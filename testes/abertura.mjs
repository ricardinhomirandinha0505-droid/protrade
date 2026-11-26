import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [n, vp, m] of [['c', { width: 1440, height: 900 }, false], ['m', { width: 390, height: 844 }, true]]) {
  const p = await (await b.newContext({ viewport: vp, isMobile: m, hasTouch: m })).newPage();
  await p.goto('http://127.0.0.1:4192/', { waitUntil: 'domcontentloaded' });
  for (const t of [300, 700, 1100, 1500, 1900, 2300, 2700, 3100]) { await p.waitForTimeout(t === 300 ? 300 : 400); await p.screenshot({ path: `testes/capturas/ab-${n}-${t}.jpg`, quality: 60 }); }
}
await b.close();
