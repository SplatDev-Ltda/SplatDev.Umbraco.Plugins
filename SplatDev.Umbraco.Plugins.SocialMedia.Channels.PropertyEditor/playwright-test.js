const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to Umbraco backoffice
  await page.goto('https://staging-umbraco.splatdev.tech/umbraco');

  // Login using credentials
  await page.fill('input[name="username"]', process.env.Umbraco_default_username);
  await page.fill('input[name="password"]', process.env.Umbraco_default_password);
  await page.click('button[type="submit"]');

  // Check if login was successful
  try {
    await page.waitForSelector('.umb-secured-section', { timeout: 5000 });
    console.log('Login successful');
  } catch (error) {
    console.error('Login failed', error);
    await browser.close();
    return;
  }

  // Verify the SocialMediaChannels property editor
  try {
    const selector = 'iframe[src*="SocialMediaChannels"]';
    await page.frame({ url: /SocialMediaChannels/ }).waitForSelector(selector, { timeout: 5000 });
    console.log('SocialMediaChannels property editor is accessible.');
  } catch (error) {
    console.error('SocialMediaChannels property editor is not accessible.', error);
  }

  // Close the browser
  await browser.close();
})();
