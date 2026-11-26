# Site da Protrade (protótipo para a reunião de 27/11/2026)

Site novo, feito de raiz, com os 7 carros reais da Protrade (anúncios do Standvirtual a 26/11/2026).
TypeScript + Vite, sem framework. Páginas geradas no build: home + uma ficha por carro.

```bash
npm run imagens   # fotos dos anúncios -> public/img (WebP, sem a marca de água do portal)
npm run build     # tsc + vite + gerar/paginas.ts -> dist/
python -I servir.py   # http://127.0.0.1:4192
```

Para publicar (só com o «publica» do João): `SITE_URL=<url> BASE=/<pasta>/ npm run build`. Por omissão sai com `noindex`.

## Direcção
- Marca: anel azul `#5080F8` + nome em azul-noite `#0A0F2C`; TRADE em itálico, por isso os títulos são Montserrat 800 itálico.
- Cena do ofício: o Audi A3 45 TFSIe (recorte real) faz o caminho da origem com o scroll (instituição financeira, 1.º dono, manutenção, Protrade) e acende cada paragem por onde passa.
- Abertura: as ripas da parede do stand tapam o hero, as 8 pétalas do anel juntam-se, PRO sobe, TRADE entra a acelerar, as ripas abrem e o logótipo voa para o topo.
- Fotografias reveladas por ripas; índice de carros com a fotografia a seguir o rato; pedido escrito como uma frase que abre o WhatsApp.
- Contacto fixo: WhatsApp + Ligar (barra no telemóvel, bloco no canto no computador).

## Perguntas em aberto para a Protrade
- Garantia do Corsa, 308 SW e Taigo: o portal diz 36 meses e o texto do anúncio diz 18. No site aparece «Incluída».
- Horário do stand (não está publicado em lado nenhum).
- Fotografias com o fundo de outono: confirmar que são as que querem mostrar no site.
