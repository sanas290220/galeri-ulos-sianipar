// GLOBAL STATE MANAGEMENT
let ULOS_DATA = [];
let ACTIVE_CATEGORY = 'Semua';
let SEARCH_QUERY = '';
let PENDING_ACTION_PRODUCT_ID = null;
let APPLIED_VOUCHER = null;
let SELECTED_VARIANT_DETAIL = null;

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initProductsData();
    initStoreSettings();
    updateAuthUI();
    updateCartBadge();
    
    if (document.getElementById('product-grid')) {
        loadProducts();
    }
    if (document.getElementById('detail-container')) {
        loadProductDetail();
    }
    if (document.getElementById('cart-page-container')) {
        renderCartPage();
    }
});

// INITIALIZE LOCALSTORAGE DATA
function initProductsData() {
    const customData = localStorage.getItem('ulos_custom_data');
    if (!customData) {
        fetch('data/ulos-data.json')
            .then(res => res.json())
            .then(data => {
                localStorage.setItem('ulos_custom_data', JSON.stringify(data));
                ULOS_DATA = data;
                if (document.getElementById('product-grid')) renderCatalog(ULOS_DATA);
            })
            .catch(err => console.error("Error init JSON data:", err));
    } else {
        ULOS_DATA = JSON.parse(customData);
    }
}

function initStoreSettings() {
    if (!localStorage.getItem('store_bank_accounts')) {
        const defaultBanks = [
            { bank: 'Bank BCA', norek: '8290-1234-5678', atasNama: 'Galeri Ulos Sianipar' },
            { bank: 'Bank Mandiri', norek: '106-00-9876543-2', atasNama: 'Sandi Ardiansyah (Owner)' },
            { bank: 'E-Wallet GoPay / OVO', norek: '0812-6543-2109', atasNama: 'Galeri Ulos Medan' }
        ];
        localStorage.setItem('store_bank_accounts', JSON.stringify(defaultBanks));
    }

    if (!localStorage.getItem('store_couriers')) {
        const defaultCouriers = [
            { id: 'jne', name: 'JNE Express (REG/YES)', active: true },
            { id: 'pos', name: 'POS Indonesia Kilat', active: true },
            { id: 'jnt', name: 'J&T Express', active: true },
            { id: 'cargo', name: 'Cargo Adat Spesial Medan', active: true }
        ];
        localStorage.setItem('store_couriers', JSON.stringify(defaultCouriers));
    }

    if (!localStorage.getItem('store_vouchers')) {
        const defaultVouchers = [
            { id: 1, code: 'ULOSHERITAGE', type: 'percent', value: 10, minSpend: 500000, expiry: '2026-12-31', active: true },
            { id: 2, code: 'MEDANHEMAT', type: 'nominal', value: 50000, minSpend: 300000, expiry: '2026-12-31', active: true }
        ];
        localStorage.setItem('store_vouchers', JSON.stringify(defaultVouchers));
    }

    if (!localStorage.getItem('simulated_orders')) {
        const defaultOrders = [
            {
                orderId: 'ORD-982143',
                date: '08/11/2026',
                customerUsername: 'pembeli',
                customerName: 'Sandi Ardiansyah',
                phone: '0812-6543-2109',
                address: 'Jl. AR. Hakim No. 45, Medan, Sumatera Utara',
                items: [{ nama: 'Ulos Ragidup', qty: 1, harga: 1500000, hargaFormatted: 'Rp 1.500.000', varianPilihan: 'Merah Maroon (Standard)' }],
                subtotal: 1500000,
                discount: 0,
                shippingFee: 25000,
                total: 1525000,
                courier: 'JNE Express',
                bankTujuan: 'Bank BCA (8290-1234-5678)',
                resi: 'JNE9918273645',
                status: 'Pesanan Dikirim',
                buktiBayar: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
                paymentStatus: 'Verified'
            }
        ];
        localStorage.setItem('simulated_orders', JSON.stringify(defaultOrders));
    }

    if (!localStorage.getItem('buyer_inbox_emails')) {
        const defaultBuyerEmails = [
            { id: 1, recipientUsername: 'pembeli', subject: 'Invoice Tagihan Pesanan #ORD-982143', date: '08/11/2026 14:20', body: 'Terima kasih telah memesan Ulos Ragidup. Total tagihan Anda adalah Rp 1.525.000. Silakan lakukan transfer manual.' },
            { id: 2, recipientUsername: 'pembeli', subject: 'Pembayaran Disetujui Galeri #ORD-982143', date: '08/11/2026 14:45', body: 'Bukti pembayaran Anda telah diverifikasi oleh Admin. Pesanan Ulos Anda sedang dikemas dengan asuransi adat.' },
            { id: 3, recipientUsername: 'pembeli', subject: 'Pesanan Dikirim! Resi JNE9918273645', date: '08/11/2026 16:10', body: 'Pesanan Anda telah diserahkan kepada kurir JNE Express. Lacak nomor resi JNE9918273645 pada sistem pelacakan.' }
        ];
        localStorage.setItem('buyer_inbox_emails', JSON.stringify(defaultBuyerEmails));
    }
}

function getProductsData() {
    const data = localStorage.getItem('ulos_custom_data');
    return data ? JSON.parse(data) : ULOS_DATA;
}

function saveProductsData(data) {
    localStorage.setItem('ulos_custom_data', JSON.stringify(data));
    ULOS_DATA = data;
    if (document.getElementById('product-grid')) {
        applyFilters();
    }
}

// AUTH SYSTEM
function getLoggedUser() {
    const data = localStorage.getItem('logged_user');
    return data ? JSON.parse(data) : null;
}

function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem('registered_users')) || [
        { name: 'Pembeli Utama', username: 'pembeli', password: 'pembeli123', role: 'pembeli' }
    ];
}

function updateAuthUI() {
    const user = getLoggedUser();
    const navAuthContainers = document.querySelectorAll('.auth-nav-container');

    navAuthContainers.forEach(container => {
        if (!user) {
            container.innerHTML = `
                <button onclick="openLoginModal()" class="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-full text-xs font-semibold shadow-md transition flex items-center gap-2">
                    <i class="fa-solid fa-right-to-bracket"></i> Masuk / Daftar
                </button>
            `;
        } else {
            const isAdmin = user.role === 'admin';
            container.innerHTML = `
                <div class="relative group">
                    <button class="px-4 py-2 bg-white border border-brand-200 rounded-full text-xs font-semibold text-brand-900 shadow-sm flex items-center gap-2">
                        <i class="fa-solid ${isAdmin ? 'fa-user-shield text-amber-600' : 'fa-circle-user text-brand-700'} text-sm"></i>
                        <span>${user.name}</span>
                        <i class="fa-solid fa-chevron-down text-[10px] text-stone-400"></i>
                    </button>
                    <div class="hidden group-hover:block absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50">
                        <div class="px-4 py-2 border-b border-stone-100">
                            <p class="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Status Akses</p>
                            <p class="text-xs font-bold text-brand-800">${isAdmin ? 'Admin Galeri Sianipar' : 'Pembeli Terdaftar'}</p>
                        </div>
                        ${isAdmin 
                            ? `<a href="keranjang.html" class="block px-4 py-2 text-xs text-stone-700 hover:bg-brand-50"><i class="fa-solid fa-sliders text-amber-600 mr-2"></i>Dashboard Admin</a>`
                            : `<a href="keranjang.html#pesanan-section" onclick="switchBuyerTab('orders')" class="block px-4 py-2 text-xs text-stone-700 hover:bg-brand-50"><i class="fa-solid fa-truck-fast text-brand-700 mr-2"></i>Pesanan & Resi Saya</a>
                               <a href="keranjang.html#inbox-section" onclick="switchBuyerTab('inbox')" class="block px-4 py-2 text-xs text-stone-700 hover:bg-brand-50"><i class="fa-solid fa-envelope text-brand-700 mr-2"></i>Inbox Email Notifikasi</a>`
                        }
                        <button onclick="logout()" class="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-stone-100 mt-1">
                            <i class="fa-solid fa-right-from-bracket"></i> Keluar (Logout)
                        </button>
                    </div>
                </div>
            `;
        }
    });

    const adminBanner = document.getElementById('admin-mode-banner');
    if (adminBanner) {
        if (user && user.role === 'admin') {
            adminBanner.classList.remove('hidden');
        } else {
            adminBanner.classList.add('hidden');
        }
    }
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegisterBtn = document.getElementById('tab-register-btn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLoginBtn.className = "w-1/2 py-2 text-xs font-bold text-brand-800 border-b-2 border-brand-700";
        tabRegisterBtn.className = "w-1/2 py-2 text-xs font-semibold text-stone-400 border-b-2 border-transparent hover:text-stone-700";
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabRegisterBtn.className = "w-1/2 py-2 text-xs font-bold text-brand-800 border-b-2 border-brand-700";
        tabLoginBtn.className = "w-1/2 py-2 text-xs font-semibold text-stone-400 border-b-2 border-transparent hover:text-stone-700";
    }
}

function openLoginModal(reasonMessage = null, productId = null) {
    if (productId) PENDING_ACTION_PRODUCT_ID = productId;
    const modal = document.getElementById('login-modal');
    const msgElement = document.getElementById('login-modal-message');
    
    if (msgElement) {
        if (reasonMessage) {
            msgElement.textContent = reasonMessage;
            msgElement.classList.remove('hidden');
        } else {
            msgElement.classList.add('hidden');
        }
    }

    switchAuthTab('login');
    if (modal) modal.classList.remove('hidden');
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.classList.add('hidden');
    PENDING_ACTION_PRODUCT_ID = null;
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value.trim();

    if (!name || !username || !password) {
        showToast("Lengkapi seluruh data pendaftaran!");
        return;
    }

    const users = getRegisteredUsers();
    if (users.find(u => u.username === username) || username === 'admin') {
        showToast("Username sudah digunakan!");
        return;
    }

    const newUser = { name, username, password, role: 'pembeli' };
    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));

    showToast("Registrasi berhasil! Silakan masuk.");
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = password;
    switchAuthTab('login');
}

function handleLoginSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
    const passwordInput = document.getElementById('login-password').value.trim();

    let userObj = null;
    if (usernameInput === 'admin' && passwordInput === 'admin123') {
        userObj = { username: 'admin', name: 'Admin Galeri', role: 'admin' };
    } else {
        const users = getRegisteredUsers();
        const found = users.find(u => u.username === usernameInput && u.password === passwordInput);
        if (found) {
            userObj = { username: found.username, name: found.name, role: 'pembeli' };
        }
    }

    if (!userObj) {
        showToast("Username atau password salah!");
        return;
    }

    localStorage.setItem('logged_user', JSON.stringify(userObj));
    updateAuthUI();
    closeLoginModal();
    showToast(`Selamat datang, ${userObj.name}!`);

    if (PENDING_ACTION_PRODUCT_ID && userObj.role === 'pembeli') {
        addToCart(PENDING_ACTION_PRODUCT_ID);
        PENDING_ACTION_PRODUCT_ID = null;
    }

    if (document.getElementById('cart-page-container')) {
        renderCartPage();
    }
}

function logout() {
    localStorage.removeItem('logged_user');
    updateAuthUI();
    showToast("Anda telah keluar akun.");
    if (document.getElementById('cart-page-container')) {
        renderCartPage();
    }
}

// ---------------------------------------------------------------------
// MODUL PEMBELI 1: PENJELAJAHAN PRODUK & VARIAN
// ---------------------------------------------------------------------
function loadProducts() {
    ULOS_DATA = getProductsData();
    renderCatalog(ULOS_DATA);
}

function renderCatalog(products) {
    const grid = document.getElementById('product-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) return;

    grid.innerHTML = '';
    if (products.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }

    products.forEach(item => {
        const totalStok = item.varian ? item.varian.reduce((s, v) => s + Number(v.stok), 0) : 10;
        const card = document.createElement('div');
        card.className = "bg-white rounded-3xl border border-stone-200/90 overflow-hidden card-hover-effect flex flex-col justify-between group";
        
        card.innerHTML = `
            <div>
                <div class="relative h-56 bg-stone-100 overflow-hidden">
                    <img src="${item.gambar}" alt="${item.nama}" 
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80';"
                         class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"></div>
                    
                    <span class="absolute top-3 left-3 text-[10px] font-bold bg-white/95 text-brand-900 px-3 py-1 rounded-full shadow-sm">
                        ${item.kategori}
                    </span>
                    <span class="absolute top-3 right-3 text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full shadow-sm">
                        📦 ${item.berat || 500}g | Stok: ${totalStok}
                    </span>
                    
                    <div class="absolute bottom-3.5 left-4 right-4 text-white">
                        <h3 class="font-serif-title text-xl font-bold">${item.nama}</h3>
                        <p class="text-[11px] text-white/90 line-clamp-1">${item.penggunaan}</p>
                    </div>
                </div>

                <div class="p-5 space-y-3">
                    <div class="flex justify-between items-baseline">
                        <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Harga Resmi</span>
                        <span class="font-bold text-brand-800 text-base font-serif-title">${item.hargaFormatted || ('Rp ' + Number(item.harga).toLocaleString('id-ID'))}</span>
                    </div>
                    
                    <p class="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                        ${item.makna}
                    </p>

                    <!-- Pilihan Varian Quick Preview -->
                    <div class="pt-1">
                        <label class="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Varian Motif/Warna:</label>
                        <div class="flex flex-wrap gap-1 text-[11px]">
                            ${item.varian ? item.varian.map(v => `<span class="px-2 py-0.5 bg-brand-50 text-brand-800 rounded border border-brand-200/60">${v.warna}</span>`).join('') : '<span class="text-stone-400">Standard</span>'}
                        </div>
                    </div>
                </div>
            </div>

            <div class="px-5 pb-5 pt-1 flex flex-col gap-2">
                <a href="detail-ulos.html?id=${item.id}" class="w-full py-2.5 bg-brand-50/80 hover:bg-brand-100 text-brand-800 text-xs font-semibold rounded-xl border border-brand-200/70 transition flex items-center justify-center gap-1.5 text-center">
                    <i class="fa-solid fa-book-open text-brand-700"></i> Detail Filosofi & Varian
                </a>
                <button onclick="addToCart(${item.id})" class="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-cart-plus"></i> Tambah Keranjang
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterCategory(category) {
    ACTIVE_CATEGORY = category;
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(category) || (category === 'Semua' && btn.textContent.includes('Semua'))) {
            btn.className = "filter-btn active-filter px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition bg-brand-700 text-white shadow-sm";
        } else {
            btn.className = "filter-btn px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition bg-white text-stone-600 border border-stone-200 hover:border-brand-500 hover:text-brand-700";
        }
    });
    applyFilters();
}

function handleSearch() {
    const input = document.getElementById('search-input');
    if (input) SEARCH_QUERY = input.value.toLowerCase();
    applyFilters();
}

function handleSearchMobile() {
    const input = document.getElementById('search-input-mobile');
    if (input) SEARCH_QUERY = input.value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    let filtered = getProductsData();
    if (ACTIVE_CATEGORY !== 'Semua') {
        filtered = filtered.filter(item => item.kategori.toLowerCase() === ACTIVE_CATEGORY.toLowerCase());
    }
    if (SEARCH_QUERY.trim() !== '') {
        filtered = filtered.filter(item => 
            item.nama.toLowerCase().includes(SEARCH_QUERY) ||
            item.makna.toLowerCase().includes(SEARCH_QUERY) ||
            item.kategori.toLowerCase().includes(SEARCH_QUERY)
        );
    }
    renderCatalog(filtered);
}

// DETAIL ULOS DETAIL & VARIANT SELECTOR
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1;

    const data = getProductsData();
    const item = data.find(p => p.id === productId) || data[0];
    
    document.getElementById('detail-title').textContent = item.nama;
    document.getElementById('detail-category').textContent = item.kategori;
    document.getElementById('detail-price').textContent = item.hargaFormatted || ('Rp ' + Number(item.harga).toLocaleString('id-ID'));
    document.getElementById('detail-philosophy').textContent = item.makna;
    document.getElementById('detail-usage').textContent = item.penggunaan;
    if (document.getElementById('detail-weight')) {
        document.getElementById('detail-weight').textContent = `${item.berat || 500} gram`;
    }
    
    const img = document.getElementById('detail-image');
    if (img) {
        img.src = item.gambar;
        img.alt = item.nama;
    }

    const variantContainer = document.getElementById('detail-variants-selector');
    if (variantContainer && item.varian) {
        variantContainer.innerHTML = item.varian.map((v, i) => `
            <option value="${v.warna} (${v.ukuran})">Varian: ${v.warna} — ${v.ukuran} (Stok: ${v.stok})</option>
        `).join('');
    }

    const btn = document.getElementById('detail-add-cart-btn');
    if (btn) {
        btn.setAttribute('onclick', `addToCartWithVariant(${item.id})`);
    }
}

// ---------------------------------------------------------------------
// MODUL PEMBELI 2: KERANJANG BELANJA
// ---------------------------------------------------------------------
function getCart() {
    return JSON.parse(localStorage.getItem('ulos_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('ulos_cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(id) {
    addToCartWithVariant(id, null);
}

function addToCartWithVariant(id, customVarian = null) {
    const user = getLoggedUser();
    if (!user) {
        openLoginModal("Silakan login atau daftar terlebih dahulu untuk memesan kain ulos.", id);
        return;
    }
    if (user.role === 'admin') {
        showToast("Akun Admin Galeri tidak dapat melakukan transaksi pembelian.");
        return;
    }

    const data = getProductsData();
    const product = data.find(p => p.id === id);
    if (!product) return;

    let varianNama = customVarian;
    if (!varianNama) {
        const selectEl = document.getElementById('detail-variants-selector');
        if (selectEl && selectEl.value) {
            varianNama = selectEl.value;
        } else if (product.varian && product.varian.length > 0) {
            varianNama = `${product.varian[0].warna} (${product.varian[0].ukuran})`;
        } else {
            varianNama = 'Standard Tradisional';
        }
    }

    let cart = getCart();
    const existing = cart.find(item => item.id === id && item.varianPilihan === varianNama);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1, varianPilihan: varianNama });
    }

    saveCart(cart);
    showToast(`"${product.nama}" (${varianNama}) ditambahkan ke keranjang!`);
}

function updateCartQty(id, change, varian) {
    let cart = getCart();
    const item = cart.find(i => i.id === id && i.varianPilihan === varian);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) cart = cart.filter(i => !(i.id === id && i.varianPilihan === varian));
    }
    saveCart(cart);
    renderCartPage();
}

function removeFromCart(id, varian) {
    let cart = getCart().filter(i => !(i.id === id && i.varianPilihan === varian));
    saveCart(cart);
    renderCartPage();
}

function updateCartBadge() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(b => b.textContent = totalQty);
}

// ---------------------------------------------------------------------
// MODUL PEMBELI 3, 4, 5, 6: CHECKOUT, BUKTI BAYAR, RESI & INBOX EMAIL
// ---------------------------------------------------------------------

function switchBuyerTab(tab) {
    const bCart = document.getElementById('buyer-cart-tab');
    const bOrders = document.getElementById('buyer-orders-tab');
    const bInbox = document.getElementById('buyer-inbox-tab');
    
    const btnC = document.getElementById('tab-buyer-cart-btn');
    const btnO = document.getElementById('tab-buyer-orders-btn');
    const btnI = document.getElementById('tab-buyer-inbox-btn');

    if (bCart) bCart.classList.add('hidden');
    if (bOrders) bOrders.classList.add('hidden');
    if (bInbox) bInbox.classList.add('hidden');

    if (btnC) btnC.className = "px-4 py-2 rounded-full text-xs font-semibold bg-white text-stone-600 border border-stone-200";
    if (btnO) btnO.className = "px-4 py-2 rounded-full text-xs font-semibold bg-white text-stone-600 border border-stone-200";
    if (btnI) btnI.className = "px-4 py-2 rounded-full text-xs font-semibold bg-white text-stone-600 border border-stone-200";

    if (tab === 'cart' && bCart) {
        bCart.classList.remove('hidden');
        if (btnC) btnC.className = "px-4 py-2 rounded-full text-xs font-bold bg-brand-700 text-white shadow";
    } else if (tab === 'orders' && bOrders) {
        bOrders.classList.remove('hidden');
        if (btnO) btnO.className = "px-4 py-2 rounded-full text-xs font-bold bg-brand-700 text-white shadow";
        renderBuyerOrders();
    } else if (tab === 'inbox' && bInbox) {
        bInbox.classList.remove('hidden');
        if (btnI) btnI.className = "px-4 py-2 rounded-full text-xs font-bold bg-brand-700 text-white shadow";
        renderBuyerInbox();
    }
}

function applyVoucherCode() {
    const codeInput = document.getElementById('voucher-code-input');
    if (!codeInput) return;

    const code = codeInput.value.trim().toUpperCase();
    if (!code) {
        showToast("Masukkan kode voucher!");
        return;
    }

    const vouchers = JSON.parse(localStorage.getItem('store_vouchers')) || [];
    const found = vouchers.find(v => v.code === code && v.active);

    if (!found) {
        showToast("Kode voucher tidak valid atau sudah kedaluwarsa.");
        return;
    }

    const cart = getCart();
    const subtotal = cart.reduce((sum, i) => sum + (i.harga * i.qty), 0);

    if (subtotal < found.minSpend) {
        showToast(`Minimal belanja untuk voucher ini adalah Rp ${found.minSpend.toLocaleString('id-ID')}`);
        return;
    }

    APPLIED_VOUCHER = found;
    showToast(`Voucher ${found.code} berhasil dipasang!`);
    renderCartPage();
}

function renderCartPage() {
    const user = getLoggedUser();
    const userView = document.getElementById('user-cart-view');
    const adminView = document.getElementById('admin-dashboard-view');

    if (user && user.role === 'admin') {
        if (userView) userView.classList.add('hidden');
        if (adminView) {
            adminView.classList.remove('hidden');
            switchAdminTab('products');
        }
        return;
    }

    if (adminView) adminView.classList.add('hidden');
    if (userView) userView.classList.remove('hidden');

    switchBuyerTab('cart');

    const cartContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const cart = getCart();

    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-12 bg-white rounded-3xl border border-stone-200">
                <i class="fa-solid fa-bag-shopping text-4xl text-stone-300 mb-3"></i>
                <h4 class="font-serif-title text-lg font-bold text-stone-700">Keranjang Belanja Kosong</h4>
                <p class="text-xs text-stone-500 mb-4">Anda belum menambahkan kain ulos ke dalam keranjang.</p>
                <a href="index.html#katalog-section" class="px-5 py-2.5 bg-brand-700 text-white rounded-full text-xs font-semibold shadow">Lihat Katalog Ulos</a>
            </div>
        `;
        if (cartSummary) cartSummary.classList.add('hidden');
        return;
    }

    if (cartSummary) cartSummary.classList.remove('hidden');
    cartContainer.innerHTML = '';

    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.harga * item.qty;
        subtotal += itemTotal;

        const row = document.createElement('div');
        row.className = "bg-white p-4 rounded-3xl border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 soft-card-shadow";
        row.innerHTML = `
            <div class="flex items-center gap-4 w-full sm:w-auto">
                <img src="${item.gambar}" alt="${item.nama}" class="w-16 h-16 rounded-2xl object-cover border border-stone-200">
                <div>
                    <span class="text-[10px] font-bold text-brand-700 uppercase">${item.kategori} • ${item.varianPilihan || 'Standard'}</span>
                    <h4 class="font-serif-title font-bold text-stone-800">${item.nama}</h4>
                    <span class="text-xs font-semibold text-stone-500">Rp ${Number(item.harga).toLocaleString('id-ID')}</span>
                </div>
            </div>
            
            <div class="flex items-center justify-between w-full sm:w-auto gap-6">
                <div class="flex items-center border border-stone-200 rounded-full px-3 py-1 bg-stone-50">
                    <button onclick="updateCartQty(${item.id}, -1, '${item.varianPilihan}')" class="text-stone-500 hover:text-stone-800 px-1 text-xs font-bold">-</button>
                    <span class="px-3 text-xs font-bold text-stone-800">${item.qty}</span>
                    <button onclick="updateCartQty(${item.id}, 1, '${item.varianPilihan}')" class="text-stone-500 hover:text-stone-800 px-1 text-xs font-bold">+</button>
                </div>
                <span class="font-bold text-brand-800 text-sm font-serif-title">Rp ${itemTotal.toLocaleString('id-ID')}</span>
                <button onclick="removeFromCart(${item.id}, '${item.varianPilihan}')" class="text-rose-500 hover:text-rose-700 text-sm">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        cartContainer.appendChild(row);
    });

    // Populate Bank Options & Info for Buyer
    const bankListContainer = document.getElementById('buyer-bank-accounts-info');
    const bankSelectOption = document.getElementById('checkout-bank-choice');
    const banks = JSON.parse(localStorage.getItem('store_bank_accounts')) || [];

    if (bankListContainer) {
        bankListContainer.innerHTML = banks.map(b => `
            <div class="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span class="font-bold text-stone-800 block">${b.bank}</span>
                <span class="text-brand-800 font-mono font-bold">${b.norek}</span>
                <span class="text-[10px] text-stone-500 block">a.n. ${b.atasNama}</span>
            </div>
        `).join('');
    }

    if (bankSelectOption) {
        bankSelectOption.innerHTML = banks.map(b => `
            <option value="${b.bank} (${b.norek})">${b.bank} — ${b.norek} (a.n. ${b.atasNama})</option>
        `).join('');
    }

    let discountVal = 0;
    if (APPLIED_VOUCHER) {
        discountVal = APPLIED_VOUCHER.type === 'percent' ? Math.round((subtotal * APPLIED_VOUCHER.value) / 100) : APPLIED_VOUCHER.value;
    }

    const shippingFee = 25000;
    const finalTotal = Math.max(0, subtotal - discountVal + shippingFee);

    document.getElementById('summary-subtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('summary-discount').textContent = `- Rp ${discountVal.toLocaleString('id-ID')}`;
    document.getElementById('summary-total').textContent = `Rp ${finalTotal.toLocaleString('id-ID')}`;

    if (user && document.getElementById('checkout-name')) {
        document.getElementById('checkout-name').value = user.name;
    }
}

function handleCheckoutForm(event) {
    event.preventDefault();
    const user = getLoggedUser();

    if (!user) {
        openLoginModal("Silakan login terlebih dahulu untuk membuat pesanan.");
        return;
    }

    const cart = getCart();
    if (cart.length === 0) return;

    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    const courier = document.getElementById('checkout-courier').value;
    const bankChoice = document.getElementById('checkout-bank-choice').value;
    const buktiTransferUrl = document.getElementById('checkout-bukti-url').value || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';

    const subtotal = cart.reduce((sum, i) => sum + (i.harga * i.qty), 0);
    let discountVal = 0;
    if (APPLIED_VOUCHER) {
        discountVal = APPLIED_VOUCHER.type === 'percent' ? Math.round((subtotal * APPLIED_VOUCHER.value) / 100) : APPLIED_VOUCHER.value;
    }

    const orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
        orderId: orderId,
        date: new Date().toLocaleDateString('id-ID'),
        customerUsername: user.username,
        customerName: name,
        phone: phone,
        address: address,
        items: cart,
        subtotal: subtotal,
        discount: discountVal,
        shippingFee: 25000,
        total: Math.max(0, subtotal - discountVal + 25000),
        courier: courier,
        bankTujuan: bankChoice,
        resi: '-',
        status: 'Menunggu Verifikasi Pembayaran',
        buktiBayar: buktiTransferUrl,
        paymentStatus: 'Pending Verification'
    };

    orders.unshift(newOrder);
    localStorage.setItem('simulated_orders', JSON.stringify(orders));

    // Send Buyer Email Notification (Invoice)
    addBuyerInboxEmail(
        user.username,
        `Invoice Tagihan Pesanan #${orderId}`,
        `Terima kasih telah memesan di Galeri Ulos Sianipar. Total tagihan Anda adalah Rp ${newOrder.total.toLocaleString('id-ID')}. Silakan transfer ke ${bankChoice}.`
    );

    saveCart([]);
    APPLIED_VOUCHER = null;
    
    const modal = document.getElementById('checkout-success-modal');
    if (modal) {
        document.getElementById('modal-order-id').textContent = newOrder.orderId;
        modal.classList.remove('hidden');
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('checkout-success-modal');
    if (modal) modal.classList.add('hidden');
    switchBuyerTab('orders');
}

// MODUL PEMBELI 5: PELACAKAN PESANAN & RESI SAYA
function renderBuyerOrders() {
    const user = getLoggedUser();
    const container = document.getElementById('buyer-orders-list');
    if (!container) return;

    if (!user) {
        container.innerHTML = `<p class="text-xs text-stone-500 py-6 text-center">Silakan login untuk melihat status pesanan Anda.</p>`;
        return;
    }

    const orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    const buyerOrders = orders.filter(o => o.customerUsername === user.username);

    if (buyerOrders.length === 0) {
        container.innerHTML = `<p class="text-xs text-stone-500 py-8 text-center">Belum ada riwayat pesanan.</p>`;
        return;
    }

    container.innerHTML = buyerOrders.map(ord => `
        <div class="bg-white p-6 rounded-3xl border border-stone-200 soft-card-shadow space-y-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-3 gap-2">
                <div>
                    <span class="text-xs font-bold text-brand-700 font-mono">${ord.orderId}</span>
                    <h4 class="font-bold text-stone-800 text-sm">${ord.date} • ${ord.courier}</h4>
                </div>
                <div class="flex gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${ord.paymentStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        ${ord.paymentStatus || 'Pending'}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                        ${ord.status}
                    </span>
                </div>
            </div>

            <div class="space-y-1.5 text-xs text-stone-600">
                <span class="font-bold text-stone-700">Detail Produk Dibeli:</span>
                ${ord.items.map(i => `<div class="flex justify-between"><span>• ${i.nama} (${i.varianPilihan || 'Standard'}) x${i.qty}</span><span>${i.hargaFormatted || ('Rp ' + Number(i.harga).toLocaleString('id-ID'))}</span></div>`).join('')}
            </div>

            <!-- Resi Tracking Banner -->
            <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex justify-between items-center text-xs">
                <div>
                    <span class="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Nomor Resi Pengiriman:</span>
                    <span class="font-mono font-bold text-stone-900 text-sm">${ord.resi !== '-' ? ord.resi : 'Belum diinput Admin'}</span>
                </div>
                ${ord.resi !== '-' ? `<span class="px-3 py-1 bg-emerald-600 text-white rounded-full text-[11px] font-bold"><i class="fa-solid fa-truck-fast mr-1"></i> Dalam Pengiriman</span>` : `<span class="text-[11px] text-amber-700 italic">Menunggu Input Resi</span>`}
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-stone-100">
                <span class="text-xs font-bold text-brand-900">Total Bayar: Rp ${ord.total.toLocaleString('id-ID')}</span>
                <span class="text-[11px] text-stone-500">Tujuan Bayar: ${ord.bankTujuan || 'Transfer Bank'}</span>
            </div>
        </div>
    `).join('');
}

// MODUL PEMBELI 6: INBOX EMAIL SIMULASI
function addBuyerInboxEmail(username, subject, body) {
    let emails = JSON.parse(localStorage.getItem('buyer_inbox_emails')) || [];
    emails.unshift({
        id: Date.now(),
        recipientUsername: username,
        subject: subject,
        date: new Date().toLocaleString('id-ID'),
        body: body
    });
    localStorage.setItem('buyer_inbox_emails', JSON.stringify(emails));
}

function renderBuyerInbox() {
    const user = getLoggedUser();
    const container = document.getElementById('buyer-inbox-list');
    if (!container) return;

    if (!user) {
        container.innerHTML = `<p class="text-xs text-stone-500 py-6 text-center">Silakan login untuk membuka email Anda.</p>`;
        return;
    }

    const emails = JSON.parse(localStorage.getItem('buyer_inbox_emails')) || [];
    const myEmails = emails.filter(e => e.recipientUsername === user.username);

    if (myEmails.length === 0) {
        container.innerHTML = `<p class="text-xs text-stone-500 py-8 text-center">Kotak masuk email kosong.</p>`;
        return;
    }

    container.innerHTML = myEmails.map(e => `
        <div class="p-4 bg-white rounded-2xl border border-stone-200 soft-card-shadow space-y-2">
            <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-brand-900"><i class="fa-solid fa-envelope-open text-brand-700 mr-1.5"></i> ${e.subject}</span>
                <span class="text-[10px] text-stone-400 font-mono">${e.date}</span>
            </div>
            <p class="text-xs text-stone-600 leading-relaxed bg-brand-50/50 p-3 rounded-xl border border-brand-100">${e.body}</p>
        </div>
    `).join('');
}

// ---------------------------------------------------------------------
// ENGINE 6 MODUL ADMIN DASHBOARD
// ---------------------------------------------------------------------
function switchAdminTab(tab) {
    const tabs = ['products', 'orders', 'logistics', 'finance', 'email', 'vouchers'];
    tabs.forEach(t => {
        const el = document.getElementById(`admin-${t}-tab`);
        const btn = document.getElementById(`tab-admin-${t}-btn`);
        if (el) el.classList.add('hidden');
        if (btn) btn.className = "px-4 py-2 rounded-full text-xs font-semibold bg-white text-stone-600 border border-stone-200 hover:border-brand-500";
    });

    const activeEl = document.getElementById(`admin-${tab}-tab`);
    const activeBtn = document.getElementById(`tab-admin-${tab}-btn`);
    if (activeEl) activeEl.classList.remove('hidden');
    if (activeBtn) activeBtn.className = "px-4 py-2 rounded-full text-xs font-bold bg-brand-700 text-white shadow";

    if (tab === 'products') renderAdminProducts();
    if (tab === 'orders') renderAdminOrders();
    if (tab === 'logistics') renderAdminLogistics();
    if (tab === 'finance') renderAdminFinance();
    if (tab === 'email') renderAdminEmailLogs();
    if (tab === 'vouchers') renderAdminVouchers();
}

function renderAdminProducts() {
    const list = document.getElementById('admin-products-list');
    if (!list) return;

    const products = getProductsData();
    list.innerHTML = '';

    products.forEach(item => {
        const totalStok = item.varian ? item.varian.reduce((s, v) => s + Number(v.stok), 0) : 10;
        const card = document.createElement('div');
        card.className = "bg-white p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 soft-card-shadow";
        card.innerHTML = `
            <div class="flex items-center gap-4 w-full sm:w-auto">
                <img src="${item.gambar}" alt="${item.nama}" class="w-16 h-16 rounded-xl object-cover border border-stone-200">
                <div>
                    <span class="text-[10px] font-bold text-brand-700 uppercase">${item.kategori} • ${item.berat || 500}g</span>
                    <h4 class="font-serif-title font-bold text-stone-800 text-base">${item.nama}</h4>
                    <span class="text-xs font-semibold text-stone-600">${item.hargaFormatted || ('Rp ' + Number(item.harga).toLocaleString('id-ID'))} | Stok Total: ${totalStok}</span>
                </div>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button onclick="openEditProductModal(${item.id})" class="px-3.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-pen-to-square"></i> Edit & Varian
                </button>
                <button onclick="deleteProduct(${item.id})" class="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
                    <i class="fa-solid fa-trash"></i> Hapus
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

function openAddProductModal() {
    document.getElementById('product-modal-title').textContent = "Tambah Ulos Baru";
    document.getElementById('edit-product-id').value = "";
    document.getElementById('prod-nama').value = "";
    document.getElementById('prod-kategori').value = "Pernikahan";
    document.getElementById('prod-harga').value = "";
    document.getElementById('prod-berat').value = "500";
    document.getElementById('prod-gambar').value = "assets/images/ragidup.jpg";
    document.getElementById('prod-makna').value = "";
    document.getElementById('prod-penggunaan').value = "";
    document.getElementById('prod-varian-warna').value = "Merah Maroon";
    document.getElementById('prod-varian-stok').value = "10";

    document.getElementById('crud-product-modal').classList.remove('hidden');
}

function openEditProductModal(id) {
    const products = getProductsData();
    const item = products.find(p => p.id === id);
    if (!item) return;

    document.getElementById('product-modal-title').textContent = "Edit Data & Varian Ulos";
    document.getElementById('edit-product-id').value = item.id;
    document.getElementById('prod-nama').value = item.nama;
    document.getElementById('prod-kategori').value = item.kategori;
    document.getElementById('prod-harga').value = item.harga;
    document.getElementById('prod-berat').value = item.berat || 500;
    document.getElementById('prod-gambar').value = item.gambar;
    document.getElementById('prod-makna').value = item.makna;
    document.getElementById('prod-penggunaan').value = item.penggunaan;
    
    if (item.varian && item.varian.length > 0) {
        document.getElementById('prod-varian-warna').value = item.varian[0].warna;
        document.getElementById('prod-varian-stok').value = item.varian[0].stok;
    }

    document.getElementById('crud-product-modal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('crud-product-modal').classList.add('hidden');
}

function saveProductForm(event) {
    event.preventDefault();
    const editId = document.getElementById('edit-product-id').value;
    const nama = document.getElementById('prod-nama').value.trim();
    const kategori = document.getElementById('prod-kategori').value;
    const harga = parseInt(document.getElementById('prod-harga').value);
    const berat = parseInt(document.getElementById('prod-berat').value) || 500;
    const gambar = document.getElementById('prod-gambar').value.trim() || 'assets/images/ragidup.jpg';
    const makna = document.getElementById('prod-makna').value.trim();
    const penggunaan = document.getElementById('prod-penggunaan').value.trim();
    const warna = document.getElementById('prod-varian-warna').value.trim() || 'Standard';
    const stok = parseInt(document.getElementById('prod-varian-stok').value) || 10;

    let products = getProductsData();
    const varianData = [{ warna: warna, ukuran: 'Standard (180x60cm)', stok: stok }];

    if (editId) {
        const index = products.findIndex(p => p.id === parseInt(editId));
        if (index !== -1) {
            products[index] = {
                ...products[index],
                nama,
                kategori,
                harga,
                hargaFormatted: 'Rp ' + harga.toLocaleString('id-ID'),
                berat,
                gambar,
                makna,
                penggunaan,
                varian: varianData
            };
            showToast(`Ulos "${nama}" diperbarui!`);
        }
    } else {
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            nama,
            kategori,
            harga,
            hargaFormatted: 'Rp ' + harga.toLocaleString('id-ID'),
            berat,
            gambar,
            makna,
            penggunaan,
            varian: varianData
        };
        products.unshift(newProduct);
        showToast(`Ulos baru "${nama}" berhasil ditambahkan!`);
    }

    saveProductsData(products);
    closeProductModal();
    renderAdminProducts();
}

function deleteProduct(id) {
    if (confirm("Apakah Anda yakin ingin menghapus ulos ini dari katalog?")) {
        let products = getProductsData().filter(p => p.id !== id);
        saveProductsData(products);
        renderAdminProducts();
        showToast("Produk terhapus dari katalog.");
    }
}

function renderAdminOrders() {
    const ordersContainer = document.getElementById('admin-orders-list');
    if (!ordersContainer) return;

    const orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    ordersContainer.innerHTML = '';

    if (orders.length === 0) {
        ordersContainer.innerHTML = `<p class="text-xs text-stone-500 py-4 text-center">Belum ada pesanan masuk.</p>`;
        return;
    }

    orders.forEach((ord, index) => {
        const card = document.createElement('div');
        card.className = "bg-white p-6 rounded-2xl border border-stone-200 soft-card-shadow space-y-4";
        card.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-3 gap-2">
                <div>
                    <span class="text-xs font-bold text-brand-700">${ord.orderId}</span>
                    <h4 class="font-bold text-stone-800 text-sm">${ord.customerName} (${ord.phone})</h4>
                    <p class="text-[11px] text-stone-500">${ord.address} • ${ord.date}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${ord.paymentStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        ${ord.paymentStatus || 'Pending'}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
                        ${ord.status}
                    </span>
                </div>
            </div>

            <div class="space-y-1.5 text-xs text-stone-600">
                <span class="font-bold text-stone-700">Item Pesanan:</span>
                ${ord.items.map(i => `<div class="flex justify-between"><span>- ${i.nama} (${i.varianPilihan || 'Standard'}) x${i.qty}</span><span>${i.hargaFormatted || ('Rp ' + Number(i.harga).toLocaleString('id-ID'))}</span></div>`).join('')}
            </div>

            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-stone-100 gap-3">
                <span class="text-xs font-bold text-stone-800">Total Transaksi: Rp ${ord.total.toLocaleString('id-ID')}</span>
                
                <div class="flex flex-wrap gap-2">
                    <button onclick="viewBuktiTransfer('${ord.buktiBayar}')" class="px-3 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg text-xs font-semibold transition">
                        <i class="fa-solid fa-receipt mr-1"></i> Lihat Bukti Bayar
                    </button>
                    <button onclick="approvePayment(${index})" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition">
                        <i class="fa-solid fa-check mr-1"></i> Setujui Pembayaran
                    </button>
                    <button onclick="cancelOrderAdmin(${index})" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition">
                        <i class="fa-solid fa-xmark mr-1"></i> Batalkan Pesanan
                    </button>
                </div>
            </div>
        `;
        ordersContainer.appendChild(card);
    });
}

function viewBuktiTransfer(url) {
    const modal = document.getElementById('bukti-bayar-modal');
    const img = document.getElementById('bukti-bayar-img');
    if (modal && img) {
        img.src = url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
        modal.classList.remove('hidden');
    }
}

function closeBuktiModal() {
    document.getElementById('bukti-bayar-modal').classList.add('hidden');
}

function approvePayment(index) {
    let orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    if (orders[index]) {
        orders[index].paymentStatus = 'Verified';
        orders[index].status = 'Diproses Galeri';
        localStorage.setItem('simulated_orders', JSON.stringify(orders));
        
        addBuyerInboxEmail(
            orders[index].customerUsername,
            `Pembayaran Disetujui Galeri #${orders[index].orderId}`,
            `Bukti pembayaran Anda untuk pesanan #${orders[index].orderId} telah disetujui Admin. Barang sedang dalam proses pengemasan.`
        );

        renderAdminOrders();
        showToast(`Pembayaran ${orders[index].orderId} disetujui!`);
    }
}

function cancelOrderAdmin(index) {
    let orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    if (orders[index]) {
        orders[index].paymentStatus = 'Rejected / Expired';
        orders[index].status = 'Pesanan Dibatalkan (Waktu Habis)';
        localStorage.setItem('simulated_orders', JSON.stringify(orders));
        renderAdminOrders();
        showToast(`Pesanan ${orders[index].orderId} dibatalkan.`);
    }
}

function renderAdminLogistics() {
    const list = document.getElementById('admin-logistics-list');
    const couriersList = document.getElementById('admin-couriers-config');
    if (!list) return;

    const couriers = JSON.parse(localStorage.getItem('store_couriers')) || [];
    if (couriersList) {
        couriersList.innerHTML = couriers.map((c, idx) => `
            <div class="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <span class="font-semibold text-stone-800">${c.name}</span>
                <button onclick="toggleCourierStatus(${idx})" class="px-3 py-1 rounded-full text-[11px] font-bold ${c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}">
                    ${c.active ? 'Aktif' : 'Nonaktif'}
                </button>
            </div>
        `).join('');
    }

    const orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    list.innerHTML = '';

    orders.forEach((ord, index) => {
        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-2xl border border-stone-200 soft-card-shadow space-y-3";
        card.innerHTML = `
            <div class="flex justify-between items-center border-b border-stone-100 pb-2">
                <span class="text-xs font-bold text-brand-700">${ord.orderId} — ${ord.customerName}</span>
                <span class="text-xs text-stone-500 font-medium">Kurir: ${ord.courier || 'JNE Express'}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                    <label class="block text-[10px] font-bold uppercase text-stone-400">Nomor Resi Pengiriman</label>
                    <input type="text" id="resi-input-${index}" value="${ord.resi !== '-' ? ord.resi : ''}" placeholder="Masukkan No. Resi" class="text-xs p-2 rounded-xl border border-stone-200 w-full mt-1">
                </div>
                <div class="flex gap-2 pt-4">
                    <button onclick="saveResiNumber(${index})" class="px-3 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow">
                        Simpan Resi
                    </button>
                    <button onclick="printShippingLabel(${index})" class="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold shadow">
                        <i class="fa-solid fa-print mr-1"></i> Cetak Label Alamat
                    </button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function toggleCourierStatus(idx) {
    let couriers = JSON.parse(localStorage.getItem('store_couriers')) || [];
    if (couriers[idx]) {
        couriers[idx].active = !couriers[idx].active;
        localStorage.setItem('store_couriers', JSON.stringify(couriers));
        renderAdminLogistics();
        showToast("Status kurir diperbarui.");
    }
}

function saveResiNumber(index) {
    let orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    const input = document.getElementById(`resi-input-${index}`);
    if (orders[index] && input) {
        const resiVal = input.value.trim();
        orders[index].resi = resiVal;
        orders[index].status = 'Pesanan Dikirim';
        localStorage.setItem('simulated_orders', JSON.stringify(orders));
        
        addBuyerInboxEmail(
            orders[index].customerUsername,
            `Pesanan Dikirim! Resi ${resiVal}`,
            `Pesanan Anda #${orders[index].orderId} telah diserahkan ke ${orders[index].courier} dengan nomor resi: ${resiVal}.`
        );

        showToast(`Resi untuk ${orders[index].orderId} disimpan!`);
        renderAdminLogistics();
    }
}

function printShippingLabel(index) {
    const orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    const ord = orders[index];
    if (!ord) return;

    const modal = document.getElementById('printable-label-modal');
    if (modal) {
        document.getElementById('label-order-id').textContent = ord.orderId;
        document.getElementById('label-courier').textContent = ord.courier;
        document.getElementById('label-receiver-name').textContent = ord.customerName;
        document.getElementById('label-receiver-phone').textContent = ord.phone;
        document.getElementById('label-receiver-address').textContent = ord.address;
        document.getElementById('label-items-summary').textContent = ord.items.map(i => `${i.nama} (${i.qty}x)`).join(', ');
        
        modal.classList.remove('hidden');
    }
}

function closeLabelModal() {
    document.getElementById('printable-label-modal').classList.add('hidden');
}

function executePrintLabel() {
    window.print();
}

function renderAdminFinance() {
    const orders = JSON.parse(localStorage.getItem('simulated_orders')) || [];
    const totalSales = orders.filter(o => o.paymentStatus === 'Verified').reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = orders.filter(o => o.paymentStatus === 'Verified').length;

    document.getElementById('finance-total-revenue').textContent = `Rp ${totalSales.toLocaleString('id-ID')}`;
    document.getElementById('finance-orders-count').textContent = `${totalOrdersCount} Transaksi Sukses`;

    const banks = JSON.parse(localStorage.getItem('store_bank_accounts')) || [];
    const bankContainer = document.getElementById('admin-banks-list');
    if (bankContainer) {
        bankContainer.innerHTML = banks.map((b, i) => `
            <div class="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-stone-800 text-sm block">${b.bank}</span>
                    <span class="text-brand-800 font-mono font-bold">${b.norek}</span>
                    <span class="text-stone-500 block">a.n. ${b.atasNama}</span>
                </div>
                <button onclick="deleteBankInfo(${i})" class="text-rose-600 hover:text-rose-800 font-semibold">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
}

function handleAddBankSubmit(event) {
    event.preventDefault();
    const bank = document.getElementById('new-bank-name').value.trim();
    const norek = document.getElementById('new-bank-norek').value.trim();
    const atasNama = document.getElementById('new-bank-owner').value.trim();

    if (!bank || !norek || !atasNama) return;

    let banks = JSON.parse(localStorage.getItem('store_bank_accounts')) || [];
    banks.push({ bank, norek, atasNama });
    localStorage.setItem('store_bank_accounts', JSON.stringify(banks));

    document.getElementById('new-bank-name').value = '';
    document.getElementById('new-bank-norek').value = '';
    document.getElementById('new-bank-owner').value = '';

    showToast("Rekening toko ditambahkan!");
    renderAdminFinance();
}

function deleteBankInfo(index) {
    let banks = JSON.parse(localStorage.getItem('store_bank_accounts')) || [];
    banks.splice(index, 1);
    localStorage.setItem('store_bank_accounts', JSON.stringify(banks));
    renderAdminFinance();
    showToast("Rekening toko dihapus.");
}

function renderAdminEmailLogs() {
    const container = document.getElementById('admin-email-logs-list');
    if (!container) return;

    const emails = JSON.parse(localStorage.getItem('buyer_inbox_emails')) || [];
    container.innerHTML = emails.map(l => `
        <div class="p-3 bg-white rounded-xl border border-stone-200 flex justify-between items-center text-xs">
            <div>
                <span class="font-bold text-stone-800">${l.subject}</span>
                <p class="text-[11px] text-stone-500">Penerima: ${l.recipientUsername}@gmail.com</p>
            </div>
            <div class="text-right">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 block">Terkirim</span>
                <span class="text-[10px] text-stone-400 mt-0.5 block">${l.date}</span>
            </div>
        </div>
    `).join('');
}

function renderAdminVouchers() {
    const container = document.getElementById('admin-vouchers-list');
    if (!container) return;

    const vouchers = JSON.parse(localStorage.getItem('store_vouchers')) || [];
    container.innerHTML = vouchers.map((v, i) => `
        <div class="p-4 bg-white rounded-2xl border border-stone-200 flex justify-between items-center soft-card-shadow text-xs">
            <div>
                <span class="px-2.5 py-1 bg-brand-100 text-brand-800 rounded-lg font-mono font-bold text-sm uppercase">${v.code}</span>
                <p class="font-semibold text-stone-800 mt-1">Diskon: ${v.type === 'percent' ? v.value + '%' : 'Rp ' + v.value.toLocaleString('id-ID')}</p>
                <p class="text-[11px] text-stone-500">Min. Belanja: Rp ${v.minSpend.toLocaleString('id-ID')} • Expired: ${v.expiry}</p>
            </div>
            <button onclick="deleteVoucher(${i})" class="text-rose-600 hover:text-rose-800 font-semibold">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function handleAddVoucherSubmit(event) {
    event.preventDefault();
    const code = document.getElementById('v-code').value.trim().toUpperCase();
    const type = document.getElementById('v-type').value;
    const value = parseInt(document.getElementById('v-value').value);
    const minSpend = parseInt(document.getElementById('v-minspend').value);
    const expiry = document.getElementById('v-expiry').value;

    if (!code || !value) return;

    let vouchers = JSON.parse(localStorage.getItem('store_vouchers')) || [];
    vouchers.push({ id: Date.now(), code, type, value, minSpend, expiry, active: true });
    localStorage.setItem('store_vouchers', JSON.stringify(vouchers));

    document.getElementById('v-code').value = '';
    document.getElementById('v-value').value = '';

    showToast(`Voucher ${code} berhasil diterbitkan!`);
    renderAdminVouchers();
}

function deleteVoucher(index) {
    let vouchers = JSON.parse(localStorage.getItem('store_vouchers')) || [];
    vouchers.splice(index, 1);
    localStorage.setItem('store_vouchers', JSON.stringify(vouchers));
    renderAdminVouchers();
    showToast("Voucher dihapus.");
}

// TOAST NOTIFICATION
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = "pointer-events-auto bg-stone-900 text-white text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-700 transition-all transform translate-y-2 opacity-0 duration-300";
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 text-base"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}