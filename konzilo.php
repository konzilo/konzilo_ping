<?php
/*
 * Plugin name: Konzilo ping
 * Plugin URI: http://wordpress.org/extend/plugins/konzilo/
 * Description: Ping konzilo when wordpress changes are made.
 * Author: Fabian Sörqvist
 * Author URI: https://www.konzilo.com
 * Version: 0.1
 */


// Default konzilo location.
if (!defined('KONZILO_URL')) {
  define('KONZILO_URL', 'https://app.konzilo.com');
}

/**
 * Send a refresh request to konzilo on save.
 */
function konzilo_save_update($post_id, $post) {
    if ( defined('XMLRPC_REQUEST') && XMLRPC_REQUEST ) {
        return;
    }
    if ($post->post_type != 'post' || $post->post_status == 'trash'
        || $post->post_status === 'auto-draft') {
        return $post_id;
    }
    // Make a refresh request to konzilo.
    $result = wp_remote_post(KONZILO_URL . '/api/ping', array(
        'body' => array(
            'id' => $post_id,
            'host' => get_home_url()
        )));
}

add_action('save_post', 'konzilo_save_update', 10, 2 );


add_action('load-post.php', 'konzilo_meta_box_setup');
add_action('load-post-new.php', 'konzilo_meta_box_setup');

function konzilo_meta_box_setup() {
    add_action('add_meta_boxes', 'konzilo_add_meta_boxes');
    //add_action('save_post', 'konzilo_save_update', 10, 2 );
}

function konzilo_add_meta_boxes() {
    global $post;
    global $pagenow;
    global $post;
    if ($post->post_status != 'publish' && (!empty($update) || $post->post_status != 'future')) {
        wp_register_script('konzilo_script',
                          plugins_url('js/script.js', __FILE__),
                          array('jquery'));
        wp_localize_script('konzilo_script', 'konzilo', array(
            'tz' => get_option('gmt_offset')
        ));
        wp_enqueue_script('konzilo_script');
        add_meta_box(
            'konzilo-social-post',      // Unique ID
            esc_html__( 'Konzilo', 'konzilo' ),    // Title
            'konzilo_meta_box',   // Callback function
            'post',         // Admin page (or post type)
            'normal',         // Context
            'high'         // Priority
        );
    }
}

function konzilo_meta_box( $object, $box ) {
    $link = empty($object) ? KONZILO_URL . '/update-iframe' : KONZILO_URL .
          '/update-iframe/' . $object->ID;
    $link .= '?site=' . urlencode(get_site_url());

    echo "<iframe id=\"konzilo-iframe\" src=\"$link\" style=\"width: 100%; border: none; height: 0px;\"></iframe>";
}
