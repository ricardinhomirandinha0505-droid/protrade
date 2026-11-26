import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:4192/'); await p.waitForTimeout(3000);
await p.evaluate(() => document.querySelector('.visita').scrollIntoView()); await p.waitForTimeout(2500);
console.log(await p.evaluate(() => { const f = document.querySelector('.visita-foto'), i = f.querySelector('img'); const r = f.getBoundingClientRect();
 return JSON.stringify({ cls: f.className, fw: r.width, fh: r.height, nat: i.naturalWidth, src: i.currentSrc, iw: i.getBoundingClientRect().width, capa: getComputedStyle(f.querySelector('.ripa-capa i')).transform, op: getComputedStyle(i).opacity }); }));
await p.screenshot({ path: 'testes/capturas/dbg.jpg', quality: 60 }); await b.close();
