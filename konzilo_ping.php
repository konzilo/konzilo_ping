<?php
/*
 * Plugin name: Konzilo ping
 * Plugin URI: http://wordpress.org/extend/plugins/konzilo_ping/
 * Description: Ping konzilo when wordpress changes are made.
 * Author: Fabian Sörqvist
 * Author URI: http://kntnt.com/
 * Version: 0.1
 */


// Default konzilo location.
if (!defined('KONZILO_URL')) {
  define('KONZILO_URL', 'https://app.konzilo.com');
}

/**
 * Send a refresh request to konzilo on save.
 */
function konzilo_ping_save_update($post_id, $post) {
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

add_action('save_post', 'konzilo_ping_save_update', 10, 2 );
