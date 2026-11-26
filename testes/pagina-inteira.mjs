// Imagem da página inteira (prévia por imagem): ecrã a ecrã, cosido, com as cenas no estado em que se vêem. node testes/pagina-inteira.mjs
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
const OUT = 'prévias'; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const rotas = [['home', '/'], ['ficha-audi-a3-45', '/viaturas/audi-a3-sportback-45-tfsie-s-line/']];
for (const [nome, vp, m] of [['computador', { width: 1440, height: 900 }, false], ['telemovel', { width: 390, height: 844 }, true]]) {
  const dpr = m ? 2 : 1;
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: dpr, isMobile: m, hasTouch: m });
  for (const [r, u] of rotas) {
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:4192' + u); await p.waitForTimeout(3800);
    await p.addStyleTag({ content: '.saltar,.barra{display:none!important}.topo{position:absolute!important}html{scroll-behavior:auto!important}' });
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    const partes = []; let y = 0;
    while (true) {
      const yy = Math.min(y, H - vp.height);
      await p.evaluate((v) => scrollTo(0, v), yy); await p.waitForTimeout(700); await p.evaluate(() => document.querySelectorAll('.cinetico,[data-revela]').forEach((e) => { const r = e.getBoundingClientRect(); if (r.top < innerHeight) e.classList.add('visto'); })); await p.waitForTimeout(1300);
      partes.push({ input: await p.screenshot({ type: 'png' }), top: yy * dpr, left: 0 });
      if (yy >= H - vp.height) break; y += vp.height;
    }
    await sharp({ create: { width: vp.width * dpr, height: H * dpr, channels: 3, background: '#F2F4F8' } }).composite(partes).jpeg({ quality: 82 }).toFile(`${OUT}/protrade-${r}-${nome}.jpg`);
    await p.close();
  }
  await ctx.close();
}
await b.close(); console.log('ok');
