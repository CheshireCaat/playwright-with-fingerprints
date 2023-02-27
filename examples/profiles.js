require('dotenv').config();
const { plugin } = require('..');

(async () => {
  const context = await plugin.launchPersistentContext(`${__dirname}/profile`);

  const page = await context.newPage();
  await page.goto('chrome://version');

  const el = await page.waitForSelector('#profile_path');
  console.log('Current profile:', await el.evaluate((el) => el.textContent));

  await context.close();
})();
