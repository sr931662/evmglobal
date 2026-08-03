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

  const targets = [
    ['Trust & Assurance', 'trust.png'],
    ['The Gallery', 'gallery.png'],
    ['Traveller Stories', 'testimonials.png'],
    ['Good to Know', 'faq.png'],
    ['Stay Inspired', 'newsletter.png'],
  ];

  for (const [text, file] of targets) {
    const loc = page.getByText(text, { exact: true }).first();
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: __dirname + '/' + file });
  }

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
