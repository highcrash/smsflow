<?php
defined( 'ABSPATH' ) || exit;

/**
 * Handles all HTTP communication with the SMSFlow REST API.
 */
class SMSFlow_API {

    private string $api_url;
    private string $api_key;

    public function __construct() {
        $this->api_url = rtrim( (string) get_option( 'smsflow_api_url', 'https://api.smsflow.io' ), '/' );
        $this->api_key = (string) get_option( 'smsflow_api_key', '' );
    }

    /* ── Public interface ── */

    /**
     * Send a single SMS message.
     *
     * @param string      $phone   E.164 phone number, e.g. "+15551234567".
     * @param string      $body    Message body (max 160 chars for single SMS).
     * @param string|null $device  Optional device ID to route through.
     * @return array{success:bool, data:mixed, error:string}
     */
    public function send_sms( string $phone, string $body, ?string $device = null ): array {
        $payload = [
            'phoneNumber' => $phone,
            'body'        => $body,
        ];
        if ( $device ) {
            $payload['deviceId'] = $device;
        }

        return $this->request( 'POST', '/messages', $payload );
    }

    /**
     * Send an SMS using a named template with variable substitution.
     *
     * @param string $phone      E.164 phone number.
     * @param string $template   Template name as stored in SMSFlow.
     * @param array  $variables  Key-value map of template variables.
     */
    public function send_template( string $phone, string $template, array $variables = [] ): array {
        return $this->request( 'POST', '/messages/template', [
            'phoneNumber'  => $phone,
            'templateName' => $template,
            'variables'    => (object) $variables,
        ] );
    }

    /**
     * Retrieve account stats (used on the admin dashboard widget).
     */
    public function get_stats(): array {
        return $this->request( 'GET', '/analytics?range=7d' );
    }

    /**
     * List connected devices.
     */
    public function get_devices(): array {
        return $this->request( 'GET', '/devices' );
    }

    /**
     * Verify the stored API key by fetching the current user profile.
     */
    public function verify_key(): bool {
        $result = $this->request( 'GET', '/users/me' );
        return $result['success'];
    }

    /* ── Private helpers ── */

    private function request( string $method, string $path, array $body = [] ): array {
        if ( empty( $this->api_key ) ) {
            return $this->error( 'SMSFlow API key is not configured.' );
        }

        $args = [
            'method'  => strtoupper( $method ),
            'timeout' => 15,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type'  => 'application/json',
                'Accept'        => 'application/json',
                'X-Source'      => 'wordpress-plugin/' . SMSFLOW_VERSION,
            ],
        ];

        if ( ! empty( $body ) ) {
            $args['body'] = wp_json_encode( $body );
        }

        $url      = $this->api_url . $path;
        $response = wp_remote_request( $url, $args );

        if ( is_wp_error( $response ) ) {
            return $this->error( $response->get_error_message() );
        }

        $status = wp_remote_retrieve_response_code( $response );
        $raw    = wp_remote_retrieve_body( $response );
        $data   = json_decode( $raw, true );

        if ( $status >= 200 && $status < 300 ) {
            return [ 'success' => true, 'data' => $data, 'error' => '' ];
        }

        $message = $data['message'] ?? "HTTP {$status}";
        return $this->error( is_array( $message ) ? implode( ', ', $message ) : (string) $message );
    }

    private function error( string $message ): array {
        error_log( '[SMSFlow] API error: ' . $message );
        return [ 'success' => false, 'data' => null, 'error' => $message ];
    }
}
