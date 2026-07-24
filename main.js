/* ============================================================
   ANSL — 공통 스크립트
   ① 헤더 · 푸터 · 메뉴를 모든 페이지에 자동으로 주입
   ② 현재 페이지 메뉴 자동 강조
   ③ 스크롤 등장 애니메이션
   ④ 모바일 햄버거 메뉴

   ★ 메뉴를 바꾸고 싶으면 아래 NAV 하나만 고치면
     전체 페이지에 동시에 반영됩니다.
   ============================================================ */

/* ── 로고 (좌측 상단) ─────────────────────────────────────── */
var LOGO = { title: 'ANSL', sub: 'Advanced Next-generation Semiconductor Lab' };

/* ── 상단 메뉴 구성 ───────────────────────────────────────────
   label : 상위 카테고리 (대문자)
   href  : 상위 카테고리를 클릭했을 때 이동할 페이지
   sub   : 마우스를 올리면 펼쳐지는 하위 항목들 (없으면 [] )
--------------------------------------------------------------- */
var NAV = [
  { label: 'RESEARCH', href: 'research.html', sub: [
    { label: 'Research Topics', href: 'research.html' },
    { label: 'Projects',        href: 'research.html#projects' }
  ]},
  { label: 'PUBLICATIONS', href: 'publications-journal.html', sub: [
    { label: 'Journal',    href: 'publications-journal.html' },
    { label: 'Conference', href: 'publications-conference.html' },
    { label: 'Patent',     href: 'publications-patent.html' }
  ]},
  { label: 'MEMBERS', href: 'members-professor.html', sub: [
    { label: 'Professor',   href: 'members-professor.html' },
    { label: 'Researchers', href: 'members-researchers.html' },
    { label: 'Alumni',      href: 'members-researchers.html#alumni' }
  ]},
  { label: 'GALLERY', href: 'gallery.html', sub: [] },
  { label: 'RECRUITMENT', href: 'recruitment.html', sub: [
    { label: 'Join us',  href: 'recruitment.html' },
    { label: 'Contact',  href: 'recruitment.html#contact' }
  ]}
];

/* ── 푸터 내용 ─────────────────────────────────────────────── */
var FOOTER = {
  addr:  'Department of Materials Science and Engineering<br>' +
         'Seoul National University, 1 Gwanak-ro, Gwanak-gu, Seoul',
  email: 'ansl@snu.ac.kr'
};


/* ============================================================
   유틸: 현재 페이지 파일명 (해시 제외)
   ============================================================ */
function currentFile() {
  var p = location.pathname.split('/').pop();
  return (p || 'index.html').toLowerCase();
}
function fileOf(href) {
  return href.split('#')[0].toLowerCase();
}


/* ============================================================
   ① 헤더 주입
   ============================================================ */
(function buildHeader() {
  var mount = document.getElementById('hd');
  if (!mount) return;

  var cur = currentFile();

  var cols = NAV.map(function (col) {
    var owns = fileOf(col.href) === cur ||
               col.sub.some(function (s) { return fileOf(s.href) === cur; });

    var subHTML = col.sub.map(function (s) {
      var isCur = fileOf(s.href) === cur ? ' class="current"' : '';
      return '<a href="' + s.href + '"' + isCur + '>' + s.label + '</a>';
    }).join('');

    return '' +
      '<div class="col">' +
        '<a class="top' + (owns ? ' current' : '') + '" href="' + col.href + '">' + col.label + '</a>' +
        (subHTML ? '<div class="sub">' + subHTML + '</div>' : '') +
      '</div>';
  }).join('');

  mount.innerHTML = '' +
    '<div class="hd-inner">' +
      '<a class="logo" href="index.html"><b>' + LOGO.title + '</b><small>' + LOGO.sub + '</small></a>' +
      '<button class="burger" aria-label="menu">☰</button>' +
      '<nav class="nav">' + cols + '</nav>' +
    '</div>';
})();


/* ============================================================
   ② 푸터 주입
   ============================================================ */
(function buildFooter() {
  var mount = document.querySelector('footer');
  if (!mount) return;

  mount.innerHTML = '' +
    '<div class="wrap">' +
      '<div class="fl">' +
        '<div><b>ANSL</b> · Advanced Next-generation Semiconductor Lab<br>' + FOOTER.addr + '</div>' +
        '<div><b>Email</b> <a href="mailto:' + FOOTER.email + '">' + FOOTER.email + '</a><br>' +
             '<a href="index.html">Home</a></div>' +
      '</div>' +
      '<div class="copy">© 2026 ANSL, Seoul National University. All rights reserved.</div>' +
    '</div>';
})();


/* ============================================================
   ③ 스크롤 등장 애니메이션
   HTML에 data-ani="up|left|right|scale|fade" 만 붙이면 동작.
   지연은 data-delay="150" (밀리초).
   ============================================================ */
(function () {
  var targets = document.querySelectorAll('[data-ani]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('on'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      el.style.transitionDelay = (el.dataset.delay || 0) + 'ms';
      el.classList.add('on');
      io.unobserve(el);
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
  });

  targets.forEach(function (el) { io.observe(el); });
})();


/* ============================================================
   ④ 모바일 햄버거 메뉴
   ============================================================ */
(function () {
  var hd = document.getElementById('hd');
  var burger = document.querySelector('.burger');
  if (!hd || !burger) return;

  burger.addEventListener('click', function () {
    hd.classList.toggle('open');
    burger.textContent = hd.classList.contains('open') ? '✕' : '☰';
  });
})();
