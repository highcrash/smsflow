<?php
defined( 'ABSPATH' ) || exit;

/**
 * Handles generic WordPress notification hooks (user registration, password reset, etc.)
 */
class SMSFlow_Notifications {

    private SMSFlow_API $api;

    public function __construct() {
        $this->api = new SMSFlow_API();

        $options = (array) get_option( 'smsflow_options', [] );

        // User registration
        if ( ! empty( $options['user_registration_enabled'] ) ) {
            add_action( 'user_register', [ $this, 'on_user_register' ], 10, 2 );
        }

        // Password reset
        if ( ! empty( $options['password_reset_enabled'] ) ) {
            add_action( 'after_password_reset', [ $this, 'on_password_reset' ], 10, 1 );
        }
    }

    /* ── Handlers ── */

    public function on_user_register( int $user_id, array $userdata ): void {
        $phone = get_user_meta( $user_id, 'billing_phone', true )
               ?: get_user_meta( $user_id, 'phone', true );

        if ( ! $phone ) {
            return;
        }

        $options  = (array) get_option( 'smsflow_options', [] );
        $template = $options['user_registration_template']
                    ?? __( 'Welcome to {{site_name}}! Your account is now active.', 'smsflow-wp' );
        $user     = get_user_by( 'id', $user_id );

        $message = $this->render_template( $template, [
            'site_name'  => get_bloginfo( 'name' ),
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'email'      => $user->user_email,
        ] );

        $this->api->send_sms( $phone, $message );
    }

    public function on_password_reset( WP_User $user ): void {
        $phone = get_user_meta( $user->ID, 'billing_phone', true )
               ?: get_user_meta( $user->ID, 'phone', true );

        if ( ! $phone ) {
            return;
        }

        $options  = (array) get_option( 'smsflow_options', [] );
        $template = $options['password_reset_template']
                    ?? __( 'Your {{site_name}} password has been successfully reset.', 'smsflow-wp' );

        $message = $this->render_template( $template, [
            'site_name'  => get_bloginfo( 'name' ),
            'first_name' => $user->first_name,
        ] );

        $this->api->send_sms( $phone, $message );
    }

    /* ── Helpers ── */

    /**
     * Replace {{variable}} placeholders in a template string.
     *
     * @param string $template Template with {{key}} placeholders.
     * @param array  $vars     Associative array of replacement values.
     */
    public static function render_template( string $template, array $vars ): string {
        foreach ( $vars as $key => $value ) {
            $template = str_replace( '{{' . $key . '}}', (string) $value, $template );
        }
        return $template;
    }
}
