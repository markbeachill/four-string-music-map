(() => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-public-nav]');
  if (toggle && nav) toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  const form = document.querySelector('[data-public-search-form]');
  const input = document.querySelector('[data-public-search-input]');
  const results = document.querySelector('[data-public-search-results]');
  const status = document.querySelector('[data-public-search-status]');
  if (!form || !input || !results) return;
  const isStatic = !location.pathname.startsWith('/site/');
  if (!isStatic) return;

  const base = (window.SITE_BASE || '/');
  const resolve = item => item.external ? item.url : base + String(item.url || '').replace(/^\//, '');

  let indexPromise;
  const loadIndex = () => indexPromise ||= fetch(base + 'assets/search-index.json').then(r => r.json());
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const card = item => {
    const target = item.external ? ' target="_blank" rel="noopener"' : '';
        return `<li class="res-row"><a class="res-link" href="${esc(resolve(item))}"${target}>${esc(item.title)}</a><span class="res-meta"><span class="res-tag">${esc(item.type)}</span></span></li>`;
  };
  const run = async () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.innerHTML = ''; status.innerHTML = '<p class="result-count">Enter a search above.</p>'; return; }
    const index = await loadIndex();
    const tokens = q.split(/\s+/).filter(Boolean);
    const matches = index.filter(item => {
      const text = `${item.title} ${item.description} ${item.keywords}`.toLowerCase();
      return tokens.every(token => text.includes(token));
    }).slice(0, 100);
    status.innerHTML = `<p class="result-count">${matches.length} results for “${esc(input.value)}”</p>`;
    results.innerHTML = matches.map(card).join('') || '<p class="empty-state">No results found.</p>';
    history.replaceState(null, '', `?q=${encodeURIComponent(input.value)}`);
  };
  form.addEventListener('submit', event => { event.preventDefault(); run(); });
  const q = new URLSearchParams(location.search).get('q');
  if (q) { input.value = q; run(); }
})();

(() => {
  if (location.pathname.startsWith('/site/')) return;
  const text = value => (value || '').trim().toLowerCase();

  const resourceForm = document.querySelector('[data-resource-filter]');
  if (resourceForm) {
    const cards = [...document.querySelectorAll('[data-resource-card]')];
    const run = () => {
      const data = new FormData(resourceForm);
      const q = text(data.get('q'));
      const type = text(data.get('type'));
      const difficulty = text(data.get('difficulty'));
      const provider = text(data.get('provider'));
      let visible = 0;
      cards.forEach(card => {
        const show = (!q || card.dataset.resourceSearch.includes(q)) && (!type || text(card.dataset.resourceType) === type) && (!difficulty || text(card.dataset.resourceDifficulty) === difficulty) && (!provider || text(card.dataset.resourceProvider) === provider);
        card.hidden = !show;
        if (show) visible += 1;
      });
      const count = document.querySelector('.result-count');
      if (count) count.textContent = `${visible} selected resources`;
    };
    resourceForm.addEventListener('submit', event => { event.preventDefault(); run(); });
    resourceForm.addEventListener('change', run);
  }

  const songForm = document.querySelector('[data-song-filter]');
  if (songForm) {
    const cards = [...document.querySelectorAll('[data-song-card]')];
    const run = () => {
      const data = new FormData(songForm);
      const q = text(data.get('q'));
      const difficulty = text(data.get('difficulty'));
      const genre = text(data.get('genre'));
      let visible = 0;
      cards.forEach(card => {
        const show = (!q || card.dataset.songSearch.includes(q)) && (!difficulty || text(card.dataset.songDifficulty) === difficulty) && (!genre || text(card.dataset.songGenre) === genre);
        card.hidden = !show;
        if (show) visible += 1;
      });
      const count = document.querySelector('.result-count');
      if (count) count.textContent = `${visible} songs`;
    };
    songForm.addEventListener('submit', event => { event.preventDefault(); run(); });
    songForm.addEventListener('change', run);
  }

  const providerForm = document.querySelector('[data-provider-filter]');
  if (providerForm) {
    const cards = [...document.querySelectorAll('[data-provider-card]')];
    const input = providerForm.querySelector('input[name="q"]');
    const run = () => cards.forEach(card => card.hidden = !!text(input.value) && !card.dataset.providerSearch.includes(text(input.value)));
    providerForm.addEventListener('submit', event => { event.preventDefault(); run(); });
    input.addEventListener('input', run);
  }
})();
