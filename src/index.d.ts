import type { BrowserType } from 'playwright-core';
import type { FingerprintPlugin } from 'browser-with-fingerprints';

type LaunchFn = Launcher['launchPersistentContext'];

/**
 * Describes the **playwright** compatible launch options.
 */
export type PluginLaunchOptions = Parameters<LaunchFn>[1];

/**
 * Describes the **playwright** compatible browser launcher.
 *
 * See [playwright](https://playwright.dev/docs/api/class-browsertype#browser-type-launch) docs for more information.
 */
export type Launcher = Pick<BrowserType, 'launch' | 'launchPersistentContext'>;

/**
 * Describes a plugin that is capable of fetching a fingerprint and launching a browser instance using it.
 *
 * In order to use the plugin, create an instance of it using the {@link createPlugin} method or, even better, use the default instance that is already configured to work.
 *
 * @remarks
 * **NOTE**: This plugin works correctly only with the **playwright** framework or with its core version.
 * In case of using custom launchers that are incompatible with **playwright** or launchers that do not use it under the hood, errors may occur.
 */
export interface PlaywrightFingerprintPlugin extends FingerprintPlugin {
  /**
   * Launches **playwright** and launches a browser instance with given arguments and options when specified.
   *
   * This method uses the playwright's native {@link BrowserType.launch | launch} method under the hood and adds some functionality for applying fingerprints and proxies.
   * Before launching, the parameters that you specified using the {@link useProxy} and {@link useFingerprint} methods will also be applied for the browser.
   *
   * The options for are the same as the built-in ones, with a few exceptions that can break things.
   * For example, you can't use the `channel` option and will get an error when trying to specify it because the plugin doesn't support it:
   *
   * ```js
   * // This code will throw an error:
   * await plugin.launch({ channel: 'chrome-canary' });
   * ```
   *
   * You can get a list of unsupported options by importing the {@link UNSUPPORTED_OPTIONS} variable.
   *
   * If you need more information on how the native method works, use the **playwright** documentation -
   * [link](https://playwright.dev/docs/api/class-browsertype#browser-type-launch).
   *
   * @remarks
   * **NOTE**: This plugin only works with the `chromium` browser, which comes bundled with the plugin.
   * You will not be able to use default `chromium`, `firefox`, `webkit` and other engines that come with the **playwright** framework.
   *
   * If you need to use the default browsers without fingerprint spoofing, just use the **playwright** built-in `launch` method.
   *
   * You must specify the service key to apply the fingerprint when launching the browser (if the fingerprint was obtained using a paid key).
   *
   * @example
   * An example of launching the browser in visible mode:
   *
   * ```js
   * const browser = await plugin.launch({
   *   headless: false,
   * });
   * ```
   *
   * @param options - Set of configurable options to set on the browser.
   * @returns Promise which resolves to a browser instance.
   */
  launch(options?: PluginLaunchOptions): ReturnType<LaunchFn>;

  /**
   * Returns the persistent browser context instance.
   *
   * Launches browser that uses persistent storage located at `userDataDir` and returns the only context. Closing this
   * context will automatically close the browser.
   *
   * @param userDataDir - Path to a user data directory, which stores browser session data like cookies and local storage.
   * @param options - Set of configurable options to set on the browser.
   * @returns Promise which resolves to a context instance.
   */
  launchPersistentContext(userDataDir: string, options?: PluginLaunchOptions): ReturnType<LaunchFn>;

  /**
   * A **playwright** compatible launcher or the **playwright** itself.
   *
   * It's used to launch the browser directly via the plugin.
   */
  readonly launcher: Launcher;
}

/**
 * A default instance of the fingerprint plugin for the **playwright** library.
 * It comes with a pre-configured launcher and is the easiest option to use.
 *
 * The default instance itself imports and uses the necessary dependencies, so you can replace
 * the **playwright** imports with a plugin if you don't need additional options.
 */
export declare const plugin: PlaywrightFingerprintPlugin;

/**
 * A list of option names for the **playwright** built-in `launch` method that cannot be
 * used in conjunction with the plugin.
 *
 * @remarks
 * **NOTE**: If you use the options specified in this list to launch the browser, a
 * corresponding error will be thrown.
 */
export declare const UNSUPPORTED_OPTIONS: readonly string[];

/**
 * Create a separate plugin instance using the provided **playwright** compatible browser launcher.
 *
 * This method can be useful if you are working with any wrappers for the target library.
 * But use it with caution and respect the launcher signature.
 *
 * @remarks
 * **NOTE**: If you're using pure **playwright** or **playwright-core** packages without add-ons,
 * it's best to use the default plugin instance that is already configured to work.
 *
 * @param launcher - Playwright (or **API** compatible) browser launcher.
 * @returns A new separate plugin instance.
 */
export declare function createPlugin(launcher: Launcher): PlaywrightFingerprintPlugin;
