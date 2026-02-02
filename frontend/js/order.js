/**
 * order.js - Order Creation and WhatsApp Integration
 */

const Order = (function() {
    const getWhatsAppNumber = () => window.ENV?.WHATSAPP_PHONE || '201227624726';

    // Initialize order module
    function init() {
        setupEventListeners();
        
        // Re-render on language change
        window.addEventListener('languageChanged', () => {
            if (document.getElementById('orderModal').classList.contains('active')) {
                renderSummary();
            }
        });
    }

    // Open order modal
    function openModal() {
        const modal = document.getElementById('orderModal');
        const overlay = document.getElementById('orderModalOverlay');
        
        if (!modal || !overlay) return;

        // Render order summary
        renderSummary();

        // Show modal
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close order modal
    function closeModal() {
        const modal = document.getElementById('orderModal');
        const overlay = document.getElementById('orderModalOverlay');
        
        if (modal) modal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Render order summary
    function renderSummary() {
        const summaryEl = document.getElementById('orderSummary');
        if (!summaryEl) return;

        const items = Cart.getItems();
        const total = Cart.getTotal();

        const summaryTitle = I18n.translate('order.summary') || 'ملخص الطلب';
        const totalLabel = I18n.translate('order.total') || 'الإجمالي';

        summaryEl.innerHTML = `
            <div class="order-summary-title">${summaryTitle}</div>
            ${items.map(item => {
                const details = Cart.getItemDetails(item);
                if (!details) return '';
                return `
                    <div class="order-summary-item">
                        <span>${details.name} × ${item.quantity}</span>
                        <span>${I18n.formatPrice(details.price * item.quantity)}</span>
                    </div>
                `;
            }).join('')}
            <div class="order-summary-total">
                <span>${totalLabel}</span>
                <span>${I18n.formatPrice(total)}</span>
            </div>
        `;
    }

    // Generate WhatsApp message
    function generateMessage(customerInfo) {
        const items = Cart.getItems();
        const total = Cart.getTotal();
        const lang = I18n.getLang();

        let message = '';

        if (lang === 'ar') {
            message = `🛒 *طلب جديد من الصحابه*\n`;
            message += `━━━━━━━━━━━━━━━\n\n`;
            message += `📋 *تفاصيل الطلب:*\n`;
            
            items.forEach(item => {
                const details = Cart.getItemDetails(item);
                if (details) {
                    message += `• ${details.name} × ${item.quantity} = ${details.price * item.quantity} جنيه\n`;
                }
            });

            message += `\n━━━━━━━━━━━━━━━\n`;
            message += `💰 *الإجمالي: ${total} جنيه*\n\n`;
            message += `👤 *بيانات العميل:*\n`;
            message += `الاسم: ${customerInfo.name}\n`;
            if (customerInfo.phone) message += `الهاتف: ${customerInfo.phone}\n`;
            if (customerInfo.address) message += `العنوان/ملاحظات: ${customerInfo.address}\n`;
        } else {
            message = `🛒 *New Order from Al-Sahaba*\n`;
            message += `━━━━━━━━━━━━━━━\n\n`;
            message += `📋 *Order Details:*\n`;
            
            items.forEach(item => {
                const details = Cart.getItemDetails(item);
                if (details) {
                    message += `• ${details.name} × ${item.quantity} = ${details.price * item.quantity} EGP\n`;
                }
            });

            message += `\n━━━━━━━━━━━━━━━\n`;
            message += `💰 *Total: ${total} EGP*\n\n`;
            message += `👤 *Customer Info:*\n`;
            message += `Name: ${customerInfo.name}\n`;
            if (customerInfo.phone) message += `Phone: ${customerInfo.phone}\n`;
            if (customerInfo.address) message += `Address/Notes: ${customerInfo.address}\n`;
        }

        return message;
    }

    // Submit order via WhatsApp (with backend save)
    async function submit(customerInfo) {
        const message = generateMessage(customerInfo);
        const items = Cart.getItems().map(item => {
            const details = Cart.getItemDetails(item);
            return {
                productId: item.productId,
                variantIndex: item.variantIndex,
                name: details ? details.name : 'Unknown Product',
                price: details ? details.price : 0,
                quantity: item.quantity
            };
        });

        const orderData = {
            items,
            total: Cart.getTotal(),
            customer: customerInfo
        };

        // Try to save order to backend
        let backendSaved = false;
        try {
            const response = await fetch(`${ENV.API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            backendSaved = result.success;
        } catch (error) {
            console.error('Failed to save order to backend:', error);
        }

        // Save order to local history
        History.saveOrder({
            ...orderData,
            date: new Date().toISOString()
        });

        // Clear cart
        Cart.clear();
        closeModal();

        // Show success toast
        const successMsg = backendSaved 
            ? (I18n.getLang() === 'ar' ? 'تم حفظ الطلب بنجاح' : 'Order saved successfully')
            : (I18n.getLang() === 'ar' ? 'تم حفظ الطلب محلياً' : 'Order saved locally');
        Cart.showToast(successMsg, 'success');

        // Open WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${getWhatsAppNumber()}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    // Copy order details to clipboard
    function copyToClipboard() {
        const customerInfo = {
            name: document.getElementById('customerName')?.value.trim() || '',
            phone: document.getElementById('customerPhone')?.value.trim() || '',
            address: document.getElementById('customerAddress')?.value.trim() || ''
        };

        if (!customerInfo.name || !customerInfo.phone) {
            alert(I18n.getLang() === 'ar' ? 'الرجاء إدخال الاسم ورقم الهاتف أولاً' : 'Please enter your name and phone first');
            return;
        }

        const message = generateMessage(customerInfo);
        
        navigator.clipboard.writeText(message).then(() => {
            Cart.showToast(
                I18n.getLang() === 'ar' ? 'تم نسخ تفاصيل الطلب!' : 'Order details copied!',
                'success'
            );
        }).catch(err => {
            console.error('Clipboard error:', err);
            // Fallback: select and prompt to copy
            const textarea = document.createElement('textarea');
            textarea.value = message;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            Cart.showToast(
                I18n.getLang() === 'ar' ? 'تم نسخ تفاصيل الطلب!' : 'Order details copied!',
                'success'
            );
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Close button
        document.getElementById('orderModalClose')?.addEventListener('click', closeModal);

        // Overlay click
        document.getElementById('orderModalOverlay')?.addEventListener('click', closeModal);

        // Order form submit
        document.getElementById('orderForm')?.addEventListener('submit', (e) => {
            e.preventDefault();

            const customerInfo = {
                name: document.getElementById('customerName').value.trim(),
                phone: document.getElementById('customerPhone').value.trim(),
                address: document.getElementById('customerAddress').value.trim()
            };

            if (!customerInfo.name) {
                alert(I18n.getLang() === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter your name');
                return;
            }

            if (!customerInfo.phone) {
                alert(I18n.getLang() === 'ar' ? 'الرجاء إدخال رقم الهاتف' : 'Please enter your phone number');
                return;
            }

            submit(customerInfo);
        });
    }

    return {
        init,
        openModal,
        closeModal,
        submit,
        copyToClipboard
    };
})();

window.Order = Order;
