<?php
defined( 'ABSPATH' ) || exit;

/**
 * WooCommerce integration — sends SMS notifications on order status changes.
 *
 * Requires WooCommerce to be active. The main plugin file checks for
 * class_exists('WooCommerce') before instantiating this class.
 */
class SMSFlow_WooCommerce {

    private SMSFlow_API $api;

    /** Map WooCommerce status slugs → option key prefixes */
    private const STATUS_MAP = [
        'pending'    => 'wc_order_placed',
        'processing' => 'wc_order_processing',
        'completed'  => 'wc_order_completed',
        'shipped'    => 'wc_order_shipped',
        'cancelled'  => 'wc_order_cancelled',
        'refunded'   => 'wc_order_refunded',
    ];

    public function __construct() {
        $this->api = new SMSFlow_API();

        // Hook into every WooCommerce order status change
        add_action( 'woocommerce_order_status_changed', [ $this, 'on_order_status_changed' ], 10, 4 );

        // Hook into the custom "shipped" action fired by popular shipping plugins
        add_action( 'woocommerce_order_status_wc-shipped', [ $this, 'on_order_shipped' ], 10, 1 );

        // Add a "Phone" field to the checkout if missing
        add_filter( 'woocommerce_billing_fields', [ $this, 'ensure_billing_phone' ] );
    }

    /* ── Event handlers ── */

    /**
     * Fired when any WooCommerce order transitions between statuses.
     *
     * @param int       $order_id   Order post ID.
     * @param string    $old_status Previous status slug (without "wc-" prefix).
     * @param string    $new_status New status slug (without "wc-" prefix).
     * @param WC_Order  $order      Order object.
     */
    public function on_order_status_changed( int $order_id, string $old_status, string $new_status, WC_Order $order ): void {
        if ( ! isset( self::STATUS_MAP[ $new_status ] ) ) {
            return;
        }

        $option_key = self::STATUS_MAP[ $new_status ];
        $options    = (array) get_option( 'smsflow_options', [] );

        if ( empty( $options[ $option_key . '_enabled' ] ) ) {
            return;
        }

        $phone = $order->get_billing_phone();
        if ( empty( $phone ) ) {
            return;
        }

        $template = $options[ $option_key . '_template' ] ?? $this->default_template( $new_status );
        $message  = $this->build_message( $template, $order, $new_status );

        $this->api->send_sms( $phone, $message );
    }

    /**
     * Handle the "shipped" custom status (fired by shipping/fulfilment plugins).
     */
    public function on_order_shipped( int $order_id ): void {
        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }
        $this->on_order_status_changed( $order_id, '', 'shipped', $order );
    }

    /* ── Checkout fields ── */

    /**
     * Ensure billing_phone is required in checkout.
     *
     * @param array $fields WooCommerce billing fields.
     */
    public function ensure_billing_phone( array $fields ): array {
        if ( isset( $fields['billing_phone'] ) ) {
            $fields['billing_phone']['required'] = true;
        }
        return $fields;
    }

    /* ── Helpers ── */

    private function build_message( string $template, WC_Order $order, string $status ): string {
        $tracking = $order->get_meta( '_tracking_number' )
                  ?: $order->get_meta( '_wc_shipment_tracking_items' )
                  ?: '';

        if ( is_array( $tracking ) ) {
            $tracking = $tracking[0]['tracking_number'] ?? '';
        }

        $vars = [
            'billing_first_name' => $order->get_billing_first_name(),
            'billing_last_name'  => $order->get_billing_last_name(),
            'order_number'       => $order->get_order_number(),
            'order_total'        => wp_strip_all_tags( wc_price( $order->get_total() ) ),
            'status'             => wc_get_order_status_name( $status ),
            'tracking_number'    => (string) $tracking,
            'site_name'          => get_bloginfo( 'name' ),
            'shop_url'           => wc_get_page_permalink( 'shop' ),
            'account_url'        => wc_get_page_permalink( 'myaccount' ),
        ];

        return SMSFlow_Notifications::render_template( $template, $vars );
    }

    private function default_template( string $status ): string {
        $templates = [
            'pending'    => __( 'Hi {{billing_first_name}}, we received your order #{{order_number}} ({{order_total}}). Thank you!', 'smsflow-wp' ),
            'processing' => __( 'Hi {{billing_first_name}}, your order #{{order_number}} is being processed. We\'ll notify you when it ships.', 'smsflow-wp' ),
            'completed'  => __( 'Hi {{billing_first_name}}, your order #{{order_number}} is complete. Thank you for shopping with us!', 'smsflow-wp' ),
            'shipped'    => __( 'Hi {{billing_first_name}}, your order #{{order_number}} has shipped! Tracking: {{tracking_number}}', 'smsflow-wp' ),
            'cancelled'  => __( 'Hi {{billing_first_name}}, your order #{{order_number}} has been cancelled. Contact us if this was unexpected.', 'smsflow-wp' ),
            'refunded'   => __( 'Hi {{billing_first_name}}, your refund for order #{{order_number}} ({{order_total}}) has been processed.', 'smsflow-wp' ),
        ];

        return $templates[ $status ] ?? 'Your order #{{order_number}} status: {{status}}.';
    }
}
