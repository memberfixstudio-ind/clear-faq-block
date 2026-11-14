# Changelog

## Unreleased

- Load the plugin text domain and register script translations, so the editor UI (buttons, labels, placeholders) can be translated, not just the PHP strings.
- Add a GitHub Actions workflow that lints the PHP, runs `npm run build` and fails if the committed `build/` is out of date.
