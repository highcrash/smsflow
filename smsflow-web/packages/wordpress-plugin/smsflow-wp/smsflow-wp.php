<?php
/**
 * Plugin Name:       SMSFlow
 * Plugin URI:        https://smsflow.io
 * Description:       Send SMS notifications via your SMSFlow gateway. Integrates with WooCommerce for order and shipping updates.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * Author:            SMSFlow
 * Author URI:        https://smsflow.io
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       smsflow-wp
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'SMSFLOW_VERSION',     '1.0.0' );
define( 'SMSFLOW_PLUGIN_FILE', __FILE__ );
define( 'SMSFLOW_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'SMSFLOW_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );

/* ── Autoload classes ── */
spl_autoload_register( function ( string $class ): void {
    $map = [
        'SMSFlow_API'           => 'class-smsflow-api.php',
        'SMSFlow_Admin'         => 'class-smsflow-admin.php',
        'SMSFlow_Notifications' => 'class-smsflow-notifications.php',
        'SMSFlow_WooCommerce'   => 'class-smsflow-woocommerce.php',
    ];
    if ( isset( $map[ $class ] ) ) {
        require_once SMSFLOW_PLUGIN_DIR . 'includes/' . $map[ $class ];
    }
} );

/* ── Bootstrap ── */
function smsflow_init(): void {
    new SMSFlow_Admin();
    new SMSFlow_Notifications();

    if ( class_exists( 'WooCommerce' ) ) {
        new SMSFlow_WooCommerce();
    }
}
add_action( 'plugins_loaded', 'smsflow_init' );

/* ── Activation / Deactivation ── */
register_activation_hook( __FILE__, function (): void {
    add_option( 'smsflow_api_key',  '' );
    add_option( 'smsflow_api_url',  'https://api.smsflow.io' );
    add_option( 'smsflow_options',  [] );
} );

register_deactivation_hook( __FILE__, function (): void {
    // Intentionally left empty — preserve settings on deactivation.
} );
