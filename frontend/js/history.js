/**
 * history.js - Order History Module
 * Stores order history in localStorage
 */

const History = (function() {
    const STORAGE_KEY = 'elsahaba_orders';

    // Initialize history module
    function init() {
        // Only render if we're on the history page
        if (document.getElementById('orderHistoryList')) {
            render();
            setupEventListeners();
        }

        // Re-render on language change
        window.addEventListener('languageChanged', () => {
            if (document.getElementById('orderHistoryList')) {
                render();
            }
        });
    }

    // Get all orders
    function getOrders() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    }

    // Save order to history
    function saveOrder(order) {
        const orders = getOrders();
        orders.unshift({
            id: Date.now(),
            ...order
        });
        
        // Keep only last 50 orders
        if (orders.length > 50) {
            orders.splice(50);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    }

    // Clear all history
    function clear() {
        localStorage.removeItem(STORAGE_KEY);
        render();
    }

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const lang = I18n.getLang();
        
        return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Render order history
    function render() {
        const listEl = document.getElementById('orderHistoryList');
        const emptyEl = document.getElementById('historyEmpty');
        const clearBtn = document.getElementById('clearHistoryBtn');

        if (!listEl) return;

        const orders = getOrders();

        if (orders.length === 0) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'flex';
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'block';

        listEl.innerHTML = orders.map(order => `
            <div class="history-card">
                <div class="history-header">
                    <span class="history-date">${formatDate(order.date)}</span>
                    <span class="history-total">${I18n.formatPrice(order.total)}</span>
                </div>
                <div class="history-items">
                    ${order.items.map(item => `
                        <div class="history-item">
                            <span>${item.name} × ${item.quantity}</span>
                            <span>${I18n.formatPrice(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                ${order.customer ? `
                    <div class="history-customer">
                        <span>👤 ${order.customer.name}</span>
                        ${order.customer.phone ? `<span>📞 ${order.customer.phone}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Setup event listeners
    function setupEventListeners() {
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            const confirmMsg = I18n.getLang() === 'ar' 
                ? 'هل أنت متأكد من مسح سجل الطلبات؟' 
                : 'Are you sure you want to clear order history?';
            
            if (confirm(confirmMsg)) {
                clear();
            }
        });
    }

    return {
        init,
        getOrders,
        saveOrder,
        clear
    };
})();

window.History = History;
