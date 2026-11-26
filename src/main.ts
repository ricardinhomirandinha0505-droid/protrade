// Protrade · comportamento do site (TypeScript, sem dependências).
import './estilo.css';

declare global { interface Window { dataLayer: Record<string, unknown>[] } }

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const html = document.documentElement;
const semMov = () => html.classList.contains('sem-movimento');
const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const raf = () => new Promise<number>((r) => requestAnimationFrame(r));
window.dataLayer = window.dataLayer || [];

// ---------- medição: cada CTA diz de onde veio a lead, e o envio do formulário guarda essa origem ----------
function medicao() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLElement>('[data-cta]');
    if (!a) return;
    const origem = a.dataset.cta!;
    if (origem !== 'formulario-enviar') { try { sessionStorage.setItem('pt-origem', origem); } catch { /* sem armazenamento */ } }
    window.dataLayer.push({ event: 'cta_contacto', origem, pagina: location.pathname });
  });
}
const origemGuardada = () => { try { return sessionStorage.getItem('pt-origem') || 'direto'; } catch { return 'direto'; } };

// ---------- interruptor «Reduzir movimento» ----------
function interruptor() {
  const pinta = () => $$<HTMLButtonElement>('[data-movimento]').forEach((b) => { b.setAttribute('aria-pressed', String(semMov())); b.textContent = semMov() ? 'Repor movimento' : 'Reduzir movimento'; });
  pinta();
  document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('[data-movimento]')) return;
    html.classList.toggle('sem-movimento');
    try { localStorage.setItem('pt-movimento', semMov() ? '0' : '1'); } catch { /* */ }
    pinta(); document.dispatchEvent(new Event('pt-movimento'));
  });
}

// ---------- títulos: linhas que sobem e ganham nitidez quando entram no ecrã ----------
function titulos() {
  $$('.cinetico').forEach((t) => $$('.l', t).forEach((l, i) => (l.firstElementChild as HTMLElement)?.style.setProperty('--n', String(i))));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  $$('.cinetico').forEach((t) => { if (!t.matches('[data-hero-titulo]')) io.observe(t); });
}

// ---------- fotografias reveladas pela parede de ripas ----------
function revelas() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -18% 0px' });
  $$('[data-revela]').forEach((f) => {
    const capa = document.createElement('span'); capa.className = 'ripa-capa'; capa.setAttribute('aria-hidden', 'true');
    capa.innerHTML = Array.from({ length: 10 }, (_, i) => `<i style="--i:${i}"></i>`).join('');
    f.prepend(capa); io.observe(f);
  });
}

// ---------- topo: fica sólido quando sai do hero; menu do telemóvel ----------
function topo() {
  const t = $('[data-topo]'); if (!t) return;
  const hero = $('[data-hero]');
  const pinta = () => t.classList.toggle('solido', !hero || scrollY > hero.offsetHeight - 90);
  pinta(); addEventListener('scroll', pinta, { passive: true });
  const btn = $<HTMLButtonElement>('[data-menu-abrir]'), menu = $('[data-menu]');
  if (!btn || !menu) return;
  const fecha = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.firstElementChild!.textContent = 'Menu'; document.body.style.overflow = ''; };
  btn.addEventListener('click', () => {
    if (!menu.hidden) return fecha();
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.firstElementChild!.textContent = 'Fechar'; document.body.style.overflow = 'hidden';
    $<HTMLAnchorElement>('a', menu)?.focus();
  });
  menu.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) fecha(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { fecha(); btn.focus(); } });
}

// ---------- hero: planos reais com câmara viva e fundidos longos; encolhe para moldura ao scroll ----------
function hero() {
  const caixa = $('[data-planos]'); if (!caixa) return;
  const planos = $$<HTMLImageElement>('.hero-plano', caixa);
  let i = 0, timer = 0, visivel = true;
  const carregaResto = () => planos.forEach((p) => { if (p.dataset.srcset) { p.srcset = p.dataset.srcset; delete p.dataset.srcset; } });
  // os outros planos só se pedem depois da primeira pintura (não tiram nada ao LCP)
  if (document.readyState === 'complete') setTimeout(carregaResto, 600); else addEventListener('load', () => setTimeout(carregaResto, 600));
  const passa = () => {
    if (semMov() || document.hidden || !visivel) return;
    const seg = planos[(i + 1) % planos.length];
    if (!seg.complete || !seg.currentSrc) return;
    planos[i].classList.remove('ativo'); i = (i + 1) % planos.length; seg.classList.add('ativo');
  };
  const arranca = () => { clearInterval(timer); timer = window.setInterval(passa, 5200); };
  arranca();
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(caixa);
  document.addEventListener('visibilitychange', arranca);

  const moldura = $('[data-moldura]'), h = $('[data-hero]');
  if (!moldura || !h) return;
  let pedido = false;
  const pinta = () => { pedido = false; const p = Math.min(1, Math.max(0, scrollY / (h.offsetHeight * .8))); moldura.style.setProperty('--p', p.toFixed(4)); };
  addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(pinta); } }, { passive: true });
  pinta();
}

// ---------- abertura: as ripas tapam, o anel forma-se, TRADE acelera, as ripas abrem e o logótipo voa para o topo ----------
async function abertura() {
  const ab = $('[data-abertura]'), titulo = $('[data-hero-titulo]');
  const mostraTitulo = () => titulo?.classList.add('visto');
  if (!ab) return;
  const acaba = () => { ab.remove(); html.classList.remove('abrindo'); mostraTitulo(); };
  if (semMov()) return acaba();
  html.classList.add('abrindo');
  await raf(); await raf();
  ab.classList.add('p1'); await espera(820);
  ab.classList.add('p2'); await espera(330);
  ab.classList.add('p3'); await espera(900);
  // voo: símbolo e palavra para o sítio deles no topo
  const alvoS = $('.topo-simbolo'), alvoP = $('.topo-palavra');
  const simb = $('.ab-simbolo', ab), pro = $('.ab-pro', ab), trade = $('.ab-trade', ab);
  ab.classList.add('abre');
  if (alvoS && alvoP && simb && pro && trade && getComputedStyle($('.topo-marca')!).display !== 'none') {
    const voa = (el: Element, alvo: DOMRect, origem: DOMRect) => {
      const dx = alvo.left - origem.left, dy = alvo.top - origem.top, s = alvo.width / origem.width;
      return (el as HTMLElement).animate([{ transform: 'translate(0,0) scale(1)', transformOrigin: '0 0' }, { transform: `translate(${dx}px,${dy}px) scale(${s})`, transformOrigin: '0 0' }],
        { duration: 820, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    };
    const rP = alvoP.getBoundingClientRect(), rPro = pro.getBoundingClientRect(), rTr = trade.getBoundingClientRect();
    // a palavra do topo tem PRO+TRADE no mesmo viewBox: o alvo de cada metade calcula-se pela proporção do original
    const sx = rP.width / 1905;
    const alvoPro = new DOMRect(rP.left + (26 - 26) * sx, rP.top, 680 * sx, rP.height);
    const alvoTr = new DOMRect(rP.left + (730 - 26) * sx, rP.top, 1201 * sx, rP.height);
    voa(simb, alvoS.getBoundingClientRect(), simb.getBoundingClientRect());
    voa(pro, alvoPro, rPro); voa(trade, alvoTr, rTr);
    await espera(840);
  } else {
    (ab.querySelector('.abertura-logo') as HTMLElement).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
    await espera(420);
  }
  html.classList.remove('abrindo');
  await espera(60);
  acaba();
}

// ---------- origem: o Audi faz o caminho da origem com o scroll, as paragens acendem ----------
function origem() {
  const sec = $('[data-origem]'), carro = $<HTMLImageElement>('[data-carro]'), traco = $('[data-traco]'), estrada = $('[data-estrada]');
  if (!sec || !carro || !estrada) return;
  const paragens = $$('[data-paragem]', sec);
  let alvo = 0, atual = 0, ativo = false;
  const medir = () => {
    const r = estrada.getBoundingClientRect();
    const p = (innerHeight * .92 - r.top) / (r.height + innerHeight * .55);
    alvo = Math.min(1, Math.max(0, p));
  };
  const pinta = () => {
    atual += (alvo - atual) * (semMov() ? 1 : .12);
    const max = estrada.clientWidth - carro.clientWidth;
    carro.style.setProperty('--x', `${(atual * max).toFixed(1)}px`);
    carro.style.setProperty('--x-fim', `${max}px`);
    traco?.style.setProperty('--o', (atual * 9).toFixed(3));
    // cada paragem acende quando a frente do carro passa por baixo dela
    const frente = atual * max + carro.clientWidth * .82, base = estrada.getBoundingClientRect().left;
    paragens.forEach((li) => li.classList.toggle('aceso', semMov() || frente >= li.getBoundingClientRect().left - base + 24));
    if (Math.abs(alvo - atual) > .0005) requestAnimationFrame(pinta); else ativo = false;
  };
  const pede = () => { medir(); if (!ativo) { ativo = true; requestAnimationFrame(pinta); } };
  addEventListener('scroll', pede, { passive: true }); addEventListener('resize', pede); document.addEventListener('pt-movimento', pede);
  pede();
}

// ---------- índice de carros: a fotografia segue o rato (computador) ----------
function indice() {
  const fl = $('[data-flutua]'), lista = $('[data-indice]');
  if (!fl || !lista || !matchMedia('(hover: hover) and (min-width: 900px)').matches) return;
  const im = $<HTMLImageElement>('img', fl)!;
  let x = 0, y = 0, tx = 0, ty = 0, vx = 0, corre = false;
  const anda = () => {
    const nx = x + (tx - x) * .16, ny = y + (ty - y) * .16; vx = nx - x; x = nx; y = ny;
    fl.style.setProperty('--fx', `${x - 170}px`); fl.style.setProperty('--fy', `${y - 128}px`);
    fl.style.setProperty('--fr', `${Math.max(-8, Math.min(8, vx * .35)).toFixed(2)}deg`);
    if (fl.classList.contains('ver') || Math.abs(tx - x) > .5) requestAnimationFrame(anda); else corre = false;
  };
  lista.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; if (!corre) { corre = true; x = tx; y = ty; requestAnimationFrame(anda); } });
  $$<HTMLAnchorElement>('[data-linha]', lista).forEach((a) => {
    a.addEventListener('pointerenter', () => { if (im.getAttribute('src') !== a.dataset.img) im.src = a.dataset.img!; im.alt = ''; fl.classList.add('ver'); });
  });
  lista.addEventListener('pointerleave', () => fl.classList.remove('ver'));
}

// ---------- galeria da ficha: uma fotografia de cada vez, setas dos dois lados, tira, teclado e dedo ----------
function galeria() {
  const g = $('[data-galeria]'); if (!g) return;
  const fotos = $$<HTMLImageElement>('.galeria-foto', g), minis = $$<HTMLButtonElement>('[data-mini]', g), conta = $('[data-conta]', g);
  let i = 0;
  const carrega = (k: number) => { const f = fotos[k]; if (f?.dataset.srcset) { f.srcset = f.dataset.srcset; delete f.dataset.srcset; } };
  const vai = (k: number) => {
    k = (k + fotos.length) % fotos.length; carrega(k); carrega((k + 1) % fotos.length);
    fotos[i].classList.remove('ativo'); minis[i]?.classList.remove('ativo'); minis[i]?.removeAttribute('aria-current');
    i = k; fotos[i].classList.add('ativo'); minis[i]?.classList.add('ativo'); minis[i]?.setAttribute('aria-current', 'true');
    if (conta) conta.textContent = String(i + 1);
    minis[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: semMov() ? 'auto' : 'smooth' });
  };
  addEventListener('load', () => carrega(1));
  $('[data-ant]', g)?.addEventListener('click', () => vai(i - 1));
  $('[data-seg]', g)?.addEventListener('click', () => vai(i + 1));
  minis.forEach((m) => m.addEventListener('click', () => vai(Number(m.dataset.mini))));
  g.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') vai(i - 1); if (e.key === 'ArrowRight') vai(i + 1); });
  const palco = $('[data-palco]', g)!;
  let x0 = 0, y0 = 0;
  palco.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  palco.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) vai(i + (dx < 0 ? 1 : -1)); });
}

// ---------- barra fixa: esconde-se só quando o formulário está à vista ----------
function barra() {
  const b = $('[data-barra]'), c = $('[data-contacto]'); if (!b || !c) return;
  new IntersectionObserver(([e]) => b.classList.toggle('esconde', e.isIntersecting), { threshold: .25 }).observe(c);
}

// ---------- formulário em frase: valida, monta a mensagem e abre o WhatsApp ----------
function formulario() {
  const f = $<HTMLFormElement>('[data-form]'); if (!f) return;
  const erro = $('[data-form-erro]', f)!, fim = $('[data-form-fim]', f)!;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = f.elements.namedItem('nome') as HTMLInputElement, tel = f.elements.namedItem('telefone') as HTMLInputElement, carro = f.elements.namedItem('carro') as HTMLSelectElement;
    const digitos = tel.value.replace(/\D/g, '');
    const okNome = nome.value.trim().length >= 2, okTel = digitos.length >= 9 && digitos.length <= 15;
    nome.setAttribute('aria-invalid', String(!okNome)); tel.setAttribute('aria-invalid', String(!okTel));
    if (!okNome || !okTel) { erro.textContent = !okNome ? 'Falta o seu nome.' : 'O número precisa de 9 algarismos.'; (!okNome ? nome : tel).focus(); return; }
    erro.textContent = '';
    const origem = origemGuardada();
    window.dataLayer.push({ event: 'lead', origem, viatura: carro.value, pagina: location.pathname });
    const txt = `Olá Protrade, chamo-me ${nome.value.trim()} e o meu número é ${tel.value.trim()}. Quero saber do ${carro.value}.`;
    window.open(`https://wa.me/351911150080?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
    fim.hidden = false; fim.focus();
  });
}

medicao(); interruptor(); topo(); titulos(); revelas(); hero(); origem(); indice(); galeria(); barra(); formulario();
if ($('[data-abertura]')) abertura(); else $$('[data-hero-titulo]').forEach((t) => t.classList.add('visto'));
// na ficha, o título entra logo
$$('.ficha-nome').forEach((t) => requestAnimationFrame(() => t.classList.add('visto')));
