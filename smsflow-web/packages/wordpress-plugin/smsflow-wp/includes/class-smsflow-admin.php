<?php
defined( 'ABSPATH' ) || exit;

/**
 * Registers the SMSFlow settings pages and admin menu items.
 */
class SMSFlow_Admin {

    private SMSFlow_API $api;

    public function __construct() {
        $this->api = new SMSFlow_API();

        add_action( 'admin_menu',            [ $this, 'register_menu' ] );
        add_action( 'admin_init',            [ $this, 'register_settings' ] );
        add_action( 'admin_post_smsflow_test_sms', [ $this, 'handle_test_sms' ] );
        add_action( 'wp_dashboard_setup',    [ $this, 'register_dashboard_widget' ] );
    }

    /* ── Menu ── */

    public function register_menu(): void {
        add_menu_page(
            __( 'SMSFlow', 'smsflow-wp' ),
            __( 'SMSFlow', 'smsflow-wp' ),
            'manage_options',
            'smsflow',
            [ $this, 'render_settings_page' ],
            'dashicons-smartphone',
            58
        );

        add_submenu_page(
            'smsflow',
            __( 'Settings', 'smsflow-wp' ),
            __( 'Settings', 'smsflow-wp' ),
            'manage_options',
            'smsflow',
            [ $this, 'render_settings_page' ]
        );

        add_submenu_page(
            'smsflow',
            __( 'Send SMS', 'smsflow-wp' ),
            __( 'Send SMS', 'smsflow-wp' ),
            'manage_options',
            'smsflow-send',
            [ $this, 'render_send_page' ]
        );
    }

    /* ── Settings ── */

    public function register_settings(): void {
        register_setting( 'smsflow_settings', 'smsflow_api_key', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ] );
        register_setting( 'smsflow_settings', 'smsflow_api_url', [
            'type'              => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default'           => 'https://api.smsflow.io',
        ] );
        register_setting( 'smsflow_settings', 'smsflow_options', [
            'type'    => 'array',
            'default' => [],
        ] );
    }

    /* ── Pages ── */

    public function render_settings_page(): void {
        $verified = false;
        if ( get_option( 'smsflow_api_key' ) ) {
            $verified = $this->api->verify_key();
        }

        $devices_result = $verified ? $this->api->get_devices() : null;
        $devices        = $devices_result['success'] ? ( $devices_result['data'] ?? [] ) : [];

        $options = (array) get_option( 'smsflow_options', [] );
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'SMSFlow Settings', 'smsflow-wp' ); ?></h1>

            <?php settings_errors( 'smsflow_settings' ); ?>

            <?php if ( $verified ): ?>
                <div class="notice notice-success inline"><p>
                    <strong><?php esc_html_e( '✓ Connected', 'smsflow-wp' ); ?></strong>
                    <?php
                    printf(
                        /* translators: %d: device count */
                        esc_html( _n( '%d device online.', '%d devices online.', count( $devices ), 'smsflow-wp' ) ),
                        count( $devices )
                    );
                    ?>
                </p></div>
            <?php elseif ( get_option( 'smsflow_api_key' ) ): ?>
                <div class="notice notice-error inline"><p>
                    <?php esc_html_e( '✗ Could not connect. Please check your API key.', 'smsflow-wp' ); ?>
                </p></div>
            <?php endif; ?>

            <form method="post" action="options.php">
                <?php settings_fields( 'smsflow_settings' ); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">
                            <label for="smsflow_api_key"><?php esc_html_e( 'API Key', 'smsflow-wp' ); ?></label>
                        </th>
                        <td>
                            <input
                                type="password"
                                id="smsflow_api_key"
                                name="smsflow_api_key"
                                value="<?php echo esc_attr( get_option( 'smsflow_api_key' ) ); ?>"
                                class="regular-text"
                                autocomplete="off"
                            />
                            <p class="description">
                                <?php
                                printf(
                                    /* translators: %s: link */
                                    wp_kses(
                                        __( 'Generate a key in your <a href="%s" target="_blank">SMSFlow dashboard</a>.', 'smsflow-wp' ),
                                        [ 'a' => [ 'href' => [], 'target' => [] ] ]
                                    ),
                                    'https://app.smsflow.io/api-keys'
                                );
                                ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="smsflow_api_url"><?php esc_html_e( 'API URL', 'smsflow-wp' ); ?></label>
                        </th>
                        <td>
                            <input
                                type="url"
                                id="smsflow_api_url"
                                name="smsflow_api_url"
                                value="<?php echo esc_attr( get_option( 'smsflow_api_url', 'https://api.smsflow.io' ) ); ?>"
                                class="regular-text"
                            />
                            <p class="description">
                                <?php esc_html_e( 'Leave as default unless you are self-hosting SMSFlow.', 'smsflow-wp' ); ?>
                            </p>
                        </td>
                    </tr>
                </table>

                <h2><?php esc_html_e( 'WooCommerce Notifications', 'smsflow-wp' ); ?></h2>
                <table class="form-table" role="presentation">
                    <?php
                    $wc_events = [
                        'wc_order_placed'    => __( 'Order placed', 'smsflow-wp' ),
                        'wc_order_processing'=> __( 'Order processing', 'smsflow-wp' ),
                        'wc_order_completed' => __( 'Order completed', 'smsflow-wp' ),
                        'wc_order_shipped'   => __( 'Order shipped', 'smsflow-wp' ),
                        'wc_order_cancelled' => __( 'Order cancelled', 'smsflow-wp' ),
                        'wc_order_refunded'  => __( 'Order refunded', 'smsflow-wp' ),
                    ];
                    foreach ( $wc_events as $key => $label ):
                        $enabled = ! empty( $options[ $key . '_enabled' ] );
                        $tpl     = $options[ $key . '_template' ] ?? '';
                    ?>
                    <tr>
                        <th scope="row"><?php echo esc_html( $label ); ?></th>
                        <td>
                            <label>
                                <input
                                    type="checkbox"
                                    name="smsflow_options[<?php echo esc_attr( $key ); ?>_enabled]"
                                    value="1"
                                    <?php checked( $enabled ); ?>
                                />
                                <?php esc_html_e( 'Send SMS', 'smsflow-wp' ); ?>
                            </label>
                            <br />
                            <textarea
                                name="smsflow_options[<?php echo esc_attr( $key ); ?>_template]"
                                rows="2"
                                class="large-text"
                                placeholder="<?php esc_attr_e( 'Hi {{billing_first_name}}, your order #{{order_number}} has been {{status}}.', 'smsflow-wp' ); ?>"
                            ><?php echo esc_textarea( $tpl ); ?></textarea>
                            <p class="description">
                                <?php esc_html_e( 'Available variables: {{billing_first_name}}, {{billing_last_name}}, {{order_number}}, {{order_total}}, {{status}}, {{tracking_number}}.', 'smsflow-wp' ); ?>
                            </p>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </table>

                <?php submit_button(); ?>
            </form>

            <hr />

            <h2><?php esc_html_e( 'Send a Test SMS', 'smsflow-wp' ); ?></h2>
            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                <?php wp_nonce_field( 'smsflow_test_sms' ); ?>
                <input type="hidden" name="action" value="smsflow_test_sms" />
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">
                            <label for="test_phone"><?php esc_html_e( 'Phone number', 'smsflow-wp' ); ?></label>
                        </th>
                        <td>
                            <input type="tel" id="test_phone" name="test_phone" class="regular-text" placeholder="+15551234567" />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="test_message"><?php esc_html_e( 'Message', 'smsflow-wp' ); ?></label>
                        </th>
                        <td>
                            <textarea id="test_message" name="test_message" rows="3" class="large-text"><?php echo esc_textarea( __( 'This is a test SMS from your WordPress SMSFlow plugin.', 'smsflow-wp' ) ); ?></textarea>
                        </td>
                    </tr>
                </table>
                <?php submit_button( __( 'Send test SMS', 'smsflow-wp' ), 'secondary' ); ?>
            </form>
        </div>
        <?php
    }

    public function render_send_page(): void {
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'Send SMS', 'smsflow-wp' ); ?></h1>
            <form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
                <?php wp_nonce_field( 'smsflow_test_sms' ); ?>
                <input type="hidden" name="action" value="smsflow_test_sms" />
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">
                            <label for="send_phone"><?php esc_html_e( 'Recipient phone', 'smsflow-wp' ); ?></label>
                        </th>
                        <td>
                            <input type="tel" id="send_phone" name="test_phone" class="regular-text" placeholder="+15551234567" required />
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="send_message"><?php esc_html_e( 'Message', 'smsflow-wp' ); ?></label>
                        </th>
                        <td>
                            <textarea id="send_message" name="test_message" rows="4" class="large-text" required></textarea>
                            <p class="description" id="smsflow-char-count">0 / 160 characters</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button( __( 'Send SMS', 'smsflow-wp' ) ); ?>
            </form>
        </div>
        <script>
        (function(){
            var ta = document.getElementById('send_message');
            var counter = document.getElementById('smsflow-char-count');
            if(ta && counter){
                ta.addEventListener('input', function(){
                    counter.textContent = ta.value.length + ' / 160 characters';
                });
            }
        })();
        </script>
        <?php
    }

    /* ── Test SMS handler ── */

    public function handle_test_sms(): void {
        check_admin_referer( 'smsflow_test_sms' );

        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'Unauthorized', 'smsflow-wp' ), 403 );
        }

        $phone   = sanitize_text_field( wp_unslash( $_POST['test_phone'] ?? '' ) );
        $message = sanitize_textarea_field( wp_unslash( $_POST['test_message'] ?? '' ) );

        if ( $phone && $message ) {
            $result = $this->api->send_sms( $phone, $message );
            $status = $result['success'] ? 'smsflow_sent' : 'smsflow_error';
            add_settings_error( 'smsflow_settings', $status, $result['success']
                ? __( 'Test SMS sent successfully!', 'smsflow-wp' )
                : sprintf( __( 'Failed: %s', 'smsflow-wp' ), $result['error'] ),
                $result['success'] ? 'updated' : 'error'
            );
        }

        wp_redirect( add_query_arg( 'page', 'smsflow', admin_url( 'admin.php' ) ) );
        exit;
    }

    /* ── Dashboard widget ── */

    public function register_dashboard_widget(): void {
        wp_add_dashboard_widget(
            'smsflow_stats',
            __( 'SMSFlow — Last 7 Days', 'smsflow-wp' ),
            [ $this, 'render_dashboard_widget' ]
        );
    }

    public function render_dashboard_widget(): void {
        $result = $this->api->get_stats();
        if ( ! $result['success'] ) {
            echo '<p>' . esc_html__( 'Could not load stats. Check your API key.', 'smsflow-wp' ) . '</p>';
            return;
        }

        $stats = $result['data']['stats'] ?? [];
        $total     = $stats['totalSent']     ?? 0;
        $delivered = $stats['delivered']     ?? 0;
        $failed    = $stats['failed']        ?? 0;
        $rate      = $stats['deliveryRate']  ?? 0;
        ?>
        <ul style="margin:0;padding:0;list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <li style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;">
                <strong style="font-size:22px;color:#065f46;"><?php echo esc_html( number_format( $total ) ); ?></strong>
                <p style="margin:2px 0 0;color:#047857;font-size:12px;"><?php esc_html_e( 'Total sent', 'smsflow-wp' ); ?></p>
            </li>
            <li style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;">
                <strong style="font-size:22px;color:#065f46;"><?php echo esc_html( number_format( (float) $rate, 1 ) ); ?>%</strong>
                <p style="margin:2px 0 0;color:#047857;font-size:12px;"><?php esc_html_e( 'Delivery rate', 'smsflow-wp' ); ?></p>
            </li>
            <li style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px;">
                <strong style="font-size:22px;color:#92400e;"><?php echo esc_html( number_format( $delivered ) ); ?></strong>
                <p style="margin:2px 0 0;color:#b45309;font-size:12px;"><?php esc_html_e( 'Delivered', 'smsflow-wp' ); ?></p>
            </li>
            <li style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;">
                <strong style="font-size:22px;color:#991b1b;"><?php echo esc_html( number_format( $failed ) ); ?></strong>
                <p style="margin:2px 0 0;color:#b91c1c;font-size:12px;"><?php esc_html_e( 'Failed', 'smsflow-wp' ); ?></p>
            </li>
        </ul>
        <p style="margin:12px 0 0;text-align:right;">
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=smsflow' ) ); ?>"><?php esc_html_e( 'Settings →', 'smsflow-wp' ); ?></a>
        </p>
        <?php
    }
}
