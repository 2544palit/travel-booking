// Litrip App - Main Router & Utilities

// --- SPA Router ---
const safeParse = (key, defaultVal) => {
  const val = localStorage.getItem(key);
  if (!val || val === 'undefined') return defaultVal;
  try { return JSON.parse(val); } catch (e) { return defaultVal; }
};

const rawToken = localStorage.getItem('litrip_token');

const APP_STATE = {
  currentPage: 'landing',
  user: safeParse('litrip_user', null),
  token: (rawToken && rawToken !== 'undefined') ? rawToken : null,
  cart: safeParse('litrip_cart', []),
  currentBookingId: localStorage.getItem('litrip_booking_id') || null
};

async function navigateTo(page) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) { window.location.href = page === 'landing' ? '/' : `/pages/${page}.html`; return; }

  try {
    const url = page === 'landing' ? '/' : `/pages/${page}.html`;
    window.location.href = url;
  } catch (e) {
    console.error('Navigation error:', e);
  }
}

function saveUser(user, token) {
  APP_STATE.user = user;
  APP_STATE.token = token;
  localStorage.setItem('litrip_user', JSON.stringify(user));
  localStorage.setItem('litrip_token', token);
}

function logout() {
  APP_STATE.user = null;
  APP_STATE.token = null;
  APP_STATE.cart = [];
  localStorage.removeItem('litrip_user');
  localStorage.removeItem('litrip_token');
  localStorage.removeItem('litrip_cart');
  localStorage.removeItem('litrip_booking_id');
  navigateTo('landing');
}

function getUser() { return APP_STATE.user; }
function getToken() { return APP_STATE.token; }
function isLoggedIn() { return APP_STATE.user !== null; }

// --- Cart Management ---
function addToCart(item) {
  APP_STATE.cart.push(item);
  localStorage.setItem('litrip_cart', JSON.stringify(APP_STATE.cart));
  updateCartBadge();
  showToast(`เพิ่ม ${item.details?.flightNo || item.details?.hotelName || 'รายการ'} ลงตะกร้าแล้ว`);
}

function removeFromCart(itemId) {
  APP_STATE.cart = APP_STATE.cart.filter(i => i.itemId !== itemId);
  localStorage.setItem('litrip_cart', JSON.stringify(APP_STATE.cart));
  updateCartBadge();
}

function getCart() {
  APP_STATE.cart = safeParse('litrip_cart', []);
  return APP_STATE.cart;
}

function clearCart() {
  APP_STATE.cart = [];
  localStorage.setItem('litrip_cart', JSON.stringify([]));
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.totalPrice || 0), 0);
}

function updateCartBadge() {
  const cart = getCart();
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = cart.length;
    b.style.display = cart.length > 0 ? 'flex' : 'none';
  });
}

function setCurrentBookingId(id) {
  APP_STATE.currentBookingId = id;
  localStorage.setItem('litrip_booking_id', id);
}
function getCurrentBookingId() { return APP_STATE.currentBookingId; }

// --- Toast Notification ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-primary';
  toast.className = `fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-xl shadow-2xl z-[9999] text-sm flex items-center gap-2 transition-all duration-300 transform translate-y-0 opacity-100`;
  toast.innerHTML = `<span class="material-symbols-outlined text-[18px]">${type === 'error' ? 'error' : 'check_circle'}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// --- Format Helpers ---
function formatPrice(amount) {
  return '฿' + Math.round(Number(amount)).toLocaleString('th-TH');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  const loginBtns = document.querySelectorAll('.auth-buttons');
  const profileArea = document.querySelectorAll('.profile-area');
  if (isLoggedIn()) {
    loginBtns.forEach(el => el.style.display = 'none');
    profileArea.forEach(el => {
      el.style.display = 'flex';
      const nameEl = el.querySelector('.profile-name');
      const tierEl = el.querySelector('.profile-tier');
      if (nameEl) nameEl.textContent = APP_STATE.user.name;
      
      const isVip = APP_STATE.user.isVip || localStorage.getItem('litrip_vip') === 'true';
      if (tierEl) {
        if (isVip) {
            tierEl.innerHTML = '<span class="material-symbols-outlined text-[12px] inline-block align-middle mr-0.5">workspace_premium</span>VIP Member';
            tierEl.className = 'profile-tier text-xs text-orange-600 font-bold';
        } else {
            tierEl.textContent = APP_STATE.user.tier || 'Member';
            tierEl.className = 'profile-tier text-xs text-tertiary';
        }
      }
    });
  }
});


// --- VIP Management ---
function isUserVip() {
    return isLoggedIn() && (APP_STATE.user.isVip || localStorage.getItem('litrip_vip') === 'true');
}

function openVipModal() {
    if(!isLoggedIn()) {
        showToast('กรุณาเข้าสู่ระบบก่อนสมัคร VIP', 'warning');
        setTimeout(() => navigateTo('login'), 1500);
        return;
    }
    const modal = document.getElementById('vip-modal');
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('div').classList.remove('scale-95', 'translate-y-4');
        }, 10);
    }
}

function closeVipModal() {
    const modal = document.getElementById('vip-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.add('scale-95', 'translate-y-4');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function updateVipPlanUI(radio) {
    const radios = document.querySelectorAll('input[name="vip-plan"]');
    radios.forEach(r => {
        const div = r.nextElementSibling;
        const innerCircle = div.querySelector('.bg-orange-500');
        if (r.checked) {
            div.classList.replace('border-gray-200', 'border-orange-500');
            div.classList.add('bg-orange-50/30');
            div.querySelector('.w-5').classList.replace('border-gray-300', 'border-orange-500');
            innerCircle.classList.replace('opacity-0', 'opacity-100');
        } else {
            div.classList.replace('border-orange-500', 'border-gray-200');
            div.classList.remove('bg-orange-50/30');
            div.querySelector('.w-5').classList.replace('border-orange-500', 'border-gray-300');
            innerCircle.classList.replace('opacity-100', 'opacity-0');
        }
    });
}

async function subscribeVip() {
    if(!isLoggedIn()) {
        showToast('กรุณาเข้าสู่ระบบก่อนสมัคร VIP', 'warning');
        setTimeout(() => navigateTo('login'), 1500);
        return;
    }
    
    const btn = document.getElementById('vip-subscribe-btn');
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">autorenew</span> กำลังดำเนินการ...';
    btn.disabled = true;

    try {
        const selectedPlan = document.querySelector('input[name="vip-plan"]:checked').value;
        const price = selectedPlan === 'annual' ? 599 : 99;
        const planName = selectedPlan === 'annual' ? 'Litrip VIP Annual Pass (รายปี)' : 'Litrip VIP Monthly Pass (รายเดือน)';
        const planDesc = selectedPlan === 'annual' ? 'สิทธิพิเศษปลดล็อคทันทีตลอด 365 วัน' : 'สิทธิพิเศษปลดล็อคทันทีตลอด 30 วัน';
        
        const user = getUser();
        const vipItem = {
            itemId: 'vip_' + Date.now(),
            type: 'vip',
            basePrice: price,
            quantity: 1,
            plan: selectedPlan,
            title: planName
        };
        
        const payload = {
            travelerId: user.id,
            travelerEmail: user.email,
            items: [vipItem],
            promoCode: null
        };
        
        const bookingRes = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json());
        
        if (!bookingRes.success) throw new Error(bookingRes.error || 'Failed to create VIP booking');
        
        closeVipModal();
        localStorage.setItem('litrip_booking_id', bookingRes.data.bookingId);
        navigateTo('checkout');
        
    } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการสร้างรายการชำระเงิน', 'error');
        btn.innerHTML = 'สมัครสมาชิก VIP ตอนนี้ <span class="material-symbols-outlined text-[18px]">arrow_forward</span>';
        btn.disabled = false;
    }
}

// Inject VIP Modal HTML globally
document.addEventListener('DOMContentLoaded', () => {
  const navs = document.querySelectorAll('nav');
  navs.forEach(nav => {
      // Avoid duplicate VIP buttons
      if(nav.querySelector('.vip-nav-btn')) return;
      const a = document.createElement('a');
      a.href = "#";
      a.className = "vip-nav-btn flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 hover:from-orange-200 hover:to-yellow-200 font-bold rounded-full transition shadow-sm border border-orange-200";
      a.onclick = (e) => { e.preventDefault(); openVipModal(); };
      a.innerHTML = `<span class="material-symbols-outlined text-[16px]">workspace_premium</span> Litrip VIP`;
      nav.appendChild(a);
  });

  if (!document.getElementById('vip-modal')) {
      const modalHtml = `
      <div id="vip-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden flex items-center justify-center opacity-0 transition-opacity duration-300">
        <div class="bg-white w-[90%] max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform scale-95 translate-y-4 transition-all duration-300 relative">
          <div class="bg-gradient-to-r from-blue-900 to-blue-950 p-6 text-white text-center relative">
            <button onclick="closeVipModal()" class="absolute top-4 right-4 text-white/70 hover:text-white"><span class="material-symbols-outlined">close</span></button>
            <div class="w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full mx-auto flex items-center justify-center mb-3 shadow-lg border-2 border-white/20">
                <span class="material-symbols-outlined text-3xl text-white">workspace_premium</span>
            </div>
            <h2 class="text-2xl font-bold font-display drop-shadow-md">Litrip VIP Club</h2>
            <p class="text-blue-200 text-sm mt-1">ยกระดับทุกการเดินทางของคุณให้คุ้มค่าและพรีเมียมกว่าที่เคย</p>
          </div>
          
          <div class="p-6">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2"><span class="material-symbols-outlined text-orange-500 text-[20px]">stars</span> สิทธิพิเศษสำหรับสมาชิก VIP เท่านั้น</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">health_and_safety</span></div>
                    <div><h4 class="font-bold text-sm text-gray-800">ฟรี! ประกันการเดินทาง</h4><p class="text-xs text-gray-500 mt-0.5">คุ้มครองอุบัติเหตุ, เที่ยวบินดีเลย์ และกระเป๋าสูญหายตลอดทริป</p></div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">luggage</span></div>
                    <div><h4 class="font-bold text-sm text-gray-800">ฟรี! น้ำหนักกระเป๋า</h4><p class="text-xs text-gray-500 mt-0.5">รับสิทธิ์โหลดกระเป๋าเพิ่ม +15 กก. ทุกเที่ยวบินไม่มีค่าใช้จ่าย</p></div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">restaurant</span></div>
                    <div><h4 class="font-bold text-sm text-gray-800">ฟรี! บุฟเฟต์อาหารเช้า</h4><p class="text-xs text-gray-500 mt-0.5">รับอาหารเช้าฟรีทุกวันสำหรับการจองโรงแรมที่ร่วมรายการ</p></div>
                </div>
                <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[16px]">local_offer</span></div>
                    <div><h4 class="font-bold text-sm text-gray-800">ส่วนลด On-top 5%</h4><p class="text-xs text-gray-500 mt-0.5">ประหยัดทันทีเพิ่มอีก 5% สำหรับทุกแพ็คเกจดีลและที่พัก</p></div>
                </div>
            </div>
            
            <div class="space-y-3">
                <h4 class="font-bold text-sm text-gray-800">เลือกแพ็กเกจสมาชิกของคุณ:</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label class="cursor-pointer relative">
                        <input type="radio" name="vip-plan" value="monthly" class="peer sr-only" onchange="updateVipPlanUI(this)">
                        <div class="h-full rounded-xl border-2 border-gray-200 p-4 hover:border-orange-200 transition-colors peer-checked:border-orange-500 peer-checked:bg-orange-50/30">
                            <h5 class="font-bold text-gray-800">รายเดือน</h5>
                            <p class="text-[11px] text-gray-500 mt-1 mb-3">เหมาะสำหรับเดินทางทริปเดียว</p>
                            <p class="text-xl font-bold text-primary mt-auto">฿99 <span class="text-[10px] font-normal text-gray-500">/ เดือน</span></p>
                            <div class="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-orange-500 flex items-center justify-center">
                                <div class="w-2.5 h-2.5 rounded-full bg-orange-500 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </label>
                    
                    <label class="cursor-pointer relative">
                        <input type="radio" name="vip-plan" value="annual" class="peer sr-only" checked onchange="updateVipPlanUI(this)">
                        <div class="h-full rounded-xl border-2 border-orange-500 bg-orange-50/30 p-4 hover:border-orange-600 transition-colors">
                            <span class="absolute -top-2.5 left-4 bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">คุ้มค่าที่สุด (ประหยัด 50%)</span>
                            <h5 class="font-bold text-gray-800">รายปี (Annual Pass)</h5>
                            <p class="text-[11px] text-gray-500 mt-1 mb-3">คุ้มครองและใช้สิทธิ์ฟรีตลอด 365 วัน</p>
                            <p class="text-xl font-bold text-primary mt-auto">฿599 <span class="text-[10px] font-normal text-gray-500">/ ปี</span></p>
                            <div class="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-orange-500 flex items-center justify-center">
                                <div class="w-2.5 h-2.5 rounded-full bg-orange-500 opacity-100"></div>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
          </div>
          
          <div class="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button onclick="closeVipModal()" class="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">ไว้ทีหลัง</button>
            <button id="vip-subscribe-btn" onclick="subscribeVip()" class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl shadow-md hover:from-orange-600 hover:to-yellow-600 transition flex items-center justify-center gap-2">
                สมัครสมาชิก VIP ตอนนี้ <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>`;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
});

// --- Notifications System ---

// Initialize default notifications if empty
function getStoredNotifications() {
    const stored = localStorage.getItem('litrip_notifications');
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Default welcome notification
    const defaults = [{
        id: 'notif_welcome',
        type: 'promo',
        icon: 'campaign',
        iconBg: 'bg-blue-50 text-blue-600',
        title: '🎉 ยินดีต้อนรับสู่ Litrip',
        desc: 'เริ่มต้นการเดินทางสุดพิเศษของคุณได้แล้ววันนี้ พร้อมรับสิทธิพิเศษมากมาย',
        time: 'ล่าสุด',
        actionPath: 'landing',
        read: false
    }];
    localStorage.setItem('litrip_notifications', JSON.stringify(defaults));
    return defaults;
}

window.addNotification = function(notif) {
    const notifs = getStoredNotifications();
    const newNotif = {
        id: 'notif_' + Date.now(),
        type: notif.type || 'system',
        icon: notif.icon || 'notifications',
        iconBg: notif.iconBg || 'bg-gray-50 text-gray-600',
        title: notif.title || 'การแจ้งเตือนใหม่',
        desc: notif.desc || '',
        time: notif.time || 'เมื่อสักครู่',
        actionPath: notif.actionPath || 'dashboard',
        read: false
    };
    notifs.unshift(newNotif); // Add to top
    // Keep only latest 20 notifications
    if (notifs.length > 20) notifs.pop();
    
    localStorage.setItem('litrip_notifications', JSON.stringify(notifs));
    renderNotifications();
};

function renderNotifications() {
    const notifList = document.getElementById('notif-list');
    const countBadge = document.getElementById('notif-count');
    const redDot = document.getElementById('notif-badge');
    
    if (!notifList) return;
    
    let notifs = getStoredNotifications();
    let unreadCount = notifs.filter(n => !n.read).length;

    notifList.innerHTML = '';
    
    if (notifs.length === 0) {
        notifList.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">ไม่มีการแจ้งเตือน</div>';
    } else {
        notifs.forEach(n => {
            const item = document.createElement('div');
            // Gray out background if read
            const bgClass = n.read ? 'bg-transparent opacity-70' : 'bg-white hover:bg-gray-50';
            item.className = `p-4 border-b border-gray-100/50 cursor-pointer transition-colors flex gap-4 group ${bgClass}`;
            item.onclick = (e) => {
                e.stopPropagation();
                
                // Mark this single item as read
                if (!n.read) {
                    n.read = true;
                    localStorage.setItem('litrip_notifications', JSON.stringify(notifs));
                    renderNotifications();
                }
                
                if (n.actionPath === 'vip') {
                    if (typeof openVipModal === 'function') openVipModal();
                } else if (n.actionPath) {
                    navigateTo(n.actionPath);
                }
                toggleNotifications();
            };
            
            item.innerHTML = `
                <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${n.iconBg} group-hover:scale-105 transition-transform mt-0.5">
                    <span class="material-symbols-outlined text-[20px]">${n.icon}</span>
                </div>
                <div class="flex-1 min-w-0 relative">
                    ${!n.read ? '<div class="absolute -left-3 top-1.5 w-1.5 h-1.5 bg-[#fe932c] rounded-full"></div>' : ''}
                    <h4 class="text-[13px] font-bold text-[#001334] mb-1 truncate ${n.read ? 'text-gray-600' : ''}">${n.title}</h4>
                    <p class="text-xs text-gray-500 leading-relaxed line-clamp-2 pr-2">${n.desc}</p>
                    <span class="text-[10px] font-bold text-gray-400 mt-2 block">${n.time}</span>
                </div>
            `;
            notifList.appendChild(item);
        });
    }

    if (countBadge) countBadge.textContent = unreadCount;
    if (redDot) {
        if (unreadCount === 0) redDot.classList.add('hidden');
        else redDot.classList.remove('hidden');
    }
}

function toggleNotifications(e) {
    if(e) e.stopPropagation();
    const dropdown = document.getElementById('notif-dropdown');
    if (!dropdown) return;
    
    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        dropdown.classList.add('flex');
        renderNotifications();
    } else {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('flex');
    }
}

window.markNotifAsRead = function(e) {
    if(e) e.stopPropagation();
    let notifs = getStoredNotifications();
    notifs.forEach(n => n.read = true);
    localStorage.setItem('litrip_notifications', JSON.stringify(notifs));
    renderNotifications();
}

// Global click outside to close dropdown
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notif-dropdown');
    const container = document.getElementById('notification-container');
    if (dropdown && !dropdown.classList.contains('hidden')) {
        if (container && !container.contains(e.target)) {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('flex');
        }
    }
});

// Run render on load delay
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderNotifications, 300);
});
