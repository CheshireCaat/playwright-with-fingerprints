const Loader = require('browser-with-fingerprints/src/loader');

/**
 * The loader instance for the `playwright` framework that supports both the default and `core` versions.
 *
 * The minimum required framework version is `1.27.1`.
 *
 * @internal
 */
exports.loader = new Loader('playwright', '1.27.1', ['playwright-core']);
