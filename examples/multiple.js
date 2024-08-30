// require('dotenv').config();
// Replace this import with `require('..')` if you are running the example from the repository:
const { plugin } = require('playwright-with-fingerprints');

// Set the service key for the plugin (you can buy it here https://bablosoft.com/directbuy/FingerprintSwitcher/2).
// Leave an empty string to use the free version.
plugin.setServiceKey(process.env.FINGERPRINT_KEY ?? '');

(async () => {
  for (let i = 0; i < 2; ++i) {
    const fingerprint = await plugin.fetch({ tags: ['Microsoft Windows', 'Chrome'] });
    const browser = await plugin.useFingerprint(fingerprint).launch();

    const page = await browser.newPage();
    await page.goto('https://httpbin.org/headers', { waitUntil: 'domcontentloaded' });

    const { headers } = JSON.parse(await page.$eval('pre', (pre) => pre.innerText));

    console.log(`Browser №${i + 1}:`, {
      headers: {
        userAgent: headers['User-Agent'],
        acceptLanguage: headers['Accept-Language'],
      },
      viewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight })),
    });

    await browser.close();
  }
})();
