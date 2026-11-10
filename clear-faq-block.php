<?php
/**
 * Plugin Name:       Clear FAQ Block
 * Plugin URI:        https://github.com/memberfixstudio-ind/clear-faq-block
 * Description:       A FAQ accordion block that is quick to fill in: type, or paste a whole list at once. No front-end JavaScript, keyboard friendly, FAQ schema built in.
 * Version:           1.0.0
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Author:            Rohan Salave
 * Author URI:        https://www.linkedin.com/in/rohan-salave-362475189/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       clear-faq-block
 * Domain Path:       /languages
 *
 * @package ClearFaqBlock
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register the block from its built block.json.
 */
function clear_faq_block_register() {
	load_plugin_textdomain( 'clear-faq-block', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );

	$block = register_block_type( __DIR__ . '/build' );

	// Let the editor script use translated strings (JSON files from `wp i18n make-json`).
	if ( $block && ! empty( $block->editor_script_handles ) ) {
		foreach ( $block->editor_script_handles as $handle ) {
			wp_set_script_translations( $handle, 'clear-faq-block', __DIR__ . '/languages' );
		}
	}
}
add_action( 'init', 'clear_faq_block_register' );

/**
 * Questions collected on this request, printed once as a single FAQPage.
 *
 * @param array|null $add Items to add.
 * @return array
 */
function clear_faq_block_schema_items( $add = null ) {
	static $items = array();
	if ( is_array( $add ) ) {
		$items = array_merge( $items, $add );
	}
	return $items;
}

/**
 * Give each accordion its own group name (so "one open at a time" never links two
 * separate FAQ blocks) and collect questions for the schema.
 *
 * @param string $content Rendered block HTML.
 * @param array  $block   Parsed block.
 * @return string
 */
function clear_faq_block_render( $content, $block ) {
	if ( 'clear-faq/faq' !== $block['blockName'] || '' === trim( $content ) ) {
		return $content;
	}

	$attrs = isset( $block['attrs'] ) ? $block['attrs'] : array();

	if ( class_exists( 'WP_HTML_Tag_Processor' ) && false !== strpos( $content, 'data-exclusive="true"' ) ) {
		$group     = wp_unique_id( 'cfaq-' );
		$processor = new WP_HTML_Tag_Processor( $content );
		while ( $processor->next_tag( array( 'tag_name' => 'details' ) ) ) {
			$processor->set_attribute( 'name', $group );
		}
		$content = $processor->get_updated_html();
	}

	$schema_on = ! isset( $attrs['schema'] ) || $attrs['schema'];
	if ( $schema_on && ! empty( $attrs['items'] ) && is_array( $attrs['items'] ) && is_singular() ) {
		$entries = array();
		foreach ( $attrs['items'] as $item ) {
			$question = isset( $item['question'] ) ? trim( wp_strip_all_tags( $item['question'] ) ) : '';
			$answer   = isset( $item['answer'] ) ? trim( wp_kses( $item['answer'], array( 'a' => array( 'href' => true ), 'br' => array(), 'strong' => array(), 'em' => array(), 'b' => array(), 'i' => array() ) ) ) : '';
			if ( '' === $question || '' === $answer ) {
				continue;
			}
			$entries[] = array(
				'@type'          => 'Question',
				'name'           => html_entity_decode( $question, ENT_QUOTES, 'UTF-8' ),
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => $answer,
				),
			);
		}
		clear_faq_block_schema_items( $entries );
	}

	return $content;
}
add_filter( 'render_block', 'clear_faq_block_render', 10, 2 );

/**
 * Print one FAQPage JSON-LD block for every FAQ on the page.
 */
function clear_faq_block_print_schema() {
	$items = clear_faq_block_schema_items();
	if ( empty( $items ) ) {
		return;
	}

	/**
	 * Filter the FAQ schema before it is printed. Return an empty array to skip it.
	 *
	 * @param array $schema FAQPage data.
	 */
	$schema = apply_filters(
		'clear_faq_block_schema',
		array(
			'@context'   => 'https://schema.org',
			'@type'      => 'FAQPage',
			'mainEntity' => $items,
		)
	);

	if ( empty( $schema ) ) {
		return;
	}

	printf(
		"<script type=\"application/ld+json\">%s</script>\n",
		wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG )
	);
}
add_action( 'wp_footer', 'clear_faq_block_print_schema' );
