const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5183/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(150);
  }

  const loc = page.getByText('Stay Inspired', { exact: true }).first();
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: __dirname + '/newsletter2.png' });

  // scroll a bit more to capture both newsletter + HomeCTA together for comparison
  await page.evaluate(() => window.scrollBy(0, -150));
  await page.waitForTimeout(200);
  await page.screenshot({ path: __dirname + '/newsletter_and_cta.png' });

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
