/**
 * Supermarket Shelf Catalog Controller
 * Indonesian retail products search, filtering, and add-to-cart
 */

function openShelfModal() {
  const modal = document.getElementById('shelf-catalog-modal');
  if (!modal) return;

  // Reset search and categories
  AppState.shelfCategoryFilter = 'all';
  AppState.shelfSearchQuery = '';

  const searchInput = document.getElementById('shelf-search-input');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('#shelf-categories-bar .shelf-cat-chip').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === 'all');
  });

  renderShelfCatalogModal();
  modal.classList.remove('hidden');
}

function closeShelfModal() {
  const modal = document.getElementById('shelf-catalog-modal');
  if (modal) modal.classList.add('hidden');
}

function renderShelfCatalogModal() {
  const listContainer = document.getElementById('shelf-products-list');
  if (!listContainer) return;

  const currentCat = AppState.shelfCategoryFilter || 'all';
  const query = (AppState.shelfSearchQuery || '').toLowerCase().trim();

  const filtered = SHELF_PRODUCTS.filter(prod => {
    const matchesCat = currentCat === 'all' || prod.category === currentCat;
    const matchesQuery = !query ||
      prod.name.toLowerCase().includes(query) ||
      prod.category.toLowerCase().includes(query) ||
      (prod.source && prod.source.toLowerCase().includes(query));
    return matchesCat && matchesQuery;
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; padding: 36px 12px; text-align: center;">
        <i data-lucide="package-search" style="margin: 0 auto; color: var(--text-muted); width: 36px; height: 36px;"></i>
        <h4 style="margin-top: 12px; font-weight: 700; color: var(--text-primary); font-size: 14px;">
          ${AppState.lang === 'en' ? 'Product not found' : 'Produk tidak ditemukan'}
        </h4>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          ${AppState.lang === 'en' ? 'Try another keyword or category.' : 'Coba kata kunci atau kategori lain.'}
        </p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  listContainer.innerHTML = filtered.map(prod => {
    const inCartItem = AppState.cart.find(c => c.name === prod.name);
    const inCartQty = inCartItem ? inCartItem.qty : 0;

    return `
      <div class="shelf-item-card ${inCartQty > 0 ? 'in-cart' : ''}" data-id="${prod.id}">
        <div class="shelf-item-header">
          <span class="shelf-cat-badge">${escapeHtml(prod.category)}</span>
          <span class="shelf-source-tag">${escapeHtml(prod.retailer || 'Retail')}</span>
        </div>
        <div class="shelf-item-name">${escapeHtml(prod.name)}</div>
        <div class="shelf-item-price-row">
          <div>
            <div class="shelf-item-price">${formatRupiah(prod.price)}</div>
            <div class="shelf-item-unit">/ ${prod.unit}</div>
          </div>
          <button type="button" class="btn-add-shelf" data-shelf-id="${prod.id}" aria-label="Tambah ${escapeHtml(prod.name)} ke troli">
            <i data-lucide="${inCartQty > 0 ? 'check' : 'plus'}"></i>
            <span>${inCartQty > 0 ? `${inCartQty} di Troli` : (AppState.lang === 'en' ? '+ Add' : '+ Tambah')}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function addShelfProductToCart(productId) {
  const prod = SHELF_PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  const existingItem = AppState.cart.find(c => c.name === prod.name);
  if (existingItem) {
    existingItem.qty += 1;
    existingItem.subtotal = existingItem.qty * existingItem.finalUnitPrice;
  } else {
    const newItem = {
      id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: prod.name,
      category: prod.category,
      unit: prod.unit,
      qty: 1,
      originalPrice: prod.price,
      discountString: '',
      finalUnitPrice: prod.price,
      subtotal: prod.price
    };
    AppState.cart.unshift(newItem);
  }

  saveCartToStorage();
  renderCartItems();
  updateBudgetSafetyUI();
  updateComparatorBadges();
  renderShelfCatalogModal();

  showToast(`"${prod.name}" ${AppState.lang === 'en' ? 'added to cart' : 'ditambahkan ke troli'}`);
}
