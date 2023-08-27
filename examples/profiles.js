// require('dotenv').config();
// Replace this import with `require('..')` if you are running the example from the repository:
const { plugin } = require('playwright-with-fingerprints');

(async () => {
  const context = await plugin.launchPersistentContext(`${__dirname}/profile`);

  const page = await context.newPage();
  await page.goto('chrome://version');

  const el = await page.waitForSelector('#profile_path');
  console.log('Current profile:', await el.evaluate((el) => el.textContent));

  await context.close();
})();
