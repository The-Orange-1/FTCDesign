// FTCDesign — UI behaviors
(function () {
  // -- Theme toggle (persisted) --
  const root = document.documentElement;
  const stored = localStorage.getItem('ftc-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  if (initial === 'dark') root.setAttribute('data-theme', 'dark');

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (next === 'dark') root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      localStorage.setItem('ftc-theme', next);
    });
  }

  // -- Sidebar drawer --
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  const hamburger = document.querySelector('.hamburger');
  const sidebarClose = document.querySelector('.sidebar__close');

  const openSidebar = () => {
    if (!sidebar) return;
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('no-scroll');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
  };
  const closeSidebar = () => {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('no-scroll');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  };
  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // Mark current page in sidebar
  if (sidebar) {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const key = path.replace('.html', '') || 'index';
    const current = sidebar.querySelector(`a[data-page="${key}"]`);
    if (current) current.setAttribute('aria-current', 'page');
  }

  // -- Search modal --
  const searchTrigger = document.querySelector('.search-trigger');
  const searchModal = document.getElementById('search-modal');
  const searchInput = searchModal && searchModal.querySelector('.search-modal__input');
  const searchResults = searchModal && searchModal.querySelector('.search-results');
  const searchClose = searchModal && searchModal.querySelector('.search-modal__close');

  // Static index — all pages and major sections.
  const index = [
    { title: 'Home', sub: 'FTCDesign overview', url: 'index.html' },
    { title: 'Learning Course', sub: 'Setup + 4 stages', url: 'learn.html' },
    { title: 'Course Setup', sub: 'Onshape, account, libraries', url: 'learn.html#setup' },
    { title: 'Stage 1 · Foundations', sub: 'Sketches, parts, assemblies, power transmission', url: 'learn.html#stage-1' },
    { title: 'Stage 2 · Subsystems', sub: 'Mecanum, pivot, intake, slide', url: 'learn.html#stage-2' },
    { title: 'Stage 3 · Integration', sub: 'Robot layout, packaging, wiring', url: 'learn.html#stage-3' },
    { title: 'Stage 4 · Strategic Design', sub: 'Game analysis, scope, reliability', url: 'learn.html#stage-4' },
    { title: 'Design Handbook', sub: 'Reference for the why behind every choice', url: 'handbook.html' },
    { title: 'Strategic Design', sub: 'Game analysis, scope, execution', url: 'handbook.html#strategy-game-analysis' },
    { title: 'Hardware', sub: 'Materials, structure, fasteners, 3D printing, tolerances', url: 'handbook.html#hw-materials' },
    { title: 'Power Transmission', sub: 'Bearings, gears, belts, motors, wheels, electronics', url: 'handbook.html#pt-motion' },
    { title: 'Mechanisms (handbook)', sub: 'Drivetrains, elevators, arms, intakes, shooters, bumpers', url: 'handbook.html#mech-drivetrains' },
    { title: 'Design Write-ups', sub: 'Controllability, tensioning, springs, the 18-inch rule', url: 'handbook.html#wu-controllability' },
    { title: 'Mechanism Examples', sub: 'Annotated mechanisms with trade-offs', url: 'mechanisms.html' },
    { title: 'Drivebases', sub: 'Mecanum, tank, swerve', url: 'mechanisms.html#drivebases' },
    { title: 'Intakes', sub: 'Active, passive, under-bumper', url: 'mechanisms.html#intakes' },
    { title: 'Game-piece manipulation', sub: 'Indexers, end effectors', url: 'mechanisms.html#manipulation' },
    { title: 'Linear extensions', sub: 'Cascade, continuous, telescope', url: 'mechanisms.html#linear' },
    { title: 'Rotating mechanisms', sub: 'Pivots, turrets', url: 'mechanisms.html#rotating' },
    { title: 'CAD Best Practices', sub: 'Five articles, in order', url: 'best-practices.html' },
    { title: 'Document setup', sub: 'Best practice 1', url: 'best-practices.html#document-setup' },
    { title: 'Sub-document setup', sub: 'Best practice 2', url: 'best-practices.html#sub-document' },
    { title: 'Layout sketches', sub: 'Best practice 3', url: 'best-practices.html#layout-sketch' },
    { title: 'Part studio practices', sub: 'Best practice 4', url: 'best-practices.html#part-studio' },
    { title: 'Assembly practices', sub: 'Best practice 5', url: 'best-practices.html#assembly' },
    { title: 'Other Resources', sub: 'Tools, libraries, community', url: 'resources.html' },
    { title: 'Community', sub: 'Discord, forums', url: 'resources.html#community' },
    { title: 'Contributing', sub: 'How to add to the library', url: 'resources.html#contributing' }
  ];

  let activeIdx = 0;
  const renderResults = (q) => {
    if (!searchResults) return;
    const query = q.toLowerCase().trim();
    const matches = !query
      ? index.slice(0, 10)
      : index.filter((it) => (it.title + ' ' + it.sub).toLowerCase().includes(query));
    if (!matches.length) {
      searchResults.innerHTML = '<li class="search-results__empty">No matches.</li>';
      return;
    }
    activeIdx = 0;
    searchResults.innerHTML = matches
      .map(
        (m, i) =>
          `<li class="${i === 0 ? 'active' : ''}"><a href="${m.url}"><div class="result__title">${m.title}</div><div class="result__sub">${m.sub}</div></a></li>`
      )
      .join('');
  };

  const openSearch = () => {
    if (!searchModal) return;
    searchModal.classList.add('open');
    searchModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    if (searchInput) {
      searchInput.value = '';
      renderResults('');
      setTimeout(() => searchInput.focus(), 30);
    }
  };
  const closeSearch = () => {
    if (!searchModal) return;
    searchModal.classList.remove('open');
    searchModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };
  if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }
  if (searchInput) {
    searchInput.addEventListener('input', (e) => renderResults(e.target.value));
  }
  if (searchResults) {
    searchResults.addEventListener('mousemove', (e) => {
      const li = e.target.closest('li');
      if (!li || li.classList.contains('search-results__empty')) return;
      [...searchResults.children].forEach((c) => c.classList.remove('active'));
      li.classList.add('active');
      activeIdx = [...searchResults.children].indexOf(li);
    });
  }

  // -- Keyboard shortcuts --
  document.addEventListener('keydown', (e) => {
    const inField =
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable;
    const modalOpen = searchModal && searchModal.classList.contains('open');

    // Alt+C → open search (user requested, mirrors Onshape's Alt+C)
    if (e.altKey && (e.key === 'c' || e.key === 'C') && !modalOpen) {
      e.preventDefault();
      openSearch();
      return;
    }

    // "/" or Ctrl/Cmd+K → open search (common shortcuts)
    if (!inField && !modalOpen && (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'))) {
      e.preventDefault();
      openSearch();
      return;
    }

    if (!modalOpen) {
      // Esc closes sidebar
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      }
      return;
    }

    // -- in search modal --
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      return;
    }
    if (!searchResults) return;
    const items = [...searchResults.children].filter((c) => !c.classList.contains('search-results__empty'));
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const link = items[activeIdx] && items[activeIdx].querySelector('a');
      if (link) link.click();
      return;
    } else {
      return;
    }
    items.forEach((c) => c.classList.remove('active'));
    items[activeIdx].classList.add('active');
    items[activeIdx].scrollIntoView({ block: 'nearest' });
  });

  // -- TOC scroll-spy --
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

  // -- Mechanism category filters --
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

  // -- Handbook rail filter (in-page only) --
  const railSearch = document.querySelector('.book__search input');
  const railLinks = document.querySelectorAll('.book__rail li');
  if (railSearch && railLinks.length) {
    railSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      railLinks.forEach((li) => {
        const text = li.textContent.toLowerCase();
        li.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }
})();
