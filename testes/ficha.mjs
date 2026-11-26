import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }); const erros = [];
for (const [n, vp, m] of [['c', { width: 1440, height: 900 }, false], ['m', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m }); const p = await ctx.newPage();
  p.on('pageerror', (e) => erros.push(e.message)); p.on('console', (x) => x.type() === 'error' && erros.push(x.text()));
  await p.goto('http://127.0.0.1:4192/viaturas/audi-a3-sportback-45-tfsie-s-line/'); await p.waitForTimeout(1500);
  await p.screenshot({ path: `testes/capturas/ficha-${n}-1.jpg`, quality: 70 });
  await p.click('[data-seg]'); await p.waitForTimeout(900);
  await p.evaluate(() => scrollTo(0, innerHeight * 1.1)); await p.waitForTimeout(900); await p.screenshot({ path: `testes/capturas/ficha-${n}-2.jpg`, quality: 70 });
  await p.evaluate(() => scrollTo(0, innerHeight * 2.2)); await p.waitForTimeout(900); await p.screenshot({ path: `testes/capturas/ficha-${n}-3.jpg`, quality: 70 });
  console.log(n, 'largura', await p.evaluate(() => document.documentElement.scrollWidth), 'altura', await p.evaluate(() => document.documentElement.scrollHeight));
  await ctx.close();
}
await b.close(); console.log(erros.join('\n') || 'sem erros');
