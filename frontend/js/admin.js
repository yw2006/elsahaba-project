/**
 * admin.js - Admin Panel Controller
 * Handles product management with Backend API
 */

const Admin = (function() {
    let products = [];
    let categories = [];
    let pagination = {
        total: 0,
        page: 1,
        pages: 1,
        limit: 12
    };
    let editingProductId = null;
    let token = localStorage.getItem('elsahaba_token');
    let searchQuery = '';

    // Initialize admin panel
    async function init() {
        if (token) {
            // Verify token
            const isValid = await verifyToken();
            if (isValid) {
                showDashboard();
            } else {
                logout();
            }
        } else {
            showLoginForm();
        }

        setupEventListeners();
    }

    // Verify current token
    async function verifyToken() {
        try {
            const response = await fetch(`${ENV.API_URL}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            return data.success;
        } catch (error) {
            return false;
        }
    }

    // Show login form
    function showLoginForm() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('dashboardSection').style.display = 'none';
        
        // Hide dashboard if visible
        const dashboard = document.getElementById('dashboardSection');
        if(dashboard) dashboard.style.display = 'none';
    }

    // Show dashboard
    function showDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        loadCategories().then(() => loadData());
    }

    // Logout
    function logout() {
        localStorage.removeItem('elsahaba_token');
        token = null;
        showLoginForm();
    }

    // Load categories
    async function loadCategories() {
        try {
            const response = await fetch(`${ENV.API_URL}/products/categories`);
            const data = await response.json();
            if (data.success) {
                categories = data.data || [];
                renderCategoryOptions();
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    // Load products with pagination and search
    async function loadData(page = 1) {
        try {
            const params = new URLSearchParams({
                page,
                limit: pagination.limit,
                search: searchQuery,
                inStock: 'all' // Admin wants to see everything
            });

            const response = await fetch(`${ENV.API_URL}/products?${params.toString()}`);
            const data = await response.json();
            
            if (data.success) {
                products = data.data;
                pagination = data.pagination;
                renderProducts();
                renderPagination();
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            showMessage('فشل في تحميل المنتجات', 'error');
        }
    }

    // Render products table
    function renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-row">لا توجد منتجات</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr class="${!product.inStock ? 'out-of-stock-row' : ''}">
                <td>
                    <img src="${product.image}" alt="${product.name.ar}" class="product-thumb" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23e6f4f9%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 font-size=%2240%22>🧴</text></svg>'">
                </td>
                <td>
                    <div class="product-name-ar">${product.name.ar}</div>
                    <div class="product-name-en">${product.name.en}</div>
                    ${product.hasVariants ? `<span style="font-size: 0.7rem; color: var(--primary-600); border: 1px solid var(--primary-200); padding: 1px 4px; border-radius: 4px;">متعدد الأنواع</span>` : ''}
                </td>
                <td>${product.hasVariants ? 'متعدد' : product.price + ' جنيه'}</td>
                <td>${getCategoryName(product.category)}</td>
                <td>
                    <button class="btn-sm ${product.inStock ? 'btn-success' : 'btn-danger'} btn-stock" data-id="${product.id}">
                        ${product.inStock ? 'متوفر' : 'غير متوفر'}
                    </button>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" data-id="${product.id}" title="تعديل">✏️</button>
                    <button class="btn-icon btn-delete" data-id="${product.id}" title="حذف">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    // Render pagination
    function renderPagination() {
        const container = document.getElementById('adminPagination');
        if (!container) return;

        if (pagination.pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn nav-btn" ${pagination.page === 1 ? 'disabled' : ''} data-page="${pagination.page - 1}">
                السابق
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
                التالي
            </button>
        `;

        container.innerHTML = html;
    }

    // Get category name
    function getCategoryName(categoryId) {
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name.ar : categoryId;
    }

    // Render category options in form
    function renderCategoryOptions() {
        const select = document.getElementById('productCategory');
        if (!select) return;

        select.innerHTML = categories
            .filter(c => c.id !== 'all')
            .map(cat => `<option value="${cat.id}">${cat.name.ar} - ${cat.name.en}</option>`)
            .join('');
    }

    // Open product form
    function openProductForm(productId = null) {
        const modal = document.getElementById('productFormModal');
        const title = document.getElementById('formTitle');
        const form = document.getElementById('productForm');
        
        editingProductId = productId;
        
        // Reset dynamic sections
        const variantsList = document.getElementById('variantsList');
        if (variantsList) {
            // Remove rows but keep header
            const rows = variantsList.querySelectorAll('.variant-row');
            rows.forEach(r => r.remove());
        }
        toggleVariantsSection(false);

        if (productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            title.textContent = 'تعديل المنتج';
            document.getElementById('productNameAr').value = product.name.ar;
            document.getElementById('productNameEn').value = product.name.en;
            document.getElementById('productCategory').value = product.category;
            
            const hasVariants = product.hasVariants || false;
            document.getElementById('productHasVariants').checked = hasVariants;
            toggleVariantsSection(hasVariants);

            if (hasVariants) {
                product.variants.forEach(v => addVariantRow(v));
                document.getElementById('productPrice').value = '';
                document.getElementById('productImage').value = '';
            } else {
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productImage').value = product.image;
            }
        } else {
            title.textContent = 'إضافة منتج جديد';
            form.reset();
        }
        
        loadProductDraft(productId);
        
        modal.classList.add('active');
    }

    // Close product form
    function closeProductForm() {
        const modal = document.getElementById('productFormModal');
        if (modal) modal.classList.remove('active');
        editingProductId = null;
    }

    // Toggle variants UI
    function toggleVariantsSection(show) {
        const section = document.getElementById('variantsSection');
        const priceRow = document.getElementById('standardPriceRow');
        const imageGroup = document.getElementById('standardImageGroup');
        
        if (show) {
            section.style.display = 'block';
            priceRow.style.display = 'none';
            imageGroup.style.display = 'none';
            // Ensure at least one variant row if empty
            if (document.getElementById('variantsList').children.length === 0) {
                addVariantRow();
            }
        } else {
            section.style.display = 'none';
            priceRow.style.display = 'grid';
            imageGroup.style.display = 'block';
        }
    }

    // Add row for a variant
    function addVariantRow(variant = null) {
        const list = document.getElementById('variantsList');
        const row = document.createElement('div');
        row.className = 'variant-row';
        // Grid styles moved to CSS class in admin.html

        const inStock = variant ? variant.inStock !== false : true;

        row.innerHTML = `
            <input type="text" class="v-name-ar" value="${variant ? variant.name.ar : ''}" placeholder="الاسم (عربي)" required>
            <input type="text" class="v-name-en" value="${variant ? variant.name.en : ''}" placeholder="Name (EN)" required>
            <input type="number" step="any" class="v-price" value="${variant ? variant.price : ''}" placeholder="السعر" required>
            <input type="text" class="v-image" value="${variant ? variant.image : ''}" placeholder="رابط الصورة">
            <div style="text-align: center;">
                <input type="checkbox" class="v-stock" ${inStock ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
            </div>
            <button type="button" class="btn btn-danger btn-sm v-remove" style="padding: 0.5rem; height: 38px;" title="حذف">🗑️</button>
        `;

        row.querySelector('.v-remove').addEventListener('click', () => {
        row.remove();
        saveProductDraft();
    });
    list.appendChild(row);
}

// Save product form draft to localStorage
function saveProductDraft() {
    const hasVariants = document.getElementById('productHasVariants').checked;
    const variants = [];

    if (hasVariants) {
        document.querySelectorAll('.variant-row').forEach(row => {
            variants.push({
                name: {
                    ar: row.querySelector('.v-name-ar').value,
                    en: row.querySelector('.v-name-en').value
                },
                price: parseFloat(row.querySelector('.v-price').value),
                image: row.querySelector('.v-image').value,
                inStock: row.querySelector('.v-stock').checked
            });
        });
    }

    const draft = {
        name: {
            ar: document.getElementById('productNameAr').value,
            en: document.getElementById('productNameEn').value
        },
        category: document.getElementById('productCategory').value,
        price: document.getElementById('productPrice').value,
        image: document.getElementById('productImage').value,
        hasVariants: hasVariants,
        variants: variants,
        editingProductId: editingProductId
    };

    localStorage.setItem('elsahaba_product_draft', JSON.stringify(draft));
}

// Load product form draft from localStorage
function loadProductDraft(requestedProductId = null) {
    const draftJson = localStorage.getItem('elsahaba_product_draft');
    if (!draftJson) return;

    try {
        const draft = JSON.parse(draftJson);
        if (!draft) return;

        // Only load if the draft is for the same product (or both are new products)
        if (draft.editingProductId !== requestedProductId) return;

        document.getElementById('productNameAr').value = draft.name?.ar || '';
        document.getElementById('productNameEn').value = draft.name?.en || '';
        document.getElementById('productCategory').value = draft.category || '';
        
        const hasVariants = draft.hasVariants || false;
        document.getElementById('productHasVariants').checked = hasVariants;
        toggleVariantsSection(hasVariants);

        if (hasVariants) {
            // Remove existing rows but keep header
            const rows = document.getElementById('variantsList').querySelectorAll('.variant-row');
            rows.forEach(r => r.remove());
            draft.variants?.forEach(v => addVariantRow(v));
            document.getElementById('productPrice').value = '';
            document.getElementById('productImage').value = '';
        } else {
            document.getElementById('productPrice').value = draft.price || '';
            document.getElementById('productImage').value = draft.image || '';
        }
    } catch (error) {
        console.error('Error loading product draft:', error);
    }
}

// Clear product form draft
function clearProductDraft() {
    localStorage.removeItem('elsahaba_product_draft');
}
    // Save product
    async function saveProduct(formData) {
        const hasVariants = document.getElementById('productHasVariants').checked;
        
        const productData = {
            name: {
                ar: formData.get('nameAr'),
                en: formData.get('nameEn')
            },
            category: formData.get('category'),
            hasVariants
        };

        if (hasVariants) {
            const variantRows = document.querySelectorAll('.variant-row');
            productData.variants = Array.from(variantRows).map(row => ({
                name: {
                    ar: row.querySelector('.v-name-ar').value,
                    en: row.querySelector('.v-name-en').value
                },
                price: parseFloat(row.querySelector('.v-price').value),
                image: row.querySelector('.v-image').value,
                inStock: row.querySelector('.v-stock').checked
            }));
            
            // Set main product defaults from first variant for safety
            if (productData.variants.length > 0) {
                productData.price = productData.variants[0].price;
                productData.image = productData.variants[0].image || 'images/default-product.svg';
            }
        } else {
            productData.price = parseFloat(formData.get('price'));
            productData.image = formData.get('image');
            productData.variants = [];
        }

        productData.description = {
            ar: formData.get('descAr'),
            en: formData.get('descEn')
        };

        try {
            const url = editingProductId 
                ? `${ENV.API_URL}/products/${editingProductId}`
                : `${ENV.API_URL}/products`;
            
            const method = editingProductId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });

            const data = await response.json();
            if (data.success) {
                showMessage(editingProductId ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح', 'success');
                closeProductForm();
                clearProductDraft();
                loadData(pagination.page);
            } else {
                showMessage(data.message || 'فشل حفظ المنتج', 'error');
            }
        } catch (error) {
            console.error('Failed to save product:', error);
            showMessage('فشل في حفظ المنتج: ' + error.message, 'error');
        }
    }

    // Delete product
    async function deleteProduct(productId) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        try {
            const response = await fetch(`${ENV.API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            
            loadData(pagination.page);
            showMessage('تم حذف المنتج', 'success');
        } catch (error) {
            console.error('Failed to delete product:', error);
            showMessage('فشل في حذف المنتج', 'error');
        }
    }

    // Toggle stock
    async function toggleStock(productId) {
        try {
            const response = await fetch(`${ENV.API_URL}/products/${productId}/stock`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if(!data.success) throw new Error(data.message);

            loadData(pagination.page);
            showMessage(data.message, 'success');
        } catch(error) {
            console.error('Failed to toggle stock:', error);
            showMessage('فشل في تغيير حالة التوفر', 'error');
        }
    }

    // Show message toast
    function showMessage(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;

            try {
                const response = await fetch(`${ENV.API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    token = data.token;
                    localStorage.setItem('elsahaba_token', token);
                    showDashboard();
                } else {
                    showMessage(data.message || 'فشل تسجيل الدخول', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage('حدث خطأ في الاتصال', 'error');
            }
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', logout);

        // Add product button
        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            openProductForm();
        });

        // Search input with debounce
        const searchInput = document.getElementById('adminSearchInput');
        let searchTimeout;
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchQuery = e.target.value;
                    loadData(1); // Reset to page 1
                }, 500);
            });
        }

        // Pagination buttons
        document.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.page-btn');
            if (pageBtn && !pageBtn.disabled && pageBtn.closest('#adminPagination')) {
                const page = parseInt(pageBtn.dataset.page);
                loadData(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Product form submit
    document.getElementById('productForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        saveProduct(formData);
    });

    // Save draft on any input in the form
    document.getElementById('productForm')?.addEventListener('input', () => {
        saveProductDraft();
    });

    // Has Variants toggle
    document.getElementById('productHasVariants')?.addEventListener('change', (e) => {
        toggleVariantsSection(e.target.checked);
        saveProductDraft();
    });

    // Add Variant button
    document.getElementById('addVariantBtn')?.addEventListener('click', () => {
        addVariantRow();
        saveProductDraft();
    });

        // Cancel button
        document.getElementById('cancelFormBtn')?.addEventListener('click', closeProductForm);
        
        // Close modal on overlay click
        document.getElementById('productFormModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'productFormModal') closeProductForm();
        });

        // Edit, delete, and stock buttons (event delegation)
        document.getElementById('productsTableBody')?.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            const stockBtn = e.target.closest('.btn-stock');

            if (editBtn) {
                openProductForm(editBtn.dataset.id);
            } else if (deleteBtn) {
                deleteProduct(deleteBtn.dataset.id);
            } else if (stockBtn) {
                toggleStock(stockBtn.dataset.id);
            }
        });
    }

    return { init };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => Admin.init());
