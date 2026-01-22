/**
 * products.js - Product Display and Filtering Module
 */

const Products = (function() {
    let allProducts = [];
    let categories = [];
    let currentCategory = 'all';
    let currentSort = 'default';
    let searchQuery = '';

    // Initialize products module
    async function init() {
        await loadProducts();
        renderCategories();
        renderProducts();
        setupEventListeners();

        // Re-render on language change
        window.addEventListener('languageChanged', () => {
            renderCategories();
            renderProducts();
        });
    }

    // Load products from API
    async function loadProducts() {
        try {
            // Fetch products
            const productsResponse = await fetch(`${ENV.API_URL}/products`);
            const productsData = await productsResponse.json();
            
            // Fetch categories
            const categoriesResponse = await fetch(`${ENV.API_URL}/products/categories`);
            const categoriesData = await categoriesResponse.json();

            if (productsData.success) {
                allProducts = productsData.data || [];
            }
            
            if (categoriesData.success) {
                categories = categoriesData.data || [];
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            // Fallback to local JSON if API fails
            try {
                const response = await fetch('data/products.json');
                const data = await response.json();
                allProducts = data.products || [];
                categories = data.categories || [];
            } catch (fallbackError) {
                console.error('Failed to load fallback data:', fallbackError);
                allProducts = [];
                categories = [];
            }
        }
    }

    // Get all products
    function getAll() {
        return allProducts;
    }

    // Get product by ID
    function getById(id) {
        return allProducts.find(p => p.id == id);
    }

    // Filter and sort products
    function getFiltered() {
        let filtered = [...allProducts];

        // Filter by category
        if (currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category === currentCategory);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => {
                const nameAr = (p.name.ar || '').toLowerCase();
                const nameEn = (p.name.en || '').toLowerCase();
                return nameAr.includes(query) || nameEn.includes(query);
            });
        }

        // Sort products
        switch (currentSort) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                const lang = I18n.getLang();
                filtered.sort((a, b) => {
                    const nameA = a.name[lang] || a.name.en;
                    const nameB = b.name[lang] || b.name.en;
                    return nameA.localeCompare(nameB, lang);
                });
                break;
        }

        return filtered;
    }

    // Render category buttons
    function renderCategories() {
        const wrapper = document.querySelector('.categories-wrapper');
        if (!wrapper) return;

        wrapper.innerHTML = categories.map(cat => `
            <button class="category-btn ${cat.id === currentCategory ? 'active' : ''}" 
                    data-category="${cat.id}">
                ${cat.icon || ''} ${I18n.getProductText(cat, 'name')}
            </button>
        `).join('');
    }

    // Render products grid
    function renderProducts() {
        const grid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('productsEmpty');
        if (!grid) return;

        const filtered = getFiltered();

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = filtered.map(product => `
            <article class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${I18n.getProductText(product, 'name')}" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23e6f4f9%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2240%22>🧴</text></svg>'">
                </div>
                <div class="product-info">
                    <span class="product-category">${getCategoryName(product.category)}</span>
                    <h3 class="product-name">${I18n.getProductText(product, 'name')}</h3>
                    <p class="product-desc">${I18n.getProductText(product, 'description')}</p>
                    <div class="product-footer">
                        <div class="product-price">${I18n.formatPrice(product.price)}</div>
                        ${product.inStock !== false ? 
                            `<button class="add-btn" data-product-id="${product.id}" aria-label="Add to cart">+</button>` :
                            `<span class="out-of-stock-badge" style="color:red; font-size:0.9em;">${I18n.getLang() === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}</span>`
                        }
                    </div>
                </div>
            </article>
        `).join('');
        console.log(filtered)
    }

    // Get category name by ID
    function getCategoryName(categoryId) {
        const category = categories.find(c => c.id === categoryId);
        return category ? I18n.getProductText(category, 'name') : '';
    }

    // Open product modal
    function openModal(productId) {
        const product = getById(productId);
        if (!product) return;

        const modal = document.getElementById('productModal');
        const overlay = document.getElementById('productModalOverlay');
        
        if (!modal || !overlay) return;

        // Populate modal
        document.getElementById('modalProductImage').src = product.image;
        document.getElementById('modalProductImage').alt = I18n.getProductText(product, 'name');
        document.getElementById('modalProductName').textContent = I18n.getProductText(product, 'name');
        document.getElementById('modalProductDesc').textContent = I18n.getProductText(product, 'description');
        document.getElementById('modalProductPrice').textContent = I18n.formatPrice(product.price);
        document.getElementById('qtyInput').value = 1;

        // Store product ID
        modal.dataset.productId = productId;

        // Show modal
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close product modal
    function closeModal() {
        const modal = document.getElementById('productModal');
        const overlay = document.getElementById('productModalOverlay');
        
        if (modal) modal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Setup event listeners
    function setupEventListeners() {
        // Category buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                currentCategory = e.target.dataset.category;
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderProducts();
            }
        });

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderProducts();
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                renderProducts();
            });
        }

        // Product card click (open modal)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const addBtn = e.target.closest('.add-btn');
            
            if (addBtn) {
                e.stopPropagation();
                const productId = addBtn.dataset.productId;
                Cart.add(productId, 1);
                return;
            }

            if (card) {
                openModal(card.dataset.productId);
            }
        });

        // Modal close button
        const closeBtn = document.getElementById('productModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Overlay click
        const overlay = document.getElementById('productModalOverlay');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }

        // Quantity controls
        document.getElementById('qtyMinus')?.addEventListener('click', () => {
            const input = document.getElementById('qtyInput');
            if (input && parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
            }
        });

        document.getElementById('qtyPlus')?.addEventListener('click', () => {
            const input = document.getElementById('qtyInput');
            if (input && parseInt(input.value) < 99) {
                input.value = parseInt(input.value) + 1;
            }
        });

        // Add to cart from modal
        document.getElementById('addToCartBtn')?.addEventListener('click', () => {
            const modal = document.getElementById('productModal');
            const qty = parseInt(document.getElementById('qtyInput').value) || 1;
            const productId = modal.dataset.productId;
            
            Cart.add(productId, qty);
            closeModal();
        });
    }

    return {
        init,
        getAll,
        getById,
        getFiltered,
        openModal,
        closeModal
    };
})();

window.Products = Products;
