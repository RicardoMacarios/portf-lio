// Sempre abrir no topo (hero), ignorando posição salva e #âncora na URL
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));

// Links internos rolam até a seção sem colocar #âncora na URL
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const alvo = document.querySelector(link.getAttribute('href'));
    if (!alvo) return;
    e.preventDefault();
    alvo.scrollIntoView({ behavior: 'smooth' });
  });
});

// Carrossel de imagens dos projetos (passa sozinho, pausa com o mouse em cima)
document.querySelectorAll('[data-carrossel]').forEach(carrossel => {
  const trilho = carrossel.querySelector('.carrossel-trilho');
  const slides = trilho.querySelectorAll('img');
  const pontos = carrossel.querySelector('.carrossel-pontos');
  let atual = 0;
  let timer;

  const botoes = [...slides].map((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Ver imagem ${i + 1}`);
    b.addEventListener('click', () => { irPara(i); reiniciar(); });
    pontos.appendChild(b);
    return b;
  });

  const marcar = i => botoes.forEach((b, j) => b.classList.toggle('ativo', j === i));

  const irPara = i => {
    atual = (i + slides.length) % slides.length;
    trilho.scrollTo({ left: trilho.clientWidth * atual });
    marcar(atual);
  };

  const reiniciar = () => {
    clearInterval(timer);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(() => irPara(atual + 1), 4000);
    }
  };

  // Atualiza o ponto ativo quando a pessoa arrasta com o dedo
  trilho.addEventListener('scroll', () => {
    const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
    if (i !== atual) { atual = i; marcar(i); }
  }, { passive: true });

  carrossel.querySelector('.anterior').addEventListener('click', () => { irPara(atual - 1); reiniciar(); });
  carrossel.querySelector('.proxima').addEventListener('click', () => { irPara(atual + 1); reiniciar(); });
  carrossel.addEventListener('mouseenter', () => clearInterval(timer));
  carrossel.addEventListener('mouseleave', reiniciar);
  trilho.addEventListener('touchstart', () => clearInterval(timer), { passive: true });
  trilho.addEventListener('touchend', reiniciar, { passive: true });

  marcar(0);
  reiniciar();
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

reveals.forEach(r => observer.observe(r));

// Barra de progresso da rolagem
const progresso = document.getElementById('progresso');
const atualizarProgresso = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progresso.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
};
window.addEventListener('scroll', atualizarProgresso, { passive: true });
window.addEventListener('resize', atualizarProgresso);
atualizarProgresso();

// Menu lateral: marca a seção que está na tela
const linksMenu = document.querySelectorAll('.sidebar-nav a');
const secoesMenu = [...linksMenu].map(l => document.querySelector(l.getAttribute('href')));
// Seções que não estão no menu acendem o item mais próximo
const apelidos = { processo: 'tecnologias', diferenciais: 'projetos' };

const marcarMenu = () => {
  const linha = window.innerHeight * 0.35;
  let ativa = 'inicio';
  document.querySelectorAll('.main section[id]').forEach(sec => {
    if (sec.getBoundingClientRect().top <= linha) ativa = apelidos[sec.id] || sec.id;
  });
  // No fim da página, o último item fica ativo
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) ativa = 'contato';
  linksMenu.forEach((l, i) => l.classList.toggle('ativo', secoesMenu[i]?.id === ativa));
};
window.addEventListener('scroll', marcarMenu, { passive: true });
marcarMenu();

// Efeito de digitação no hero
const digitando = document.getElementById('digitando');
const frases = ['Desenvolvedor Backend', 'Fundador do BarberVez', 'Node.js · PostgreSQL · React'];
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let frase = 0, letra = frases[0].length, apagando = true;
  const passo = () => {
    const texto = frases[frase];
    letra += apagando ? -1 : 1;
    digitando.textContent = texto.slice(0, letra);
    let espera = apagando ? 45 : 85;
    if (!apagando && letra === texto.length) { apagando = true; espera = 2200; }
    else if (apagando && letra === 0) { apagando = false; frase = (frase + 1) % frases.length; espera = 350; }
    setTimeout(passo, espera);
  };
  setTimeout(passo, 2200);
}

// Trajetória: clicar na empresa mostra o que fiz lá
const abas = [...document.querySelectorAll('.traj-item')];
const selecionarAba = aba => {
  abas.forEach(a => {
    const ativa = a === aba;
    a.classList.toggle('ativo', ativa);
    a.setAttribute('aria-selected', ativa);
    a.tabIndex = ativa ? 0 : -1;
    document.getElementById(a.getAttribute('aria-controls')).hidden = !ativa;
  });
};
abas.forEach((aba, i) => {
  aba.addEventListener('click', () => selecionarAba(aba));
  aba.addEventListener('keydown', e => {
    const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const prox = abas[(i + dir + abas.length) % abas.length];
    selecionarAba(prox);
    prox.focus();
  });
});

// Menu mobile (sidebar vira gaveta)
const hamburger = document.getElementById('nav-hamburger');
const sidebar = document.getElementById('sidebar');
const fundo = document.getElementById('sidebar-fundo');

const abrirMenu = abrir => {
  hamburger.classList.toggle('open', abrir);
  sidebar.classList.toggle('open', abrir);
  fundo.classList.toggle('open', abrir);
  hamburger.setAttribute('aria-expanded', abrir);
};

hamburger.addEventListener('click', () => abrirMenu(!sidebar.classList.contains('open')));
fundo.addEventListener('click', () => abrirMenu(false));
sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => abrirMenu(false)));
