(async () => {
  try {
    const res = await fetch('gallery.json', { cache: 'no-store' });
    const items = await res.json();
    const wrap = document.getElementById('gallery');
    if (!wrap) return;
    wrap.innerHTML = items.map(g => `
      <article class="card">
        <img class="gallery-item" src="${g.url}" alt="${g.title}">
        <h3>${g.title}</h3>
        <p class="muted"></p>
      </article>
    `).join('');
  } catch (err) { console.error('Failed to load gallery.json', err); }
})();
