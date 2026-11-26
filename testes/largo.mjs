import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://127.0.0.1:4192/'); await p.waitForTimeout(4000);
console.log(await p.evaluate(() => { const W = innerWidth; return [...document.querySelectorAll('*')].map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => r.right > W + 2).slice(0, 8).map(([e, r]) => e.tagName + '.' + e.className + ' ' + Math.round(r.right)).join('\n') + '\nH=' + document.documentElement.scrollHeight; }));
await b.close();
