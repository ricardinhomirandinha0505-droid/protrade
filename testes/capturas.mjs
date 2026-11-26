// Capturas por secção, computador e telemóvel, com o Chrome do PC. node testes/capturas.mjs [url] [pasta]
import { chromium } from 'playwright';
const URL = process.argv[2] || 'http://127.0.0.1:4192/';
const OUT = process.argv[3] || 'testes/capturas';
import fs from 'node:fs'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const erros = [];
for (const [nome, vp, mobile] of [['c1440', { width: 1440, height: 900 }, false], ['m390', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') erros.push(`${nome} consola: ${m.text()}`); });
  p.on('pageerror', (e) => erros.push(`${nome} erro: ${e.message}`));
  p.on('requestfailed', (r) => erros.push(`${nome} falhou: ${r.url()}`));
  await p.goto(URL, { waitUntil: 'load' });
  // abertura a meio e no fim
  await p.waitForTimeout(1300); await p.screenshot({ path: `${OUT}/${nome}-00-abertura.jpg`, quality: 70 });
  await p.waitForTimeout(2600); await p.screenshot({ path: `${OUT}/${nome}-01-hero.jpg`, quality: 70 });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const larg = await p.evaluate(() => document.documentElement.scrollWidth);
  if (larg > vp.width) erros.push(`${nome}: página mais larga do que o ecrã (${larg})`);
  let y = 0, k = 2;
  while (y < H - vp.height) {
    y = Math.min(H - vp.height, y + Math.round(vp.height * .85));
    await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(1300);
    await p.screenshot({ path: `${OUT}/${nome}-${String(k++).padStart(2, '0')}.jpg`, quality: 70 });
  }
  await ctx.close();
}
await b.close();
console.log(erros.length ? erros.join('\n') : 'sem erros na consola');
