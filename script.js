/**
 * FOODIEHUB - Complete Full Stack Food Delivery Application
 * Author: Bhumi Kumari
 * 
 * Features:
 * - Original UI animations (preloader, scroll reveal, counters, etc.)
 * - Full backend API integration (MongoDB)
 * - Cart system with modal
 * - Complete checkout flow
 */

'use strict';

// ====== CONFIG ======
const API_URL = 'http://localhost:5000/api';
let loggedInUser = JSON.parse(localStorage.getItem('fh_user') || 'null');
let token = localStorage.getItem('fh_token') || null;

// ====== FOOD DATA (Backend only - no static data) ======
let FOODS = [];

// ====== CART STATE ======
let cart = JSON.parse(localStorage.getItem('fh_cart') || '{"items":[],"totalPrice":0}');

// ====== DOM HELPERS ======
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ====== SELLER STATE ======
let loggedInSeller = JSON.parse(localStorage.getItem('fh_seller') || 'null');
let sellerData = JSON.parse(localStorage.getItem('fh_seller_data') || 'null');

// ====== SELLER FUNCTIONS ======
function toggleSellerDropdown() {
    const dd = document.getElementById('sellerDropdown');
    if (!dd) return;
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

// Close seller dropdown on click outside
document.addEventListener('click', (e) => {
    const dd = document.getElementById('sellerDropdown');
    const btn = document.getElementById('sellerBtn');
    if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
        dd.style.display = 'none';
    }
});

function openSellerRegister() {
    const dd = document.getElementById('sellerDropdown');
    if (dd) dd.style.display = 'none';
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'sellerRegisterOverlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width:550px;max-height:90vh;overflow-y:auto;">
            <button class="modal-close" onclick="document.getElementById('sellerRegisterOverlay').remove();document.body.classList.remove('no-scroll');">&times;</button>
            <div class="modal-header">
                <i class="fas fa-store-alt" style="color:#8B5CF6;"></i>
                <h2>Register as Seller</h2>
                <p>Start your own restaurant on FoodieHub</p>
            </div>
            <div style="padding:0 0 20px;">
                <form id="sellerRegisterForm">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" id="srName" placeholder="Your name" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" id="srPhone" placeholder="Mobile number" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="srEmail" placeholder="Your email" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <div class="form-group">
                        <label>Password *</label>
                        <input type="password" id="srPassword" placeholder="Create password (min 6 chars)" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <hr style="margin:20px 0;border-color:#eee;">
                    <h3 style="margin-bottom:15px;color:#8B5CF6;">🏪 Restaurant Details</h3>
                    <div class="form-group">
                        <label>Restaurant Name *</label>
                        <input type="text" id="srRestName" placeholder="e.g. Pizza Palace" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group">
                            <label>Category</label>
                            <select id="srCategory" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                                <option value="pizza">Pizza</option>
                                <option value="burger">Burger</option>
                                <option value="biryani">Biryani</option>
                                <option value="chinese">Chinese</option>
                                <option value="desserts">Desserts</option>
                                <option value="drinks">Drinks</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>City</label>
                            <input type="text" id="srCity" placeholder="City" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Restaurant Address</label>
                        <textarea id="srAddress" rows="2" placeholder="Full address" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top:10px;background:#8B5CF6;">
                        <i class="fas fa-store-alt"></i> Register as Seller
                    </button>
                    <p style="text-align:center;margin-top:12px;font-size:0.9rem;color:#666;">
                        Already registered? <a href="#" onclick="document.getElementById('sellerRegisterOverlay').remove();document.body.classList.remove('no-scroll');setTimeout(openSellerLogin,200);" style="color:#8B5CF6;font-weight:600;">Seller Login</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    document.getElementById('sellerRegisterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('srName').value.trim();
        const email = document.getElementById('srEmail').value.trim();
        const password = document.getElementById('srPassword').value.trim();
        const phone = document.getElementById('srPhone').value.trim();
        const restName = document.getElementById('srRestName').value.trim();
        const restCategory = document.getElementById('srCategory').value;
        const restCity = document.getElementById('srCity').value.trim();
        const restAddress = document.getElementById('srAddress').value.trim();

        if (!name || !email || !password || !restName) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        showToast('Creating seller account...', 'info');
        const res = await api('/seller/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, phone, restaurantName: restName, restaurantCategory: restCategory, restaurantCity: restCity, restaurantAddress: restAddress })
        });

        if (res.success) {
            loggedInUser = res.data.user;
            loggedInSeller = res.data.seller;
            token = res.data.token;
            localStorage.setItem('fh_user', JSON.stringify(loggedInUser));
            localStorage.setItem('fh_seller', JSON.stringify(loggedInSeller));
            localStorage.setItem('fh_seller_data', JSON.stringify(res.data.seller));
            localStorage.setItem('fh_token', token);
            showToast('Seller account created! 🎉 Welcome to FoodieHub!', 'success');
            document.getElementById('sellerRegisterOverlay').remove();
            document.body.classList.remove('no-scroll');
            updateAuthUI();
            updateSellerUI();
        } else {
            showToast(res.message || 'Registration failed', 'error');
        }
    });
}

function openSellerLogin() {
    const dd = document.getElementById('sellerDropdown');
    if (dd) dd.style.display = 'none';
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'sellerLoginOverlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width:450px;">
            <button class="modal-close" onclick="document.getElementById('sellerLoginOverlay').remove();document.body.classList.remove('no-scroll');">&times;</button>
            <div class="modal-header">
                <i class="fas fa-store-alt" style="color:#8B5CF6;"></i>
                <h2>Seller Login</h2>
                <p>Log in to manage your restaurant</p>
            </div>
            <div style="padding:0 0 20px;">
                <form id="sellerLoginForm">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="slEmail" placeholder="Your seller email" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="slPassword" placeholder="Your password" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg btn-block" style="background:#8B5CF6;">
                        <i class="fas fa-sign-in-alt"></i> Login as Seller
                    </button>
                    <p style="text-align:center;margin-top:12px;font-size:0.9rem;color:#666;">
                        Don't have an account? <a href="#" onclick="document.getElementById('sellerLoginOverlay').remove();document.body.classList.remove('no-scroll');setTimeout(openSellerRegister,200);" style="color:#8B5CF6;font-weight:600;">Register as Seller</a>
                    </p>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    document.getElementById('sellerLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('slEmail').value.trim();
        const password = document.getElementById('slPassword').value.trim();
        if (!email || !password) {
            showToast('Please fill all fields', 'error');
            return;
        }

        showToast('Logging in...', 'info');
        const res = await api('/seller/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (res.success) {
            loggedInUser = res.data.user;
            loggedInSeller = res.data.seller;
            token = res.data.token;
            localStorage.setItem('fh_user', JSON.stringify(loggedInUser));
            localStorage.setItem('fh_seller', JSON.stringify(loggedInSeller));
            localStorage.setItem('fh_seller_data', JSON.stringify(res.data.seller));
            localStorage.setItem('fh_token', token);
            showToast('Seller login successful! 🎉', 'success');
            document.getElementById('sellerLoginOverlay').remove();
            document.body.classList.remove('no-scroll');
            updateAuthUI();
            updateSellerUI();
            openSellerDashboard();
        } else {
            showToast(res.message || 'Login failed', 'error');
        }
    });
}

function updateSellerUI() {
    const dashboardBtn = document.getElementById('sellerDashboardBtn');
    if (dashboardBtn) {
        dashboardBtn.style.display = loggedInSeller ? 'block' : 'none';
    }
    const sellerBtn = document.getElementById('sellerBtn');
    if (sellerBtn && loggedInSeller) {
        sellerBtn.innerHTML = '<i class="fas fa-store-alt"></i> ' + (loggedInSeller.restaurantName || 'My Shop');
        sellerBtn.style.background = '#7C3AED';
    } else if (sellerBtn) {
        sellerBtn.innerHTML = '<i class="fas fa-store-alt"></i> Sell';
        sellerBtn.style.background = '#8B5CF6';
    }
}

async function openSellerDashboard() {
    if (!loggedInSeller) {
        showToast('Please login as seller first', 'error');
        return;
    }

    const dd = document.getElementById('sellerDropdown');
    if (dd) dd.style.display = 'none';
    openModal('sellerDashboardModal');

    // Fetch latest seller data
    const res = await api('/seller/dashboard');
    if (res.success) {
        sellerData = res.data;
        localStorage.setItem('fh_seller_data', JSON.stringify(res.data));
    }

    renderSellerDashboard();
}

function renderSellerDashboard() {
    const container = document.getElementById('sellerDashboardContainer');
    if (!container) return;

    const seller = sellerData?.seller || loggedInSeller;
    const dishes = sellerData?.dishes || [];
    const totalDishes = sellerData?.totalDishes || dishes.length;

    if (!seller) {
        container.innerHTML = '<p style="text-align:center;padding:30px;color:#999;">Seller data not available.</p>';
        return;
    }

    container.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
            <div style="background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;border:1px solid #bbf7d0;">
                <i class="fas fa-utensils" style="font-size:1.5rem;color:#16a34a;"></i>
                <h3 style="font-size:1.5rem;margin:8px 0;color:#16a34a;">${totalDishes}</h3>
                <p style="font-size:0.85rem;color:#666;">Total Dishes</p>
            </div>
            <div style="background:#fef3c7;border-radius:12px;padding:16px;text-align:center;border:1px solid #fde68a;">
                <i class="fas fa-star" style="font-size:1.5rem;color:#d97706;"></i>
                <h3 style="font-size:1.5rem;margin:8px 0;color:#d97706;">${seller.rating || '4.0'}</h3>
                <p style="font-size:0.85rem;color:#666;">Rating</p>
            </div>
            <div style="background:#dbeafe;border-radius:12px;padding:16px;text-align:center;border:1px solid #bfdbfe;">
                <i class="fas fa-toggle-${seller.isOpen ? 'on' : 'off'}" style="font-size:1.5rem;color:#2563eb;"></i>
                <h3 style="font-size:1.1rem;margin:8px 0;color:#2563eb;">${seller.isOpen ? '🟢 Open' : '🔴 Closed'}</h3>
                <p style="font-size:0.85rem;color:#666;">${seller.openingHours?.open || '09:00'} - ${seller.openingHours?.close || '23:00'}</p>
            </div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:20px;">
            <button onclick="showSellerDishesTab()" class="btn btn-primary" id="sellerTabDishes" style="flex:1;padding:10px;font-size:0.85rem;">
                <i class="fas fa-utensils"></i> 🍽️ Dishes
            </button>
            <button onclick="showSellerDeliveryTab()" class="btn btn-outline" id="sellerTabDelivery" style="flex:1;padding:10px;font-size:0.85rem;">
                <i class="fas fa-truck"></i> 🚚 Delivery
            </button>
            <button onclick="showSellerSettingsTab()" class="btn btn-outline" id="sellerTabSettings" style="flex:1;padding:10px;font-size:0.85rem;">
                <i class="fas fa-cog"></i> ⚙️ Settings
            </button>
            <button onclick="sellerLogout()" style="flex:0;padding:10px 14px;background:#fee2e2;color:#dc2626;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        </div>

        <div id="sellerTabContent">
            <!-- Dishes tab content will be rendered here -->
        </div>
    `;

    showSellerDishesTab();
}

function showSellerDishesTab() {
    const content = document.getElementById('sellerTabContent');
    if (!content) return;

    document.getElementById('sellerTabDishes')?.classList.add('btn-primary');
    document.getElementById('sellerTabDishes')?.classList.remove('btn-outline');
    document.getElementById('sellerTabSettings')?.classList.remove('btn-primary');
    document.getElementById('sellerTabSettings')?.classList.add('btn-outline');

    const dishes = sellerData?.dishes || [];

    let html = `
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #eee;">
            <h3 style="margin-bottom:15px;color:#8B5CF6;">➕ Add New Dish to Your Menu</h3>
            <p style="font-size:0.85rem;color:#888;margin-bottom:15px;">Fill in the details below. Your dish will appear on FoodieHub for customers to order!</p>
            <form id="sellerAddDishForm" onsubmit="event.preventDefault(); sellerAddDish();">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Dish Name *</label>
                        <input type="text" id="sellerDishName" placeholder="e.g. Butter Chicken" required style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Selling Price (₹) *</label>
                        <input type="number" id="sellerDishPrice" placeholder="e.g. 299" min="1" required style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Original Price (₹)</label>
                        <input type="number" id="sellerDishOrigPrice" placeholder="e.g. 399 (for discount)" min="0" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Category *</label>
                        <select id="sellerDishCategory" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                            <option value="pizza">🍕 Pizza</option>
                            <option value="burger">🍔 Burger</option>
                            <option value="biryani">🍛 Biryani</option>
                            <option value="chinese">🥟 Chinese</option>
                            <option value="desserts">🍰 Desserts</option>
                            <option value="drinks">🥤 Drinks</option>
                            <option value="other">📦 Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Preparation Time</label>
                        <input type="text" id="sellerDishPrepTime" placeholder="e.g. 10-15 min" value="10-15 min" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Tag / Badge</label>
                        <select id="sellerDishTag" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                            <option value="">None</option>
                            <option value="Popular">🔥 Popular</option>
                            <option value="Best Seller">⭐ Best Seller</option>
                            <option value="Chef Special">👨‍🍳 Chef Special</option>
                            <option value="New">🆕 New</option>
                            <option value="Healthy">🥗 Healthy</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-top:12px;">
                    <label style="font-size:0.85rem;font-weight:500;">Dish Image URL *</label>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <input type="text" id="sellerDishImage" placeholder="https://images.unsplash.com/photo-..." style="flex:1;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                        <button type="button" onclick="document.getElementById('sellerDishImagePreview').src=document.getElementById('sellerDishImage').value||'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'" style="background:#f0f0f0;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;"><i class="fas fa-eye"></i></button>
                    </div>
                    <img id="sellerDishImagePreview" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80" alt="Preview" style="width:80px;height:80px;border-radius:8px;object-fit:cover;margin-top:8px;border:2px solid #eee;">
                </div>
                <div style="display:flex;gap:12px;margin-top:12px;">
                    <div style="flex:1;">
                        <label style="font-size:0.85rem;font-weight:500;">Description</label>
                        <textarea id="sellerDishDesc" placeholder="Describe your dish - ingredients, taste, serving size..." style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;min-height:60px;" rows="3"></textarea>
                    </div>
                    <div style="min-width:140px;">
                        <label style="font-size:0.85rem;font-weight:500;">Options</label>
                        <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px;">
                            <label style="display:flex;align-items:center;gap:6px;font-size:0.9rem;cursor:pointer;padding:6px 10px;background:#f0fdf4;border-radius:6px;">
                                <input type="checkbox" id="sellerDishVeg"> 🌿 Vegetarian
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;font-size:0.9rem;cursor:pointer;padding:6px 10px;background:#f0f0f0;border-radius:6px;">
                                <input type="checkbox" id="sellerDishAvailable" checked> ✅ Available
                            </label>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="margin-top:15px;background:#8B5CF6;">
                    <i class="fas fa-cloud-upload-alt"></i> Publish Dish to FoodieHub
                </button>
                <p style="font-size:0.8rem;color:#999;margin-top:6px;text-align:center;">Your dish will be visible to all customers once published ✅</p>
            </form>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
            <h3 style="margin:0;">📋 My Menu (${dishes.length} dishes)</h3>
            <span style="font-size:0.85rem;color:#888;">Click <i class="fas fa-edit"></i> to edit, <i class="fas fa-trash"></i> to delete</span>
        </div>
    `;

    if (dishes.length === 0) {
        html += '<div style="text-align:center;padding:40px;color:#999;background:#f9fafb;border-radius:12px;border:2px dashed #ddd;"><i class="fas fa-utensils" style="font-size:3rem;margin-bottom:15px;color:#ccc;"></i><p style="font-size:1.1rem;">Your menu is empty!</p><p style="font-size:0.9rem;margin-top:5px;">Add your first dish above and start selling on FoodieHub 🚀</p></div>';
    } else {
        html += '<div style="max-height:45vh;overflow-y:auto;">';
        dishes.forEach(d => {
            const discount = d.originalPrice ? Math.round((1 - d.price/d.originalPrice)*100) : 0;
            html += `
                <div style="display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:8px;background:#f9fafb;border-radius:10px;border:1px solid #eee;transition:all 0.2s;">
                    <img src="${d.image}" alt="${d.name}" style="width:55px;height:55px;border-radius:10px;object-fit:cover;">
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:6px;">
                            <strong style="font-size:0.9rem;">${d.name}</strong>
                            ${d.isVegetarian ? '<span style="font-size:0.7rem;">🌿</span>' : ''}
                            ${d.tag ? `<span style="font-size:0.65rem;padding:2px 6px;border-radius:4px;background:#fef3c7;color:#92400e;">${d.tag}</span>` : ''}
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
                            <span style="font-weight:700;color:#FF6B35;font-size:0.95rem;">₹${d.price}</span>
                            ${d.originalPrice ? `<span style="font-size:0.8rem;color:#999;text-decoration:line-through;">₹${d.originalPrice}</span><span style="font-size:0.7rem;color:#10b981;font-weight:600;">${discount}% OFF</span>` : ''}
                            <span style="font-size:0.75rem;color:#999;">• ${d.category}</span>
                        </div>
                        ${d.description ? `<p style="font-size:0.75rem;color:#888;margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${d.description}</p>` : ''}
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                        <span style="font-size:0.7rem;padding:3px 8px;border-radius:12px;background:${d.isAvailable !== false ? '#d1fae5' : '#fee2e2'};color:${d.isAvailable !== false ? '#059669' : '#dc2626'};font-weight:600;">
                            ${d.isAvailable !== false ? '🟢 Available' : '🔴 Hidden'}
                        </span>
                        <div style="display:flex;gap:4px;">
                            <button onclick="sellerEditDish('${d._id}')" style="background:#dbeafe;color:#2563eb;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:0.75rem;" title="Edit Dish"><i class="fas fa-edit"></i></button>
                            <button onclick="sellerDeleteDish('${d._id}')" style="background:#fee2e2;color:#dc2626;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:0.75rem;" title="Delete Dish"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }

    content.innerHTML = html;
}

function showSellerSettingsTab() {
    const content = document.getElementById('sellerTabContent');
    if (!content) return;

    document.getElementById('sellerTabDishes')?.classList.remove('btn-primary');
    document.getElementById('sellerTabDishes')?.classList.add('btn-outline');
    document.getElementById('sellerTabSettings')?.classList.add('btn-primary');
    document.getElementById('sellerTabSettings')?.classList.remove('btn-outline');

    const seller = sellerData?.seller || loggedInSeller || {};

    content.innerHTML = `
        <div style="background:#f9fafb;border-radius:12px;padding:20px;border:1px solid #eee;">
            <h3 style="margin-bottom:15px;">🏪 Restaurant Settings</h3>
            <form id="sellerSettingsForm" onsubmit="event.preventDefault(); sellerUpdateProfile();">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Restaurant Name</label>
                        <input type="text" id="ssRestName" value="${seller.restaurantName || ''}" required style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Category</label>
                        <select id="ssCategory" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                            <option value="pizza" ${seller.restaurantCategory === 'pizza' ? 'selected' : ''}>Pizza</option>
                            <option value="burger" ${seller.restaurantCategory === 'burger' ? 'selected' : ''}>Burger</option>
                            <option value="biryani" ${seller.restaurantCategory === 'biryani' ? 'selected' : ''}>Biryani</option>
                            <option value="chinese" ${seller.restaurantCategory === 'chinese' ? 'selected' : ''}>Chinese</option>
                            <option value="desserts" ${seller.restaurantCategory === 'desserts' ? 'selected' : ''}>Desserts</option>
                            <option value="drinks" ${seller.restaurantCategory === 'drinks' ? 'selected' : ''}>Drinks</option>
                            <option value="other" ${seller.restaurantCategory === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">City</label>
                        <input type="text" id="ssCity" value="${seller.restaurantCity || ''}" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Phone</label>
                        <input type="tel" id="ssPhone" value="${seller.restaurantPhone || ''}" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                </div>
                <div class="form-group" style="margin-top:12px;">
                    <label style="font-size:0.85rem;font-weight:500;">Address</label>
                    <textarea id="ssAddress" rows="2" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">${seller.restaurantAddress || ''}</textarea>
                </div>
                <div class="form-group">
                    <label style="font-size:0.85rem;font-weight:500;">Restaurant Image URL</label>
                    <input type="text" id="ssImage" value="${seller.restaurantImage || ''}" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px;">
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Delivery Time</label>
                        <input type="text" id="ssDeliveryTime" value="${seller.deliveryTime || '25-35 min'}" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Delivery Fee (₹)</label>
                        <input type="number" id="ssDeliveryFee" value="${seller.deliveryFee || 0}" min="0" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Min Order (₹)</label>
                        <input type="number" id="ssMinOrder" value="${seller.minOrder || 99}" min="0" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;margin-top:12px;">
                    <label style="display:flex;align-items:center;gap:8px;font-size:0.9rem;">
                        <input type="checkbox" id="ssIsOpen" ${seller.isOpen ? 'checked' : ''}> 🟢 Restaurant is Open
                    </label>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="margin-top:15px;">
                    <i class="fas fa-save"></i> Save Settings
                </button>
            </form>
        </div>
    `;
}

async function sellerAddDish() {
    const name = document.getElementById('sellerDishName')?.value.trim();
    const price = document.getElementById('sellerDishPrice')?.value.trim();
    const originalPrice = document.getElementById('sellerDishOrigPrice')?.value.trim();
    const category = document.getElementById('sellerDishCategory')?.value;
    const preparationTime = document.getElementById('sellerDishPrepTime')?.value.trim() || '10-15 min';
    const tag = document.getElementById('sellerDishTag')?.value || '';
    const image = document.getElementById('sellerDishImage')?.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80';
    const description = document.getElementById('sellerDishDesc')?.value.trim() || '';
    const isVegetarian = document.getElementById('sellerDishVeg')?.checked || false;
    const isAvailable = document.getElementById('sellerDishAvailable')?.checked !== false;

    if (!name || !price) {
        showToast('Please enter dish name and price', 'error');
        return;
    }

    showToast('Publishing dish...', 'info');
    const bodyData = { 
        name, 
        price: Number(price), 
        category, 
        image, 
        description, 
        isVegetarian,
        isAvailable,
        preparationTime,
        tag
    };
    
    // Add originalPrice only if provided
    if (originalPrice && Number(originalPrice) > Number(price)) {
        bodyData.originalPrice = Number(originalPrice);
    }

    const res = await api('/seller/dish', {
        method: 'POST',
        body: JSON.stringify(bodyData)
    });

    if (res.success) {
        showToast(`"${name}" published to FoodieHub! 🎉`, 'success');
        // Refresh dashboard data
        const dashRes = await api('/seller/dashboard');
        if (dashRes.success) {
            sellerData = dashRes.data;
            localStorage.setItem('fh_seller_data', JSON.stringify(dashRes.data));
        }
        // Reload foods to update main menu
        await loadBackendFoods();
        renderMenu();
        showSellerDishesTab();
        // Clear form
        document.getElementById('sellerDishName').value = '';
        document.getElementById('sellerDishPrice').value = '';
        document.getElementById('sellerDishOrigPrice').value = '';
        document.getElementById('sellerDishImage').value = '';
        document.getElementById('sellerDishDesc').value = '';
        document.getElementById('sellerDishVeg').checked = false;
        document.getElementById('sellerDishAvailable').checked = true;
        document.getElementById('sellerDishPrepTime').value = '10-15 min';
        document.getElementById('sellerDishTag').value = '';
        document.getElementById('sellerDishImagePreview').src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80';
    } else {
        showToast(res.message || 'Could not publish dish', 'error');
    }
}

async function sellerDeleteDish(dishId) {
    if (!confirm('Delete this dish from your menu?')) return;

    const res = await api(`/seller/dish/${dishId}`, { method: 'DELETE' });
    if (res.success) {
        showToast('Dish deleted from menu!', 'success');
        const dashRes = await api('/seller/dashboard');
        if (dashRes.success) {
            sellerData = dashRes.data;
            localStorage.setItem('fh_seller_data', JSON.stringify(dashRes.data));
        }
        await loadBackendFoods();
        renderMenu();
        showSellerDishesTab();
    } else {
        showToast(res.message || 'Could not delete dish', 'error');
    }
}

async function sellerEditDish(dishId) {
    const dishes = sellerData?.dishes || [];
    const dish = dishes.find(d => d._id === dishId);
    if (!dish) {
        showToast('Dish not found', 'error');
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'sellerEditDishOverlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width:500px;">
            <button class="modal-close" onclick="document.getElementById('sellerEditDishOverlay').remove();document.body.classList.remove('no-scroll');">&times;</button>
            <div class="modal-header"><i class="fas fa-edit" style="color:#8B5CF6;"></i><h2>Edit Dish</h2><p>Update your dish details</p></div>
            <div style="padding:0 0 20px;">
                <form id="sellerEditDishForm" onsubmit="event.preventDefault(); sellerSaveEditDish('${dish._id}');">
                    <div class="form-group">
                        <label>Dish Name *</label>
                        <input type="text" id="sedName" value="${dish.name}" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group">
                            <label>Price (₹) *</label>
                            <input type="number" id="sedPrice" value="${dish.price}" min="1" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <select id="sedCategory" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                                <option value="pizza" ${dish.category === 'pizza' ? 'selected' : ''}>Pizza</option>
                                <option value="burger" ${dish.category === 'burger' ? 'selected' : ''}>Burger</option>
                                <option value="biryani" ${dish.category === 'biryani' ? 'selected' : ''}>Biryani</option>
                                <option value="chinese" ${dish.category === 'chinese' ? 'selected' : ''}>Chinese</option>
                                <option value="desserts" ${dish.category === 'desserts' ? 'selected' : ''}>Desserts</option>
                                <option value="drinks" ${dish.category === 'drinks' ? 'selected' : ''}>Drinks</option>
                                <option value="other" ${dish.category === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Image URL</label>
                        <input type="text" id="sedImage" value="${dish.image || ''}" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="sedDesc" rows="2" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">${dish.description || ''}</textarea>
                    </div>
                    <div style="display:flex;align-items:center;gap:20px;margin:10px 0;">
                        <label style="display:flex;align-items:center;gap:6px;">
                            <input type="checkbox" id="sedVeg" ${dish.isVegetarian ? 'checked' : ''}> 🌿 Vegetarian
                        </label>
                        <label style="display:flex;align-items:center;gap:6px;">
                            <input type="checkbox" id="sedAvailable" ${dish.isAvailable !== false ? 'checked' : ''}> ✅ Available
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg btn-block">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
}

async function sellerSaveEditDish(dishId) {
    const name = document.getElementById('sedName')?.value.trim();
    const price = document.getElementById('sedPrice')?.value.trim();
    const category = document.getElementById('sedCategory')?.value;
    const image = document.getElementById('sedImage')?.value.trim();
    const description = document.getElementById('sedDesc')?.value.trim() || '';
    const isVegetarian = document.getElementById('sedVeg')?.checked || false;
    const isAvailable = document.getElementById('sedAvailable')?.checked !== false;

    if (!name || !price) {
        showToast('Please fill name and price', 'error');
        return;
    }

    showToast('Updating dish...', 'info');
    const res = await api(`/seller/dish/${dishId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, price: Number(price), category, image, description, isVegetarian, isAvailable })
    });

    if (res.success) {
        showToast('Dish updated! ✅', 'success');
        document.getElementById('sellerEditDishOverlay')?.remove();
        document.body.classList.remove('no-scroll');
        const dashRes = await api('/seller/dashboard');
        if (dashRes.success) {
            sellerData = dashRes.data;
            localStorage.setItem('fh_seller_data', JSON.stringify(dashRes.data));
        }
        await loadBackendFoods();
        renderMenu();
        showSellerDishesTab();
    } else {
        showToast(res.message || 'Could not update dish', 'error');
    }
}

async function sellerUpdateProfile() {
    const restaurantName = document.getElementById('ssRestName')?.value.trim();
    const restaurantCategory = document.getElementById('ssCategory')?.value;
    const restaurantCity = document.getElementById('ssCity')?.value.trim();
    const restaurantPhone = document.getElementById('ssPhone')?.value.trim();
    const restaurantAddress = document.getElementById('ssAddress')?.value.trim();
    const restaurantImage = document.getElementById('ssImage')?.value.trim();
    const deliveryTime = document.getElementById('ssDeliveryTime')?.value.trim();
    const deliveryFee = document.getElementById('ssDeliveryFee')?.value;
    const minOrder = document.getElementById('ssMinOrder')?.value;
    const isOpen = document.getElementById('ssIsOpen')?.checked || false;

    if (!restaurantName) {
        showToast('Restaurant name is required', 'error');
        return;
    }

    showToast('Saving settings...', 'info');
    const res = await api('/seller/profile', {
        method: 'PUT',
        body: JSON.stringify({
            restaurantName, restaurantCategory, restaurantCity, restaurantPhone,
            restaurantAddress, restaurantImage, deliveryTime,
            deliveryFee: Number(deliveryFee), minOrder: Number(minOrder), isOpen
        })
    });

    if (res.success) {
        showToast('Settings saved! ✅', 'success');
        const dashRes = await api('/seller/dashboard');
        if (dashRes.success) {
            sellerData = dashRes.data;
            loggedInSeller = dashRes.data.seller;
            localStorage.setItem('fh_seller_data', JSON.stringify(dashRes.data));
            localStorage.setItem('fh_seller', JSON.stringify(dashRes.data.seller));
        }
        updateSellerUI();
    } else {
        showToast(res.message || 'Could not save settings', 'error');
    }
}

// ====== SELLER DELIVERY & OTP SYSTEM ======
async function showSellerDeliveryTab() {
    const content = document.getElementById('sellerTabContent');
    if (!content) return;

    document.getElementById('sellerTabDishes')?.classList.remove('btn-primary');
    document.getElementById('sellerTabDishes')?.classList.add('btn-outline');
    document.getElementById('sellerTabSettings')?.classList.remove('btn-primary');
    document.getElementById('sellerTabSettings')?.classList.add('btn-outline');
    
    // Show delivery tab active
    const delBtn = document.getElementById('sellerTabDelivery');
    if (delBtn) { delBtn.classList.add('btn-primary'); delBtn.classList.remove('btn-outline'); }

    showToast('Loading orders...', 'info');
    
    // Fetch all orders from the system
    const res = await api('/order/all');
    let orders = [];
    if (res.success && Array.isArray(res.data)) {
        orders = res.data;
    }

    if (orders.length === 0) {
        content.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;background:#f9fafb;border-radius:12px;border:2px dashed #ddd;">
                <i class="fas fa-truck" style="font-size:3rem;margin-bottom:15px;color:#ccc;"></i>
                <p style="font-size:1.1rem;">No orders received yet</p>
                <p style="font-size:0.9rem;margin-top:5px;">When customers place orders, they will appear here 🚚</p>
            </div>
        `;
        return;
    }

    let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
            <h3 style="margin:0;">🚚 Delivery Management</h3>
            <span style="font-size:0.85rem;color:#888;">${orders.length} total orders</span>
        </div>
        <div style="max-height:55vh;overflow-y:auto;">
    `;

    orders.forEach(order => {
        const addr = order.address || {};
        const items = order.items || [];
        const itemsHtml = items.map(i => `
            <div style="display:flex;align-items:center;gap:8px;padding:3px 0;">
                <span style="flex:1;font-size:0.85rem;">${i.name} × ${i.qty || i.quantity || 1}</span>
                <span style="font-weight:600;color:#FF6B35;font-size:0.85rem;">₹${(i.price || 0) * (i.qty || i.quantity || 1)}</span>
            </div>
        `).join('');

        const statusInfo = getStatusInfo(order.status);
        const nextStatus = getNextStatus(order.status);
        
        html += `
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #eee;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                <div>
                    <strong style="font-size:0.95rem;">Order #${order.orderId}</strong>
                    <span style="display:inline-block;margin-left:8px;padding:2px 10px;border-radius:20px;font-size:0.7rem;font-weight:600;background:${statusInfo.bg};color:${statusInfo.color};">
                        ${order.status}
                    </span>
                </div>
                <span style="font-size:0.7rem;color:#999;">${new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div style="font-size:0.8rem;color:#666;margin-bottom:6px;background:#f3f4f6;padding:8px 10px;border-radius:8px;">
                <strong>👤 ${order.customerName || 'Customer'}</strong><br>
                📞 ${addr.mobile || 'N/A'}<br>
                📍 ${addr.fullName || ''}, ${addr.address || ''}, ${addr.pincode || ''}
            </div>
            ${itemsHtml}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:8px;border-top:1px solid #ddd;">
                <div>
                    <span style="font-weight:700;color:#FF6B35;">₹${order.totalPrice}</span>
                    <span style="font-size:0.75rem;color:#999;margin-left:8px;">${order.paymentMethod || 'COD'}</span>
                </div>
                <div style="display:flex;gap:6px;">
                    <button onclick="sellerCopyCustomerInfo('${order.orderId}')" style="background:#e0e7ff;color:#4f46e5;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:0.75rem;font-weight:600;" title="Copy Customer Info"><i class="fas fa-copy"></i></button>
                    ${order.status === 'Out for Delivery' ? `
                        <button onclick="sellerVerifyDeliveryOTP('${order.orderId}')" style="background:#10b981;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                            <i class="fas fa-key"></i> Enter OTP
                        </button>
                    ` : nextStatus ? `
                        <button onclick="sellerUpdateDeliveryStatus('${order.orderId}','${nextStatus}')" style="background:#8B5CF6;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;">
                            ${nextStatus === 'Out for Delivery' ? '🚚 Out for Delivery' : '→ ' + nextStatus}
                        </button>
                    ` : '<span style="font-size:0.8rem;color:#10b981;font-weight:600;">✅ Delivered</span>'}
                </div>
            </div>
        </div>`;
    });

    html += '</div>';
    content.innerHTML = html;
}

function getStatusInfo(status) {
    const map = {
        'Pending': { bg: '#fef3c7', color: '#d97706' },
        'Confirmed': { bg: '#dbeafe', color: '#2563eb' },
        'Preparing': { bg: '#e0e7ff', color: '#4f46e5' },
        'Out for Delivery': { bg: '#fce7f3', color: '#db2777' },
        'Delivered': { bg: '#d1fae5', color: '#059669' },
        'Cancelled': { bg: '#fee2e2', color: '#dc2626' }
    };
    return map[status] || { bg: '#f3f4f6', color: '#6b7280' };
}

async function sellerUpdateDeliveryStatus(orderId, newStatus) {
    if (!confirm(`Update order ${orderId} to "${newStatus}"?`)) return;
    
    showToast('Updating delivery status...', 'info');
    const res = await api(`/order/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
    });

    if (res.success) {
        showToast(`✅ Order ${orderId}: ${newStatus}`, 'success');
        
        // If going Out for Delivery - show OTP
        if (newStatus === 'Out for Delivery' && res.data && res.data.otp) {
            const otp = res.data.otp;
            showToast(`🔑 OTP for delivery: ${otp} - Share this with the customer!`, 'info');
            
            // Show OTP in a larger popup
            setTimeout(() => {
                showDeliveryOTPModal(orderId, otp);
            }, 500);
        }
        
        showSellerDeliveryTab();
    } else {
        showToast(res.message || 'Could not update status', 'error');
    }
}

function showDeliveryOTPModal(orderId, otp) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'deliveryOTPModal';
    overlay.innerHTML = `
        <div class="modal" style="max-width:420px;text-align:center;">
            <button class="modal-close" onclick="document.getElementById('deliveryOTPModal').remove();document.body.classList.remove('no-scroll');">&times;</button>
            <div style="font-size:4rem;color:#8B5CF6;margin:20px 0;"><i class="fas fa-key"></i></div>
            <h2 style="margin-bottom:5px;">🔑 Delivery OTP Generated</h2>
            <p style="color:#666;margin-bottom:20px;">Share this OTP with the customer. They need to provide it to confirm delivery.</p>
            <div style="background:#f3f0ff;padding:20px;border-radius:12px;margin-bottom:20px;border:2px dashed #8B5CF6;">
                <p style="font-size:0.9rem;color:#666;margin-bottom:8px;">Order: ${orderId}</p>
                <div style="font-size:2.5rem;font-weight:800;color:#8B5CF6;letter-spacing:10px;font-family:monospace;">${otp}</div>
            </div>
            <button class="btn btn-primary btn-lg btn-block" onclick="navigator.clipboard.writeText('${otp}').then(()=>{showToast('OTP copied! Share with customer','success')}).catch(()=>{});" style="background:#8B5CF6;">
                <i class="fas fa-copy"></i> Copy OTP
            </button>
            <button class="btn btn-outline btn-lg btn-block" style="margin-top:8px;" onclick="document.getElementById('deliveryOTPModal').remove();document.body.classList.remove('no-scroll');">
                <i class="fas fa-check"></i> Done
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
}

function sellerVerifyDeliveryOTP(orderId) {
    // Create OTP verification modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'sellerVerifyOTPModal';
    overlay.innerHTML = `
        <div class="modal" style="max-width:400px;text-align:center;">
            <button class="modal-close" onclick="document.getElementById('sellerVerifyOTPModal').remove();document.body.classList.remove('no-scroll');">&times;</button>
            <div style="font-size:3rem;color:#10b981;margin:15px 0;"><i class="fas fa-truck"></i></div>
            <h2 style="margin-bottom:5px;">🚚 Confirm Delivery</h2>
            <p style="color:#666;margin-bottom:15px;">Ask the customer for the OTP and enter it below to confirm delivery.</p>
            <div style="background:#f0fdf4;padding:15px;border-radius:12px;margin-bottom:15px;">
                <p style="font-size:0.85rem;color:#666;">Order: <strong>${orderId}</strong></p>
            </div>
            <div class="form-group">
                <label style="font-size:0.9rem;font-weight:600;">Enter Customer OTP</label>
                <input type="text" id="sellerOtpInput" placeholder="_ _ _ _" maxlength="4" style="width:100%;padding:16px 20px;border:2px solid #10b981;border-radius:10px;font-size:1.5rem;text-align:center;letter-spacing:12px;font-weight:700;outline:none;background:#f0fdf4;">
            </div>
            <button class="btn btn-primary btn-lg btn-block" onclick="sellerSubmitOTP('${orderId}')" style="margin-top:10px;background:#10b981;">
                <i class="fas fa-check-circle"></i> Confirm Delivery
            </button>
            <p style="font-size:0.8rem;color:#999;margin-top:10px;">Delivery will be marked as completed ✅</p>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
    
    // Focus OTP input
    setTimeout(() => {
        const input = document.getElementById('sellerOtpInput');
        if (input) input.focus();
    }, 300);
}

async function sellerSubmitOTP(orderId) {
    const otp = document.getElementById('sellerOtpInput')?.value.trim();
    if (!otp || otp.length !== 4) {
        showToast('Please enter the 4-digit OTP', 'error');
        return;
    }

    showToast('Verifying OTP...', 'info');
    const res = await api(`/order/${orderId}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp })
    });

    if (res.success) {
        showToast('✅ Delivery confirmed! Order completed successfully! 🎉', 'success');
        document.getElementById('sellerVerifyOTPModal')?.remove();
        document.body.classList.remove('no-scroll');
        showSellerDeliveryTab();
    } else {
        showToast(res.message || '❌ Invalid OTP. Please try again.', 'error');
    }
}

async function sellerCopyCustomerInfo(orderId) {
    const res = await api(`/order/track/${orderId}`);
    if (res.success && res.data) {
        // Get full order details
        const fullRes = await api('/order/all');
        let orders = [];
        if (fullRes.success && Array.isArray(fullRes.data)) {
            orders = fullRes.data;
        }
        const order = orders.find(o => o.orderId === orderId);
        
        if (order) {
            const addr = order.address || {};
            const details = `📋 Order #${order.orderId}
👤 Customer: ${order.customerName || 'N/A'}
📞 Phone: ${addr.mobile || 'N/A'}
📍 Address: ${addr.fullName || ''}, ${addr.address || ''}, ${addr.pincode || ''}
💰 Total: ₹${order.totalPrice}
💳 Payment: ${order.paymentMethod || 'COD'}`;
            
            navigator.clipboard.writeText(details).then(() => {
                showToast('📋 Customer info copied!', 'success');
            }).catch(() => {
                showToast('Could not copy', 'error');
            });
        }
    }
}

function sellerLogout() {
    if (!confirm('Logout from seller account?')) return;
    loggedInSeller = null;
    sellerData = null;
    localStorage.removeItem('fh_seller');
    localStorage.removeItem('fh_seller_data');
    updateSellerUI();
    closeModal('sellerDashboardModal');
    showToast('Logged out from seller account', 'info');
}

// ====== TOAST ======
function showToast(msg, type = 'success') {
    const el = $('toast');
    const icon = $('toastIcon');
    const msgEl = $('toastMessage');
    if (!el) return;
    msgEl.textContent = msg;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    icon.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i>`;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ====== API ======
async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(API_URL + path, { ...options, headers });
        const data = await res.json();
        return data;
    } catch (e) {
        return { success: false, message: e.message };
    }
}

function normalizeCart(nextCart) {
    const items = (nextCart?.items || []).map(i => ({
        _id: i._id || i.foodId,
        foodId: i.foodId || i._id,
        name: i.name,
        price: Number(i.price) || 0,
        image: i.image || '',
        qty: Number(i.qty || i.quantity || 1)
    }));
    return {
        items,
        totalPrice: Number(nextCart?.totalPrice) || items.reduce((s, i) => s + i.price * i.qty, 0)
    };
}

async function loadBackendCart() {
    if (!token || !loggedInUser?._id) return false;
    const res = await api(`/cart/${loggedInUser._id}`);
    if (!res.success) return false;
    cart = normalizeCart(res.data);
    localStorage.setItem('fh_cart', JSON.stringify(cart));
    updateCartUI();
    return true;
}

async function loadBackendFoods() {
    const res = await api('/foods');
    if (!res.success || !Array.isArray(res.data)) return false;
    FOODS.splice(0, FOODS.length, ...res.data.map(food => ({
        _id: food._id,
        name: food.name,
        price: food.price,
        image: food.image,
        category: food.category,
        rating: food.rating || 4.5
    })));
    return true;
}

// ====== AUTH ======
function updateAuthUI() {
    const loginBtn = $('loginBtn');
    const signupBtn = $('signupBtn');
    
    if (loginBtn) {
        loginBtn.onclick = null;
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
    }
    if (signupBtn) {
        signupBtn.onclick = null;
        const newSignupBtn = signupBtn.cloneNode(true);
        signupBtn.parentNode.replaceChild(newSignupBtn, signupBtn);
    }
    
    const loginBtn2 = $('loginBtn');
    const signupBtn2 = $('signupBtn');
    
    if (loggedInUser) {
        if (loginBtn2) {
            loginBtn2.textContent = loggedInUser.name.split(' ')[0];
            loginBtn2.className = 'btn btn-primary';
            loginBtn2.onclick = () => showToast(`Welcome ${loggedInUser.name}!`, 'info');
        }
        if (signupBtn2) {
            signupBtn2.textContent = 'Logout';
            signupBtn2.className = 'btn btn-outline';
            signupBtn2.onclick = logoutUser;
        }
    } else {
        if (loginBtn2) {
            loginBtn2.textContent = 'Log In';
            loginBtn2.className = 'btn btn-outline';
            loginBtn2.onclick = () => openModal('loginModal');
        }
        if (signupBtn2) {
            signupBtn2.textContent = 'Sign Up';
            signupBtn2.className = 'btn btn-primary';
            signupBtn2.onclick = () => openModal('signupModal');
        }
    }
    updateCartUI();
    updateOrdersButton();
    updateAdminButton();
}

function logoutUser() {
    loggedInUser = null; token = null;
    localStorage.removeItem('fh_user'); localStorage.removeItem('fh_token');
    cart = { items: [], totalPrice: 0 };
    localStorage.setItem('fh_cart', JSON.stringify(cart));
    closeModal('loginModal'); closeModal('signupModal');
    showToast('Logged out successfully', 'info');
    updateAuthUI();
}

// ====== ADMIN & ORDERS BUTTON VISIBILITY ======
function updateAdminButton() {
    const adminBtn = $('adminNavBtn');
    if (adminBtn) {
        adminBtn.style.display = loggedInUser ? 'inline-flex' : 'none';
        const hasNewOrders = localStorage.getItem('fh_new_order_notification') === 'true';
        if (hasNewOrders && loggedInUser) {
            adminBtn.innerHTML = '<i class="fas fa-cog"></i> Admin <span style="background:#ef4444;color:white;border-radius:50%;padding:1px 6px;font-size:0.7rem;margin-left:4px;">!</span>';
        } else {
            adminBtn.innerHTML = '<i class="fas fa-cog"></i> Admin';
        }
    }
}

function updateOrdersButton() {
    const ordersBtn = $('ordersNavBtn');
    if (ordersBtn) {
        ordersBtn.style.display = loggedInUser ? 'inline-flex' : 'none';
    }
}

// ====== MODALS ======
function openModal(id) { const el = $(id); if (el) { el.classList.add('show'); document.body.classList.add('no-scroll'); } }
function closeModal(id) { const el = $(id); if (el) { el.classList.remove('show'); document.body.classList.remove('no-scroll'); } }

// ====== RENDER MENU (from backend only) ======
function renderMenu() {
    const grid = $('menuGrid');
    if (!grid) return;
    if (!FOODS || FOODS.length === 0) {
        grid.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#999;grid-column:1/-1;"><i class="fas fa-utensils" style="font-size:3rem;margin-bottom:15px;display:block;"></i><p style="font-size:1.1rem;">No dishes added yet.</p><p style="font-size:0.9rem;margin-top:5px;">Go to Admin Panel to add your dishes!</p></div>';
        return;
    }
    grid.innerHTML = FOODS.map(f => `
        <div class="menu-card reveal">
            <div class="menu-card-img"><img src="${f.image}" alt="${f.name}" loading="lazy"></div>
            <h3>${f.name}</h3>
            <div class="menu-price">₹${f.price}</div>
            <button class="btn btn-primary add-to-cart-btn" onclick="addToCart('${f._id}')">
                <i class="fas fa-plus"></i> Add to Cart
            </button>
        </div>
    `).join('');
}

// ====== CART ======
async function addToCart(foodId) {
    const food = FOODS.find(f => f._id === foodId);
    if (!food) { showToast('Food not found', 'error'); return; }

    // If logged in with backend token, try backend first
    if (loggedInUser && token) {
        const res = await api('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ foodId, quantity: 1 })
        });
        if (res.success) {
            cart = normalizeCart(res.data);
            saveCart();
            showToast(`${food.name} added to cart!`);
            return;
        }
    }

    // Add to LOCAL cart (works even without login)
    const idx = cart.items.findIndex(i => i._id === foodId);
    if (idx > -1) cart.items[idx].qty += 1;
    else cart.items.push({ _id: food._id, foodId: food._id, name: food.name, price: food.price, image: food.image, qty: 1 });
    saveCart();
    showToast(`${food.name} added to cart!`);
}

async function updateQty(id, delta) {
    if (token) {
        const res = await api('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ foodId: id, quantity: delta })
        });
        if (res.success) {
            cart = normalizeCart(res.data);
            saveCart(); renderCartModal();
            return;
        }
    }

    const idx = cart.items.findIndex(i => i._id === id);
    if (idx === -1) return;
    cart.items[idx].qty += delta;
    if (cart.items[idx].qty <= 0) cart.items.splice(idx, 1);
    saveCart(); renderCartModal();
}

async function removeFromCart(id) {
    if (token) {
        const res = await api('/cart/remove', {
            method: 'DELETE',
            body: JSON.stringify({ foodId: id })
        });
        if (res.success) {
            cart = normalizeCart(res.data);
            saveCart(); renderCartModal();
            return;
        }
    }

    cart.items = cart.items.filter(i => i._id !== id);
    saveCart(); renderCartModal();
}

function saveCart() {
    cart.totalPrice = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
    localStorage.setItem('fh_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const count = cart.items.reduce((s, i) => s + i.qty, 0);
    const cartCountEl = $('cartCount');
    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? 'inline' : 'none';
    }
}

// ====== CART MODAL ======
function openCartModal() {
    renderCartModal();
    openModal('cartModal');
}

function renderCartModal() {
    const container = $('cartItems');
    const total = $('cartTotal');
    const checkoutBtn = $('checkoutBtn');
    if (!container) return;

    if (cart.items.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;"><i class="fas fa-shopping-cart" style="font-size:3rem;margin-bottom:15px;"></i><p>Your cart is empty</p></div>';
        if (total) total.textContent = 'Total: ₹0';
        if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.5'; }
        return;
    }

    container.innerHTML = cart.items.map(i => `
        <div style="display:flex;align-items:center;gap:15px;padding:12px 0;border-bottom:1px solid #eee;">
            <img src="${i.image}" alt="${i.name}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;">
            <div style="flex:1;"><h4 style="font-size:0.95rem;">${i.name}</h4><p style="color:#FF6B35;font-weight:600;">₹${i.price}</p></div>
            <div style="display:flex;align-items:center;gap:8px;">
                <button onclick="updateQty('${i._id}',-1)" style="width:30px;height:30px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:1rem;">−</button>
                <span style="font-weight:600;min-width:20px;text-align:center;">${i.qty}</span>
                <button onclick="updateQty('${i._id}',1)" style="width:30px;height:30px;border-radius:50%;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:1rem;">+</button>
            </div>
            <button onclick="removeFromCart('${i._id}')" style="color:#ef4444;background:none;border:none;cursor:pointer;font-size:1.1rem;"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');

    if (total) total.textContent = `Total: ₹${cart.totalPrice}`;
    if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.style.opacity = '1'; }
}

// ====== CHECKOUT ======
function openCheckout() {
    if (!loggedInUser) { showToast('Please login first', 'error'); closeModal('cartModal'); openModal('loginModal'); return; }
    if (cart.items.length === 0) { showToast('Cart is empty', 'error'); return; }
    closeModal('cartModal');
    renderCheckoutPage();
}

function renderCheckoutPage() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'checkoutOverlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width:550px;max-height:90vh;overflow-y:auto;">
            <button class="modal-close" onclick="document.getElementById('checkoutOverlay').remove();document.body.classList.remove('no-scroll');">&times;</button>
            <div class="modal-header"><i class="fas fa-truck"></i><h2>Checkout</h2><p>Complete your order</p></div>
            <div style="padding:0 0 20px;">
                <h3 style="margin-bottom:15px;">Delivery Address</h3>
                <form id="checkoutForm">
                    <div class="form-group"><input type="text" id="coName" placeholder="Full Name" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;"></div>
                    <div class="form-group"><input type="tel" id="coMobile" placeholder="Mobile Number" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;"></div>
                    <div class="form-group"><textarea id="coAddress" placeholder="Full Address" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;min-height:70px;"></textarea></div>
                    <div class="form-group"><input type="text" id="coPincode" placeholder="Pincode" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;"></div>
                    
                    <h3 style="margin:20px 0 15px;">Payment Method</h3>
                    <div id="payOptions">
                        <label style="display:flex;align-items:center;gap:12px;padding:14px 18px;border:2px solid #FF6B35;border-radius:8px;margin-bottom:10px;cursor:pointer;background:#fff7ed;">
                            <input type="radio" name="payment" value="cod" checked onchange="selectedPay=this.value"> <i class="fas fa-money-bill-wave" style="color:#FF6B35;"></i> <strong>Cash on Delivery</strong> (Pay when you receive)
                        </label>
                    </div>
                    <div id="paymentDetails" style="margin:10px 0 5px;">
                        <p style="font-size:0.9rem;color:#666;background:#fff7ed;padding:12px;border-radius:8px;">Pay cash when the order arrives. No online payment required.</p>
                    </div>

                    <div style="display:flex;justify-content:space-between;padding:15px 0;font-size:1.2rem;font-weight:700;">
                        <span>Total: ₹${cart.totalPrice}</span>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg btn-block">
                        <i class="fas fa-check-circle"></i> Place Order • ₹${cart.totalPrice}
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
    window.selectedPay = 'cod';

    $('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await placeOrder();
    });
}

let selectedPay = 'cod';

async function placeOrder() {
    selectedPay = 'cod';
    const name = $('coName')?.value.trim();
    const mobile = $('coMobile')?.value.trim();
    const address = $('coAddress')?.value.trim();
    const pincode = $('coPincode')?.value.trim();
    if (!name || !mobile || !address || !pincode) { showToast('Please fill all address fields', 'error'); return; }
    if (mobile.length !== 10) { showToast('Enter valid 10-digit mobile', 'error'); return; }
    if (pincode.length !== 6) { showToast('Enter valid 6-digit pincode', 'error'); return; }

    const orderId = 'FH' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    if (token) {
        showToast('Placing order...', 'info');
        const res = await api('/order/create', {
            method: 'POST',
            body: JSON.stringify({
                address: { fullName: name, mobile, address, pincode },
                paymentMethod: 'cod'
            })
        });
        const totalPrice = cart.totalPrice;
        if (res.success) {
            cart = { items: [], totalPrice: 0 }; saveCart();
            document.getElementById('checkoutOverlay')?.remove();
            document.body.classList.remove('no-scroll');
            showOrderConfirm(res.data.orderId || orderId, { totalPrice, paymentMethod: 'cod' });
            return;
        } else {
            showToast('Backend error: ' + (res.message || 'Unknown'), 'error');
        }
    }

    const totalPrice = cart.totalPrice;
    const orders = JSON.parse(localStorage.getItem('fh_orders') || '[]');
    orders.unshift({ id: orderId, items: [...cart.items], totalPrice, address: { fullName: name, mobile, address, pincode }, paymentMethod: 'cod', status: 'Confirmed', createdAt: new Date().toISOString() });
    localStorage.setItem('fh_orders', JSON.stringify(orders));
    cart = { items: [], totalPrice: 0 }; saveCart();
    document.getElementById('checkoutOverlay')?.remove();
    document.body.classList.remove('no-scroll');
    showOrderConfirm(orderId, { totalPrice, paymentMethod: 'cod' });
}

// ====== NOTIFICATION SYSTEM ======
async function checkForNewOrders() {
    if (!token) return;
    const lastCheck = localStorage.getItem('fh_last_order_check') || '0';
    const res = await api('/order/all');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const latestOrder = res.data[0];
        const latestTime = new Date(latestOrder.createdAt).getTime();
        if (latestTime > parseInt(lastCheck)) {
            localStorage.setItem('fh_new_order_notification', 'true');
            updateAdminButton();
            const addr = latestOrder.address || {};
            const itemsList = (latestOrder.items || []).map(i => `${i.name} x${i.qty || i.quantity || 1}`).join(', ');
            showToast(`🆕 New Order! ${latestOrder.customerName || 'Someone'} ordered ${itemsList}. Total: ₹${latestOrder.totalPrice}`, 'info');
        }
        localStorage.setItem('fh_last_order_check', Date.now().toString());
    }
}

setInterval(checkForNewOrders, 10000);

function copyOrderDetails(order) {
    const addr = order.address || {};
    const items = (order.items || []).map(i => 
        `  • ${i.name} × ${i.qty || i.quantity || 1} = ₹${(i.price || 0) * (i.qty || i.quantity || 1)}`
    ).join('\n');
    
    const details = `🛵 NEW ORDER - FoodieHub
━━━━━━━━━━━━━━━━━━━
📋 Order ID: ${order.orderId}
👤 Customer: ${order.customerName || 'N/A'}
📧 Email: ${order.customerEmail || 'N/A'}
📞 Phone: ${addr.mobile || 'N/A'}
📍 Address: ${addr.fullName || ''}, ${addr.address || ''}, ${addr.pincode || ''}
💳 Payment: ${order.paymentMethod || 'COD'} | ₹${order.totalPrice}
📅 Date: ${new Date(order.createdAt).toLocaleString()}
━━━━━━━━━━━━━━━━━━━
🛒 ITEMS ORDERED:
${items}
━━━━━━━━━━━━━━━━━━━
✅ Status: ${order.status}`;

    navigator.clipboard.writeText(details).then(() => {
        showToast('📋 Order details copied! Paste and share anywhere.', 'success');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = details;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('📋 Order details copied!', 'success');
    });
}

function shareOnWhatsApp(order) {
    const addr = order.address || {};
    const items = (order.items || []).map(i => 
        `• ${i.name} × ${i.qty || i.quantity || 1} = ₹${(i.price || 0) * (i.qty || i.quantity || 1)}`
    ).join('%0A');
    
    const text = `🛵 *NEW ORDER - FoodieHub*%0A━━━━━━━━━━━━━━%0A📋 *Order:* ${order.orderId}%0A👤 *Customer:* ${order.customerName || 'N/A'}%0A📞 *Phone:* ${addr.mobile || 'N/A'}%0A📍 *Address:* ${addr.fullName || ''}, ${addr.address || ''}, ${addr.pincode || ''}%0A💰 *Total:* ₹${order.totalPrice}%0A━━━━━━━━━━━━━━%0A🛒 *ITEMS:*%0A${items}%0A━━━━━━━━━━━━━━%0A✅ *Status:* ${order.status}`;
    
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

// ====== MY ORDERS ======
async function openOrdersModal() {
    if (!loggedInUser) {
        showToast('Please login to view your orders', 'error');
        openModal('loginModal');
        return;
    }
    await renderOrdersModal();
    openModal('ordersModal');
}

async function renderOrdersModal() {
    const container = $('ordersContainer');
    if (!container) return;

    let orders = [];

    if (token) {
        const res = await api(`/order/${loggedInUser._id}`);
        if (res.success && Array.isArray(res.data)) {
            orders = res.data;
        }
    }

    if (orders.length === 0) {
        const localOrders = JSON.parse(localStorage.getItem('fh_orders') || '[]');
        orders = localOrders;
    }

    if (orders.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;"><i class="fas fa-clipboard-list" style="font-size:3rem;margin-bottom:15px;"></i><p>No orders yet. Start ordering delicious food!</p></div>';
        return;
    }

    container.innerHTML = orders.map(order => {
        const items = order.items || [];
        const itemsHtml = items.map(i => `
            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;">
                ${i.image ? `<img src="${i.image}" alt="${i.name}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">` : ''}
                <span style="flex:1;font-size:0.9rem;">${i.name} × ${i.qty || i.quantity || 1}</span>
                <span style="font-weight:600;color:#FF6B35;font-size:0.9rem;">₹${(i.price || 0) * (i.qty || i.quantity || 1)}</span>
            </div>
        `).join('');

        const canDelete = order.status !== 'Delivered' && order.status !== 'Out for Delivery';

        return `
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #eee;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                <div>
                    <strong style="font-size:1rem;">Order #${order.orderId || order.id}</strong>
                    <span style="display:inline-block;margin-left:10px;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;background:${statusColor(order.status || 'Confirmed').bg};color:${statusColor(order.status || 'Confirmed').color};">${order.status || 'Confirmed'}</span>
                </div>
                <span style="font-size:0.8rem;color:#999;">${new Date(order.createdAt || order.date).toLocaleDateString()}</span>
            </div>
            ${itemsHtml}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid #ddd;">
                <div>
                    <span style="font-size:0.85rem;color:#666;">Total: </span>
                    <span style="font-weight:700;font-size:1.1rem;color:#FF6B35;">₹${order.totalPrice}</span>
                    <span style="font-size:0.75rem;color:#999;margin-left:8px;text-transform:capitalize;">(${order.paymentMethod || 'COD'})</span>
                </div>
                ${canDelete ? `<button onclick="deleteOrder('${order.orderId || order.id}')" style="background:#fee2e2;color:#dc2626;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:0.85rem;font-weight:600;"><i class="fas fa-trash-alt"></i> Delete</button>` : '<span style="font-size:0.8rem;color:#999;"><i class="fas fa-check-circle" style="color:#10b981;"></i> Completed</span>'}
            </div>
        </div>`;
    }).join('');
}

function statusColor(status) {
    const map = {
        'Pending': { bg: '#fef3c7', color: '#d97706' },
        'Confirmed': { bg: '#dbeafe', color: '#2563eb' },
        'Preparing': { bg: '#e0e7ff', color: '#4f46e5' },
        'Out for Delivery': { bg: '#fce7f3', color: '#db2777' },
        'Delivered': { bg: '#d1fae5', color: '#059669' },
        'Cancelled': { bg: '#fee2e2', color: '#dc2626' }
    };
    return map[status] || { bg: '#f3f4f6', color: '#6b7280' };
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    if (token) {
        showToast('Deleting order...', 'info');
        const res = await api(`/order/${orderId}`, { method: 'DELETE' });
        if (res.success) {
            showToast('Order deleted successfully!', 'success');
            await renderOrdersModal();
            return;
        } else {
            showToast(res.message || 'Could not delete order', 'error');
            return;
        }
    }

    let orders = JSON.parse(localStorage.getItem('fh_orders') || '[]');
    const idx = orders.findIndex(o => (o.orderId || o.id) === orderId);
    if (idx > -1) {
        if (orders[idx].status === 'Delivered' || orders[idx].status === 'Out for Delivery') {
            showToast('Cannot delete a completed/delivered order', 'error');
            return;
        }
        orders.splice(idx, 1);
        localStorage.setItem('fh_orders', JSON.stringify(orders));
        showToast('Order deleted successfully!', 'success');
        await renderOrdersModal();
    } else {
        showToast('Order not found', 'error');
    }
}

function showOrderConfirm(orderId, data) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.innerHTML = `
        <div class="modal" style="max-width:500px;text-align:center;">
            <div style="font-size:4rem;color:#10b981;margin-bottom:15px;"><i class="fas fa-check-circle"></i></div>
            <h2>Order Placed! 🎉</h2>
            <p style="color:#666;margin:10px 0 20px;">Your delicious food is being prepared</p>
            <div style="background:#f0fdf4;padding:15px;border-radius:12px;margin-bottom:20px;">
                <p style="font-size:0.85rem;color:#666;">Order ID</p>
                <p style="font-size:1.3rem;font-weight:700;color:#FF6B35;">${orderId}</p>
            </div>
            <div style="text-align:left;">
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;"><span>Status</span><span style="font-weight:600;color:#d97706;">Confirmed</span></div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;"><span>Amount</span><span style="font-weight:700;color:#FF6B35;">₹${data.totalPrice}</span></div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;"><span>Payment</span><span style="text-transform:capitalize;">Cash on Delivery</span></div>
            </div>
            <button class="btn btn-primary btn-lg btn-block" style="margin-top:20px;" onclick="this.closest('.modal-overlay').remove();document.body.classList.remove('no-scroll');showToast('Order placed! Track it below.')">
                <i class="fas fa-check"></i> Done
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// ====== ADMIN PANEL ======
async function openAdminPanel() {
    if (!loggedInUser) {
        showToast('Please login as admin', 'error');
        openModal('loginModal');
        return;
    }
    localStorage.setItem('fh_new_order_notification', 'false');
    updateAdminButton();
    openModal('adminModal');
    await renderAdminPanel();
}

async function copyOrderById(orderId) {
    const res = await api(`/order/track/${orderId}`);
    if (res.success && res.data) {
        const order = {
            orderId: res.data.orderId,
            customerName: res.data.customerName || '',
            customerEmail: res.data.customerEmail || '',
            address: res.data.address || {},
            totalPrice: res.data.totalPrice,
            paymentMethod: res.data.paymentMethod,
            items: res.data.items || [],
            status: res.data.status,
            createdAt: res.data.createdAt
        };
        copyOrderDetails(order);
    } else {
        showToast('Could not fetch order details', 'error');
    }
}

async function shareOrderWhatsApp(orderId) {
    const res = await api(`/order/track/${orderId}`);
    if (res.success && res.data) {
        const order = {
            orderId: res.data.orderId,
            customerName: res.data.customerName || '',
            address: res.data.address || {},
            totalPrice: res.data.totalPrice,
            paymentMethod: res.data.paymentMethod,
            items: res.data.items || [],
            status: res.data.status
        };
        shareOnWhatsApp(order);
    } else {
        showToast('Could not fetch order details', 'error');
    }
}

async function renderAdminPanel() {
    const container = $('adminOrdersContainer');
    if (!container) return;

    // Render tabs for Orders / Dishes
    container.innerHTML = `
        <div style="display:flex;gap:10px;margin-bottom:15px;">
            <button id="adminTabOrders" onclick="renderAdminOrders()" style="flex:1;padding:10px;background:#FF6B35;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">📋 Orders</button>
            <button id="adminTabDishes" onclick="renderAdminDishes()" style="flex:1;padding:10px;background:#f0f0f0;color:#333;border:none;border-radius:8px;cursor:pointer;font-weight:600;">🍽️ Manage Dishes</button>
        </div>
        <div id="adminTabContent">
            <p style="text-align:center;padding:20px;color:#999;">Loading...</p>
        </div>
    `;
    
    await renderAdminOrders();
}

let adminOrdersCache = [];

async function renderAdminOrders() {
    const content = $('adminTabContent');
    if (!content) return;

    const tabBtn = $('adminTabOrders');
    const dishesBtn = $('adminTabDishes');
    if (tabBtn) tabBtn.style.background = '#FF6B35';
    if (tabBtn) tabBtn.style.color = 'white';
    if (dishesBtn) { dishesBtn.style.background = '#f0f0f0'; dishesBtn.style.color = '#333'; }

    let orders = [];
    if (token) {
        const res = await api('/order/all');
        if (res.success && Array.isArray(res.data)) {
            orders = res.data;
            adminOrdersCache = orders;
        }
    }

    if (orders.length === 0) {
        content.innerHTML = '<div style="text-align:center;padding:40px;color:#999;"><i class="fas fa-box-open" style="font-size:3rem;margin-bottom:15px;"></i><p>No orders received yet.</p></div>';
        return;
    }

    content.innerHTML = orders.map(order => {
        const items = order.items || [];
        const itemsHtml = items.map(i => `
            <div style="display:flex;align-items:center;gap:10px;padding:4px 0;">
                ${i.image ? `<img src="${i.image}" alt="${i.name}" style="width:35px;height:35px;border-radius:6px;object-fit:cover;">` : ''}
                <span style="flex:1;font-size:0.85rem;">${i.name} × ${i.qty || i.quantity || 1}</span>
                <span style="font-weight:600;color:#FF6B35;font-size:0.85rem;">₹${(i.price || 0) * (i.qty || i.quantity || 1)}</span>
            </div>
        `).join('');

        const addr = order.address || {};
        const nextStatus = getNextStatus(order.status);
        const statusBtn = nextStatus ? 
            `<button onclick="updateOrderStatusAdmin('${order.orderId}','${nextStatus}')" style="background:#FF6B35;color:white;border:none;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:0.8rem;font-weight:600;">→ ${nextStatus}</button>` :
            '<span style="font-size:0.8rem;color:#10b981;"><i class="fas fa-check-circle"></i> Completed</span>';

        return `
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #eee;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                <div>
                    <strong style="font-size:0.95rem;">Order #${order.orderId}</strong>
                    <span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:20px;font-size:0.7rem;font-weight:600;background:${statusColor(order.status).bg};color:${statusColor(order.status).color};">${order.status}</span>
                </div>
                <span style="font-size:0.75rem;color:#999;">${new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div style="font-size:0.8rem;color:#666;margin-bottom:6px;">
                <strong>Customer:</strong> ${order.customerName || 'Unknown'} 
                <span style="margin-left:10px;"><strong>Email:</strong> ${order.customerEmail || 'N/A'}</span>
                <span style="margin-left:10px;"><strong>Mobile:</strong> ${addr.mobile || 'N/A'}</span>
            </div>
            <div style="font-size:0.8rem;color:#666;margin-bottom:8px;">
                <strong>Address:</strong> ${addr.fullName || ''}, ${addr.address || ''}, ${addr.pincode || ''}
            </div>
            ${itemsHtml}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:8px;border-top:1px solid #ddd;">
                <div>
                    <span style="font-weight:700;color:#FF6B35;">₹${order.totalPrice}</span>
                    <span style="font-size:0.75rem;color:#999;margin-left:8px;text-transform:capitalize;">(${order.paymentMethod || 'COD'})</span>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
                    <button onclick="copyOrderById('${order.orderId}')" style="background:#e0e7ff;color:#4f46e5;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:600;" title="Copy"><i class="fas fa-copy"></i></button>
                    <button onclick="shareOrderWhatsApp('${order.orderId}')" style="background:#d1fae5;color:#059669;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:600;" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
                    ${order.status === 'Out for Delivery' ? `<button onclick="openOTPModal('${order.orderId}')" style="background:#10b981;color:white;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;font-size:0.75rem;font-weight:600;"><i class="fas fa-key"></i></button>` : ''}
                    ${statusBtn}
                </div>
            </div>
        </div>`;
    }).join('');
}

async function renderAdminDishes() {
    const content = $('adminTabContent');
    if (!content) return;

    const tabBtn = $('adminTabOrders');
    const dishesBtn = $('adminTabDishes');
    if (tabBtn) { tabBtn.style.background = '#f0f0f0'; tabBtn.style.color = '#333'; }
    if (dishesBtn) { dishesBtn.style.background = '#FF6B35'; dishesBtn.style.color = 'white'; }

    // Add dish form + existing dishes list
    let dishesHtml = `
        <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #eee;">
            <h3 style="margin-bottom:15px;">➕ Add New Dish</h3>
            <form id="addDishForm" onsubmit="event.preventDefault(); addNewDish();">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Dish Name *</label>
                        <input type="text" id="dishName" placeholder="e.g. Butter Chicken" required style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Price (₹) *</label>
                        <input type="number" id="dishPrice" placeholder="e.g. 299" min="1" required style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Category</label>
                        <select id="dishCategory" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                            <option value="pizza">Pizza</option>
                            <option value="burger">Burger</option>
                            <option value="biryani">Biryani</option>
                            <option value="chinese">Chinese</option>
                            <option value="desserts">Desserts</option>
                            <option value="drinks">Drinks</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label style="font-size:0.85rem;font-weight:500;">Image URL</label>
                        <input type="text" id="dishImage" placeholder="https://... image link" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;">
                    </div>
                </div>
                <div class="form-group" style="margin-top:12px;">
                    <label style="font-size:0.85rem;font-weight:500;">Description</label>
                    <textarea id="dishDesc" placeholder="Brief description of the dish" style="width:100%;padding:10px 14px;border:2px solid #eee;border-radius:8px;font-size:0.9rem;min-height:50px;" rows="2"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block" style="margin-top:10px;">
                    <i class="fas fa-plus"></i> Add Dish
                </button>
            </form>
        </div>
        <h3 style="margin-bottom:15px;">📋 Your Dishes (${FOODS.length})</h3>
    `;

    if (FOODS.length === 0) {
        dishesHtml += '<div style="text-align:center;padding:30px;color:#999;">No dishes added. Use the form above to add your first dish!</div>';
    } else {
        dishesHtml += '<div style="max-height:50vh;overflow-y:auto;">';
        FOODS.forEach(f => {
            dishesHtml += `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;margin-bottom:8px;background:#f9fafb;border-radius:8px;border:1px solid #eee;">
                <img src="${f.image}" alt="${f.name}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;">
                <div style="flex:1;">
                    <strong style="font-size:0.9rem;">${f.name}</strong>
                    <span style="display:block;font-size:0.8rem;color:#999;">${f.category} • ₹${f.price}</span>
                </div>
                <button onclick="editDish('${f._id}')" style="background:#dbeafe;color:#2563eb;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;margin-right:4px;"><i class="fas fa-edit"></i></button>
                <button onclick="deleteDish('${f._id}')" style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:0.8rem;"><i class="fas fa-trash"></i></button>
            </div>`;
        });
        dishesHtml += '</div>';
    }

    content.innerHTML = dishesHtml;
}

async function addNewDish() {
    const name = $('dishName')?.value.trim();
    const price = $('dishPrice')?.value.trim();
    const category = $('dishCategory')?.value;
    const image = $('dishImage')?.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80';
    const description = $('dishDesc')?.value.trim() || '';

    if (!name || !price) {
        showToast('Please enter dish name and price', 'error');
        return;
    }

    showToast('Adding dish...', 'info');
    const res = await api('/foods', {
        method: 'POST',
        body: JSON.stringify({ name, price: Number(price), category, image, description })
    });

    if (res.success) {
        showToast(`"${name}" added successfully! 🎉`, 'success');
        // Reload foods and refresh
        await loadBackendFoods();
        renderMenu();
        await renderAdminDishes();
        // Clear form
        $('dishName').value = '';
        $('dishPrice').value = '';
        $('dishImage').value = '';
        $('dishDesc').value = '';
    } else {
        showToast(res.message || 'Could not add dish', 'error');
    }
}

async function deleteDish(foodId) {
    if (!confirm('Delete this dish?')) return;
    
    const res = await api(`/foods/${foodId}`, { method: 'DELETE' });
    if (res.success) {
        showToast('Dish deleted!', 'success');
        await loadBackendFoods();
        renderMenu();
        await renderAdminDishes();
    } else {
        showToast(res.message || 'Could not delete', 'error');
    }
}

async function editDish(foodId) {
    const food = FOODS.find(f => f._id === foodId);
    if (!food) { showToast('Dish not found', 'error'); return; }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'editDishOverlay';
    overlay.innerHTML = `
        <div class="modal" style="max-width:500px;">
            <button class="modal-close" onclick="document.getElementById('editDishOverlay').remove();document.body.classList.remove('no-scroll');">&times;</button>
            <div class="modal-header"><i class="fas fa-edit"></i><h2>Edit Dish</h2><p>Update dish details</p></div>
            <div style="padding:0 0 20px;">
                <form id="editDishForm" onsubmit="event.preventDefault(); saveEditDish('${food._id}');">
                    <div class="form-group">
                        <label>Dish Name *</label>
                        <input type="text" id="editDishName" value="${food.name}" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <div class="form-group">
                        <label>Price (₹) *</label>
                        <input type="number" id="editDishPrice" value="${food.price}" min="1" required style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="editDishCategory" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                            <option value="pizza" ${food.category === 'pizza' ? 'selected' : ''}>Pizza</option>
                            <option value="burger" ${food.category === 'burger' ? 'selected' : ''}>Burger</option>
                            <option value="biryani" ${food.category === 'biryani' ? 'selected' : ''}>Biryani</option>
                            <option value="chinese" ${food.category === 'chinese' ? 'selected' : ''}>Chinese</option>
                            <option value="desserts" ${food.category === 'desserts' ? 'selected' : ''}>Desserts</option>
                            <option value="drinks" ${food.category === 'drinks' ? 'selected' : ''}>Drinks</option>
                            <option value="other" ${food.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Image URL</label>
                        <input type="text" id="editDishImage" value="${food.image || ''}" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="editDishDesc" rows="2" style="width:100%;padding:12px 16px;border:2px solid #eee;border-radius:8px;font-size:0.95rem;"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg btn-block">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');
}

async function saveEditDish(foodId) {
    const name = $('editDishName')?.value.trim();
    const price = $('editDishPrice')?.value.trim();
    const category = $('editDishCategory')?.value;
    const image = $('editDishImage')?.value.trim();
    const description = $('editDishDesc')?.value.trim() || '';

    if (!name || !price) {
        showToast('Please enter dish name and price', 'error');
        return;
    }

    showToast('Updating dish...', 'info');
    const res = await api(`/foods/${foodId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, price: Number(price), category, image, description })
    });

    if (res.success) {
        showToast(`"${name}" updated successfully! 🎉`, 'success');
        document.getElementById('editDishOverlay')?.remove();
        document.body.classList.remove('no-scroll');
        await loadBackendFoods();
        renderMenu();
        await renderAdminDishes();
    } else {
        showToast(res.message || 'Could not update dish', 'error');
    }
}

function getNextStatus(currentStatus) {
    const flow = {
        'Confirmed': 'Preparing',
        'Preparing': 'Out for Delivery',
        'Out for Delivery': null,
        'Delivered': null
    };
    return flow[currentStatus] || null;
}

async function updateOrderStatusAdmin(orderId, newStatus) {
    if (!confirm(`Change order ${orderId} status to "${newStatus}"?`)) return;

    if (token) {
        showToast('Updating status...', 'info');
        const res = await api(`/order/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        if (res.success) {
            showToast(`Order ${orderId}: Status updated to "${newStatus}"`, 'success');
            if (newStatus === 'Out for Delivery' && res.data && res.data.otp) {
                showToast(`🔑 OTP for delivery: ${res.data.otp}`, 'info');
            }
            await renderAdminOrders();
            return;
        } else {
            showToast(res.message || 'Could not update status', 'error');
            return;
        }
    }
    showToast('Please start backend server to manage orders', 'error');
}

// ====== OTP VERIFICATION ======
function openOTPModal(orderId) {
    $('otpOrderId').value = orderId;
    $('otpInput').value = '';
    closeModal('adminModal');
    openModal('otpModal');
    setTimeout(() => $('otpInput')?.focus(), 300);
}

async function verifyOTP() {
    const orderId = $('otpOrderId').value;
    const otp = $('otpInput')?.value.trim();
    if (!orderId || !otp) {
        showToast('Please enter the OTP', 'error');
        return;
    }

    showToast('Verifying OTP...', 'info');
    const res = await api(`/order/${orderId}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ otp })
    });

    if (res.success) {
        showToast('✅ Delivery confirmed! Order completed.', 'success');
        closeModal('otpModal');
        openAdminPanel();
    } else {
        showToast(res.message || 'Invalid OTP. Try again.', 'error');
    }
}

// ====== ORDER TRACKING ======
async function trackOrder() {
    const input = $('orderId');
    const id = input?.value.trim().toUpperCase();
    if (!id) { showToast('Please enter an Order ID', 'error'); return; }

    const steps = $$('.track-step');
    const bar = $('progressBar');
    const msg = $('trackingMsg');
    const applyStatus = (status, foundMessage = null) => {
        const statusMap = { 'Pending': 1, 'Confirmed': 1, 'Preparing': 2, 'Out for Delivery': 3, 'Delivered': 4 };
        const step = statusMap[status] || 1;
        steps.forEach((s, i) => { i < step ? s.classList.add('active') : s.classList.remove('active'); });
        if (bar) bar.style.width = ((step - 1) / 3 * 100) + '%';
        if (msg) msg.textContent = foundMessage || `Order ${id}: ${status}`;
    };

    // Try backend first, then localStorage
    const backend = await api(`/order/track/${id}`);
    if (backend.success) {
        applyStatus(backend.data.status);
        showToast(`Order found! Status: ${backend.data.status}`, 'success');
        return;
    }

    const orders = JSON.parse(localStorage.getItem('fh_orders') || '[]');
    const order = orders.find(o => o.id === id);
    if (order) {
        applyStatus(order.status);
        showToast(`Order found! Status: ${order.status}`, 'success');
    } else {
        showToast('Order not found. Please check the Order ID.', 'error');
    }
}

// ====== PRELOADER ======
window.addEventListener('load', () => {
    setTimeout(() => {
        const p = $('preloader');
        if (p) { p.classList.add('hidden'); document.body.classList.remove('no-scroll'); }
    }, 1500);
    document.body.classList.add('no-scroll');
});

// ====== HEADER SCROLL ======
window.addEventListener('scroll', () => {
    const header = $('header');
    const topBtn = $('backToTop');
    if (header) { window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled'); }
    if (topBtn) { window.scrollY > 500 ? topBtn.classList.add('show') : topBtn.classList.remove('show'); }
});

$('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ====== HAMBURGER ======
$('hamburger')?.addEventListener('click', () => {
    $('hamburger')?.classList.toggle('active');
    $('navMenu')?.classList.toggle('show');
    document.body.classList.toggle('no-scroll');
});

$$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        $('hamburger')?.classList.remove('active');
        $('navMenu')?.classList.remove('show');
        document.body.classList.remove('no-scroll');
    });
});

// ====== THEME, MODALS, AUTH ======
const savedTheme = localStorage.getItem('fh_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
const themeBtn = $('themeToggle');
if (themeBtn) {
    themeBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('fh_theme', next);
        themeBtn.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

// Modal events
document.getElementById('loginModalClose')?.addEventListener('click', () => closeModal('loginModal'));
document.getElementById('loginModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('loginModal')) closeModal('loginModal'); });
document.getElementById('switchToSignup')?.addEventListener('click', (e) => { e.preventDefault(); closeModal('loginModal'); setTimeout(() => openModal('signupModal'), 200); });

document.getElementById('signupModalClose')?.addEventListener('click', () => closeModal('signupModal'));
document.getElementById('signupModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('signupModal')) closeModal('signupModal'); });
document.getElementById('switchToLogin')?.addEventListener('click', (e) => { e.preventDefault(); closeModal('signupModal'); setTimeout(() => openModal('loginModal'), 200); });

document.getElementById('cartModalClose')?.addEventListener('click', () => closeModal('cartModal'));
document.getElementById('cartModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('cartModal')) closeModal('cartModal'); });

document.getElementById('ordersModalClose')?.addEventListener('click', () => closeModal('ordersModal'));
document.getElementById('ordersModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('ordersModal')) closeModal('ordersModal'); });

document.getElementById('adminModalClose')?.addEventListener('click', () => closeModal('adminModal'));
document.getElementById('adminModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('adminModal')) closeModal('adminModal'); });

document.getElementById('sellerDashboardClose')?.addEventListener('click', () => closeModal('sellerDashboardModal'));
document.getElementById('sellerDashboardModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('sellerDashboardModal')) closeModal('sellerDashboardModal'); });

document.getElementById('otpModalClose')?.addEventListener('click', () => closeModal('otpModal'));
document.getElementById('otpModal')?.addEventListener('click', (e) => { if (e.target === document.getElementById('otpModal')) closeModal('otpModal'); });

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        ['loginModal', 'signupModal', 'cartModal', 'ordersModal', 'adminModal', 'sellerDashboardModal', 'otpModal'].forEach(id => closeModal(id));
        document.getElementById('hamburger')?.classList.remove('active');
        document.getElementById('navMenu')?.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }
});

// ====== LOGIN FORM ======
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) { showToast('Please fill all fields', 'error'); return; }

    showToast('Logging in...', 'info');
    const res = await api('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.success) {
        loggedInUser = res.data.user;
        token = res.data.token;
        localStorage.setItem('fh_user', JSON.stringify(loggedInUser));
        localStorage.setItem('fh_token', token);
        showToast('Login successful! Welcome back.');
        closeModal('loginModal');
        await loadBackendCart();
        updateAuthUI();
        document.getElementById('loginForm').reset();
        return;
    }

    const users = JSON.parse(localStorage.getItem('fh_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
        loggedInUser = found;
        localStorage.setItem('fh_user', JSON.stringify(found));
        showToast('Login successful! (local)');
        closeModal('loginModal');
        updateAuthUI();
    } else {
        showToast('Invalid email or password', 'error');
    }
});

// ====== SIGNUP FORM ======
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirm = document.getElementById('signupConfirm').value.trim();
    if (!name || !email || !password || !confirm) { showToast('Please fill all fields', 'error'); return; }
    if (password.length < 6) { showToast('Password must be 6+ characters', 'error'); return; }
    if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }

    showToast('Creating account...', 'info');
    const res = await api('/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    if (res.success) {
        loggedInUser = res.data.user;
        token = res.data.token;
        localStorage.setItem('fh_user', JSON.stringify(loggedInUser));
        localStorage.setItem('fh_token', token);
        showToast('Account created! Welcome to FoodieHub! 🎉');
        closeModal('signupModal');
        await loadBackendCart();
        updateAuthUI();
        document.getElementById('signupForm').reset();
        return;
    }

    const users = JSON.parse(localStorage.getItem('fh_users') || '[]');
    if (users.find(u => u.email === email)) { showToast('Email already registered', 'error'); return; }
    const newUser = { _id: Date.now().toString(36), name, email, password };
    users.push(newUser);
    localStorage.setItem('fh_users', JSON.stringify(users));
    loggedInUser = newUser;
    localStorage.setItem('fh_user', JSON.stringify(newUser));
    showToast('Account created! (local) 🎉');
    closeModal('signupModal');
    updateAuthUI();
    document.getElementById('signupForm').reset();
});

// ====== CONTACT FORM ======
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We\'ll get back to you soon.', 'success');
    document.getElementById('contactForm').reset();
});

document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Subscribed! Check your email for updates.', 'success');
    document.getElementById('newsletterForm').reset();
});

// ====== COUNTER ANIMATION ======
function animateCounters() {
    $$('.num').forEach(num => {
        const target = parseInt(num.dataset.target);
        if (!target) return;
        let current = 0;
        const step = Math.ceil(target / 120);
        const update = () => {
            current += step;
            if (current < target) { num.textContent = current; requestAnimationFrame(update); }
            else num.textContent = target;
        };
        update();
    });
}

const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounters(); counterObs.unobserve(e.target); } });
}, { threshold: 0.5 });
const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) counterObs.observe(statsGrid);

// ====== SCROLL REVEAL ======
function initScrollReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
}

// ====== NAV ACTIVE LINK ======
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 150;
    sections.forEach(s => {
        const id = s.getAttribute('id');
        const top = s.offsetTop, height = s.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
            $$('.nav-link').forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === `#${id}`) l.classList.add('active'); });
        }
    });
}
window.addEventListener('scroll', updateActiveNav);

$$('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = link.getAttribute('href');
        if (target?.startsWith('#')) {
            const el = document.querySelector(target);
            if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        }
    });
});

// ====== COUNTDOWN ======
function updateCountdown() {
    const el = document.getElementById('offerCountdown');
    if (!el) return;
    const now = new Date();
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    const diff = end - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `Offer ends in ${h}h ${m}m ${s}s`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ====== SEARCH ======
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.menu-card');
    cards.forEach(c => {
        const text = c.textContent.toLowerCase();
        c.style.display = text.includes(q) ? 'block' : 'none';
    });
});

// ====== INIT ======
async function initApp() {
    try {
        await loadBackendFoods();
        if (loggedInUser && token) await loadBackendCart();
    } catch (e) {
        console.warn('Backend fetch warning:', e);
    }
    renderMenu();
    initScrollReveal();
    updateAuthUI();
    updateSellerUI();
}

initApp();

console.log('%c🍕 FoodieHub', 'font-size:20px;font-weight:bold;color:#FF6B35;');
console.log('%cBuilt by Bhumi Kumari | BCA Student', 'color:#666;');
console.log('%c🔌 Backend: ' + API_URL, 'color:#3b82f6;');