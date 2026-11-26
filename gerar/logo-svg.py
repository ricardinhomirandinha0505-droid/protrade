# Vectoriza o logótipo verdadeiro (logo-claro.png, 1956 px) em SVG por camadas: simbolo, pro, trade, automoveis.
# python -I gerar/logo-svg.py
import cv2, numpy as np, os
AQUI = os.path.dirname(os.path.abspath(__file__))
im = cv2.imread(os.path.join(AQUI, 'logo-claro.png'), cv2.IMREAD_UNCHANGED)
a = im[:, :, 3]; b, g, r = im[:, :, 0].astype(int), im[:, :, 1].astype(int), im[:, :, 2].astype(int)
H, W = a.shape
azul = ((a > 128) & (b - r > 60)).astype(np.uint8) * 255
claro = ((a > 128) & (b - r <= 60)).astype(np.uint8) * 255
def caminhos(mask, y0, y1, x0=0, x1=None):
    m = np.zeros_like(mask); m[y0:y1, x0:x1] = mask[y0:y1, x0:x1]
    m = cv2.GaussianBlur(m, (3, 3), 0); _, m = cv2.threshold(m, 127, 255, cv2.THRESH_BINARY)
    cs, hi = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    d = []
    for c in cs:
        if cv2.contourArea(c) < 30: continue
        c = cv2.approxPolyDP(c, 0.7, True)
        d.append('M' + 'L'.join(f'{p[0][0]},{p[0][1]}' for p in c) + 'Z')
    return ''.join(d)
# limites por linhas: símbolo (azul, em cima), palavra (clara), AUTOMÓVEIS (azul, em baixo)
rows_c = np.where(claro.any(1))[0]; ty0, ty1 = rows_c.min(), rows_c.max() + 1
rows_a = np.where(azul.any(1))[0]
sym = rows_a[rows_a < ty0]; aut = rows_a[rows_a > ty1]
cols = np.where(claro[ty0:ty1].any(0))[0]
# separar PRO de TRADE pelo maior buraco entre colunas
gaps = np.diff(cols); k = np.argsort(gaps)[::-1]
# PRO tem 3 letras; o corte é a coluna onde começa o T (primeira letra a inclinar): usa-se o vale mais largo depois do O
split = None
for i in k[:6]:
    x = cols[i] + 1
    if W * 0.3 < x < W * 0.6: split = x; break
if split is None: split = int(W * 0.45)
camadas = {
  'simbolo': ('#5080F8', caminhos(azul, sym.min(), sym.max() + 1)),
  'pro': ('currentColor', caminhos(claro, ty0, ty1, 0, split)),
  'trade': ('currentColor', caminhos(claro, ty0, ty1, split, None)),
  'automoveis': ('#5080F8', caminhos(azul, aut.min(), aut.max() + 1)),
}
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-label="Protrade Automóveis">']
for nome, (cor, d) in camadas.items():
    svg.append(f'<path class="lg-{nome}" fill="{cor}" fill-rule="evenodd" d="{d}"/>')
svg.append('</svg>')
open(os.path.join(AQUI, 'logo.svg'), 'w', encoding='utf-8').write(''.join(svg))
print(W, H, 'split', split, 'sym', sym.min(), sym.max(), 'txt', ty0, ty1, 'aut', aut.min(), aut.max(), os.path.getsize(os.path.join(AQUI, 'logo.svg')))
