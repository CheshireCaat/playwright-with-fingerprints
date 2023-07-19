const { loader } = require('./loader');
const { FingerprintPlugin } = require('browser-with-fingerprints');
const { onClose, bindHooks, getViewport, setViewport } = require('./utils');

const LAUNCH_FALLBACK_WARNING = [
  'The original "launch" method is temporarily unsupported.',
  'Under the hood it will use the "launchPersistentContext" method.',
  'Therefore, it is recommended to use the second one directly instead.',
].join('\n');

const Plugin = class PlaywrightFingerprintPlugin extends FingerprintPlugin {
  async launch(options = {}) {
    this.#validateOptions(options);
    console.warn(LAUNCH_FALLBACK_WARNING);
    return await this.launchPersistentContext('', options);
  }

  async launchPersistentContext(userDataDir, options = {}) {
    this.#validateOptions(options);
    const method = 'launchPersistentContext';

    if (!this.launcher[method]) {
      throw new Error(`The provided launcher doesn't support the "${method}" method`);
    }

    return await super.launch({
      ...options,
      userDataDir,
      viewport: null,
      launcher: {
        launch: (options = {}) => {
          const [userDataDirArg] = options.args.splice(
            options.args.findIndex((arg) => arg.startsWith('--user-data-dir')),
            1
          );
          return this.launcher[method](userDataDirArg.split('=')[1], options);
        },
      },
    });
  }

  /**
   * Configures the browser, including viewport size, hook and event binding.
   *
   * @param {import('playwright').Browser} browser - The target browser instance.
   * @param {{width: number, height: number}} bounds - The size of the viewport.
   * @param {Promise<void>} sync - Method for syncing browser settings.
   * @param {(target: any) => void} cleanup - The cleanup function.
   *
   * @internal
   */
  async configure(cleanup, browser, bounds, sync) {
    onClose(browser, () => cleanup(browser));

    // Resize pages only if size is set.
    if (bounds.width && bounds.height) {
      const resize = async (page) => {
        const { width, height } = await getViewport(page);

        if (width !== bounds.width || height !== bounds.height) {
          await sync(() => setViewport(page, bounds));
        }
      };
      bindHooks(browser, { onPageCreated: resize });

      // Resize on startup only if there are open pages.
      if (browser.pages) {
        const [page] = await browser.pages();
        if (page) await resize(page);
      }
    }
  }

  /**
   * Check the options used to launch a browser for compatibility with plugin.
   * If any of the specified options are incompatible, an error will be thrown.
   *
   * @param options - Set of configurable options to set on the browser.
   *
   * @private
   */
  #validateOptions(options = {}) {
    for (const option of UNSUPPORTED_OPTIONS) {
      if (option in options) {
        throw new Error(`The built-in "${option}" option is not supported in this plugin.`);
      }
    }
  }
};

exports.plugin = new Plugin(loader.load());

exports.createPlugin = Plugin.create.bind(Plugin);

const UNSUPPORTED_OPTIONS = (exports.UNSUPPORTED_OPTIONS = ['proxy', 'channel', 'firefoxUserPrefs']);
