// FTCDesign — small UI behaviors
(function () {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // TOC scroll-spy: highlights the active section in docs sidebar / book rail
  const tocLinks = document.querySelectorAll('.docs__toc a[href^="#"], .book__rail a[href^="#"]');
  if (tocLinks.length) {
    const idMap = new Map();
    tocLinks.forEach((a) => {
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const el = document.getElementById(id);
      if (el) idMap.set(el, a);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = idMap.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) {
            tocLinks.forEach((l) => l.classList.remove('active'));
            link.classList.add('active');
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    idMap.forEach((_, el) => observer.observe(el));
  }

  // Mechanism category filters
  const filterButtons = document.querySelectorAll('.filter[data-cat]');
  const filterSections = document.querySelectorAll('section[data-cat]');
  if (filterButtons.length && filterSections.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        filterSections.forEach((sec) => {
          sec.style.display = cat === 'all' || sec.dataset.cat === cat ? '' : 'none';
        });
      });
    });
  }

  // Handbook rail: simple article filter
  const search = document.querySelector('.book__search input');
  const railLinks = document.querySelectorAll('.book__rail li');
  if (search && railLinks.length) {
    search.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      railLinks.forEach((li) => {
        const text = li.textContent.toLowerCase();
        li.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }
})();
