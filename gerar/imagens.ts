// Fotografias dos anúncios -> WebP em 3 larguras, sem a marca de água do portal (faixa de baixo).
// node gerar/imagens.ts
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { carros, RAIZ } from './modelo.ts';

const LARG = [640, 1200, 1800];
const out = path.join(RAIZ, 'public', 'img');
let n = 0;
for (const c of carros()) {
  fs.mkdirSync(path.join(out, c.slug), { recursive: true });
  for (let i = 0; i < c.fotos.length; i++) {
    const src = path.join(RAIZ, 'dados', c.fotos[i]);
    const meta = await sharp(src).metadata();
    const w = meta.width!, h = meta.height!;
    const corte = Math.round(h * 0.075);               // a marca de água do portal fica nos últimos ~6 %
    const base = sharp(src).extract({ left: 0, top: 0, width: w, height: h - corte });
    for (const L of LARG) {
      const dst = path.join(out, c.slug, `${String(i).padStart(2, '0')}-${L}.webp`);
      if (fs.existsSync(dst)) continue;
      await base.clone().resize({ width: Math.min(L, w), withoutEnlargement: true }).webp({ quality: L > 1000 ? 82 : 78 }).toFile(dst);
      n++;
    }
  }
}
// Audi 45 de perfil (recorte), para a cena da origem
await sharp(path.join(RAIZ, 'gerar', '03.png')).trim().resize({ width: 1100 }).webp({ quality: 86, alphaQuality: 90 }).toFile(path.join(out, 'audi-perfil.webp'));
await sharp(path.join(RAIZ, 'gerar', '03.png')).trim().resize({ width: 600 }).webp({ quality: 84, alphaQuality: 90 }).toFile(path.join(out, 'audi-perfil-600.webp'));
console.log('imagens novas:', n);
