const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('http://localhost:8765/');
  await page.waitForTimeout(4000);

  const desktopVisible = await page.isVisible('#desktop');
  const dockApps = await page.locator('#dock-apps .dock-app').count();
  const windows = await page.locator('.window').count();

  console.log('Desktop visible:', desktopVisible);
  console.log('Dock apps:', dockApps);
  console.log('Windows:', windows);
  console.log('Errors:', errors.length ? errors : 'none');

  // Try opening each app
  const apps = ['finder','safari','terminal','calculator','notes','settings','photos','calendar','music','messages','mail','clock','weather','maps','appstore','tv','podcasts','reminders','facetime','textedit','preview','activity','contacts'];
  for (const appId of apps) {
    const before = await page.locator('.window').count();
    const el = page.locator(`.dock-app[data-app="${appId}"]`);
    if (await el.count() === 0) { console.log(`Missing dock icon: ${appId}`); continue; }
    await el.click();
    await page.waitForTimeout(600);
    const after = await page.locator('.window').count();
    console.log(`Opened ${appId}: windows ${before} -> ${after}`);
  }

  // Test Launchpad via keyboard shortcut (Cmd+Space)
  await page.keyboard.press('Meta+Space');
  await page.waitForTimeout(400);
  const launchpadVisible = await page.isVisible('#launchpad');
  console.log('Launchpad visible:', launchpadVisible);

  await browser.close();
  process.exit(errors.length || !desktopVisible || !launchpadVisible ? 1 : 0);
})();
