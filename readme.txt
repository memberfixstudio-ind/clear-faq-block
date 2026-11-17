=== Clear FAQ Block ===
Contributors: memberfixstudio
Tags: faq, accordion, block, gutenberg, schema
Requires at least: 6.6
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A FAQ accordion block you can fill in by pasting a whole list. No front-end JavaScript, keyboard friendly, FAQ schema built in.

== Description ==

Clear FAQ adds one block to the editor for building a FAQ section.

* **Paste a whole FAQ at once.** Paste questions and answers from a document into *Paste a list* and each pair becomes an item. Put the question on the first line and the answer below it, with a blank line between pairs.
* **Edit in place.** Move, duplicate or remove items right in the block.
* **Three designs.** Cards, Lines or Minimal, plus an accent colour from your theme palette.
* **No front-end JavaScript.** It uses the browser's own `<details>` and `<summary>` elements, so it works with a keyboard and screen readers and loads nothing extra.
* **One answer open at a time** (optional). Each block gets its own group, so two FAQs on a page never interfere.
* **FAQ schema built in.** One combined `FAQPage` JSON-LD block is printed per page. Switch it off per block if your SEO plugin already handles it.

Google currently shows FAQ rich results mainly for government and health sites. The schema still helps search engines and AI assistants understand the page.

= For developers =

Filter the schema before it is printed, or return an empty array to skip it:

`add_filter( 'clear_faq_block_schema', function ( $schema ) { return $schema; } );`

Source code and build instructions: https://github.com/memberfixstudio-ind/clear-faq-block

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`, or use **Plugins → Add New → Upload Plugin**.
2. Activate it through the **Plugins** screen.
3. In the editor, add the **Clear FAQ** block.

== Frequently Asked Questions ==

= Does it load any JavaScript on the front end? =

No. The accordion is built on native `<details>` and `<summary>` elements.

= How do I turn off the FAQ schema? =

Switch it off in the block's sidebar settings, or return an empty array from the `clear_faq_block_schema` filter.

= Which versions does it need? =

WordPress 6.6 or newer and PHP 7.4 or newer.

== Changelog ==

= 1.0.0 =
* Initial release.
