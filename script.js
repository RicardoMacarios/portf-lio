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

// Nav com fundo ao rolar
const nav = document.getElementById('nav');
const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Menu hamburger
const hamburger = document.getElementById('nav-hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});
