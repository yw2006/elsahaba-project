/**
 * products.js - Product Display and Filtering Module
 */

const Products = (function() {
    let products = [];
    let categories = [];
    let pagination = {
        total: 0,
        page: 1,
        pages: 1,
        limit: 12
    };
    let currentCategory = 'all';
    let currentSort = 'default';
    let searchQuery = '';

    // Initialize products module
    async function init() {
        await loadCategories();
        await loadProducts();
        renderCategories();
        setupEventListeners();

        // Re-render on language change
        window.addEventListener('languageChanged', () => {
            renderCategories();
            renderProducts();
            renderPagination();
        });
    }

    // Load categories from API
    async function loadCategories() {
        try {
            const response = await fetch(`${ENV.API_URL}/products/categories`);
            const data = await response.json();
            if (data.success) {
                categories = data.data || [];
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    // Load products from API with pagination, filter, search, and sort
    async function loadProducts(page = 1) {
        try {
            const params = new URLSearchParams({
                page,
                limit: pagination.limit,
                category: currentCategory,
                sort: currentSort,
                search: searchQuery
            });

            const response = await fetch(`${ENV.API_URL}/products?${params.toString()}`);
            const data = await response.json();
            
            if (data.success) {
                products = data.data || [];
                pagination = data.pagination;
                renderProducts();
                renderPagination();
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    // Get product by ID
    function getById(id) {
        return products.find(p => p.id == id);
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

        if (products.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = products.map(product => `
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
                        <div class="product-price">
                            ${product.hasVariants ? 
                                `<span class="price-from">${I18n.getLang() === 'ar' ? 'من' : 'From'}</span> ` : ''}
                            ${I18n.formatPrice(product.price)}
                        </div>
                        ${product.inStock !== false ? 
                            `<button class="add-btn" data-product-id="${product.id}" aria-label="Add to cart">+</button>` :
                            `<span class="out-of-stock-badge">${I18n.getLang() === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}</span>`
                        }
                    </div>
                </div>
            </article>
        `).join('');
    }

    // Render pagination controls
    function renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;

        if (pagination.pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn nav-btn" ${pagination.page === 1 ? 'disabled' : ''} data-page="${pagination.page - 1}">
                ${I18n.getLang() === 'ar' ? 'السابق' : 'Prev'}
            </button>
        `;

        for (let i = 1; i <= pagination.pages; i++) {
            if (i === 1 || i === pagination.pages || (i >= pagination.page - 1 && i <= pagination.page + 1)) {
                 html += `
                    <button class="page-btn ${i === pagination.page ? 'active' : ''}" data-page="${i}">${i}</button>
                `;
            } else if (i === pagination.page - 2 || i === pagination.page + 2) {
                html += `<span class="page-dots">...</span>`;
            }
        }

        html += `
            <button class="page-btn nav-btn" ${pagination.page === pagination.pages ? 'disabled' : ''} data-page="${pagination.page + 1}">
                ${I18n.getLang() === 'ar' ? 'التالي' : 'Next'}
            </button>
        `;

        container.innerHTML = html;
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

        // Populate modal basics
        document.getElementById('modalProductImage').src = product.image;
        document.getElementById('modalProductImage').alt = I18n.getProductText(product, 'name');
        document.getElementById('modalProductName').textContent = I18n.getProductText(product, 'name');
        document.getElementById('modalProductDesc').textContent = I18n.getProductText(product, 'description');
        document.getElementById('modalProductPrice').textContent = I18n.formatPrice(product.price);
        document.getElementById('qtyInput').value = 1;

        // Handle Variants
        const variantsContainer = document.getElementById('modalProductVariants');
        if (variantsContainer) {
            if (product.hasVariants && product.variants && product.variants.length > 0) {
                variantsContainer.style.display = 'block';
                variantsContainer.innerHTML = `
                    <label class="variant-label">${I18n.getLang() === 'ar' ? 'اختر النوع:' : 'Choose Type:'}</label>
                    <div class="variant-options">
                        ${product.variants.map((v, index) => {
                            const isOutOfStock = v.inStock === false;
                            return `
                                <button class="variant-opt ${index === 0 ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}" 
                                        data-index="${index}" 
                                        data-price="${v.price}" 
                                        data-image="${v.image || product.image}"
                                        ${isOutOfStock ? 'title="' + (I18n.getLang() === 'ar' ? 'نفذت الكمية' : 'Out of Stock') + '"' : ''}>
                                    ${I18n.getProductText(v, 'name')}
                                    ${isOutOfStock ? ` <small>(${I18n.getLang() === 'ar' ? 'غير متوفر' : 'N/A'})</small>` : ''}
                                </button>
                            `;
                        }).join('')}
                    </div>
                `;
                
                // Initialize with first variant
                updateModalWithVariant(product.variants[0]);
                modal.dataset.selectedVariantIndex = "0";
            } else {
                variantsContainer.style.display = 'none';
                modal.dataset.selectedVariantIndex = "";
            }
        }

        // Store product ID
        modal.dataset.productId = productId;

        // Show modal
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Update modal items when variant changes
    function updateModalWithVariant(variant) {
        document.getElementById('modalProductPrice').textContent = I18n.formatPrice(variant.price);
        if (variant.image) {
            document.getElementById('modalProductImage').src = variant.image;
        }

        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            if (variant.inStock === false) {
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = I18n.getLang() === 'ar' ? 'نفذت الكمية' : 'Out of Stock';
                addToCartBtn.classList.add('disabled');
            } else {
                addToCartBtn.disabled = false;
                addToCartBtn.textContent = I18n.getLang() === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart';
                addToCartBtn.classList.remove('disabled');
            }
        }
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
                loadProducts(1); // Reset to page 1
            }
        });

        // Search input with debounce
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchQuery = e.target.value;
                    loadProducts(1); // Reset to page 1
                }, 500);
            });
        }

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                loadProducts(1); // Reset to page 1
            });
        }

        // Pagination buttons
        document.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.page-btn');
            if (pageBtn && !pageBtn.disabled) {
                const page = parseInt(pageBtn.dataset.page);
                loadProducts(page);
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Variant selection click
        document.addEventListener('click', (e) => {
            const opt = e.target.closest('.variant-opt');
            if (opt) {
                const modal = document.getElementById('productModal');
                const product = getById(modal.dataset.productId);
                const index = parseInt(opt.dataset.index);
                const variant = product.variants[index];

                document.querySelectorAll('.variant-opt').forEach(b => b.classList.remove('active'));
                opt.classList.add('active');
                
                modal.dataset.selectedVariantIndex = index;
                updateModalWithVariant(variant);
            }
        });

        // Product card click (open modal)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const addBtn = e.target.closest('.add-btn');
            
            if (addBtn) {
                e.stopPropagation();
                const productId = addBtn.dataset.productId;
                openModal(productId); // For products, we open modal to choose variant if needed
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
            if (input && parseFloat(input.value) > 0.1) {
                input.value = (parseFloat(input.value) - 1).toFixed(1);
                if (parseFloat(input.value) < 0.1) input.value = 0.1;
            }
        });

        document.getElementById('qtyPlus')?.addEventListener('click', () => {
            const input = document.getElementById('qtyInput');
            if (input && parseFloat(input.value) < 99) {
                input.value = (parseFloat(input.value) + 1).toFixed(1);
            }
        });

        // Add to cart from modal
        document.getElementById('addToCartBtn')?.addEventListener('click', () => {
            const modal = document.getElementById('productModal');
            const qty = parseFloat(document.getElementById('qtyInput').value) || 1;
            const productId = modal.dataset.productId;
            const variantIndex = modal.dataset.selectedVariantIndex;
            
            Cart.add(productId, qty, variantIndex !== "" ? parseInt(variantIndex) : null);
            closeModal();
        });
    }

    return {
        init,
        getById,
        openModal,
        closeModal
    };
})();

window.Products = Products;
