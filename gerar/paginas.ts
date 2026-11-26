// Gera o HTML de cada rota (home + uma ficha por carro), os cartões de partilha, robots e sitemap, dentro de dist/.
// Corre depois do `vite build` (lê o manifest para saber o JS e o CSS com hash).
// SITE_URL=<url da prévia>  BASE=/<pasta>/  NOINDEX=1 (por omissão: protótipo, não indexar)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { carros, euros, kms, RAIZ, type Carro } from './modelo.ts';

const DIST = path.join(RAIZ, 'dist');
const BASE = (process.env.BASE ?? '/').replace(/\/?$/, '/');
const SITE = (process.env.SITE_URL ?? 'http://localhost:4192').replace(/\/$/, '');
const NOINDEX = process.env.NOINDEX !== '0';
const ABS = (p: string) => SITE + BASE + p.replace(/^\//, '');
const R = (p: string) => BASE + p.replace(/^\//, '');

const TEL = '911 150 080', TEL_E164 = '+351911150080', WA = '351911150080', EMAIL = 'geral@protrade.pt';
const MORADA = 'Rua da Fundição, Edifício Caíde Gold, Loja 13, 4620-042 Caíde de Rei, Lousada';
const MAPA = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Protrade Automóveis, Rua da Fundição, Caíde de Rei, Lousada');
const REDES = { instagram: 'https://www.instagram.com/protrade.lda/', facebook: 'https://www.facebook.com/protrade.lda', youtube: 'https://www.youtube.com/channel/UCEJSL2OIL_bWFe906LZTTAw' };
const DATA_LISTA = '26/11/2026';

const man = JSON.parse(fs.readFileSync(path.join(DIST, '.vite', 'manifest.json'), 'utf8'));
const entrada = man['src/main.ts'];
const JS = R(entrada.file), CSS = [...(entrada.css ?? []), ...(man['style.css'] ? [man['style.css'].file] : [])].map((c: string) => R(c));

// o CSS vai embutido em cada página (sem pedido a bloquear a primeira pintura); a letra é servida pelo próprio site
const CSS_TXT = CSS.map((c: string) => fs.readFileSync(path.join(DIST, c.slice(BASE.length)), 'utf8')).join('');
const FONTES = ['', '-it'].map((v) => `@font-face{font-family:Montserrat;font-style:${v ? 'italic' : 'normal'};font-weight:400 800;font-display:swap;src:url(${R(`fontes/montserrat${v}.woff2`)}) format('woff2')}`).join('');
const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wa = (txt: string) => `https://wa.me/${WA}?text=${encodeURIComponent(txt)}`;
const pad = (i: number) => String(i).padStart(2, '0');
const img = (c: Carro, i: number, w: number) => R(`img/${c.slug}/${pad(i)}-${w}.webp`);
const srcset = (c: Carro, i: number) => [640, 900, 1200, 1800].map((w) => `${img(c, i, w)} ${w}w`).join(', ');

// ---------- logótipo verdadeiro, vectorizado do original (gerar/logo.svg) ----------
const LOGO = fs.readFileSync(path.join(RAIZ, 'gerar', 'logo.svg'), 'utf8');
const camada = (n: string) => (LOGO.match(new RegExp(`<path class="lg-${n}"[^>]*/>`)) ?? [''])[0];
const SIMB_VB = '655 28 549 549', PAL_VB = '26 688 1905 261';
const simbolo = (cls: string) => `<svg class="${cls}" viewBox="${SIMB_VB}" aria-hidden="true"><use href="#lg-simbolo"/></svg>`;
const palavra = (cls: string) => `<svg class="${cls}" viewBox="${PAL_VB}" aria-hidden="true"><use href="#lg-pro"/><use href="#lg-trade"/></svg>`;
// o desenho do logótipo vai uma vez por página; as cópias usam <use>
const SIMBOLOS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${['simbolo', 'pro', 'trade', 'automoveis'].map((n) => camada(n).replace(`class="lg-${n}"`, `id="lg-${n}" class="lg-${n}"`)).join('')}</defs></svg>`;

// As oito pétalas do símbolo (o anel do logótipo é feito de círculos sobrepostos): forma-se na abertura.
const petalas = Array.from({ length: 8 }, (_, k) => {
  const a = (k * 45 * Math.PI) / 180;
  return `<circle class="pet" style="--k:${k}" cx="${(Math.cos(a)).toFixed(4)}" cy="${(Math.sin(a)).toFixed(4)}" r="0.55"/>`;
}).join('');

// ---------- ícones (traço simples, cor do texto) ----------
const I = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M4.6 19.6l1.1-3.7A8.2 8.2 0 1 1 8.6 18.6z"/><path fill="currentColor" d="M9.1 8.2c-.3.9 0 2.4 1.5 3.9s3.1 1.9 4 1.6l.9-1.2c.1-.2.1-.4-.1-.5l-1.6-.8c-.2-.1-.4 0-.5.1l-.5.6c-.9-.4-1.6-1.1-2-2l.6-.5c.1-.1.2-.3.1-.5l-.8-1.6c-.1-.2-.3-.2-.5-.1z"/></svg>',
  tel: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M5.5 3.8h3.4l1.7 4.4-2.2 1.4a11.5 11.5 0 0 0 6 6l1.4-2.2 4.4 1.7v3.4a1.8 1.8 0 0 1-1.9 1.8A16 16 0 0 1 3.7 5.7a1.8 1.8 0 0 1 1.8-1.9z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3" fill="currentColor"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path fill="currentColor" d="M13.6 21v-7.4h2.5l.4-2.9h-2.9V8.9c0-.8.3-1.4 1.5-1.4h1.5V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8.2v2.9h2.5V21z"/></svg>',
  yt: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><rect x="2.8" y="5.5" width="18.4" height="13" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="currentColor" d="M10.3 9.3v5.4l4.6-2.7z"/></svg>',
  seta: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M5 12h14M13 6l6 6-6 6"/></svg>',
  esq: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path fill="none" stroke="currentColor" stroke-width="2" d="M15 5l-7 7 7 7"/></svg>',
  dir: '<svg viewBox="0 0 24 24" aria-hidden="true" class="ic"><path fill="none" stroke="currentColor" stroke-width="2" d="M9 5l7 7-7 7"/></svg>',
};

// ---------- peças comuns ----------
function cabeca(o: { titulo: string; descricao: string; rota: string; og: string; jsonld: object[]; preload?: string }) {
  return `<!doctype html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.titulo)}</title>
<meta name="description" content="${esc(o.descricao)}">
${NOINDEX ? '<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="canonical" href="${ABS(o.rota)}">
<meta name="theme-color" content="#0A0F2C">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_PT">
<meta property="og:site_name" content="Protrade Automóveis">
<meta property="og:title" content="${esc(o.titulo)}">
<meta property="og:description" content="${esc(o.descricao)}">
<meta property="og:url" content="${ABS(o.rota)}">
<meta property="og:image" content="${ABS(o.og)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${R('favicon.svg')}" type="image/svg+xml">
<link rel="preload" href="${R('fontes/montserrat-it.woff2')}" as="font" type="font/woff2" crossorigin>
${o.preload ?? ''}
<style>${FONTES}${CSS_TXT}</style>
<script>try{if(localStorage.getItem('pt-movimento')==='0')document.documentElement.classList.add('sem-movimento')}catch(e){}document.documentElement.classList.add('js')</script>
<script type="module" src="${JS}"></script>
${o.jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>`;
}

const NAV = [['Viaturas', 'viaturas'], ['Empresas', 'empresas'], ['Visita', 'visita'], ['Contacto', 'contacto']];
function topo(home: boolean) {
  const h = (id: string) => (home ? `#${id}` : `${R('/')}#${id}`);
  return `<a class="saltar" href="#conteudo">Saltar para o conteúdo</a>
<header class="topo" data-topo>
  <a class="topo-marca" href="${R('/')}" aria-label="Protrade Automóveis, início" data-topo-marca>${simbolo('topo-simbolo')}${palavra('topo-palavra')}</a>
  <nav class="topo-nav" aria-label="Principal">${NAV.map(([t, id]) => `<a href="${h(id)}">${t}</a>`).join('')}</nav>
  <button class="topo-menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-abrir><span>Menu</span></button>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav aria-label="Menu">${NAV.map(([t, id], i) => `<a href="${h(id)}" style="--i:${i}">${t}</a>`).join('')}</nav>
  <p class="menu-contactos"><a href="tel:${TEL_E164}" data-cta="menu-ligar">${I.tel}${TEL}</a><a href="mailto:${EMAIL}" data-cta="menu-email">${I.mail}${EMAIL}</a></p>
</div>`;
}

function barra(msg: string) {
  return `<div class="barra" data-barra>
  <a class="barra-wa" href="${wa(msg)}" target="_blank" rel="noopener" data-cta="barra-whatsapp">${I.wa}<span>Fale connosco</span></a>
  <a class="barra-tel" href="tel:${TEL_E164}" data-cta="barra-ligar">${I.tel}<span>Ligar <b>${TEL}</b></span></a>
</div>`;
}

function contacto(lista: Carro[], escolhido?: Carro) {
  const opc = lista.map((c) => `<option value="${esc(c.nome + ' ' + c.versao + ' (' + euros(c.preco) + ')')}"${escolhido?.slug === c.slug ? ' selected' : ''}>${esc(c.nome + ' ' + c.versao)}</option>`).join('');
  return `<section class="contacto" id="contacto" data-contacto>
  <h2 class="contacto-titulo cinetico"><span class="l"><span>Qual é o</span></span><span class="l"><span><em>seu próximo?</em></span></span></h2>
  <form class="frase" data-form novalidate>
    <p class="frase-texto">
      <span>Chamo-me</span>
      <label class="vh" for="f-nome">O seu nome</label><input id="f-nome" name="nome" autocomplete="name" placeholder="o seu nome" required>
      <span>e o meu número é</span>
      <label class="vh" for="f-tel">O seu telemóvel</label><input id="f-tel" name="telefone" type="tel" inputmode="tel" autocomplete="tel" placeholder="telemóvel" required pattern="[0-9 +]{9,16}">
      <span>Quero saber do</span>
      <label class="vh" for="f-carro">O carro que lhe interessa</label><select id="f-carro" name="carro">${opc}<option value="outro carro"${escolhido ? '' : ' selected'}>carro que procuro</option></select>
    </p>
    <p class="frase-erro" data-form-erro role="alert"></p>
    <button class="frase-enviar" type="submit" data-cta="formulario-enviar">${I.wa}<span>Enviar pelo WhatsApp</span></button>
    <p class="frase-fim" data-form-fim tabindex="-1" hidden>Pedido pronto no WhatsApp. Se a janela não abriu, ligue para <a href="tel:${TEL_E164}" data-cta="formulario-ligar">${TEL}</a>.</p>
  </form>
</section>`;
}

function rodape() {
  return `<footer class="rodape">
  <div class="rodape-linha">
    <a class="rodape-marca" href="${R('/')}" aria-label="Protrade Automóveis, início">${simbolo('rodape-simbolo')}${palavra('rodape-palavra')}</a>
    <p class="rodape-redes">
      <a href="${REDES.instagram}" target="_blank" rel="noopener" aria-label="Instagram da Protrade">${I.ig}</a>
      <a href="${REDES.facebook}" target="_blank" rel="noopener" aria-label="Facebook da Protrade">${I.fb}</a>
      <a href="${REDES.youtube}" target="_blank" rel="noopener" aria-label="YouTube da Protrade">${I.yt}</a>
    </p>
  </div>
  <div class="rodape-linha rodape-pe">
    <p>${esc(MORADA)} · <a href="tel:${TEL_E164}" data-cta="rodape-ligar">${TEL}</a> (chamada para a rede móvel nacional) · <a href="mailto:${EMAIL}" data-cta="rodape-email">${EMAIL}</a></p>
    <p><button class="mov" type="button" aria-pressed="false" data-movimento>Reduzir movimento</button> · Protótipo da AutoUpscale para a Protrade. Carros, preços e fotografias dos anúncios da Protrade a ${DATA_LISTA}.</p>
  </div>
</footer>`;
}

const fim = `</body>\n</html>\n`;

const ORG = {
  '@context': 'https://schema.org', '@type': 'AutoDealer', name: 'Protrade Automóveis', url: ABS('/'),
  telephone: TEL_E164, email: EMAIL, foundingDate: '2012', image: ABS('og/home.jpg'),
  address: { '@type': 'PostalAddress', streetAddress: 'Rua da Fundição, Edifício Caíde Gold, Loja 13', postalCode: '4620-042', addressLocality: 'Caíde de Rei, Lousada', addressCountry: 'PT' },
  sameAs: Object.values(REDES),
};

// ---------- home ----------
function home(cs: Carro[]) {
  const por = (s: string) => cs.find((c) => c.slug.startsWith(s))!;
  const planos: [Carro, number][] = [[por('audi-a3-sportback-45'), 0], [por('vw-taigo'), 0], [por('opel-corsa'), 0], [por('peugeot-308-1-2'), 3], [por('audi-a3-sportback-30'), 0]];
  const [p0] = planos;
  const preload = `<link rel="preload" as="image" imagesrcset="${srcset(p0[0], p0[1])}" imagesizes="100vw" fetchpriority="high">`;
  const minP = Math.min(...cs.map((c) => c.preco)), maxP = Math.max(...cs.map((c) => c.preco));
  const [dest, ...resto] = cs;
  const linha = (c: Carro, i: number) => `<li><a class="linha" href="${R(`viaturas/${c.slug}/`)}" data-linha data-img="${img(c, c.capa, 640)}" style="--i:${i}">
      <img class="linha-foto" src="${img(c, c.capa, 640)}" alt="${esc(c.nome + ' ' + c.versao)}" width="640" height="444" loading="lazy" decoding="async">
      <span class="linha-nome">${esc(c.marca)} <em>${esc(c.modelo.replace(c.marca, '').trim())}</em></span>
      <span class="linha-versao">${esc(c.versao)}</span>
      <span class="linha-dados">${c.ano} · ${kms(c.km)} · ${esc(c.combustivel)} · ${c.cv} cv · ${esc(c.caixa)}</span>
      <span class="linha-preco">${euros(c.preco)}</span>
    </a></li>`;
  const audi = dest;
  const corpo = `
<body class="pg-home">
${SIMBOLOS}
${topo(true)}
<main id="conteudo">
<section class="hero" data-hero>
  <div class="hero-moldura" data-moldura>
    <div class="hero-planos" data-planos>
      ${planos.map(([c, i], k) => `<img class="hero-plano${k === 0 ? ' ativo' : ''}" style="--k:${k}" ${k === 0 ? `src="${img(c, i, 1800)}" srcset="${srcset(c, i)}" fetchpriority="high"` : `data-srcset="${srcset(c, i)}"`} sizes="100vw" alt="${esc(c.nome + ' ' + c.versao + ' à venda na Protrade')}" width="1448" height="1004" decoding="async">`).join('\n      ')}
    </div>
    <div class="hero-veu"></div>
    <h1 class="hero-titulo cinetico" data-hero-titulo><span class="l"><span>Primeiro dono.</span></span><span class="l"><span><em>Origem certa.</em></span></span></h1>
  </div>
  <div class="abertura" data-abertura aria-hidden="true">
    <div class="ripas">${Array.from({ length: 12 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
    <div class="abertura-logo" data-abertura-logo>
      <svg class="ab-petalas" viewBox="-1.05 -1.05 2.1 2.1"><defs><clipPath id="anel"><circle r="1"/></clipPath></defs><g clip-path="url(#anel)">${petalas}</g></svg>
      ${simbolo('ab-simbolo')}
      <svg class="ab-pro" viewBox="26 688 680 261"><use href="#lg-pro"/></svg>
      <svg class="ab-trade" viewBox="730 688 1201 261"><use href="#lg-trade"/></svg>
      <svg class="ab-auto" viewBox="486 1027 932 117"><use href="#lg-automoveis"/></svg>
    </div>
  </div>
</section>

<section class="intro">
  <p class="intro-frase cinetico"><span class="l"><span>A Protrade vende carros usados de <em>primeiro dono</em>,</span></span> <span class="l"><span>vindos de instituições financeiras e concessionários oficiais.</span></span> <span class="l"><span>Em Caíde de Rei, Lousada, <em>desde 2012.</em></span></span></p>
</section>

<section class="origem" id="origem" data-origem>
  <h2 class="cinetico"><span class="l"><span>De onde vem</span></span><span class="l"><span><em>cada carro?</em></span></span></h2>
  <p class="origem-resposta">Directamente do primeiro proprietário, com a manutenção feita segundo as regras do fabricante.</p>
  <div class="estrada" data-estrada>
    <ol class="paragens">
      <li data-paragem="0"><b>Instituição financeira</b> ou concessionário oficial</li>
      <li data-paragem="1"><b>Primeiro proprietário</b> e um só historial</li>
      <li data-paragem="2"><b>Manutenção</b> segundo a marca</li>
      <li data-paragem="3"><b>Protrade</b> em Caíde de Rei, Lousada</li>
    </ol>
    <div class="estrada-via"><span class="estrada-traco" data-traco></span></div>
    <img class="estrada-carro" data-carro src="${R('img/audi-perfil.webp')}" srcset="${R('img/audi-perfil-600.webp')} 600w, ${R('img/audi-perfil.webp')} 1100w" sizes="(max-width: 700px) 46vw, 30vw" alt="Audi A3 Sportback 45 TFSIe da Protrade, de perfil" width="1100" height="407" loading="lazy" decoding="async">
  </div>
</section>

<section class="viaturas" id="viaturas">
  <div class="viaturas-cabeca">
    <h2 class="cinetico"><span class="l"><span>Que carros</span></span><span class="l"><span><em>temos agora?</em></span></span></h2>
    <p>Sete carros, de ${euros(minP)} a ${euros(maxP)}. Lista de ${DATA_LISTA}.</p>
  </div>
  <a class="destaque" href="${R(`viaturas/${dest.slug}/`)}" data-cta-nav="destaque">
    <span class="destaque-foto"><img src="${img(dest, 1, 1200)}" srcset="${srcset(dest, 1)}" sizes="(max-width: 900px) 100vw, 62vw" alt="${esc(dest.nome + ' ' + dest.versao)}, de frente" width="1448" height="1004" loading="lazy" decoding="async"></span>
    <span class="destaque-texto">
      <span class="destaque-nome">${esc(dest.nome)}<em>${esc(dest.versao)}</em></span>
      <span class="destaque-dados">${dest.ano} · ${kms(dest.km)} · ${esc(dest.combustivel)} · ${dest.cv} cv</span>
      <span class="destaque-preco">${euros(dest.preco)}</span>
      <span class="destaque-ir">Ver o carro ${I.seta}</span>
    </span>
  </a>
  <ol class="indice" data-indice>
    ${resto.map(linha).join('\n    ')}
  </ol>
  <div class="flutua" data-flutua aria-hidden="true"><img alt="" width="640" height="444"></div>
</section>

<section class="empresas" id="empresas">
  <h2 class="empresas-titulo cinetico"><span class="l"><span>Compra para</span></span><span class="l"><span><em>a empresa?</em></span></span></h2>
  <p class="empresas-resposta">Vender a empresas é o nosso foco principal. E os particulares são sempre bem-vindos.</p>
  <figure class="empresas-foto ripas-revela" data-revela><img src="${img(audi, 2, 1200)}" srcset="${srcset(audi, 2)}" sizes="(max-width: 900px) 100vw, 50vw" alt="Traseira do Audi A3 Sportback 45 TFSIe com a matrícula Protrade" width="1448" height="1004" loading="lazy" decoding="async"></figure>
  <div class="empresas-caso">
    <h3>${esc(audi.nome)} ${esc(audi.versao)}</h3>
    <ul>
      <li><b>IVA dedutível</b> para empresas</li>
      <li><b>Tributação autónoma</b> reduzida</li>
      <li><b>Híbrido plug-in</b>, ${audi.cv} cv, ${euros(audi.preco)}</li>
    </ul>
    <p>Assim diz o anúncio deste carro. Para a conta da sua empresa, fale connosco.</p>
    <a class="ligacao" href="${R(`viaturas/${audi.slug}/`)}">Ver este carro ${I.seta}</a>
  </div>
</section>

<section class="visita" id="visita">
  <figure class="visita-foto ripas-revela" data-revela><img src="${img(por('opel-corsa'), 0, 1200)}" srcset="${srcset(por('opel-corsa'), 0)}" sizes="(max-width: 900px) 100vw, 58vw" alt="O espaço da Protrade em Caíde de Rei, com o nome na parede de ripas" width="1448" height="1004" loading="lazy" decoding="async"></figure>
  <div class="visita-texto">
    <h2 class="cinetico"><span class="l"><span>Onde nos</span></span><span class="l"><span><em>encontra?</em></span></span></h2>
    <p class="visita-morada">${esc(MORADA)}.</p>
    <p class="visita-acoes">
      <a href="${MAPA}" target="_blank" rel="noopener">${I.pin}Abrir no mapa</a>
      <a href="tel:${TEL_E164}" data-cta="visita-ligar">${I.tel}${TEL}</a>
      <a href="mailto:${EMAIL}" data-cta="visita-email">${I.mail}${EMAIL}</a>
    </p>
  </div>
</section>

${contacto(cs)}
</main>
${rodape()}
${barra('Olá Protrade, vi o vosso site e gostava de saber mais sobre os vossos carros.')}
`;
  return cabeca({
    titulo: 'Protrade Automóveis · Carros usados de primeiro dono em Lousada',
    descricao: `Carros usados de primeiro dono, vindos de instituições financeiras e concessionários oficiais. ${cs.length} carros de ${euros(minP)} a ${euros(maxP)}, em Caíde de Rei, Lousada. Fale connosco pelo WhatsApp.`,
    rota: '/', og: 'og/home.jpg', preload,
    jsonld: [ORG, { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: cs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: ABS(`viaturas/${c.slug}/`), name: `${c.nome} ${c.versao}` })) }],
  }) + corpo + fim;
}

// ---------- ficha de cada carro ----------
function ficha(c: Carro, cs: Carro[]) {
  const ordem = [c.capa, ...Array.from({ length: c.nFotos }, (_, i) => i).filter((i) => i !== c.capa)];
  const preload = `<link rel="preload" as="image" imagesrcset="${srcset(c, ordem[0])}" imagesizes="(max-width: 900px) 100vw, 80vw" fetchpriority="high">`;
  const nums: [string, string][] = [['Ano', `${c.mes ? c.mes + ' ' : ''}${c.ano}`], ['Quilómetros', kms(c.km)], ['Combustível', c.combustivel], ['Potência', `${c.cv} cv`], ['Caixa', c.caixa]];
  const tec: [string, string][] = ([['Versão', c.versao], ['Cor', c.cor], ['Portas', c.portas], ['Lugares', c.lugares], ['Cilindrada', c.cilindrada], ['Emissões de CO₂', c.co2], ['Garantia', c.garantia ?? 'Incluída']] as [string, string][]).filter(([, v]) => v);
  const outros = cs.filter((o) => o.slug !== c.slug);
  const msg = `Olá Protrade, vi o ${c.nome} ${c.versao} (${euros(c.preco)}) no vosso site e gostava de saber mais.`;
  const corpo = `
<body class="pg-ficha">
${SIMBOLOS}
${topo(false)}
<main id="conteudo">
<div class="ficha-cima">
<section class="ficha-topo">
  <p class="migalha"><a href="${R('/')}#viaturas">${I.esq}Todos os carros</a></p>
  <h1 class="ficha-nome cinetico"><span class="l"><span>${esc(c.nome)}</span></span><span class="l"><span><em>${esc(c.versao)}</em></span></span></h1>
  <p class="ficha-preco">${euros(c.preco)}${c.negociavel ? ' <span>negociável</span>' : ''}</p>
  <dl class="ficha-numeros">${nums.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
</section>

<section class="galeria" data-galeria aria-label="Fotografias do ${esc(c.nome)}">
  <div class="galeria-palco" data-palco>
    ${ordem.map((i, k) => `<img class="galeria-foto${k === 0 ? ' ativo' : ''}" ${k === 0 ? `src="${img(c, i, 1800)}" srcset="${srcset(c, i)}" fetchpriority="high"` : `data-srcset="${srcset(c, i)}"`} sizes="(max-width: 900px) 100vw, 80vw" alt="${esc(c.nome + ' ' + c.versao)}, fotografia ${k + 1} de ${c.nFotos}" width="1448" height="1004" decoding="async">`).join('\n    ')}
    <button class="galeria-seta galeria-ant" type="button" aria-label="Fotografia anterior" data-ant>${I.esq}</button>
    <button class="galeria-seta galeria-seg" type="button" aria-label="Fotografia seguinte" data-seg>${I.dir}</button>
    <p class="galeria-conta" aria-live="polite"><span data-conta>1</span> / ${c.nFotos}</p>
  </div>
  <div class="galeria-tira" data-tira>
    ${ordem.map((i, k) => `<button type="button" class="galeria-mini${k === 0 ? ' ativo' : ''}" aria-label="Ver fotografia ${k + 1}" data-mini="${k}"><img src="${img(c, i, 640)}" alt="" width="640" height="444" loading="lazy" decoding="async"></button>`).join('')}
  </div>
</section>
</div>

<section class="ficha-corpo">
  ${c.destaques.length ? `<div class="ficha-destaques">
    <h2>O que diz o anúncio?</h2>
    <ul>${c.destaques.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
  </div>` : ''}
  <dl class="ficha-tecnica">${tec.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  <div class="ficha-equip">
    <h2>Que equipamento tem?</h2>
    <div class="equip-grupos">${c.equipamento.map((g) => `<div class="equip-grupo"><h3>${esc(g.grupo)}</h3><p>${g.itens.map(esc).join(' · ')}</p></div>`).join('')}</div>
  </div>
</section>

<section class="outros">
  <h2>Outros carros da Protrade</h2>
  <div class="outros-fila" data-fila>
    ${outros.map((o) => `<a class="outro" href="${R(`viaturas/${o.slug}/`)}"><span class="outro-foto"><img src="${img(o, o.capa, 640)}" alt="${esc(o.nome + ' ' + o.versao)}" width="640" height="444" loading="lazy" decoding="async"></span><span class="outro-nome">${esc(o.nome)}</span><span class="outro-preco">${euros(o.preco)}</span></a>`).join('\n    ')}
  </div>
</section>

${contacto(cs, c)}
</main>
${rodape()}
${barra(msg)}
`;
  const titulo = `${c.nome} ${c.versao} ${c.ano} · ${euros(c.preco)} · Protrade, Lousada`;
  const descricao = `${c.nome} ${c.versao} de ${c.ano}, ${kms(c.km)}, ${c.combustivel.toLowerCase()}, ${c.cv} cv, caixa ${c.caixa.toLowerCase()}. ${euros(c.preco)} na Protrade, em Caíde de Rei, Lousada.`;
  return cabeca({
    titulo, descricao, rota: `viaturas/${c.slug}/`, og: `og/${c.slug}.jpg`, preload,
    jsonld: [{
      '@context': 'https://schema.org', '@type': 'Car', name: `${c.nome} ${c.versao}`, brand: { '@type': 'Brand', name: c.marca }, model: c.modelo,
      vehicleModelDate: String(c.ano), mileageFromOdometer: { '@type': 'QuantitativeValue', value: c.km, unitCode: 'KMT' },
      fuelType: c.combustivel, vehicleTransmission: c.caixa, color: c.cor, itemCondition: 'https://schema.org/UsedCondition',
      image: ordem.slice(0, 4).map((i) => ABS(`img/${c.slug}/${pad(i)}-1200.webp`)),
      offers: { '@type': 'Offer', price: c.preco, priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: ABS(`viaturas/${c.slug}/`), seller: { '@type': 'AutoDealer', name: 'Protrade Automóveis' } },
    }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Protrade', item: ABS('/') },
      { '@type': 'ListItem', position: 2, name: `${c.nome} ${c.versao}`, item: ABS(`viaturas/${c.slug}/`) }] }],
  }) + corpo + fim;
}

// ---------- cartões de partilha 1200×630 ----------
async function cartao(foto: string, l1: string, l2: string, l3: string, dst: string) {
  const fundo = await sharp(path.join(RAIZ, 'public', foto)).resize(1200, 630, { fit: 'cover', position: 'centre' }).toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0A0F2C" stop-opacity=".94"/><stop offset=".55" stop-color="#0A0F2C" stop-opacity=".55"/><stop offset="1" stop-color="#0A0F2C" stop-opacity="0"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(64 64) scale(0.105)"><g transform="translate(-655 -28)">${camada('simbolo')}</g></g>
  <g transform="translate(136 66) scale(0.2)" fill="#fff"><g transform="translate(-26 -688)">${camada('pro').replace('currentColor', '#fff')}${camada('trade').replace('currentColor', '#fff')}</g></g>
  <text x="64" y="420" font-family="Montserrat, Segoe UI, Arial" font-weight="800" font-style="italic" font-size="64" fill="#fff">${esc(l1)}</text>
  <text x="64" y="478" font-family="Montserrat, Segoe UI, Arial" font-weight="500" font-size="30" fill="#DDE5FF">${esc(l2)}</text>
  <text x="64" y="560" font-family="Montserrat, Segoe UI, Arial" font-weight="800" font-size="40" fill="#7FA2FF">${esc(l3)}</text>
</svg>`;
  await sharp(fundo).composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 82, mozjpeg: true }).toFile(dst);
}

// ---------- escrever ----------
const cs = carros();
const escreve = (rota: string, html: string) => { const p = path.join(DIST, rota); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, html); };
escreve('index.html', home(cs));
for (const c of cs) escreve(`viaturas/${c.slug}/index.html`, ficha(c, cs));
fs.mkdirSync(path.join(DIST, 'og'), { recursive: true });
await cartao(`img/${cs[0].slug}/00-1800.webp`, 'Primeiro dono. Origem certa.', `${cs.length} carros em Caíde de Rei, Lousada`, 'Fale connosco · 911 150 080', path.join(DIST, 'og', 'home.jpg'));
for (const c of cs) await cartao(`img/${c.slug}/${pad(c.capa)}-1800.webp`, c.nome, `${c.ano} · ${kms(c.km)} · ${c.cv} cv · ${c.caixa}`, euros(c.preco), path.join(DIST, 'og', `${c.slug}.jpg`));
fs.writeFileSync(path.join(DIST, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SIMB_VB}">${camada('simbolo')}</svg>`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), NOINDEX ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${ABS('sitemap.xml')}\n`);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['/', ...cs.map((c) => `viaturas/${c.slug}/`)].map((u) => `  <url><loc>${ABS(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
console.log('páginas:', 1 + cs.length, '· SITE', SITE, '· BASE', BASE, '· noindex', NOINDEX);
