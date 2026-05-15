// FTCDesign — UI behaviors
(function () {
  const root = document.documentElement;

  // Theme: default is the warm dark; "light" is opt-in.
  const stored = localStorage.getItem('ftc-theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  if ((stored || (prefersLight ? 'light' : 'dark')) === 'light') root.setAttribute('data-theme', 'light');

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      if (next === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
      localStorage.setItem('ftc-theme', next);
    });
  }

  // Slide-out panels (left sidebar + right rail)
  const sidebar = document.getElementById('sidebar');
  const rail = document.querySelector('.toc');
  const backdrop = document.querySelector('.sidebar-backdrop');
  const hamburger = document.querySelector('.hamburger');
  const sidebarClose = document.querySelector('.sidebar__close');
  const railClose = document.querySelector('.toc__close');

  const syncBackdrop = () => {
    if (!backdrop) return;
    const anyOpen = (sidebar && sidebar.classList.contains('open')) || (rail && rail.classList.contains('open'));
    backdrop.classList.toggle('open', anyOpen);
    document.body.classList.toggle('no-scroll', anyOpen);
  };
  const closeSidebar = () => {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    syncBackdrop();
  };
  const closeRail = () => {
    if (!rail) return;
    rail.classList.remove('open');
    syncBackdrop();
  };
  const closeAll = () => { closeSidebar(); closeRail(); };
  const openAll = () => {
    if (sidebar) sidebar.classList.add('open');
    if (rail) rail.classList.add('open');
    syncBackdrop();
  };
  const toggleAll = () => {
    const anyOpen = (sidebar && sidebar.classList.contains('open')) || (rail && rail.classList.contains('open'));
    if (anyOpen) closeAll(); else openAll();
  };

  if (hamburger) hamburger.addEventListener('click', toggleAll);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (railClose) railClose.addEventListener('click', closeRail);
  if (backdrop) backdrop.addEventListener('click', closeAll);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  // Mark current page in sidebar + top nav, highlight parent section heading
  {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const key = path.replace('.html', '') || 'index';
    if (sidebar) {
      const current = sidebar.querySelector(`a[data-page="${key}"]`);
      if (current) {
        current.setAttribute('aria-current', 'page');
        // Walk back through siblings; if the link is inside a .sub container, hop out to its previous sibling first.
        let cursor = current.parentElement && current.parentElement.classList.contains('sub') ? current.parentElement : current;
        let prev = cursor.previousElementSibling;
        while (prev && prev.tagName !== 'H4') prev = prev.previousElementSibling;
        if (prev) prev.classList.add('active-section');
      }
    }
    const navCurrent = document.querySelector(`.site-nav a[data-page="${key}"]`);
    if (navCurrent) navCurrent.setAttribute('aria-current', 'page');
  }

  // Collapse non-active sidebar sections; click an h4 to toggle
  if (sidebar) {
    const nav = sidebar.querySelector('nav');
    if (nav) {
      const items = [...nav.children];
      let currentSection = null;
      const sections = [];
      items.forEach((el) => {
        if (el.tagName === 'H4') {
          currentSection = { h4: el, items: [] };
          sections.push(currentSection);
        } else if (currentSection) {
          currentSection.items.push(el);
        }
      });
      sections.forEach((section) => {
        const isActive = section.h4.classList.contains('active-section');
        if (!isActive) section.h4.classList.add('is-collapsed');
        section.h4.setAttribute('role', 'button');
        section.h4.setAttribute('tabindex', '0');
        const toggle = () => {
          const collapsed = section.h4.classList.toggle('is-collapsed');
          section.items.forEach((el) => {
            if (collapsed) el.setAttribute('hidden', '');
            else el.removeAttribute('hidden');
          });
        };
        // Initialize visibility based on collapsed state
        if (section.h4.classList.contains('is-collapsed')) {
          section.items.forEach((el) => el.setAttribute('hidden', ''));
        }
        section.h4.addEventListener('click', toggle);
        section.h4.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
      });
    }
  }

  // Search modal
  const searchTrigger = document.querySelector('.search-trigger');
  const searchModal = document.getElementById('search-modal');
  const searchInput = searchModal && searchModal.querySelector('.search-modal__input');
  const searchResults = searchModal && searchModal.querySelector('.search-results');
  const searchClose = searchModal && searchModal.querySelector('.search-modal__close');

  const index = [
    { title: 'Home', sub: 'FTCDesign overview', url: 'index.html' },
    { title: 'Learning Course', sub: 'Setup + 4 stages', url: 'learn.html' },
    { title: 'Setup', sub: 'Course setup', url: 'learn.html#setup' },
    { title: 'Stage 1 · Foundations', sub: 'Onshape tool fluency: sketches, parts, assemblies, libraries', url: 'stage-1.html' },
    { title: 'Stage 2 · Subsystems', sub: 'Master sketches, packaging, COTS, 3D printing, transmission', url: 'stage-2.html' },
    { title: 'Stage 3 · Integration', sub: 'Archetypes, master sketching, RPM/torque, flow paths, COG', url: 'stage-3.html' },
    { title: 'Stage 4 · Strategy', sub: 'Strategic design, cycle time, reliability, post-mortems', url: 'stage-4.html' },
    { title: 'Tutorials', sub: 'Step-by-step builds by difficulty', url: 'tutorials.html' },
    { title: 'Easy tutorials', sub: 'Bearing stack, parallel plate, claw, slide insert, molding', url: 'tutorials.html#easy' },
    { title: 'Medium tutorials', sub: 'Bare motor drivetrain, active intake, swingarm PTO, shooter', url: 'tutorials.html#medium' },
    { title: 'Hard tutorials', sub: 'Coaxial 4-bar diff arm, full Decode + Into the Deep robots', url: 'tutorials.html#hard' },
    { title: 'Bearing Stack', sub: 'Tutorial · Easy', url: 'tutorial-bearing-stack.html' },
    { title: 'Parallel Plate Drivetrain', sub: 'Tutorial · Easy', url: 'tutorial-parallel-plate.html' },
    { title: 'Claw', sub: 'Tutorial · Easy', url: 'tutorial-claw.html' },
    { title: 'Linear Slide insert', sub: 'Tutorial · Easy', url: 'tutorial-slide-insert.html' },
    { title: 'Silicone / Polyurethane molding', sub: 'Tutorial · Easy', url: 'tutorial-molding.html' },
    { title: 'Bare motor drivetrain', sub: 'Tutorial · Medium', url: 'tutorial-bare-motor-drive.html' },
    { title: 'Active Intake', sub: 'Tutorial · Medium', url: 'tutorial-active-intake.html' },
    { title: 'Swingarm PTO', sub: 'Tutorial · Medium', url: 'tutorial-swingarm-pto.html' },
    { title: 'Shooter', sub: 'Tutorial · Medium', url: 'tutorial-shooter.html' },
    { title: 'Coaxial virtual 4-bar differential arm', sub: 'Tutorial · Hard', url: 'tutorial-diff-arm.html' },
    { title: 'Full Decode robot', sub: 'Tutorial · Hard', url: 'tutorial-decode-robot.html' },
    { title: 'Full Into the Deep robot', sub: 'Tutorial · Hard', url: 'tutorial-into-the-deep-robot.html' },
    { title: 'Design Handbook', sub: 'Reference for the why behind every choice', url: 'handbook.html' },
    { title: 'Strategic Design', sub: 'Game analysis, scope, execution', url: 'handbook.html#strategic-design' },
    { title: 'Hardware', sub: 'Materials, structure, fasteners, 3D printing', url: 'handbook.html#hardware' },
    { title: 'Power Transmission', sub: 'Bearings, gears, belts, motors, wheels', url: 'handbook.html#power-transmission' },
    { title: 'Mechanisms (handbook)', sub: 'Drivetrains, elevators, arms, intakes', url: 'handbook.html#mechanisms' },
    { title: 'Design Write-ups', sub: 'Controllability, tensioning, springs, 18-inch rule', url: 'handbook.html#write-ups' },
    { title: 'Mechanism Examples', sub: 'Annotated mechanisms by category', url: 'mechanisms.html' },
    { title: 'Drivebases', sub: 'Parallel plate, bare motor, swerve', url: 'mechanisms.html#drivebases' },
    { title: 'Intake/Outtake', sub: 'Compliant wheel, OpTake, claw, hood shooter', url: 'mechanisms.html#intakes' },
    { title: 'Linear extensions', sub: 'Cascade, continuous, telescope, boxtube, MGN', url: 'mechanisms.html#linear' },
    { title: 'Rotating mechanisms', sub: 'Pivots, turrets, rotating slides', url: 'mechanisms.html#rotating' },
    { title: 'CAD Best Practices', sub: 'Five articles, in order', url: 'best-practices.html' },
    { title: 'Document setup', sub: 'Best practice 1', url: 'best-practices.html#document-setup' },
    { title: 'Sub-document setup', sub: 'Best practice 2', url: 'best-practices.html#sub-document' },
    { title: 'Layout sketches', sub: 'Best practice 3', url: 'best-practices.html#layout-sketch' },
    { title: 'Part studio practices', sub: 'Best practice 4', url: 'best-practices.html#part-studio' },
    { title: 'Assembly practices', sub: 'Best practice 5', url: 'best-practices.html#assembly' },
    { title: 'Resources', sub: 'External tools, libraries, community', url: 'resources.html' },
    { title: 'Community', sub: 'Discord, forums', url: 'resources.html#community' },
    { title: 'Contributing', sub: 'How to add to the library', url: 'resources.html#contributing' }
  ];

  // Lazy-loaded text content of each unique page URL in the index.
  // Built on first search open so the modal stays instant on first paint.
  let bodyCache = null;
  const buildBodyCache = async () => {
    if (bodyCache) return bodyCache;
    const map = new Map();
    const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const urls = [...new Set(index.map((it) => it.url.split('#')[0]).filter(Boolean))];
    await Promise.all(urls.map(async (url) => {
      try {
        let doc;
        if (url.toLowerCase() === here) {
          doc = document;
        } else {
          const res = await fetch(url);
          const html = await res.text();
          doc = new DOMParser().parseFromString(html, 'text/html');
        }
        const main = doc.querySelector('.prose') || doc.querySelector('.main');
        const text = main ? (main.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() : '';
        map.set(url, text);
      } catch (e) {
        map.set(url, '');
      }
    }));
    bodyCache = map;
    return bodyCache;
  };

  let activeIdx = 0;
  const renderResults = (q) => {
    if (!searchResults) return;
    const query = q.toLowerCase().trim();
    const matches = !query
      ? index.slice(0, 10)
      : index.filter((it) => {
          const haystack = (it.title + ' ' + it.sub).toLowerCase();
          if (haystack.includes(query)) return true;
          const pageUrl = it.url.split('#')[0];
          const body = bodyCache && bodyCache.get(pageUrl);
          return body ? body.includes(query) : false;
        }).slice(0, 30);
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
    document.body.classList.add('no-scroll');
    if (searchInput) {
      searchInput.value = '';
      renderResults('');
      setTimeout(() => searchInput.focus(), 30);
    }
    // Kick off the body fetch in the background. Once it lands, re-render so
    // body matches show up without the user having to retype.
    buildBodyCache().then(() => {
      if (searchModal.classList.contains('open') && searchInput) {
        renderResults(searchInput.value || '');
      }
    });
  };
  const closeSearch = () => {
    if (!searchModal) return;
    searchModal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };
  if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchModal) {
    searchModal.addEventListener('click', (e) => { if (e.target === searchModal) closeSearch(); });
  }
  if (searchInput) searchInput.addEventListener('input', (e) => renderResults(e.target.value));
  if (searchResults) {
    searchResults.addEventListener('mousemove', (e) => {
      const li = e.target.closest('li');
      if (!li || li.classList.contains('search-results__empty')) return;
      [...searchResults.children].forEach((c) => c.classList.remove('active'));
      li.classList.add('active');
      activeIdx = [...searchResults.children].indexOf(li);
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const inField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;
    const modalOpen = searchModal && searchModal.classList.contains('open');

    if (e.altKey && (e.key === 'c' || e.key === 'C') && !modalOpen) {
      e.preventDefault(); openSearch(); return;
    }
    if (!inField && !modalOpen && (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'))) {
      e.preventDefault(); openSearch(); return;
    }

    if (!modalOpen) return;

    if (e.key === 'Escape') { e.preventDefault(); closeSearch(); return; }
    if (!searchResults) return;
    const items = [...searchResults.children].filter((c) => !c.classList.contains('search-results__empty'));
    if (!items.length) return;

    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const link = items[activeIdx] && items[activeIdx].querySelector('a');
      if (link) link.click();
      return;
    } else { return; }
    items.forEach((c) => c.classList.remove('active'));
    items[activeIdx].classList.add('active');
    items[activeIdx].scrollIntoView({ block: 'nearest' });
  });

  // Right-rail TOC scroll-spy + sidebar sub-anchor highlight
  const tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  const subLinks = document.querySelectorAll('.sidebar .sub a[href*="#"]');
  const subForCurrentPage = [...subLinks].filter((a) => {
    const url = a.getAttribute('href');
    const file = url.split('#')[0];
    const here = (location.pathname.split('/').pop() || 'index.html');
    return file === here || file === '';
  });

  // Instant feedback for sub-link clicks, plus initial-load highlight when the
  // URL already has a hash. The IntersectionObserver below also updates this
  // as the user scrolls, but we don't want to wait for scroll events on click
  // or on cross-document hash navigation.
  const setActiveSub = (link) => {
    subForCurrentPage.forEach((other) => other.removeAttribute('aria-current'));
    if (link) link.setAttribute('aria-current', 'true');
  };
  subForCurrentPage.forEach((a) => {
    a.addEventListener('click', () => setActiveSub(a));
  });
  if (location.hash) {
    const initial = subForCurrentPage.find((a) => a.hash === location.hash);
    if (initial) setActiveSub(initial);
  }

  const sectionMap = new Map();
  tocLinks.forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sectionMap.set(el, { tocLink: a });
  });
  subForCurrentPage.forEach((a) => {
    const hash = a.getAttribute('href').split('#')[1];
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    const entry = sectionMap.get(el) || {};
    entry.subLink = a;
    sectionMap.set(el, entry);
  });

  // Tip popups on tutorial pages: click-to-pin so they work on touch.
  document.querySelectorAll('.tip').forEach((tip) => {
    tip.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = tip.classList.contains('is-open');
      document.querySelectorAll('.tip.is-open').forEach((t) => t.classList.remove('is-open'));
      if (!wasOpen) tip.classList.add('is-open');
    });
  });
  if (document.querySelector('.tip')) {
    document.addEventListener('click', () => {
      document.querySelectorAll('.tip.is-open').forEach((t) => t.classList.remove('is-open'));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.tip.is-open').forEach((t) => t.classList.remove('is-open'));
      }
    });
  }

  if (sectionMap.size) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const item = sectionMap.get(entry.target);
          if (!item) return;
          if (entry.isIntersecting) {
            sectionMap.forEach((v) => {
              if (v.tocLink) v.tocLink.classList.remove('active');
              if (v.subLink) v.subLink.removeAttribute('aria-current');
            });
            if (item.tocLink) item.tocLink.classList.add('active');
            if (item.subLink) item.subLink.setAttribute('aria-current', 'true');
          }
        });
      },
      { root: document.querySelector('.main'), rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    );
    sectionMap.forEach((_, el) => observer.observe(el));
  }
})();
