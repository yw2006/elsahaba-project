/**
 * cart.js - Shopping Cart Module
 * Handles cart operations with localStorage persistence
 */

const Cart = (function() {
    const STORAGE_KEY = 'elsahaba_cart';
    let items = [];

    // Initialize cart
    function init() {
        loadFromStorage();
        render();
        updateCount();
        setupEventListeners();

        // Re-render on language change
        window.addEventListener('languageChanged', render);
    }

    // Load cart from localStorage
    function loadFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            items = saved ? JSON.parse(saved) : [];
        } catch (error) {
            items = [];
        }
    }

    // Save cart to localStorage
    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    // Get all items
    function getItems() {
        return items;
    }

    // Get total price
    function getTotal() {
        return items.reduce((total, item) => {
            const product = Products.getById(item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    // Get total item count
    function getCount() {
        return items.reduce((count, item) => count + item.quantity, 0);
    }

    // Add item to cart
    function add(productId, quantity = 1) {
        const id = productId;
        const product = Products.getById(id);
        
        // Check if product exists and is in stock
        if (!product || product.inStock === false) {
            showToast(I18n.translate('product.outOfStock') || 'Out of Stock', 'error');
            return;
        }

        const existing = items.find(item => item.productId == id);

        if (existing) {
            existing.quantity += quantity;
        } else {
            items.push({ productId: id, quantity });
        }

        saveToStorage();
        render();
        updateCount();
        showToast(I18n.translate('toast.added') || 'Added to cart', 'success');
    }

    // Remove item from cart
    function remove(productId) {
        const id = productId;
        items = items.filter(item => item.productId != id);
        saveToStorage();
        render();
        updateCount();
    }

    // Update item quantity
    function updateQuantity(productId, quantity) {
        const id = productId;
        const item = items.find(item => item.productId == id);
        
        if (item) {
            if (quantity <= 0) {
                remove(productId);
            } else {
                item.quantity = quantity;
                saveToStorage();
                render();
                updateCount();
            }
        }
    }

    // Clear cart
    function clear() {
        items = [];
        saveToStorage();
        render();
        updateCount();
    }

    // Update cart count badge
    function updateCount() {
        const countEl = document.getElementById('cartCount');
        if (countEl) {
            const count = getCount();
            countEl.textContent = count;
            countEl.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Render cart sidebar
    function render() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotal = document.getElementById('cartTotal');

        if (!cartItems) return;

        if (items.length === 0) {
            cartItems.innerHTML = '';
            if (cartEmpty) cartEmpty.style.display = 'flex';
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';

        cartItems.innerHTML = items.map(item => {
            const product = Products.getById(item.productId);
            if (!product) return '';

            return `
                <div class="cart-item" data-product-id="${item.productId}">
                    <div class="cart-item-image">
                        <img src="${product.image}" alt="${I18n.getProductText(product, 'name')}"
                             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23e6f4f9%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2240%22>🧴</text></svg>'">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${I18n.getProductText(product, 'name')}</div>
                        <div class="cart-item-price">${I18n.formatPrice(product.price)}</div>
                        <div class="cart-item-controls">
                            <button class="cart-qty-btn" data-action="decrease" data-product-id="${item.productId}">−</button>
                            <span class="cart-item-qty">${item.quantity}</span>
                            <button class="cart-qty-btn" data-action="increase" data-product-id="${item.productId}">+</button>
                            <button class="cart-item-remove" data-product-id="${item.productId}">${I18n.translate('cart.remove') || 'حذف'}</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (cartTotal) {
            cartTotal.textContent = I18n.formatPrice(getTotal());
        }
    }

    // Open cart sidebar
    function open() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar) sidebar.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close cart sidebar
    function close() {
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar) sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Show toast notification
    function showToast(message, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 3000);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Cart button
        document.getElementById('cartBtn')?.addEventListener('click', open);
        
        // Close button
        document.getElementById('cartClose')?.addEventListener('click', close);
        
        // Overlay click
        document.getElementById('cartOverlay')?.addEventListener('click', close);

        // Cart item controls (event delegation)
        document.getElementById('cartItems')?.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const action = e.target.dataset.action;

            if (e.target.classList.contains('cart-item-remove')) {
                remove(productId);
            } else if (action === 'increase') {
                const item = items.find(i => i.productId == productId);
                if (item) updateQuantity(productId, item.quantity + 1);
            } else if (action === 'decrease') {
                const item = items.find(i => i.productId == productId);
                if (item) updateQuantity(productId, item.quantity - 1);
            }
        });

        // Checkout button
        document.getElementById('checkoutBtn')?.addEventListener('click', () => {
            if (items.length > 0) {
                close();
                Order.openModal();
            }
        });
    }

    return {
        init,
        getItems,
        getTotal,
        getCount,
        add,
        remove,
        updateQuantity,
        clear,
        open,
        close,
        showToast
    };
})();

window.Cart = Cart;
