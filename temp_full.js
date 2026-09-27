

    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#001334',
            secondary: '#fe932c',
            tertiary: '#d97706',
            background: '#f6f7fb',
            surface: '#ffffff',
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            display: ['"Plus Jakarta Sans"', 'sans-serif'],
          }
        }
      }
    }

    // --- SMART HUB LOGIC ---
    window.switchSmartHubTab = function (tab) {
      document.getElementById('smart-hub-ai').classList.add('hidden');
      document.getElementById('smart-hub-explore').classList.add('hidden');
      document.getElementById('smart-hub-saved').classList.add('hidden');

      document.getElementById('tab-btn-ai').className = 'font-medium text-gray-500 hover:text-gray-800 px-2 py-1 transition-all';
      document.getElementById('tab-btn-explore').className = 'font-medium text-gray-500 hover:text-gray-800 px-2 py-1 transition-all';
      document.getElementById('tab-btn-saved').className = 'font-medium text-gray-500 hover:text-gray-800 px-2 py-1 transition-all';

      document.getElementById(`smart-hub-${tab}`).classList.remove('hidden');
      document.getElementById(`tab-btn-${tab}`).className = 'font-bold text-secondary border-b-2 border-secondary px-2 py-1 transition-all';

      if (tab === 'explore') renderExploreTrips();
      if (tab === 'saved') renderSavedTrips();
    };

    window.currentExploreFilter = 'all';

    window.filterExploreTrips = function (category) {
      window.currentExploreFilter = category;

      // Reset all buttons
      document.querySelectorAll('.explore-filter-btn').forEach(btn => {
        btn.className = 'px-4 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full text-sm font-medium whitespace-nowrap transition-colors explore-filter-btn';
      });

      // Set active button
      const activeBtn = document.getElementById('btn-explore-' + category);
      if (activeBtn) {
        activeBtn.className = 'px-4 py-1.5 bg-secondary text-white rounded-full text-sm font-bold whitespace-nowrap shadow-sm explore-filter-btn';
      }

      renderExploreTrips();
    };

    window.renderExploreTrips = function () {
      const isVipUser = (typeof isUserVip === 'function') ? isUserVip() : false;
      const grid = document.getElementById('explore-trips-grid');

      // 1. Get searched destination to make this Location-Aware
      let searchDestCode = null;
      const sdCode = document.getElementById('search-dest-code');
      const sd = document.getElementById('search-dest');
      if (sdCode && sdCode.value) {
        searchDestCode = sdCode.value;
      } else if (sd && sd.value) {
        const match = sd.value.match(/\(([A-Z]{3})\)/i);
        if (match) searchDestCode = match[1].toUpperCase();
      }
      if (!searchDestCode) {
        const urlParams = new URLSearchParams(window.location.search);
        searchDestCode = urlParams.get('dest');
      }

      // Complete catalog of curated trips
      const allTrips = [
            // PMI (Palma de Mallorca)
            { id: 901, city: 'ปัลมาเดมายอร์กา', title: 'Mallorca Luxury Catamaran', tag: 'ลักชัวรี', category: 'luxury', price: 42000, img: 'https://images.unsplash.com/photo-1555881389-1fc5e6b05202?w=400&q=80', destCode: 'PMI', styleCode: 'luxury' },
            { id: 902, city: 'ปัลมาเดมายอร์กา', title: 'Historic Valldemossa & Bellver', tag: 'คู่รัก', category: 'romantic', price: 38500, img: 'https://images.unsplash.com/photo-1547285149-aebba8140e79?w=400&q=80', destCode: 'PMI', styleCode: 'romantic' },

            // PYX (Pattaya)
            { id: 801, city: 'พัทยา', title: 'Pattaya Luxury Yacht & Cafe', tag: 'สายหรู', category: 'luxury', price: 16500, img: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&q=80', destCode: 'PYX', styleCode: 'luxury' },
            { id: 802, city: 'พัทยา', title: 'Aquaverse & Family Retreat', tag: 'ครอบครัว', category: 'family', price: 13500, img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', destCode: 'PYX', styleCode: 'family' },
            { id: 803, city: 'พัทยา', title: 'Romantic Sunset Koh Larn', tag: 'คู่รัก', category: 'romantic', price: 14800, img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&q=80', destCode: 'PYX', styleCode: 'romantic' },

        // KBV (Krabi)
        { id: 101, city: 'กระบี่', title: 'Krabi 4 Islands & Sunset', tag: 'สายทะเล & ดำน้ำ', category: 'nature', price: 15900, img: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=400&q=80', destCode: 'KBV', styleCode: 'adventure' },
        { id: 102, city: 'กระบี่', title: 'Railay Rock Climbing', tag: 'ผจญภัย', category: 'adventure', price: 14500, img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&q=80', destCode: 'KBV', styleCode: 'adventure' },
        { id: 103, city: 'กระบี่', title: 'Emerald Pool & Spa', tag: 'สปา & ผ่อนคลาย', category: 'onsen', price: 18900, img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80', destCode: 'KBV', styleCode: 'luxury' },
        // HKT (Phuket)
        { id: 201, city: 'ภูเก็ต', title: 'Phuket Yacht Sunset', tag: 'ลักชัวรี', category: 'luxury', price: 29000, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80', destCode: 'HKT', styleCode: 'luxury' },
        { id: 202, city: 'ภูเก็ต', title: 'Phi Phi Island Hopping', tag: 'สายทะเล & ดำน้ำ', category: 'nature', price: 19500, img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80', destCode: 'HKT', styleCode: 'adventure' },
        { id: 203, city: 'ภูเก็ต', title: 'Old Phuket Town & Cafe', tag: 'ครอบครัว', category: 'family', price: 12500, img: 'https://images.unsplash.com/photo-1592398501258-356b718914b1?w=400&q=80', destCode: 'HKT', styleCode: 'family' },
        // CNX (Chiang Mai)
        { id: 301, city: 'เชียงใหม่', title: 'Lanna Slow Life', tag: 'มิชลิน & คาเฟ่', category: 'michelin', price: 18900, img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80', destCode: 'CNX', styleCode: 'romantic' },
        { id: 302, city: 'เชียงใหม่', title: 'Doi Inthanon Nature', tag: 'สายภูเขา', category: 'nature', price: 14500, img: 'https://images.unsplash.com/photo-1713361060470-50510cc39729?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', destCode: 'CNX', styleCode: 'adventure' },
        // NRT (Tokyo)
        { id: 401, city: 'โตเกียว', title: 'Tokyo Romantic', tag: 'ไฮไลต์ตามฤดูกาล', category: 'autumn', price: 39900, img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80', destCode: 'NRT', styleCode: 'romantic' },
        { id: 402, city: 'โตเกียว', title: 'Tokyo Michelin Elite', tag: 'ลักชัวรี', category: 'michelin', price: 59000, img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80', destCode: 'NRT', styleCode: 'luxury' },
        // CDG (Paris)
        { id: 501, city: 'ปารีส', title: 'Paris Fashion Elite', tag: 'มิชลิน & คาเฟ่', category: 'michelin', price: 69000, img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&q=80', destCode: 'CDG', styleCode: 'luxury' },
        { id: 502, city: 'ปารีส', title: 'Seine River Romance', tag: 'โรแมนติก', category: 'autumn', price: 75000, img: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&q=80', destCode: 'CDG', styleCode: 'romantic' },
        // ICN (Seoul)
        { id: 601, city: 'โซล', title: 'Seoul Autumn Vibes', tag: 'ไฮไลต์ตามฤดูกาล', category: 'autumn', price: 34500, img: 'https://images.unsplash.com/photo-1538669715315-16fb5758063f?w=400&q=80', destCode: 'ICN', styleCode: 'romantic' },
        { id: 602, city: 'โซล', title: 'K-Pop Fan Tour', tag: 'ครอบครัว', category: 'family', price: 32000, img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80', destCode: 'ICN', styleCode: 'family' },
        // SIN (Singapore)
        { id: 701, city: 'สิงคโปร์', title: 'SG Family Fun', tag: 'ครอบครัว', category: 'family', price: 28500, img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80', destCode: 'SIN', styleCode: 'family' },
        { id: 702, city: 'สิงคโปร์', title: 'Marina Bay VIP', tag: 'ลักชัวรี', category: 'luxury', price: 45000, img: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&q=80', destCode: 'SIN', styleCode: 'luxury' },
        // Default Mix (Original)
        { id: 3, city: 'เกียวโต', title: 'Kyoto Zen Retreat', tag: 'ออนเซ็น & วัฒนธรรม', category: 'onsen', price: 42500, img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80', destCode: 'NRT', styleCode: 'luxury' }
      ];

      // 2. Filter trips dynamically
      let locationTrips = searchDestCode
        ? allTrips.filter(t => t.destCode === searchDestCode)
        : [];

      // Fallback to top highlights if no specific city searched (or no trips for that city)
      let trips = locationTrips.length > 0
        ? locationTrips
        : [allTrips.find(t => t.id === 401), allTrips.find(t => t.id === 501), allTrips.find(t => t.id === 3), allTrips.find(t => t.id === 701), allTrips.find(t => t.id === 601), allTrips.find(t => t.id === 301)].filter(Boolean);

      const filtered = window.currentExploreFilter === 'all'
        ? trips
        : trips.filter(t => t.category === window.currentExploreFilter);

      if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-10 text-center text-gray-500">ไม่พบทริปในหมวดหมู่ที่เลือกสำหรับเมืองนี้</div>`;
        return;
      }

      grid.innerHTML = filtered.map(t => `
            <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden flex flex-col">
                <div class="h-40 bg-gray-200 relative">
                    <img src="${t.img}" class="w-full h-full object-cover">
                    <div class="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-bold">${t.tag}</div>
                </div>
                <div class="p-4 flex flex-col flex-1">
                    <h4 class="font-bold text-gray-800 text-lg">${t.title}</h4>
                    <p class="text-sm text-gray-500 mb-4">${t.city}</p>
                    <div class="mt-auto flex items-end justify-between">
                        <div>
                            ${isVipUser ? `
                            <p class="text-[10px] text-gray-400 line-through">฿${t.price.toLocaleString()}</p>
                            <p class="font-bold text-secondary text-lg flex items-center gap-1">฿${Math.floor(t.price * 0.95).toLocaleString()} <span class="bg-orange-100 text-orange-600 text-[8px] px-1 rounded border border-orange-200 font-bold whitespace-nowrap">VIP</span></p>
                        ` : `
                            <p class="text-[10px] text-gray-400">เริ่มต้น (3D2N)</p>
                            <p class="font-bold text-secondary text-lg">฿${t.price.toLocaleString()}</p>
                        `}
                        </div>
                        <button onclick="loadExploreTrip('${t.destCode}', '${t.styleCode}')" class="text-xs font-bold bg-primary text-white px-3 py-2 rounded-lg hover:bg-blue-900 transition-colors">
                            ดูแผน & จอง
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    window.loadExploreTrip = function (destCode, styleCode) {
      // 1. Switch back to AI custom tab
      switchSmartHubTab('ai');

      // 2. Set the form values
      const destSelect = document.getElementById('smart-dest');
      const dest = destSelect ? destSelect.value : '';
      const styleSelect = document.getElementById('smart-style');
      if (destSelect && destCode) destSelect.value = destCode;
      if (styleSelect && styleCode) styleSelect.value = styleCode;

      // 3. Scroll user up to see the loading state
      document.getElementById('smart-trip-container').scrollIntoView({ behavior: 'smooth', block: 'start' });

      // 4. Trigger generation
      generateSmartTrip();
    };

    window.saveCurrentSmartTrip = function () {
      if (!currentSmartTripData || !currentSmartTripData[selectedSmartTripTier]) return;
      const d = currentSmartTripData[selectedSmartTripTier];
      const destSelect = document.getElementById('smart-dest');
      const destName = destSelect.options[destSelect.selectedIndex].text.replace(/ \(.*\)/, '');

      const tripSummary = {
        id: 'saved-' + Date.now(),
        destName,
        tier: selectedSmartTripTier,
        guests: d.guests,
        nights: d.nights,
        price: d.totals.grandTotal,
        date: new Date().toLocaleDateString('th-TH')
      };

      let saved = JSON.parse(localStorage.getItem('litrip_saved_trips') || '[]');
      saved.push(tripSummary);
      localStorage.setItem('litrip_saved_trips', JSON.stringify(saved));

      showToast('บันทึกทริปสำเร็จ! ดูได้ที่แท็บทริปของฉัน', 'success');
    };

    window.renderSavedTrips = function () {
      const grid = document.getElementById('saved-trips-grid');
      let saved = JSON.parse(localStorage.getItem('litrip_saved_trips') || '[]');

      if (saved.length === 0) {
        grid.innerHTML = `<div class="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                <span class="material-symbols-outlined text-4xl text-gray-300 mb-2">bookmark_border</span>
                <p class="text-gray-500 font-medium">คุณยังไม่มีทริปที่บันทึกไว้</p>
                <button onclick="switchSmartHubTab('ai')" class="mt-4 text-secondary font-bold text-sm hover:underline">เริ่มสร้างทริปแรกของคุณ</button>
            </div>`;
        return;
      }

      grid.innerHTML = saved.map(t => `
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between hover:border-secondary transition-colors">
                <div>
                    <h4 class="font-bold text-gray-800 text-lg">${t.destName} (${t.nights + 1} วัน ${t.nights} คืน)</h4>
                    <p class="text-sm text-gray-500">แพ็กเกจ ${t.tier.toUpperCase()} • สำหรับ ${t.guests} ท่าน • บันทึกเมื่อ ${t.date}</p>
                    <p class="font-bold text-tertiary mt-1">฿${t.price.toLocaleString()}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="deleteSavedTrip('${t.id}')" class="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors" title="ลบ">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <button onclick="switchSmartHubTab('ai')" class="px-4 py-2 bg-secondary text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-secondary/20">
                        จองต่อ
                    </button>
                </div>
            </div>
        `).join('');
    };

    window.deleteSavedTrip = function (id) {
      let saved = JSON.parse(localStorage.getItem('litrip_saved_trips') || '[]');
      saved = saved.filter(t => t.id !== id);
      localStorage.setItem('litrip_saved_trips', JSON.stringify(saved));
      renderSavedTrips();
    };

  




    let currentType = 'flight';
    let allData = { flight: [], hotel: [], package: [], activity: [] };
    let locationData = null;

    document.addEventListener('DOMContentLoaded', async () => {
      await initLocations();
      await executeSearch();
      updateFloatingCart();
    });

    // Handle bfcache (Back/Forward Cache) when returning to this page
    window.addEventListener('pageshow', (event) => {
      // Always re-sync and update the floating cart on page show (even if loaded from cache)
      updateCartBadge();
      updateFloatingCart();
    });


    // ==========================================
    // HYBRID SEARCH SYSTEM (Autocomplete + Groups)
    // ==========================================
    const CITY_DB = [
      { code: 'BKK', rawCity: 'Bangkok', city: 'กรุงเทพฯ', country: 'ไทย', flag: '🇹🇭', group: ' ปลายทางยอดนิยม', keywords: ['bangkok', 'bkk', 'กรุงเทพ'] },
      { code: 'NRT', rawCity: 'Tokyo', city: 'โตเกียว', country: 'ญี่ปุ่น', flag: '🇯🇵', group: ' ปลายทางยอดนิยม', keywords: ['tokyo', 'nrt', 'japan', 'โตเกียว', 'ญี่ปุ่น'] },
      { code: 'SIN', rawCity: 'Singapore', city: 'สิงคโปร์', country: 'สิงคโปร์', flag: '🇸🇬', group: ' ปลายทางยอดนิยม', keywords: ['singapore', 'sin', 'สิงคโปร์'] },
      { code: 'LHR', rawCity: 'London', city: 'ลอนดอน', country: 'อังกฤษ', flag: '🇬🇧', group: ' ปลายทางยอดนิยม', keywords: ['london', 'lhr', 'uk', 'ลอนดอน', 'อังกฤษ'] },
      { code: 'ICN', rawCity: 'Seoul', city: 'โซล', country: 'เกาหลี', flag: '🇰🇷', group: '🇰🇷 เกาหลีใต้', keywords: ['seoul', 'icn', 'korea', 'โซล', 'เกาหลี'] },
      { code: 'CDG', rawCity: 'Paris', city: 'ปารีส', country: 'ฝรั่งเศส', flag: '🇫🇷', group: '🇪🇺 ยุโรป', keywords: ['paris', 'cdg', 'france', 'ปารีส', 'ฝรั่งเศส'] },
      { code: 'SYD', rawCity: 'Sydney', city: 'ซิดนีย์', country: 'ออสเตรเลีย', flag: '🇦🇺', group: '🇦🇺 ออสเตรเลีย', keywords: ['sydney', 'syd', 'australia', 'ซิดนีย์'] },
      { code: 'DEL', rawCity: 'New Delhi', city: 'นิวเดลี', country: 'อินเดีย', flag: '🇮🇳', group: '🇮🇳 อินเดีย', keywords: ['new delhi', 'delhi', 'del', 'india', 'อินเดีย'] },
      { code: 'CNX', rawCity: 'Chiang Mai', city: 'เชียงใหม่', country: 'ไทย', flag: '🇹🇭', group: '🇹🇭 ไทย', keywords: ['chiang mai', 'cnx', 'เชียงใหม่', 'ไทย'] },
      { code: 'HKT', rawCity: 'Phuket', city: 'ภูเก็ต', country: 'ไทย', flag: '🇹🇭', group: '🇹🇭 ไทย', keywords: ['phuket', 'hkt', 'ภูเก็ต', 'ไทย'] },
      { code: 'KBV', rawCity: 'Krabi', city: 'กระบี่', country: 'ไทย', flag: '🇹🇭', group: '🇹🇭 ไทย', keywords: ['krabi', 'kbv', 'กระบี่', 'ไทย'] },
      { code: 'PYX', rawCity: 'Pattaya', city: 'พัทยา', country: 'ไทย', flag: '🇹🇭', group: '🇹🇭 ไทย', keywords: ['pattaya', 'pyx', 'พัทยา', 'ไทย'] },
      { code: 'KIX', rawCity: 'Osaka', city: 'โอซาก้า', country: 'ญี่ปุ่น', flag: '🇯🇵', group: '🇯🇵 ญี่ปุ่น', keywords: ['osaka', 'kix', 'japan', 'โอซาก้า', 'ญี่ปุ่น'] },
      { code: 'CTS', rawCity: 'Sapporo', city: 'ซัปโปโร', country: 'ญี่ปุ่น', flag: '🇯🇵', group: '🇯🇵 ญี่ปุ่น', keywords: ['sapporo', 'cts', 'japan', 'ซัปโปโร', 'ญี่ปุ่น'] },
      { code: 'FUK', rawCity: 'Fukuoka', city: 'ฟุกุโอกะ', country: 'ญี่ปุ่น', flag: '🇯🇵', group: '🇯🇵 ญี่ปุ่น', keywords: ['fukuoka', 'fuk', 'japan', 'ฟุกุโอกะ', 'ญี่ปุ่น'] },
      { code: 'PMI', rawCity: 'Palma de Mallorca', city: 'ปัลมาเดมายอร์กา', country: 'สเปน', flag: '🇪🇸', group: '🇪🇺 ยุโรป', keywords: ['palma', 'mallorca', 'pmi', 'spain', 'สเปน', 'ปัลมา'] }
    ];

    function getCityGroups(filterText = '') {
      let filtered = CITY_DB;
      if (filterText) {
        const lower = filterText.toLowerCase();
        filtered = CITY_DB.filter(c => c.keywords.some(k => k.includes(lower)));
        return { 'ผลการค้นหา': filtered };
      }

      const groups = {};
      filtered.forEach(c => {
        if (!groups[c.group]) groups[c.group] = [];
        groups[c.group].push(c);
      });
      return groups;
    }

    function buildCityItem(c, type) {
      return `
        <div class="px-4 py-2 hover:bg-blue-50 cursor-pointer flex flex-col transition" onmousedown="selectLocation('${type}', '${c.code}', '${c.city} (${c.code})', '${c.rawCity}')">
          <span class="font-bold text-gray-800 text-sm flex items-center gap-2">${c.flag} ${c.city} (${c.code})</span>
          <span class="text-[11px] text-gray-500">${c.rawCity}, ${c.country}</span>
        </div>
      `;
    }

    function buildDropdownHTML(val, type) {
      let html = '';
      const groups = getCityGroups(val);
      for (const [groupName, cities] of Object.entries(groups)) {
        if (cities.length === 0) continue;
        html += `
          <div class="bg-gray-50 px-4 py-1.5 text-xs font-bold text-gray-500 border-y border-gray-100 first:border-t-0">
            ${groupName}
          </div>
        `;
        cities.forEach(c => {
          html += buildCityItem(c, type);
        });
      }
      if (html === '') {
        html = '<div class="px-4 py-4 text-sm text-gray-500 text-center">ไม่พบรายการที่ค้นหา</div>';
      }
      return html;
    }

    window.showLocationDropdown = function (type) {
      const dropdown = document.getElementById(`dropdown-${type}`);
      const input = document.getElementById(type === 'origin' ? 'search-origin' : 'search-dest');
      dropdown.innerHTML = buildDropdownHTML(input.value, type);
      dropdown.classList.remove('hidden');
    }

    window.filterLocationDropdown = function (type) {
      const dropdown = document.getElementById(`dropdown-${type}`);
      const input = document.getElementById(type === 'origin' ? 'search-origin' : 'search-dest');
      dropdown.innerHTML = buildDropdownHTML(input.value, type);
      dropdown.classList.remove('hidden');
      document.getElementById(type === 'origin' ? 'search-origin-code' : 'search-dest-code').value = '';
    }

    window.selectLocation = function (type, code, displayText, rawCity) {
      const input = document.getElementById(type === 'origin' ? 'search-origin' : 'search-dest');
      const hidden = document.getElementById(type === 'origin' ? 'search-origin-code' : 'search-dest-code');
      const dropdown = document.getElementById(`dropdown-${type}`);
      input.value = displayText;
      hidden.value = code;
      dropdown.classList.add('hidden');
    }

    window.clearLocationInput = function (type) {
      document.getElementById(type === 'origin' ? 'search-origin' : 'search-dest').value = '';
      document.getElementById(type === 'origin' ? 'search-origin-code' : 'search-dest-code').value = '';
    }

    document.addEventListener('click', (e) => {
      ['origin', 'dest'].forEach(fieldType => {
        const dropdown = document.getElementById(`dropdown-${fieldType}`);
        const input = document.getElementById(fieldType === 'origin' ? 'search-origin' : 'search-dest');
        if (dropdown && !dropdown.contains(e.target) && e.target !== input) {
          dropdown.classList.add('hidden');
        }
      });
    });

    async function initLocations() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const paramOrigin = urlParams.get('origin');

        if (paramOrigin) {
          const matchCity = CITY_DB.find(c => c.code.toLowerCase() === paramOrigin.toLowerCase() || c.keywords.some(kw => kw.includes(paramOrigin.toLowerCase())));
          if (matchCity) {
            selectLocation('origin', matchCity.code, `${matchCity.city} (${matchCity.code})`, matchCity.rawCity);
          } else {
            document.getElementById('search-origin').value = paramOrigin;
          }
        } else {
          selectLocation('origin', 'BKK', 'กรุงเทพฯ (BKK)', 'Bangkok');
        }

        const paramDest = urlParams.get('dest');
        if (paramDest) {
          const matchDest = CITY_DB.find(c => c.code.toLowerCase() === paramDest.toLowerCase() || c.keywords.some(kw => kw.includes(paramDest.toLowerCase())));
          if (matchDest) {
            selectLocation('dest', matchDest.code, `${matchDest.city} (${matchDest.code})`, matchDest.rawCity);
          } else {
            document.getElementById('search-dest').value = paramDest;
          }
        }

        // ==========================================
        // DYNAMIC DATE SETUP
        // ==========================================
        const dateFromInput = document.getElementById('search-date-from');
        const dateToInput = document.getElementById('search-date-to');

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tYyyy = tomorrow.getFullYear();
        const tMm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tDd = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowStr = `${tYyyy}-${tMm}-${tDd}`;

        const paramDateFrom = urlParams.get('dateFrom');
        const paramDateTo = urlParams.get('dateTo');

        if (dateFromInput) {
          dateFromInput.value = paramDateFrom || todayStr;
          dateFromInput.min = todayStr; // Prevent past dates

          // Auto-update 'dateTo' min and value when 'dateFrom' changes
          dateFromInput.addEventListener('change', (e) => {
            const newFromDate = new Date(e.target.value);
            const newNextDay = new Date(newFromDate);
            newNextDay.setDate(newNextDay.getDate() + 1);
            const nYyyy = newNextDay.getFullYear();
            const nMm = String(newNextDay.getMonth() + 1).padStart(2, '0');
            const nDd = String(newNextDay.getDate()).padStart(2, '0');
            const newNextDayStr = `${nYyyy}-${nMm}-${nDd}`;

            dateToInput.min = newNextDayStr;
            // If current 'dateTo' is earlier than the new next day, auto-adjust
            if (!dateToInput.value || new Date(dateToInput.value) <= newFromDate) {
              dateToInput.value = newNextDayStr;
            }
          });
        }

        if (dateToInput) {
          dateToInput.value = paramDateTo || tomorrowStr;
          // Setup initial min for dateTo
          if (dateFromInput && dateFromInput.value) {
            const currentFromDate = new Date(dateFromInput.value);
            const initNextDay = new Date(currentFromDate);
            initNextDay.setDate(initNextDay.getDate() + 1);
            const iYyyy = initNextDay.getFullYear();
            const iMm = String(initNextDay.getMonth() + 1).padStart(2, '0');
            const iDd = String(initNextDay.getDate()).padStart(2, '0');
            dateToInput.min = `${iYyyy}-${iMm}-${iDd}`;
          } else {
            dateToInput.min = tomorrowStr;
          }
        }

      } catch (err) {
        console.error('Failed to load locations:', err);
      }
    }


    async function executeSearch() {
      // Feature 1: Skeleton Loading
      document.getElementById('results-container').innerHTML = `
        ${[1, 2, 3].map(() => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-pulse">
          <div class="p-6 flex-1">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div class="space-y-2">
                <div class="h-3 bg-gray-200 rounded w-32"></div>
                <div class="h-2 bg-gray-100 rounded w-20"></div>
              </div>
            </div>
            <div class="flex items-center justify-between px-2">
              <div class="space-y-2 text-center">
                <div class="h-2 bg-gray-200 rounded w-16 mx-auto"></div>
                <div class="h-6 bg-gray-200 rounded w-14 mx-auto"></div>
                <div class="h-2 bg-gray-100 rounded w-10 mx-auto"></div>
              </div>
              <div class="flex-1 mx-6 h-0.5 bg-gray-200 rounded"></div>
              <div class="space-y-2 text-center">
                <div class="h-2 bg-gray-200 rounded w-16 mx-auto"></div>
                <div class="h-6 bg-gray-200 rounded w-14 mx-auto"></div>
                <div class="h-2 bg-gray-100 rounded w-10 mx-auto"></div>
              </div>
            </div>
          </div>
          <div class="p-6 md:w-56 bg-gray-50 flex flex-col justify-center items-end gap-3">
            <div class="h-2 bg-gray-200 rounded w-20"></div>
            <div class="h-7 bg-gray-200 rounded w-28"></div>
            <div class="h-9 bg-gray-200 rounded w-full"></div>
          </div>
        </div>`).join('')}
      `;

      const origin = document.getElementById('search-origin').value;
      const dest = document.getElementById('search-dest').value;
      const dateFrom = document.getElementById('search-date-from').value;
      const dateTo = document.getElementById('search-date-to').value;

      let flightDest = dest;
      let hotelDest = dest;
      const dLower = dest.toLowerCase();
      const dMatch = CITY_DB.find(c => c.keywords.some(k => dLower.includes(k)));
      if (dMatch) {
        flightDest = dMatch.code; hotelDest = dMatch.rawCity;
      }

      let flightOrigin = origin;
      const oLower = origin.toLowerCase();
      const oMatch = CITY_DB.find(c => c.keywords.some(k => oLower.includes(k)));
      if (oMatch) {
        flightOrigin = oMatch.code;
      }

      // สร้าง params แบบไม่ส่งค่าว่าง
      const flightParams = {};
      const hotelParams = {};

      if (origin) flightParams.origin = flightOrigin;
      if (dest) { flightParams.dest = flightDest; hotelParams.dest = hotelDest; }
      if (dateFrom) { flightParams.dateFrom = dateFrom; hotelParams.dateFrom = dateFrom; }
      if (dateTo) { flightParams.dateTo = dateTo; hotelParams.dateTo = dateTo; }

      try {
        const flightsRes = await apiSearchFlights(flightParams);
        const hotelsRes = await apiSearchHotels(hotelParams);

        // Fetch packages (type=all returns packages too)
        const pkgParams = {};
        if (origin) pkgParams.origin = flightOrigin;
        if (dest) { pkgParams.dest = flightDest; }
        if (dateFrom) pkgParams.dateFrom = dateFrom;
        if (dateTo) pkgParams.dateTo = dateTo;
        let packagesData = [];
        try {
          const pkgRes = await apiCall(`/api/search?type=package&${new URLSearchParams(pkgParams).toString()}`);
          packagesData = pkgRes.data.packages || [];
        } catch (e) { console.warn('Package fetch failed:', e); }


        let activitiesData = [];
        try {
          const actRes = await apiCall(`/api/search?type=activity&${new URLSearchParams(pkgParams).toString()}`);
          activitiesData = actRes.data.activities || [];
        } catch (e) { console.warn('Activity fetch failed:', e); }

        allData.flight = flightsRes.data.flights || [];
        allData.hotel = hotelsRes.data.hotels || [];
        allData.package = packagesData;
        allData.activity = activitiesData;


        buildDynamicFilters();

        // Show active tab logic if coming from a specific destination
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('dest') && allData.flight.length === 0 && allData.hotel.length > 0) {
          filterResults('hotel'); // auto switch to hotel if no flights found (e.g. Bangkok to Bangkok)
        } else {
          filterResults(currentType); // Apply filters and render
        }
      } catch (err) {
        console.error('Search error:', err);
        document.getElementById('results-container').innerHTML = `<div class="text-red-500 text-center py-8">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>`;
      }
    }

    let maxPriceLimit = 20000;

    function buildDynamicFilters() {
      // 1. Build Airlines (include flights, package outbound and return flights)
      const airlines = {};
      [
        ...allData.flight,
        ...allData.package.map(p => p.details.outbound),
        ...allData.package.map(p => p.details.returnFlight)
      ].forEach(f => {
        if (f) {
          const airlineStr = f.details?.airline || f.airline;
          if (airlineStr && airlineStr !== 'Airlines') {
            const individualAirlines = airlineStr.split('/').map(a => a.trim());
            individualAirlines.forEach(al => {
              if (al && al !== 'Airlines') {
                airlines[al] = (airlines[al] || 0) + 1;
              }
            });
          }
        }
      });
      const airlineContainer = document.getElementById('airline-checkboxes');
      airlineContainer.innerHTML = '';
      Object.keys(airlines).sort().forEach(al => {
        airlineContainer.innerHTML += `
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" value="${al}" checked class="airline-filter text-primary rounded border-gray-300 focus:ring-primary mr-2" onchange="applyFilters()">
            <span class="text-sm">${al}</span>
          </label>
        `;
      });

      // 2. Build Stars (include hotels and package hotels)
      const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      [...allData.hotel, ...allData.package.map(p => p.details.hotel)].forEach(h => {
        if (h) {
          const rating = Math.floor(h.rating || 4);
          if (rating >= 1 && rating <= 5) stars[rating]++;
        }
      });
      const starContainer = document.getElementById('star-checkboxes');
      starContainer.innerHTML = '';
      [5, 4, 3, 2, 1].forEach(star => {
        if (stars[star] > 0) {
          const starsHtml = '<span class="material-symbols-outlined text-sm">star</span>'.repeat(star);
          starContainer.innerHTML += `
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" value="${star}" checked class="star-filter text-primary rounded border-gray-300 mr-2" onchange="applyFilters()">
              <span class="text-sm flex text-yellow-400 mr-1">${starsHtml}</span> 
            </label>
          `;
        }
      });
    }

    function updatePriceDisplay() {
      const val = document.getElementById('filter-price').value;
      document.getElementById('price-display').textContent = formatPrice(val);
    }

    function resetFilters() {
      document.getElementById('filter-price').value = maxPriceLimit;
      updatePriceDisplay();
      document.querySelectorAll('.airline-filter').forEach(cb => cb.checked = true);
      document.querySelectorAll('.star-filter').forEach(cb => cb.checked = true);
      document.getElementById('sort-select').value = 'recommend';
      applyFilters();
    }

    function filterResults(type) {
      currentType = type;
      const activeClass = "flex-1 whitespace-nowrap py-1.5 bg-white shadow-sm rounded-md text-sm font-medium text-primary";
      const inactiveClass = "flex-1 whitespace-nowrap py-1.5 text-gray-600 rounded-md text-sm font-medium hover:text-primary";
      const inactiveClassPkg = inactiveClass + " relative";

      document.getElementById('tab-flights').className = type === 'flight' ? activeClass : inactiveClass;
      document.getElementById('tab-packages').className = type === 'package' ? activeClass : inactiveClassPkg;
      document.getElementById('tab-hotels').className = type === 'hotel' ? activeClass : inactiveClass;
      document.getElementById('tab-activities').className = type === 'activity' ? activeClass : inactiveClass;

      const smartTab = document.getElementById('tab-smart');
      if (smartTab) {
        if (type === 'smart') {
          smartTab.className = "w-full mt-3 py-2.5 bg-gradient-to-r from-secondary to-tertiary text-white rounded-lg text-sm font-bold shadow-md flex items-center justify-center gap-2 ring-2 ring-offset-2 ring-secondary";
        } else {
          smartTab.className = "w-full mt-3 py-2.5 bg-gradient-to-r from-primary to-blue-900 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2";
        }
      }

      const resContainer = document.getElementById('results-container');
      const smartContainer = document.getElementById('smart-trip-container');
      const filtersSidebar = document.querySelector('.bg-white.rounded-xl.shadow-sm.p-5.space-y-6.border'); // The filter box
      const topBar = document.querySelector('.flex.flex-col.sm\\:flex-row.justify-between.items-start');

      if (type === 'smart') {
        // --- SYNC FROM SEARCH BAR ---
        const sdCode = document.getElementById('search-dest-code');
        const sd = document.getElementById('search-dest');
        const smd = document.getElementById('smart-dest');

        let destVal = null;
        if (sdCode && sdCode.value) {
          destVal = sdCode.value;
        } else if (sd && sd.value) {
          const match = sd.value.match(/\(([A-Z]{3})\)/i);
          if (match) destVal = match[1].toUpperCase();
        }
        if (!destVal) {
          const urlParams = new URLSearchParams(window.location.search);
          destVal = urlParams.get('dest');
        }

        if (destVal && smd) {
          // Check if the option exists
          let exists = Array.from(smd.options).some(opt => opt.value === destVal);
          if (exists) {
            smd.value = destVal;
          }
        }
        // ----------------------------
        if (resContainer) resContainer.style.display = 'none';
        if (topBar) topBar.style.display = 'none';
        if (filtersSidebar) filtersSidebar.style.display = 'none';
        if (smartContainer) smartContainer.style.display = 'block';

        // Fix width for main content
        document.querySelector('main').classList.add('lg:w-[900px]');
        return; // Skip standard rendering
      } else {
        if (resContainer) resContainer.style.display = 'block';
        if (topBar) topBar.style.display = 'flex';
        if (filtersSidebar) filtersSidebar.style.display = 'block';
        if (smartContainer) smartContainer.style.display = 'none';
        document.querySelector('main').classList.remove('lg:w-[900px]');
      }

      // Re-add the badge on package tab if not active
      if (type !== 'package') {
        document.getElementById('tab-packages').innerHTML = 'แพ็กเกจ <span class="absolute -top-2 -right-0 bg-[#d97706] text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">ลด15%</span>';
      } else {
        document.getElementById('tab-packages').textContent = '📦 แพ็กเกจดีล';
      }

      const priceLabel = document.getElementById('price-label-text');
      if (type === 'package') {
        document.getElementById('filter-flight-options').style.display = 'block';
        document.getElementById('filter-hotel-options').style.display = 'block';
        if (priceLabel) priceLabel.textContent = 'ช่วงราคา (ต่อแพ็กเกจ)';
      } else if (type === 'flight') {
        document.getElementById('filter-flight-options').style.display = 'block';
        document.getElementById('filter-hotel-options').style.display = 'none';
        if (priceLabel) priceLabel.textContent = 'ช่วงราคา (ต่อเที่ยว)';
      } else if (type === 'hotel') {
        document.getElementById('filter-flight-options').style.display = 'none';
        document.getElementById('filter-hotel-options').style.display = 'block';
        if (priceLabel) priceLabel.textContent = 'ช่วงราคา (ต่อคืน)';
      } else if (type === 'activity') {
        document.getElementById('filter-flight-options').style.display = 'none';
        document.getElementById('filter-hotel-options').style.display = 'none';
        if (priceLabel) priceLabel.textContent = 'ช่วงราคา (ต่อกิจกรรม)';
      }

      // Adjust dynamic max price for the current tab
      const typeData = allData[type] || [];
      const typePrices = typeData.map(i => i.pricePerNight || i.totalPrice);
      let newMax = typePrices.length > 0 ? Math.max(...typePrices) : 20000;
      newMax = Math.ceil(newMax / 1000) * 1000; // round up to thousand
      if (newMax === 0) newMax = 20000;
      maxPriceLimit = newMax;

      const priceSlider = document.getElementById('filter-price');
      priceSlider.max = maxPriceLimit;
      priceSlider.value = maxPriceLimit;
      document.getElementById('price-max-label').textContent = formatPrice(maxPriceLimit) + '+';
      updatePriceDisplay();

      // อัพเดตฟอร์แมต Dropdown ตาม Tab ใหม่
      if (locationData) {
        populateDestinations();
      }

      applyFilters();
    }

    function applyFilters() {
      const data = allData[currentType] || [];
      const maxPrice = parseFloat(document.getElementById('filter-price').value);
      const sortType = document.getElementById('sort-select').value;

      const checkedAirlines = Array.from(document.querySelectorAll('.airline-filter:checked')).map(cb => cb.value);
      const checkedStars = Array.from(document.querySelectorAll('.star-filter:checked')).map(cb => parseInt(cb.value));

      let filtered = data.filter(item => {
        const comparePrice = item.pricePerNight || item.totalPrice;
        if (comparePrice > maxPrice) return false;

        if (currentType === 'flight') {
          const airlineStr = item.details.airline || '';
          return checkedAirlines.some(cb => airlineStr.includes(cb));
        } else if (currentType === 'hotel') {
          const rawRating = item.details.rating || 4;
          const rating = rawRating > 5 ? Math.round(rawRating / 2) : Math.floor(rawRating);
          return checkedStars.includes(rating);
        } else if (currentType === 'activity') {
          return true;
        }
        else if (currentType === 'package') {
          const obAirlines = (item.details.outbound?.airline || '');
          const rtAirlines = (item.details.returnFlight?.airline || '');
          const allPackageAirlines = obAirlines + ' / ' + rtAirlines;
          const rawRating = item.details.hotel?.rating || 4;
          const rating = rawRating > 5 ? Math.round(rawRating / 2) : Math.floor(rawRating);
          return checkedAirlines.some(cb => allPackageAirlines.includes(cb)) && checkedStars.includes(rating);
        }
        return true;
      });

      // Sorting
      if (sortType === 'price_asc') {
        filtered.sort((a, b) => (a.pricePerNight || a.totalPrice) - (b.pricePerNight || b.totalPrice));
      } else if (sortType === 'price_desc') {
        filtered.sort((a, b) => (b.pricePerNight || b.totalPrice) - (a.pricePerNight || a.totalPrice));
      }

      renderCards(filtered);
    }

    let currentRenderLimit = 20;
    let currentRenderData = [];

    function renderCards(data) {
      const container = document.getElementById('results-container');
      document.getElementById('results-count').textContent = data.length;

      currentRenderData = data;
      currentRenderLimit = 20;

      if (data.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-gray-500 animate-[fadeIn_0.3s_ease-out]">ไม่พบรายการที่ค้นหาตามเงื่อนไขที่เลือก</div>`;
        return;
      }

      container.innerHTML = '';
      renderNextBatch();
    }

    function renderNextBatch() {
      const container = document.getElementById('results-container');

      // Remove Load More button if it exists
      const oldBtn = document.getElementById('load-more-btn');
      if (oldBtn) oldBtn.remove();

      const itemsToRender = currentRenderData.slice(container.children.length, currentRenderLimit);
      const startIndex = container.children.length;

      itemsToRender.forEach((item, index) => {
        const div = document.createElement('div');
        // Smooth staggered animation
        div.className = 'bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition overflow-hidden flex flex-col md:flex-row animate-[fadeInUp_0.4s_ease-out_forwards] opacity-0 cursor-pointer';
        div.onclick = () => openDetailsModal(item.itemId);
        // Cap animation delay to 300ms so it doesn't wait forever on long lists
        div.style.animationDelay = `${Math.min(index * 40, 300)}ms`;

        if (currentType === 'flight') {
          const airptNames = { 'BKK': 'สุวรรณภูมิ', 'DMK': 'ดอนเมือง', 'NRT': 'นาริตะ', 'HND': 'ฮาเนดะ', 'KIX': 'คันไซ', 'CTS': 'นิวชิโตเสะ', 'SIN': 'ชางงี', 'ICN': 'อินชอน', 'LHR': 'ฮีทโธรว์', 'CDG': 'ชาร์ล เดอ โกล', 'SYD': 'ซิดนีย์', 'DEL': 'นิวเดลี', 'CNX': 'เชียงใหม่', 'HKT': 'ภูเก็ต', 'KBV': 'กระบี่' };
          const getAirpt = (code) => airptNames[code] || code;
          const airline = item.details.airline || 'Airlines';
          const airlineCode = airline.includes('Thai') ? 'TG' : airline.includes('Singapore') ? 'SQ' : airline.includes('ANA') ? 'NH' : airline.includes('Japan') ? 'JL' : 'FL';
          const isConnecting = item.details.isConnecting;
          const duration = item.details.layoverHours ? `9 ชม. 15 นาที` : `6 ชม. 00 นาที`;
          const layoverText = isConnecting ? `<span class="bg-[#fe932c]/10 border border-[#fe932c]/30 text-[#fe932c] text-[10px] px-1.5 py-0.5 rounded">แวะ 1 จุด</span>` : `<span class="text-[10px] text-gray-500">บินตรง (Non-stop)</span>`;

          div.className = 'bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col border border-[#001334]/10 cursor-pointer animate-[fadeInUp_0.4s_ease-out_forwards] opacity-0 mb-4';
          div.onclick = () => openDetailsModal(item.itemId);
          div.style.animationDelay = `${Math.min(index * 40, 300)}ms`;

          div.innerHTML = `
            <!-- ชั้นที่ 1: ข้อมูลสายการบิน (Card Header) -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 w-full border-b border-[#001334]/5">
              <!-- ซ้าย: โลโก้ และ ชื่อ -->
              <div class="flex items-start md:items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-[#001334] flex items-center justify-center font-bold text-white text-lg shadow-sm flex-shrink-0">
                  ${airlineCode}
                </div>
                <div class="flex flex-col">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-bold text-[#001334] text-lg whitespace-nowrap">${airline}</span>
                    <span class="bg-gray-100 text-[#001334] text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">${item.details.flightNo || (airlineCode + '-100')}</span>
                    <span class="bg-[#fe932c]/10 text-[#d97706] border border-[#fe932c]/20 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1 whitespace-nowrap">VIP Preferred</span>
                  </div>
                  <span class="text-xs text-gray-500 mt-1 whitespace-nowrap">${item.details.aircraft || 'Boeing 787-9 Dreamliner'} • ชั้น ${item.details.seatType === 'business' ? 'Business' : 'Economy'}</span>
                </div>
              </div>
              
              <!-- ขวา: สิทธิประโยชน์ -->
              <div class="flex items-center gap-4 mt-2 md:mt-0 flex-shrink-0">
                <div class="flex items-center gap-1 text-xs text-[#001334] font-medium whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">wifi</span> Wi-Fi ฟรี</div>
                <div class="flex items-center gap-1 text-xs text-[#001334] font-medium whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">restaurant</span> อาหารเลิศรส</div>
              </div>
            </div>

            <!-- ชั้นที่ 2: เวลาเดินทาง และ ราคา (Card Body) -->
            <div class="flex flex-col md:flex-row items-center justify-between p-5 w-full">
              
              <!-- โซนเวลาและเส้นทาง (70%) -->
              <div class="flex-1 w-full flex items-center justify-between md:pr-10">
                <!-- ต้นทาง -->
                <div class="flex flex-col text-left min-w-[80px]">
                  <span class="text-3xl font-bold text-[#001334] whitespace-nowrap">${formatTime(item.details.departureTime)}</span>
                  <span class="font-bold text-sm text-[#001334] whitespace-nowrap">${item.details.origin || 'กรุงเทพฯ (BKK)'}</span>
                  <span class="text-[11px] text-gray-400 whitespace-nowrap">${getAirpt(item.details.origin)} • ${formatDate(item.details.departureTime)}</span>
                </div>
                
                <!-- เส้นทางตรงกลาง -->
                <div class="flex-1 px-4 md:px-8 flex flex-col items-center min-w-[120px]">
                  <span class="text-xs text-gray-500 mb-1.5 flex items-center gap-1 whitespace-nowrap font-medium"><span class="material-symbols-outlined text-[14px]">schedule</span> ${duration}</span>
                  <div class="w-full flex items-center gap-0 opacity-80">
                    <div class="w-2 h-2 rounded-full bg-[#001334]"></div>
                    <div class="flex-1 h-[1.5px] bg-[#001334]/30 border-t border-dashed border-[#001334]/40"></div>
                    <span class="material-symbols-outlined text-[#001334] text-[18px] transform rotate-90 mx-2">flight</span>
                    <div class="flex-1 h-[1.5px] bg-[#001334]/30 border-t border-dashed border-[#001334]/40"></div>
                    <div class="w-2 h-2 rounded-full bg-[#fe932c]"></div>
                  </div>
                  <div class="mt-2 text-center">${layoverText}</div>
                </div>

                <!-- ปลายทาง -->
                <div class="flex flex-col text-right min-w-[80px]">
                  <span class="text-3xl font-bold text-[#001334] whitespace-nowrap">${formatTime(item.details.arrivalTime)}</span>
                  <span class="font-bold text-sm text-[#001334] whitespace-nowrap">${item.details.destination || 'โตเกียว (NRT)'}</span>
                  <span class="text-[11px] text-gray-400 whitespace-nowrap">${getAirpt(item.details.destination)} • ${formatDate(item.details.arrivalTime)}</span>
                </div>
              </div>
              
              <!-- โซนราคาและปุ่ม (30%) -->
              <div class="flex flex-col items-end md:pl-8 md:border-l border-[#001334]/10 mt-6 md:mt-0 min-w-[200px] flex-shrink-0">
                <span class="text-[11px] text-gray-500 font-medium whitespace-nowrap">ราคารวมภาษี/คน</span>
                <span class="text-3xl font-bold text-[#fe932c] my-1 whitespace-nowrap">${formatPrice(item.totalPrice)}</span>
                <button onclick="event.stopPropagation(); openDetailsModal('${item.itemId}')" class="bg-[#001334] hover:bg-[#001334]/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1 text-sm w-full justify-center mt-2 shadow-sm whitespace-nowrap">
                  เลือกเที่ยวบิน & เสริม <span class="material-symbols-outlined text-[18px]">expand_more</span>
                </button>
              </div>
            </div>
          `;
        } else if (currentType === 'package') {
          const ob = item.details.outbound;
          const rt = item.details.returnFlight;
          const h = item.details.hotel;
          const imgUrl = (h && h.imageUrl) ? h.imageUrl : 'https://images.unsplash.com/photo-1566073771259-6a8506099945';

          div.className = 'bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col animate-[fadeInUp_0.4s_ease-out_forwards] opacity-0 cursor-pointer relative mb-4 border border-[#001334]/10';
          div.onclick = () => openDetailsModal(item.itemId);
          div.style.animationDelay = `${Math.min(index * 40, 300)}ms`;

          div.innerHTML = `
            <div class="absolute top-0 left-0 bg-[#fe932c] text-white text-[11px] font-bold px-3 py-1.5 rounded-br-lg z-10 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">sell</span>
              แพ็กเกจดีลลดพิเศษ ${item.discountPercent}%
            </div>
            <div class="flex flex-col md:flex-row w-full">
                <!-- Image Side -->
                <div class="w-full md:w-80 h-48 md:h-auto relative flex-shrink-0">
                  <img src="${imgUrl}?w=600&auto=format&fit=crop&q=80" class="absolute inset-0 w-full h-full object-cover">
                  <div class="absolute top-8 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm text-[#001334]">
                    <span class="material-symbols-outlined text-[14px] text-[#fe932c]">star</span> ${h.rating || 4.5}
                  </div>
                </div>
                
                <!-- Content Side -->
                <div class="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="text-xl font-bold text-[#001334]">${h.hotelName || 'โรงแรม'}</h3>
                        <p class="text-sm text-gray-500 mb-1 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">location_on</span> ${h.location || ''} • ${h.roomType || ''} (${item.defaultNights} คืน)</p>
                        
                        <div class="bg-[#001334]/5 border border-[#001334]/10 rounded-lg p-3 mt-4">
                            <div class="flex items-center gap-1 text-[#001334] font-bold mb-2 text-sm">
                                <span class="material-symbols-outlined text-[16px]">flight</span> รวมตั๋วไป-กลับ
                            </div>
                            <p class="text-sm text-gray-600">🛫 ขาไป: ${ob ? ob.airline : ''} ${ob ? ob.flightNo : ''}</p>
                            <p class="text-sm text-gray-600 mt-1">🛬 ขากลับ: ${rt ? rt.airline : ''} ${rt ? rt.flightNo : ''}</p>
                        </div>
                    </div>
                </div>
                
                <!-- Price Side -->
                <div class="p-6 md:w-64 bg-gray-50 flex flex-col justify-center items-end text-right border-l border-[#001334]/5">
                    <span class="bg-[#fe932c]/20 text-[#904d00] text-[10px] font-bold px-2 py-1 rounded-full mb-1">ประหยัด ${formatPrice(item.discountAmount)}</span>
                    <p class="text-xs text-gray-500 line-through mt-2">${formatPrice(item.originalPrice)}</p>
                    <h3 class="text-3xl font-bold text-[#001334] my-1">${formatPrice(item.totalPrice)}</h3>
                    <p class="text-[10px] text-gray-400 mb-4">ราคารวมต่อท่าน</p>
                    <button onclick="event.stopPropagation(); handleAddPackageToCart('${item.itemId}')" class="w-full bg-[#001334] hover:bg-[#001334]/90 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm shadow-sm">
                        <span class="material-symbols-outlined text-[18px]">shopping_bag</span> เลือกแพ็กเกจนี้
                    </button>
                </div>
            </div>
          `;
        } else if (currentType === 'hotel') {
          const amenitiesHtml = (item.details.amenities || []).slice(0, 3).map(a => `<span class="bg-gray-100 text-[#001334] text-[11px] font-medium px-2 py-1 rounded">${a}</span>`).join('');
          const imgUrl = item.details.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
          const rating = item.details.rating || 4.5;

          div.className = 'bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col md:flex-row animate-[fadeInUp_0.4s_ease-out_forwards] opacity-0 cursor-pointer mb-4 border border-[#001334]/10';
          div.onclick = () => openDetailsModal(item.itemId);
          div.style.animationDelay = `${Math.min(index * 40, 300)}ms`;

          div.innerHTML = `
            <div class="w-full md:w-80 h-56 md:h-auto relative flex-shrink-0">
              <img src="${imgUrl}?w=600&auto=format&fit=crop&q=80" class="absolute inset-0 w-full h-full object-cover">
              <div class="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm text-[#001334]">
                <span class="material-symbols-outlined text-[14px] text-[#fe932c]">star</span> ${rating}
              </div>
              <div class="absolute bottom-3 left-3">
                 <span class="bg-[#fe932c] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">room_service</span> สิทธิพิเศษสำหรับ VIP</span>
              </div>
            </div>
            
            <div class="p-6 flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#001334]/5">
              <div>
                <h3 class="text-xl font-bold text-[#001334]">${item.details.hotelName}</h3>
                <p class="text-sm text-gray-500 mb-3 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">location_on</span> ${item.details.location}</p>
                <div class="flex flex-wrap gap-2 mt-4">
                  ${amenitiesHtml}
                </div>
              </div>
            </div>
            
            <div class="p-6 md:w-64 bg-gray-50 flex flex-col justify-center items-end text-right">
              <p class="text-sm font-semibold text-[#001334] mb-1">${item.details.roomType}</p>
              <p class="text-xs text-gray-500 mb-1">ราคาต่อคืน</p>
              <h3 class="text-3xl font-bold text-[#fe932c] mb-4">${formatPrice(item.totalPrice / (item.details.nights || 1))}</h3>
              <button onclick="event.stopPropagation(); openDetailsModal('${item.itemId}')" class="w-full bg-[#001334] text-white hover:bg-[#001334]/90 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm shadow-sm">
                เลือกวันเข้าพัก
              </button>
            </div>
          `;
        } else if (currentType === 'activity') {
          const a = item;
          const catMap = {
            'luxury': ' ลักชูรี & ไพรเวท',
            'culture': '🏛 ศิลปวัฒนธรรม',
            'adventure': ' ผจญภัย',
            'wellness': '🌿 สปา & สุขภาพ',
            'nature': '🌊 ธรรมชาติ & ชายหาด'
          };
          const displayCategory = catMap[a.category] || a.category;
          div.innerHTML = `
            <div class="md:w-64 h-48 md:h-full flex-shrink-0 relative">
              <img src="${a.imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80';" class="w-full h-full object-cover" alt="${a.title}">
              <div class="absolute top-3 left-3 bg-[#001334]/80 backdrop-blur text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px] text-[#fe932c]">star</span>
                ${a.rating.toFixed(1)} (${a.reviewsCount})
              </div>
              ${a.vipDiscountPercent > 0 ? `<div class="absolute top-3 right-3 bg-[#fe932c] text-white text-xs px-2 py-1 rounded font-bold shadow-md">VIP ลด ${a.vipDiscountPercent}%</div>` : ''}
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] font-bold text-gray-400 tracking-widest">${displayCategory}</span>
                  <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span class="text-[10px] font-bold text-[#fe932c]"><span class="material-symbols-outlined text-[12px] align-middle mr-0.5">schedule</span>${a.duration}</span>
                </div>
                <h3 class="text-lg font-extrabold text-[#001334] leading-tight mb-2">${a.title}</h3>
                <div class="flex flex-wrap gap-1.5 mb-3">
                  ${a.highlights.map(h => `<span class="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-medium border border-blue-100">${h}</span>`).join('')}
                </div>
              </div>
              <div class="flex items-end justify-between mt-4">
                <div>
                  <div class="text-xs text-gray-500 mb-0.5">ราคาต่อท่าน</div>
                  <div class="text-2xl font-bold text-[#fe932c] font-display">฿${a.price.toLocaleString()}</div>
                </div>
                <button onclick="event.stopPropagation(); openDetailsModal('${a.itemId}')" class="bg-[#001334] hover:bg-blue-900 text-white font-bold py-2 px-5 rounded-lg shadow-md transition text-sm flex items-center gap-2">
                  <span class=\"material-symbols-outlined text-[18px]\">local_activity</span> จองกิจกรรม / บริการเสริม
                </button>
              </div>
            </div>
          `;
        }

        container.appendChild(div);
      });

      if (currentRenderLimit < currentRenderData.length) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'load-more-btn';
        loadMoreBtn.className = 'w-full py-3 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition';
        loadMoreBtn.textContent = 'แสดงข้อมูลเพิ่มเติม';
        loadMoreBtn.onclick = () => {
          currentRenderLimit += 20;
          renderNextBatch();
        };
        container.appendChild(loadMoreBtn);
      }
    }


    let currentSelection = { itemId: null, seat: null, roomType: 'standard', roomPrice: 0, pkgSeats: {} };

    function generateSeatMapHTML(selectedSeat, flightNo, isPkg = false, legId = 'outbound') {
      let title = isPkg ? (legId === 'outbound' ? 'เลือกที่นั่งขาไป' : 'เลือกที่นั่งขากลับ') : 'เลือกที่นั่ง (Seat Selection)';
      let html = `<div class="my-4"><p class="font-bold mb-3 text-sm">${title}</p><div class="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-x-auto"><div class="min-w-max flex flex-col items-center gap-2">`;
      const rows = 12;
      const letters = ['A', 'B', 'C', '', 'D', 'E', 'F'];

      html += '<div class="flex gap-2 text-center text-xs font-bold text-gray-500 mb-2 w-full justify-center">';
      letters.forEach(l => {
        if (l) html += `<div class="w-8">${l}</div>`;
        else html += `<div class="w-6"></div>`;
      });
      html += '</div>';

      for (let r = 1; r <= rows; r++) {
        html += '<div class="flex gap-2 items-center justify-center">';
        letters.forEach(l => {
          if (!l) {
            html += `<div class="w-6 text-center text-[10px] text-gray-300 font-bold">${r}</div>`;
          } else {
            const seatId = `${r}${l}`;
            const hash = ((flightNo || 'AA').charCodeAt(0) + r * 7 + l.charCodeAt(0)) % 10;
            const isOccupied = hash > 7;
            const isSelected = selectedSeat === seatId;
            const seatClass = isOccupied ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : (isSelected ? 'bg-primary text-white ring-2 ring-primary ring-offset-1' : 'bg-white text-gray-700 border border-gray-300 hover:border-primary hover:text-primary cursor-pointer');

            const clickFunc = isOccupied ? '' : (isPkg ? `selectPkgSeat('${legId}', '${seatId}')` : `selectSeat('${seatId}')`);
            html += `<div onclick="${clickFunc}" class="w-8 h-8 flex items-center justify-center rounded-t-lg rounded-b-sm text-[10px] font-bold transition ${seatClass}">${seatId}</div>`;
          }
        });
        html += '</div>';
      }
      html += '</div></div></div>';
      return html;
    }

    window.selectSeat = function (seatId) {
      currentSelection.seat = seatId;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true);
    }

    window.selectPkgSeat = function (legId, seatId) {
      currentSelection.pkgSeats[legId] = seatId;
      const step = legId === 'outbound' ? 1 : 3;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true, step);
    }

    function generateHotelRoomHTML(selectedRoom, item) {
      const basePrice = item.pricePerNight || (item.totalPrice / (item.details.nights || 1));
      const rooms = [
        { id: 'standard', name: 'Standard Room', priceMod: 0, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=300&q=80' },
        { id: 'deluxe', name: 'Deluxe Sea View', priceMod: 800, img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&q=80' },
        { id: 'suite', name: 'Executive Suite', priceMod: 2500, img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&q=80' }
      ];

      let html = '<div class="my-4"><p class="font-bold mb-3 text-sm">เลือกประเภทห้องพัก (Room Type)</p><div class="space-y-3">';
      rooms.forEach(r => {
        const isSelected = selectedRoom === r.id;
        const finalPrice = basePrice + r.priceMod;
        const borderClass = isSelected ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer';

        html += `<div onclick="selectRoomType('${r.id}', ${finalPrice})" class="flex items-center gap-3 p-3 rounded-xl border transition ${borderClass}">`;
        html += `<img src="${r.img}" class="w-16 h-16 object-cover rounded-lg shrink-0">`;
        html += `<div class="flex-1"><p class="font-bold text-sm text-gray-800">${r.name}</p><p class="text-xs text-gray-500">${r.priceMod > 0 ? '+ ฿' + formatPrice(r.priceMod) + '/คืน' : 'ไม่มีค่าใช้จ่ายเพิ่มเติม'}</p></div>`;
        html += `<div class="text-right">
                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}">
                            ${isSelected ? '<span class="material-symbols-outlined text-white text-[12px] font-bold">check</span>' : ''}
                        </div>
                     </div>`;
        html += `</div>`;
      });
      html += '</div></div>';
      return html;
    }

    window.selectRoomType = function (roomId, newPrice) {
      currentSelection.roomType = roomId;
      currentSelection.roomPrice = newPrice;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true, 2);
    }



    let currentPkgStep = 1;

    function generateSeatMapHTML(selectedSeat, flightNo, isPkg = false, legId = 'outbound') {
      let title = isPkg ? (legId === 'outbound' ? 'เลือกที่นั่งขาไป' : 'เลือกที่นั่งขากลับ') : 'เลือกที่นั่ง (Seat Selection)';
      let html = `<div class="my-4"><p class="font-bold mb-3 text-sm flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">airline_seat_recline_normal</span> ${title}</p><div class="bg-gray-50 p-4 rounded-xl border border-gray-200 overflow-x-auto"><div class="min-w-max flex flex-col items-center gap-2">`;
      const rows = 12;
      const letters = ['A', 'B', 'C', '', 'D', 'E', 'F'];

      html += '<div class="flex gap-2 text-center text-xs font-bold text-gray-500 mb-2 w-full justify-center">';
      letters.forEach(l => {
        if (l) html += `<div class="w-8">${l}</div>`;
        else html += `<div class="w-6"></div>`;
      });
      html += '</div>';

      for (let r = 1; r <= rows; r++) {
        html += '<div class="flex gap-2 items-center justify-center">';
        letters.forEach(l => {
          if (!l) {
            html += `<div class="w-6 text-center text-[10px] text-gray-300 font-bold">${r}</div>`;
          } else {
            const seatId = `${r}${l}`;
            const hash = ((flightNo || 'AA').charCodeAt(0) + r * 7 + l.charCodeAt(0)) % 10;
            const isOccupied = hash > 7;
            const isSelected = selectedSeat === seatId;
            const seatClass = isOccupied ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : (isSelected ? 'bg-primary text-white ring-2 ring-primary ring-offset-1 shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:border-primary hover:text-primary cursor-pointer');

            const clickFunc = isOccupied ? '' : (isPkg ? `selectPkgSeat('${legId}', '${seatId}')` : `selectSeat('${seatId}')`);
            html += `<div onclick="${clickFunc}" class="w-8 h-8 flex items-center justify-center rounded-t-lg rounded-b-sm text-[10px] font-bold transition ${seatClass}">${seatId}</div>`;
          }
        });
        html += '</div>';
      }
      html += '</div></div></div>';
      return html;
    }

    function generateBaggageHTML(selectedBaggagePrice, isPkg = false, legId = 'outbound') {
      const isVip = (typeof isUserVip === 'function') ? isUserVip() : false;
      const options = [
        { price: 0, label: 'ฟรี 7 กก. (ถือขึ้นเครื่อง)', icon: 'backpack' },
        { price: isVip ? 0 : 450, label: '+15 กก. (โหลดใต้เครื่อง)' + (isVip ? ' [VIP ฟรี]' : ''), icon: 'luggage' },
        { price: isVip ? 200 : 650, label: '+20 กก. (คุ้มค่า)', icon: 'luggage' },
        { price: isVip ? 600 : 1050, label: '+30 กก. (จัดเต็ม)', icon: 'luggage' }
      ];

      let html = `<div class="my-4"><p class="font-bold mb-3 text-sm flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">work</span> เลือกน้ำหนักกระเป๋า (Baggage)</p><div class="grid grid-cols-2 gap-3">`;
      options.forEach(opt => {
        const isSelected = selectedBaggagePrice === opt.price;
        const borderClass = isSelected ? 'border-primary bg-blue-50 ring-1 ring-primary shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer';
        const clickFunc = isPkg ? `selectPkgBaggage('${legId}', ${opt.price}, '${opt.label}')` : `selectBaggage(${opt.price}, '${opt.label}')`;

        html += `<div onclick="${clickFunc}" class="flex flex-col p-3 rounded-xl border transition ${borderClass} relative">`;
        if (opt.price === 650) html += `<div class="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">Popular</div>`;
        html += `<div class="flex items-center gap-2 mb-1">
                       <span class="material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-gray-400'}">${opt.icon}</span>
                       <span class="font-bold text-sm ${isSelected ? 'text-primary' : 'text-gray-700'}">${opt.price === 0 ? 'ไม่มีค่าใช้จ่าย' : '+ ฿' + formatPrice(opt.price)}</span>
                     </div>
                     <p class="text-xs text-gray-500">${opt.label}</p>
                     `;
        html += `</div>`;
      });
      html += '</div></div>';
      return html;
    }

    function generateHotelRoomHTML(selectedRoom, item) {
      const basePrice = item.pricePerNight || (item.totalPrice / (item.details.nights || 1));
      const rooms = [
        { id: 'standard', name: 'Standard Room', priceMod: 0, img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=300&q=80' },
        { id: 'deluxe', name: 'Deluxe Sea View', priceMod: 800, img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=300&q=80' },
        { id: 'suite', name: 'Executive Suite', priceMod: 2500, img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=300&q=80' }
      ];

      let html = '<div class="my-4"><p class="font-bold mb-3 text-sm flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">bed</span> เลือกประเภทห้องพัก (Room Type)</p><div class="space-y-3">';
      rooms.forEach(r => {
        const isSelected = selectedRoom === r.id;
        const finalPrice = basePrice + r.priceMod;
        const borderClass = isSelected ? 'border-primary bg-blue-50 ring-1 ring-primary shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer';

        html += `<div onclick="selectRoomType('${r.id}', ${finalPrice})" class="flex items-center gap-3 p-3 rounded-xl border transition ${borderClass}">`;
        html += `<img src="${r.img}" class="w-16 h-16 object-cover rounded-lg shrink-0 shadow-sm">`;
        html += `<div class="flex-1"><p class="font-bold text-sm text-gray-800">${r.name}</p><p class="text-xs text-gray-500">${r.priceMod > 0 ? '+ ฿' + formatPrice(r.priceMod) + ' / คืน' : 'ราคาเริ่มต้น'}</p></div>`;
        html += `<div class="text-right">
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}">
                            ${isSelected ? '<span class="material-symbols-outlined text-white text-[14px] font-bold">check</span>' : ''}
                        </div>
                     </div>`;
        html += `</div>`;
      });
      html += '</div></div>';
      return html;
    }

    function generateHotelAddonsHTML(selectedAddons, isPkg = false) {
      const isVip = (typeof isUserVip === 'function') ? isUserVip() : false;
      const addons = [
        { id: 'insurance', name: 'ประกันการเดินทางเต็มรูปแบบ', price: isVip ? 0 : 300, icon: 'health_and_safety', vipLabel: isVip ? ' <span class="text-orange-500 font-bold ml-1 text-xs">[VIP ฟรี]</span>' : '' },
        { id: 'breakfast', name: 'บุฟเฟต์อาหารเช้า (ต่อวัน)', price: isVip ? 0 : 350, icon: 'restaurant', vipLabel: isVip ? ' <span class="text-orange-500 font-bold ml-1 text-xs">[VIP ฟรี]</span>' : '' },
        { id: 'airport_transfer', name: 'รถรับส่งสนามบิน (เที่ยวเดียว)', price: 600, icon: 'airport_shuttle', vipLabel: '' },
        { id: 'spa', name: 'แพ็คเกจนวดสปา 60 นาที', price: 1200, icon: 'spa', vipLabel: '' },
        { id: 'late_checkout', name: 'เลทเช็คเอาท์ (16:00 น.)', price: 500, icon: 'schedule', vipLabel: '' }
      ];
      if (!selectedAddons) selectedAddons = {};

      let html = '<div class="my-4"><p class="font-bold mb-3 text-sm flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">room_service</span> บริการเสริมพิเศษ (Extra Services)</p><div class="space-y-3">';
      addons.forEach(addon => {
        const isSelected = !!selectedAddons[addon.id];
        const borderClass = isSelected ? 'border-primary bg-blue-50 ring-1 ring-primary shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300 cursor-pointer';
        const clickFunc = isPkg ? `togglePkgAddon('${addon.id}', ${addon.price})` : `toggleHotelAddon('${addon.id}', ${addon.price})`;

        html += `<div onclick="${clickFunc}" class="flex items-center justify-between p-3 rounded-xl border transition ${borderClass}">`;
        html += `<div class="flex items-center gap-3">
                       <div class="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 shadow-sm"><span class="material-symbols-outlined text-[20px]">${addon.icon}</span></div>
                       <div><p class="font-bold text-sm text-gray-800">${addon.name}${addon.vipLabel}</p><p class="text-xs text-primary">${addon.price === 0 ? 'ไม่มีค่าใช้จ่าย' : '+ ฿' + formatPrice(addon.price)}</p></div>
                     </div>`;
        html += `<div class="w-6 h-6 rounded border-2 flex items-center justify-center transition ${isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-gray-50'}">
                        ${isSelected ? '<span class="material-symbols-outlined text-white text-[14px] font-bold">check</span>' : ''}
                     </div>`;
        html += `</div>`;
      });
      html += '</div></div>';
      return html;
    }

    window.selectSeat = function (seatId) {
      currentSelection.seat = seatId;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true);
    }

    window.selectPkgSeat = function (legId, seatId) {
      currentSelection.pkgSeats[legId] = seatId;
      const step = legId === 'outbound' ? 1 : 3;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true, step);
    }

    window.selectBaggage = function (price, label) {
      currentSelection.baggage = price;
      currentSelection.baggageLabel = label;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true);
    }

    window.selectPkgBaggage = function (legId, price, label) {
      if (!currentSelection.pkgBaggage) currentSelection.pkgBaggage = {};
      currentSelection.pkgBaggage[legId] = { price: price, label: label };
      const step = legId === 'outbound' ? 1 : 3;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true, step);
    }

    window.selectRoomType = function (roomId, newPrice) {
      currentSelection.roomType = roomId;
      currentSelection.roomPrice = newPrice;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true, 2);
    }

    window.toggleHotelAddon = function (id, price) {
      if (!currentSelection.hotelAddons) currentSelection.hotelAddons = {};
      if (currentSelection.hotelAddons[id]) delete currentSelection.hotelAddons[id];
      else currentSelection.hotelAddons[id] = price;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true);
    }

    window.togglePkgAddon = function (id, price) {
      if (!currentSelection.pkgHotelAddons) currentSelection.pkgHotelAddons = {};
      if (currentSelection.pkgHotelAddons[id]) delete currentSelection.pkgHotelAddons[id];
      else currentSelection.pkgHotelAddons[id] = price;
      if (currentSelection.itemId) openDetailsModal(currentSelection.itemId, true, 2);
    }

    function openDetailsModal(itemId, isReopen = false, targetStep = null) {
      const item = currentRenderData.find(i => i.itemId === itemId);
      if (!item) return;

      if (!isReopen) {
        currentSelection = {
          itemId: itemId,
          seat: null,
          baggage: 0,
          baggageLabel: 'ฟรี 7 กก.',
          roomType: 'standard',
          roomPrice: item.pricePerNight || (item.totalPrice / (item.details?.nights || 1)) || 0,
          pkgSeats: {},
          pkgBaggage: {},
          hotelAddons: {},
          pkgHotelAddons: {}
        };
        currentPkgStep = 1;
      } else if (targetStep !== null) {
        currentPkgStep = targetStep;
      }

      const modal = document.getElementById('details-modal');
      const content = document.getElementById('details-modal-content');
      const title = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      const price = document.getElementById('modal-price');
      const actionBtn = document.getElementById('modal-action-btn');

      content.classList.remove('max-w-2xl', 'max-w-3xl', 'max-w-4xl');
      const existingBackBtn = document.getElementById('modal-back-btn');
      if (existingBackBtn) existingBackBtn.remove();

      let currentDisplayPrice = item.pricePerNight || item.totalPrice;
      actionBtn.onclick = () => { closeDetailsModal(); handleAddToCart(item.itemId, currentType); };

      if (currentType === 'flight') {
        content.classList.add('max-w-2xl');
        title.innerHTML = `<span class="material-symbols-outlined text-primary">flight</span> รายละเอียดเที่ยวบิน และเลือกบริการเสริม`;
        actionBtn.innerHTML = `เพิ่มลงตะกร้า <span class="material-symbols-outlined text-[18px]">shopping_cart</span>`;
        actionBtn.className = "w-full sm:w-auto bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2";

        let timelineHtml = '';
        if (item.details.isConnecting && item.details.segments) {
          const s1 = item.details.segments[0].details;
          const s2 = item.details.segments[1].details;
          timelineHtml = `
            <div class="relative pl-6 border-l-2 border-primary pb-6">
              <div class="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-0 border-4 border-white"></div>
              <p class="font-bold text-gray-800">${s1.origin} <span class="text-xs font-normal text-gray-500">ออกเดินทาง ${formatTime(s1.departureTime)}</span></p>
              <div class="my-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold text-xs">${s1.airline.substring(0, 2).toUpperCase()}</div>
                <div>
                  <p class="text-sm font-bold">${s1.airline} · ${s1.flightNo}</p>
                  <p class="text-xs text-gray-500">ชั้น ${s1.seatType || 'Economy'} · บินตรง · ระยะเวลา ${s1.duration}</p>
                </div>
              </div>
              <p class="font-bold text-gray-800">${s1.destination} <span class="text-xs font-normal text-gray-500">เดินทางถึง ${formatTime(s1.arrivalTime)}</span></p>
            </div>
            
            <div class="pl-6 pb-6 border-l-2 border-gray-200">
              <div class="my-2 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center gap-2 border border-gray-200">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                แวะพักเปลี่ยนเครื่องที่ ${s1.destination} เป็นเวลา ${item.details.layoverHours} ชั่วโมง
              </div>
            </div>

            <div class="relative pl-6">
              <div class="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-0 border-4 border-white"></div>
              <p class="font-bold text-gray-800">${s2.origin} <span class="text-xs font-normal text-gray-500">ออกเดินทาง ${formatTime(s2.departureTime)}</span></p>
              <div class="my-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold text-xs">${s2.airline.substring(0, 2).toUpperCase()}</div>
                <div>
                  <p class="text-sm font-bold">${s2.airline} · ${s2.flightNo}</p>
                  <p class="text-xs text-gray-500">ชั้น ${s2.seatType || 'Economy'} · บินตรง · ระยะเวลา ${s2.duration}</p>
                </div>
              </div>
              <p class="font-bold text-gray-800">${s2.destination} <span class="text-xs font-normal text-gray-500">เดินทางถึง ${formatTime(s2.arrivalTime)}</span></p>
            </div>
          `;
        } else {
          timelineHtml = `
            <div class="relative pl-6">
              <div class="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-0 border-4 border-white"></div>
              <p class="font-bold text-gray-800">${item.details.origin} <span class="text-xs font-normal text-gray-500">ออกเดินทาง ${formatDate(item.details.departureTime)} ${formatTime(item.details.departureTime)}</span></p>
              <div class="my-4 p-4 bg-gray-50 rounded-xl flex flex-col md:flex-row md:items-center gap-4">
                <div class="w-10 h-10 bg-blue-100 text-primary rounded-full flex items-center justify-center font-bold">${item.details.airline.substring(0, 2).toUpperCase()}</div>
                <div class="flex-1">
                  <p class="font-bold text-gray-800">${item.details.airline} · ${item.details.flightNo}</p>
                  <p class="text-sm text-gray-500">ชั้น ${item.details.seatType || 'Economy'} · บินตรง · ระยะเวลา ${item.details.duration}</p>
                </div>
              </div>
              <div class="absolute w-4 h-4 bg-primary rounded-full -left-[9px] bottom-[2px] border-4 border-white"></div>
              <p class="font-bold text-gray-800">${item.details.destination} <span class="text-xs font-normal text-gray-500">เดินทางถึง ${formatDate(item.details.arrivalTime)} ${formatTime(item.details.arrivalTime)}</span></p>
            </div>
          `;
        }

        let seatMapHtml = generateSeatMapHTML(currentSelection.seat, item.details.flightNo);
        let baggageHtml = generateBaggageHTML(currentSelection.baggage);

        if (currentSelection.seat) currentDisplayPrice += 150;
        if (currentSelection.baggage) currentDisplayPrice += currentSelection.baggage;

        body.innerHTML = `
          <div class="py-4 border-b border-gray-100 mb-6">${timelineHtml}</div>
          ${seatMapHtml}
          ${baggageHtml}
        `;
        price.textContent = formatPrice(currentDisplayPrice);

      } else if (currentType === 'package') {
        content.classList.add('max-w-3xl');
        title.innerHTML = `<span class="material-symbols-outlined text-orange-500">local_offer</span> ดีลแพ็คเกจพร้อมเลือกที่นั่งและห้องพัก`;

        const ob = item.details.outbound;
        const rt = item.details.returnFlight;
        const h = item.details.hotel;

        let pkgDisplayPrice = item.totalPrice;
        if (ob) {
          if (currentSelection.pkgSeats['outbound']) pkgDisplayPrice += 150;
          if (currentSelection.pkgBaggage['outbound']) pkgDisplayPrice += currentSelection.pkgBaggage['outbound'].price;
        }
        if (rt) {
          if (currentSelection.pkgSeats['return']) pkgDisplayPrice += 150;
          if (currentSelection.pkgBaggage['return']) pkgDisplayPrice += currentSelection.pkgBaggage['return'].price;
        }
        if (h) {
          const baseRoomPrice = h.pricePerNight || (h.totalPrice / (h.details.nights || 1));
          if (currentSelection.roomPrice > baseRoomPrice) {
            pkgDisplayPrice += (currentSelection.roomPrice - baseRoomPrice) * item.defaultNights;
          }
          if (currentSelection.pkgHotelAddons) {
            Object.entries(currentSelection.pkgHotelAddons).forEach(([id, price]) => {
              if (id === 'breakfast') pkgDisplayPrice += price * item.defaultNights;
              else pkgDisplayPrice += price;
            });
          }
        }
        price.textContent = formatPrice(pkgDisplayPrice);

        let progressHtml = `
          <div class="flex items-center justify-between mb-8 px-8 relative mt-4">
            <div class="absolute top-4 left-[15%] right-[15%] h-1 bg-gray-200 -z-10"></div>
            <div class="w-1/3 text-center z-10 cursor-pointer" onclick="openDetailsModal('${itemId}', true, 1)">
              <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold mb-2 transition ${currentPkgStep >= 1 ? 'bg-primary text-white shadow-md ring-4 ring-white' : 'bg-gray-200 text-gray-400'}"><span class="material-symbols-outlined text-[20px]">flight_takeoff</span></div>
              <p class="text-xs font-bold ${currentPkgStep >= 1 ? 'text-primary' : 'text-gray-400'}">เที่ยวบินขาไป</p>
            </div>
            <div class="w-1/3 text-center z-10 cursor-pointer" onclick="openDetailsModal('${itemId}', true, 2)">
              <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold mb-2 transition ${currentPkgStep >= 2 ? 'bg-orange-500 text-white shadow-md ring-4 ring-white' : 'bg-gray-200 text-gray-400'}"><span class="material-symbols-outlined text-[20px]">hotel</span></div>
              <p class="text-xs font-bold ${currentPkgStep >= 2 ? 'text-orange-500' : 'text-gray-400'}">ที่พักโรงแรม</p>
            </div>
            <div class="w-1/3 text-center z-10 cursor-pointer" onclick="openDetailsModal('${itemId}', true, 3)">
              <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold mb-2 transition ${currentPkgStep >= 3 ? 'bg-green-500 text-white shadow-md ring-4 ring-white' : 'bg-gray-200 text-gray-400'}"><span class="material-symbols-outlined text-[20px]">flight_land</span></div>
              <p class="text-xs font-bold ${currentPkgStep >= 3 ? 'text-green-500' : 'text-gray-400'}">เที่ยวบินขากลับ</p>
            </div>
          </div>
        `;

        let stepContentHtml = '';

        if (currentPkgStep === 1) {
          stepContentHtml = `
            <div class="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">${ob.airline.substring(0, 2).toUpperCase()}</div>
                  <h4 class="font-bold text-blue-800 text-lg">เที่ยวบินขาไป ${ob.origin} ➔ ${ob.destination}</h4>
                </div>
                <div class="flex gap-4 mb-4 text-sm text-gray-700 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                   <div class="flex-1"><span class="block text-xs text-gray-500">วันเดินทาง</span><strong class="text-blue-800">${formatDate(ob.departureTime)}</strong></div>
                   <div class="flex-1"><span class="block text-xs text-gray-500">เวลาออก</span><strong class="text-blue-800">${formatTime(ob.departureTime)}</strong></div>
                   <div class="flex-1"><span class="block text-xs text-gray-500">สายการบิน</span><strong class="text-blue-800">${ob.airline} (${ob.flightNo})</strong></div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-blue-100 p-2">
                    ${generateSeatMapHTML(currentSelection.pkgSeats['outbound'], ob.flightNo, true, 'outbound')}
                    ${generateBaggageHTML(currentSelection.pkgBaggage['outbound'] ? currentSelection.pkgBaggage['outbound'].price : 0, true, 'outbound')}
                </div>
            </div>
           `;
          actionBtn.innerHTML = `ถัดไป: เลือกที่พัก <span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
          actionBtn.onclick = () => { openDetailsModal(itemId, true, 2); };
          actionBtn.className = "w-full sm:w-auto bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2";

        } else if (currentPkgStep === 2) {
          stepContentHtml = `
            <div class="p-6 rounded-2xl bg-orange-50/50 border border-orange-100">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold"><span class="material-symbols-outlined text-[16px]">hotel</span></div>
                  <h4 class="font-bold text-orange-800 text-lg">ที่พัก ${h.hotelName}</h4>
                </div>
                <p class="text-sm text-gray-600 mb-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
                   <span class="material-symbols-outlined text-orange-400">schedule</span> เข้าพัก ${item.defaultNights} คืน
                </p>
                <div class="bg-white rounded-xl shadow-sm border border-orange-100 p-2">
                    ${generateHotelRoomHTML(currentSelection.roomType, h)}
                    ${generateHotelAddonsHTML(currentSelection.pkgHotelAddons, true)}
                </div>
            </div>
           `;
          actionBtn.innerHTML = `ถัดไป: เที่ยวบินขากลับ <span class="material-symbols-outlined text-[18px]">arrow_forward</span>`;
          actionBtn.onclick = () => { openDetailsModal(itemId, true, 3); };
          actionBtn.className = "w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2";

          const backBtn = document.createElement('button');
          backBtn.id = 'modal-back-btn';
          backBtn.className = 'w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 sm:order-first mb-3 sm:mb-0 mr-0 sm:mr-3';
          backBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">arrow_back</span> ย้อนกลับ`;
          backBtn.onclick = () => { openDetailsModal(itemId, true, 1); };
          actionBtn.parentNode.insertBefore(backBtn, actionBtn);

        } else if (currentPkgStep === 3) {
          stepContentHtml = `
            <div class="p-6 rounded-2xl bg-green-50/50 border border-green-100">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">${rt.airline.substring(0, 2).toUpperCase()}</div>
                  <h4 class="font-bold text-green-800 text-lg">เที่ยวบินขากลับ ${rt.origin} ➔ ${rt.destination}</h4>
                </div>
                <div class="flex gap-4 mb-4 text-sm text-gray-700 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                   <div class="flex-1"><span class="block text-xs text-gray-500">วันเดินทาง</span><strong class="text-green-800">${formatDate(rt.departureTime)}</strong></div>
                   <div class="flex-1"><span class="block text-xs text-gray-500">เวลาออก</span><strong class="text-green-800">${formatTime(rt.departureTime)}</strong></div>
                   <div class="flex-1"><span class="block text-xs text-gray-500">สายการบิน</span><strong class="text-green-800">${rt.airline} (${rt.flightNo})</strong></div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-green-100 p-2">
                    ${generateSeatMapHTML(currentSelection.pkgSeats['return'], rt.flightNo, true, 'return')}
                    ${generateBaggageHTML(currentSelection.pkgBaggage['return'] ? currentSelection.pkgBaggage['return'].price : 0, true, 'return')}
                </div>
            </div>
           `;
          actionBtn.innerHTML = `ยืนยันเพิ่มแพ็คเกจลงตะกร้า <span class="material-symbols-outlined text-[18px]">shopping_bag</span>`;
          actionBtn.onclick = () => { closeDetailsModal(); handleAddPackageToCart(item.itemId); };
          actionBtn.className = "w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2";

          const backBtn = document.createElement('button');
          backBtn.id = 'modal-back-btn';
          backBtn.className = 'w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 sm:order-first mb-3 sm:mb-0 mr-0 sm:mr-3';
          backBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">arrow_back</span> ย้อนกลับ`;
          backBtn.onclick = () => { openDetailsModal(itemId, true, 2); };
          actionBtn.parentNode.insertBefore(backBtn, actionBtn);
        }

        body.innerHTML = progressHtml + stepContentHtml;

      } else if (currentType === 'hotel') {
        content.classList.add('max-w-2xl');
        title.innerHTML = `<span class="material-symbols-outlined text-primary">hotel</span> รายละเอียดโรงแรม และเลือกบริการเสริม`;
        actionBtn.innerHTML = `เพิ่มลงตะกร้า <span class="material-symbols-outlined text-[18px]">shopping_cart</span>`;
        actionBtn.className = "w-full sm:w-auto bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2";

        const imgUrl = item.details.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945';

        let checkInDate = new Date();
        let checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + 1);

        const searchDateFrom = document.getElementById('search-date-from').value;
        const searchDateTo = document.getElementById('search-date-to').value;
        if (searchDateFrom && searchDateTo) {
          checkInDate = new Date(searchDateFrom);
          checkOutDate = new Date(searchDateTo);
        } else if (searchDateFrom) {
          checkInDate = new Date(searchDateFrom);
          checkOutDate = new Date(checkInDate);
          checkOutDate.setDate(checkOutDate.getDate() + 1);
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const checkInStr = checkInDate.toISOString().split('T')[0];
        const checkOutStr = checkOutDate.toISOString().split('T')[0];

        let roomsHtml = generateHotelRoomHTML(currentSelection.roomType, item);
        let addonsHtml = generateHotelAddonsHTML(currentSelection.hotelAddons, false);

        body.innerHTML = `
          <div class="w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-6 relative">
            <img src="${imgUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'" class="w-full h-full object-cover">
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm text-primary">
              <span class="material-symbols-outlined text-[18px]">star</span>
              ${item.details.rating || 4.5}
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-2">${item.details.hotelName}</h3>
          <p class="text-gray-500 mb-6 flex items-center gap-1"><span class="material-symbols-outlined text-[18px]">location_on</span> ${item.details.location}</p>
          
          <div class="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <h4 class="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">calendar_month</span> กำหนดวันเข้าพัก</h4>
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <label class="text-xs text-gray-500 mb-1 block">วันเช็คอิน</label>
                <input type="date" id="hotel-checkin" class="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-sm" min="${todayStr}" value="${checkInStr}" onchange="calculateHotelPrice()">
              </div>
              <div class="flex-1">
                <label class="text-xs text-gray-500 mb-1 block">วันเช็คเอาท์</label>
                <input type="date" id="hotel-checkout" class="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-sm" min="${todayStr}" value="${checkOutStr}" onchange="calculateHotelPrice()">
              </div>
            </div>
            <p class="text-sm text-gray-600 mt-3 text-right">จำนวนพัก: <strong id="hotel-nights-count" class="text-primary text-lg">1</strong> คืน</p>
          </div>
          
          ${roomsHtml}
          ${addonsHtml}
        `;
      } else if (currentType === 'activity') {
        content.classList.add('max-w-4xl');
        title.innerHTML = `<span class="material-symbols-outlined text-[#fe932c]">local_activity</span> รายละเอียดกิจกรรม และบริการเสริม`;
        actionBtn.innerHTML = `เพิ่มลงตะกร้า <span class="material-symbols-outlined text-[18px]">shopping_cart</span>`;
        actionBtn.className = "w-full sm:w-auto bg-[#fe932c] hover:bg-[#e07f23] text-white px-8 py-3 rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2";

        currentSelection.activityAddons = {};

        const hList = (item.details?.highlights || item.highlights || []).map(h => `<li class="flex items-center gap-2"><span class="material-symbols-outlined text-green-500 text-[18px]">check_circle</span> ${h}</li>`).join('');
        const iList = (item.details?.inclusions || item.inclusions || []).map(inc => `<li class="flex items-center gap-2 text-sm"><span class="material-symbols-outlined text-blue-500 text-[16px]">done</span> ${inc}</li>`).join('');
        const tList = (item.details?.itinerary || item.itinerary || []).map(it => `<div class="flex gap-4 mb-3"><div class="flex flex-col items-center"><div class="w-2.5 h-2.5 rounded-full bg-primary mt-1.5"></div><div class="flex-1 w-[1px] bg-gray-300 my-1"></div></div><p class="text-sm text-gray-700 pb-2">${it}</p></div>`).join('');

        const addons = item.details?.addOns || item.addOns || [];
        let addonsHtml = addons.length ? '<h4 class="font-bold text-gray-800 mb-3 border-b pb-2">🎁 บริการเสริมพิเศษ (Add-ons)</h4>' : '';
        addons.forEach(ad => {
          addonsHtml += `
            <label class="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-blue-50/50 transition">
              <div class="flex items-center gap-3">
                <input type="checkbox" class="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" 
                  onchange="toggleActivityAddon('${ad.id}', ${ad.price}, this.checked)">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-800 text-sm flex items-center gap-1"><span class="material-symbols-outlined text-[16px] text-gray-500">${ad.icon}</span> ${ad.name}</span>
                </div>
              </div>
              <span class="font-bold text-tertiary text-sm">+฿${ad.price.toLocaleString()}</span>
            </label>
          `;
        });

        body.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <div class="h-64 rounded-xl overflow-hidden mb-4 shadow-sm relative">
                <img src="${item.imageUrl || item.details?.imageUrl}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80';" class="w-full h-full object-cover">
                <div class="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary shadow-sm flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-[#fe932c]">star</span> ${(item.rating || 4.5).toFixed(1)}
                </div>
              </div>
              <h3 class="text-xl font-bold text-primary mb-2 leading-tight">${item.title || item.details?.title}</h3>
              <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <span class="bg-gray-100 px-2 py-1 rounded font-medium">${item.category || item.details?.category}</span>
                <span class="material-symbols-outlined text-[14px]">schedule</span> ${item.duration || item.details?.duration}
              </div>
              
              <h4 class="font-bold text-gray-800 mb-2 border-b pb-2"> ไฮไลต์กิจกรรม</h4>
              <ul class="text-sm text-gray-600 mb-4 space-y-1">${hList}</ul>
              
              <h4 class="font-bold text-gray-800 mb-2 border-b pb-2">✅ สิ่งที่รวมในแพ็กเกจ</h4>
              <ul class="text-sm text-gray-600 mb-4 space-y-1">${iList}</ul>
            </div>
            
            <div class="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h4 class="font-bold text-gray-800 mb-4 border-b pb-2">🕒 กำหนดการ (Itinerary)</h4>
              <div class="mb-6">${tList}</div>
              
              ${addonsHtml}
            </div>
          </div>
        `;

        window.toggleActivityAddon = (id, adPrice, isChecked) => {
          if (isChecked) currentSelection.activityAddons[id] = adPrice;
          else delete currentSelection.activityAddons[id];

          let total = item.price || item.totalPrice;
          Object.values(currentSelection.activityAddons).forEach(p => total += p);
          currentDisplayPrice = total;
          document.getElementById('modal-price').textContent = '฿' + total.toLocaleString();
        };
      }
      if (!isReopen && currentType === 'hotel') {
        calculateHotelPrice();
      } else if (isReopen && currentType === 'hotel') {
        calculateHotelPrice();
      }

      if (!isReopen) {
        modal.classList.remove('hidden');
        setTimeout(() => {
          modal.classList.remove('opacity-0');
          content.classList.remove('translate-y-8', 'opacity-0', 'scale-95');
        }, 10);
      }
    }

    let currentModalNights = 1;
    window.calculateHotelPrice = function () {
      const checkInStr = document.getElementById('hotel-checkin').value;
      const checkOutStr = document.getElementById('hotel-checkout').value;
      if (!checkInStr || !checkOutStr) return;
      const ci = new Date(checkInStr);
      const co = new Date(checkOutStr);
      if (ci >= co) {
        co.setDate(ci.getDate() + 1);
        document.getElementById('hotel-checkout').value = co.toISOString().split('T')[0];
      }
      const diffTime = Math.abs(co - ci);
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      currentModalNights = diffDays;

      const countEl = document.getElementById('hotel-nights-count');
      if (countEl) countEl.textContent = diffDays;

      let newTotal = currentSelection.roomPrice * diffDays;
      if (currentSelection.hotelAddons) {
        Object.entries(currentSelection.hotelAddons).forEach(([id, price]) => {
          if (id === 'breakfast') newTotal += price * diffDays;
          else newTotal += price;
        });
      }

      document.getElementById('modal-price').textContent = formatPrice(newTotal);
    };

    function closeDetailsModal() {
      const modal = document.getElementById('details-modal');
      const content = document.getElementById('details-modal-content');
      modal.classList.add('opacity-0');
      content.classList.add('translate-y-8', 'opacity-0', 'scale-95');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    }

    function buildAddonsString(addonsObj, dict) {
      if (!addonsObj) return '';
      let names = [];
      Object.keys(addonsObj).forEach(k => {
        if (dict[k]) names.push(dict[k]);
      });
      return names.length > 0 ? (' + ' + names.join(' + ')) : '';
    }

    function handleAddToCart(id, type) {
      if (!isLoggedIn()) {
        showToast('กรุณาเข้าสู่ระบบก่อนทำการจอง', 'warning');
        setTimeout(() => navigateTo('login'), 1500);
        return;
      }
      const itemData = allData[type].find(i => i.itemId === id);
      if (!itemData) return;

      const guestsStr = document.getElementById('search-guests')?.value || '1';
      const guests = parseInt(guestsStr) || 1;

      let unitPrice = itemData.totalPrice || itemData.price || 0;
      let finalItemDetails = { ...itemData.details };

      const hotelAddonsDict = { 'insurance': 'ประกันเดินทาง', 'breakfast': 'อาหารเช้า', 'airport_transfer': 'รถรับส่ง', 'spa': 'สปา', 'late_checkout': 'เลทเช็คเอาท์' };

      if (type === 'hotel') {
        const checkIn = document.getElementById('hotel-checkin').value;
        const checkOut = document.getElementById('hotel-checkout').value;

        let newTotal = currentSelection.roomPrice * currentModalNights;
        if (currentSelection.hotelAddons) {
          Object.entries(currentSelection.hotelAddons).forEach(([aid, price]) => {
            if (aid === 'breakfast') newTotal += price * currentModalNights;
            else newTotal += price;
          });
        }
        unitPrice = newTotal;

        let roomStr = currentSelection.roomType;
        if (roomStr === 'standard') roomStr = 'Standard Room';
        if (roomStr === 'deluxe') roomStr = 'Deluxe Sea View';
        if (roomStr === 'suite') roomStr = 'Executive Suite';
        roomStr += buildAddonsString(currentSelection.hotelAddons, hotelAddonsDict);

        finalItemDetails = {
          hotelName: itemData.details.hotelName,
          roomType: roomStr,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          nights: currentModalNights
        };
      } else if (type === 'activity') {
        let addonsTotal = 0;
        let addonsArr = [];

        if (currentSelection.activityAddons) {
          Object.entries(currentSelection.activityAddons).forEach(([aid, aprice]) => {
            addonsTotal += aprice;
            const actAddon = (itemData.details?.addOns || itemData.addOns || []).find(x => x.id === aid);
            if (actAddon) addonsArr.push(actAddon.name);
          });
        }

        unitPrice += addonsTotal;

        finalItemDetails = {
          title: itemData.title || itemData.details?.title,
          category: itemData.category || itemData.details?.category,
          duration: itemData.duration || itemData.details?.duration,
          imageUrl: itemData.imageUrl || itemData.details?.imageUrl,
          selectedAddOns: addonsArr
        };
      } else {
        if (currentSelection.seat) unitPrice += 150;
        if (currentSelection.baggage) unitPrice += currentSelection.baggage;

        let flightStr = itemData.details.flightNo;
        if (currentSelection.seat) flightStr += ` | ที่นั่ง: ${currentSelection.seat}`;
        if (currentSelection.baggageLabel && currentSelection.baggage > 0) flightStr += ` | กระเป๋า: ${currentSelection.baggageLabel}`;

        finalItemDetails = {
          flightNo: flightStr,
          airline: itemData.details.airline,
          origin: itemData.details.origin,
          destination: itemData.details.destination,
          seat: currentSelection.seat || 'Random'
        };
      }

      const cartItem = {
        itemId: id,
        itemType: type,
        quantity: guests,
        unitPrice: unitPrice,
        totalPrice: unitPrice * guests,
        details: finalItemDetails
      };

      addToCart(cartItem);
      updateFloatingCart();
      showToast('เพิ่มรายการลงในตะกร้าสำเร็จ!', 'success');
    }

    function handleAddPackageToCart(pkgItemId) {
      if (!isLoggedIn()) {
        showToast('กรุณาเข้าสู่ระบบก่อนทำการจอง', 'warning');
        setTimeout(() => navigateTo('login'), 1500);
        return;
      }
      const pkg = allData.package.find(p => p.itemId === pkgItemId);
      if (!pkg) return;

      const guests = parseInt(document.getElementById('search-guests').value) || 1;
      const ob = pkg.details.outbound;
      const rt = pkg.details.returnFlight;
      const h = pkg.details.hotel;

      let basePkgTotal = pkg.totalPrice;
      if (ob) {
        if (currentSelection.pkgSeats['outbound']) basePkgTotal += 150;
        if (currentSelection.pkgBaggage['outbound']) basePkgTotal += currentSelection.pkgBaggage['outbound'].price;
      }
      if (rt) {
        if (currentSelection.pkgSeats['return']) basePkgTotal += 150;
        if (currentSelection.pkgBaggage['return']) basePkgTotal += currentSelection.pkgBaggage['return'].price;
      }

      if (h) {
        const baseRoomPrice = h.pricePerNight || (h.totalPrice / (h.details.nights || 1));
        if (currentSelection.roomPrice > baseRoomPrice) {
          basePkgTotal += (currentSelection.roomPrice - baseRoomPrice) * pkg.defaultNights;
        }
        if (currentSelection.pkgHotelAddons) {
          Object.entries(currentSelection.pkgHotelAddons).forEach(([id, price]) => {
            if (id === 'breakfast') basePkgTotal += price * pkg.defaultNights;
            else basePkgTotal += price;
          });
        }
      }

      let targetTotal = basePkgTotal * guests;
      let usedTotal = 0;

      const hotelAddonsDict = { 'insurance': 'ประกันเดินทาง', 'breakfast': 'อาหารเช้า', 'airport_transfer': 'รถรับส่ง', 'spa': 'สปา', 'late_checkout': 'เลทเช็คเอาท์' };

      if (ob) {
        let obAddonsCost = 0;
        if (currentSelection.pkgSeats['outbound']) obAddonsCost += 150;
        if (currentSelection.pkgBaggage['outbound']) obAddonsCost += currentSelection.pkgBaggage['outbound'].price;

        let obTotal = Math.floor((ob.price + obAddonsCost) * 0.85) * guests;
        usedTotal += obTotal;

        let flightStr = ob.flightNo;
        if (currentSelection.pkgSeats['outbound']) flightStr += ` | ที่นั่ง: ${currentSelection.pkgSeats['outbound']}`;
        if (currentSelection.pkgBaggage['outbound'] && currentSelection.pkgBaggage['outbound'].price > 0) flightStr += ` | กระเป๋า: ${currentSelection.pkgBaggage['outbound'].label}`;

        addToCart({
          itemId: ob.flightItemId,
          itemType: 'flight',
          quantity: guests,
          unitPrice: Math.floor((ob.price + obAddonsCost) * 0.85),
          totalPrice: obTotal,
          details: { flightNo: flightStr, airline: ob.airline, origin: ob.origin, destination: ob.destination, isPackage: true, packageId: pkgItemId }
        });
      }

      if (rt) {
        let rtAddonsCost = 0;
        if (currentSelection.pkgSeats['return']) rtAddonsCost += 150;
        if (currentSelection.pkgBaggage['return']) rtAddonsCost += currentSelection.pkgBaggage['return'].price;

        let rtTotal = Math.floor((rt.price + rtAddonsCost) * 0.85) * guests;
        usedTotal += rtTotal;

        let flightStr = rt.flightNo;
        if (currentSelection.pkgSeats['return']) flightStr += ` | ที่นั่ง: ${currentSelection.pkgSeats['return']}`;
        if (currentSelection.pkgBaggage['return'] && currentSelection.pkgBaggage['return'].price > 0) flightStr += ` | กระเป๋า: ${currentSelection.pkgBaggage['return'].label}`;

        addToCart({
          itemId: rt.flightItemId,
          itemType: 'flight',
          quantity: guests,
          unitPrice: Math.floor((rt.price + rtAddonsCost) * 0.85),
          totalPrice: rtTotal,
          details: { flightNo: flightStr, airline: rt.airline, origin: rt.origin, destination: rt.destination, isPackage: true, packageId: pkgItemId }
        });
      }

      if (h) {
        const hotelNights = pkg.defaultNights;
        let checkIn = document.getElementById('search-date-from').value;
        let checkOut = document.getElementById('search-date-to').value;
        if (!checkIn) {
          checkIn = new Date().toISOString().split('T')[0];
          const out = new Date();
          out.setDate(out.getDate() + hotelNights);
          checkOut = out.toISOString().split('T')[0];
        }

        let hotelTotal = targetTotal - usedTotal;

        let roomStr = currentSelection.roomType || h.roomType;
        if (roomStr === 'standard') roomStr = 'Standard Room';
        if (roomStr === 'deluxe') roomStr = 'Deluxe Sea View';
        if (roomStr === 'suite') roomStr = 'Executive Suite';
        roomStr += buildAddonsString(currentSelection.pkgHotelAddons, hotelAddonsDict);

        addToCart({
          itemId: h.hotelItemId,
          itemType: 'hotel',
          quantity: 1,
          unitPrice: hotelTotal,
          totalPrice: hotelTotal,
          details: { hotelName: h.hotelName, roomType: roomStr, checkInDate: checkIn, checkOutDate: checkOut, nights: hotelNights, isPackage: true, packageId: pkgItemId }
        });
      }

      updateFloatingCart();
      showToast('เพิ่มแพ็คเกจลงตะกร้าสำเร็จ! (ลด 15%)', 'success');
    }

    function updateFloatingCart() {
      const cart = getCart();
      const count = cart.length;
      document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
      document.getElementById('cart-total-float').textContent = formatPrice(getCartTotal());
      document.getElementById('floating-cart').style.transform = count > 0 ? 'translateY(0)' : 'translateY(100%)';
    }

    function goToCheckout() {
      if (getCart().length === 0) return;
      navigateTo('trip-details');
    }

    let currentSmartTripData = null;
    let selectedSmartTripTier = 'signature';

    async function generateSmartTrip() {
      window.unlockedUltraVip = false;
      const dest = document.getElementById('smart-dest').value;
      const style = document.getElementById('smart-style').value;

      // SYNC: Update the main search bar dest to match smart-dest
      const searchDest = document.getElementById('search-dest');
      if (searchDest && dest) { searchDest.value = dest; }

      // Read values from search bar
      const originElem = document.getElementById('search-origin');
      const origin = originElem && originElem.value ? originElem.value : 'BKK';

      const dfElem = document.getElementById('search-date-from');
      const dtElem = document.getElementById('search-date-to');
      const dateFrom = dfElem ? dfElem.value : '';
      const dateTo = dtElem ? dtElem.value : '';

      const guestsElem = document.getElementById('search-guests');
      const guestsStr = guestsElem ? guestsElem.value : '1';
      const guests = parseInt(guestsStr) || 1;

      // Calculate real nights from dates
      let nights = 2; // Default 3D2N
      if (dateFrom && dateTo) {
        const d1 = new Date(dateFrom);
        const d2 = new Date(dateTo);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) nights = diffDays;
      }

      const btn = document.querySelector('#smart-trip-container button[onclick="generateSmartTrip()"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> กำลังดึงข้อมูลล่าสุด...`;
      btn.disabled = true;

      try {
        const cityMatch = CITY_DB.find(c => c.code === dest);
        const rawCityName = cityMatch ? cityMatch.rawCity.toLowerCase() : dest.toLowerCase();

        // DYNAMIC ON-DEMAND FETCHING
        // Always get fresh flights and hotels for origin -> dest
        const flightParams = { origin, dest };
        if (dateFrom) flightParams.dateFrom = dateFrom;
        if (dateTo) flightParams.dateTo = dateTo;

        const hotelParams = { dest };
        if (dateFrom) hotelParams.dateFrom = dateFrom;
        if (dateTo) hotelParams.dateTo = dateTo;

        const [fRes, hRes, aRes] = await Promise.all([
          apiSearchFlights(flightParams).catch(() => ({ data: { flights: [] } })),
          apiSearchHotels(hotelParams).catch(() => ({ data: { hotels: [] } })),
          apiCall(`/api/search?type=activity&dest=${dest}`).catch(() => ({ data: { activities: [] } }))
        ]);

        let localFlights = fRes.data?.flights || [];
        let localHotels = hRes.data?.hotels || [];
        let localActs = aRes.data?.activities || allData.activity || [];

        // Match Outbound and Return
        let flightsOut = localFlights.filter(f => {
          const oMatch = (f.details?.origin || f.origin) === origin || (f.details?.originCode || f.origin) === origin;
          const dMatch = (f.details?.destination || f.destination) === dest || (f.details?.destinationCode || f.destination) === dest;
          return oMatch && dMatch;
        });

        let flightsRet = localFlights.filter(f => {
          const oMatch = (f.details?.origin || f.origin) === dest || (f.details?.originCode || f.origin) === dest;
          const dMatch = (f.details?.destination || f.destination) === origin || (f.details?.destinationCode || f.destination) === origin;
          return oMatch && dMatch;
        });

        // Fallbacks if one-way doesn't exactly match
        if (flightsOut.length === 0) flightsOut = localFlights.filter(f => (f.details?.destination || f.destination) === dest);
        if (flightsRet.length === 0) flightsRet = localFlights.filter(f => (f.details?.origin || f.origin) === dest);

        let hotels = localHotels.filter(h => {
          const loc = (h.details?.location || h.location || '').toLowerCase();
          return loc.includes(rawCityName) || loc.includes(dest.toLowerCase());
        });
        if (hotels.length === 0) hotels = localHotels;

        let acts = localActs.filter(a => {
          const acode = (a.destinationCode || a.details?.destinationCode || a.details?.destination || '').toLowerCase();
          return acode === dest.toLowerCase() || acode === rawCityName;
        });
        if (acts.length === 0) acts = localActs; // fallback

        // Style Filters for activities
        if (style === 'luxury') {
          acts = acts.filter(a => (a.category || a.details?.category || '').includes('luxury'));
        } else if (style === 'romantic') {
          acts = acts.filter(a => (a.category || a.details?.category || '').includes('luxury') || (a.category || a.details?.category || '').includes('culture'));
        } else if (style === 'adventure') {
          acts = acts.filter(a => (a.category || a.details?.category || '').includes('adventure') || (a.category || a.details?.category || '').includes('nature'));
        } else if (style === 'family') {
          acts = acts.filter(a => {
            const t = (a.title || a.details?.title || '').toLowerCase();
            return !t.includes('สปา') && !t.includes('ออนเซ็น') && !t.includes('ไวน์');
          });
        }
        if (acts.length === 0) acts = localActs; // ultimate fallback
        // EXPOSE FOR SWAP MODAL
        window.currentSmartTripItems = {
            flightsOut: flightsOut,
            flightsRet: flightsRet,
            hotels: hotels,
            acts: acts
        };
    

        const sortF = (a, b) => (a.totalPrice || a.price || 0) - (b.totalPrice || b.price || 0);
        const sortH = (a, b) => (a.pricePerNight || a.totalPrice || 0) - (b.pricePerNight || b.totalPrice || 0);
        const sortA = (a, b) => (a.totalPrice || a.price || 0) - (b.totalPrice || b.price || 0);

        flightsOut = flightsOut.sort(sortF);
        flightsRet = flightsRet.sort(sortF);
        hotels = hotels.sort(sortH);
        acts = acts.sort(sortA);

        if (flightsOut.length === 0 || hotels.length === 0) {
          showToast('ไม่พบข้อมูลเที่ยวบินหรือโรงแรมที่รองรับสำหรับเส้นทางนี้', 'warning');
          btn.innerHTML = originalText;
          btn.disabled = false;
          return;
        }

        function buildTier(ob, rt, h, a1, a2) {
          const roomPrice = h.pricePerNight || (h.totalPrice / (h.details?.nights || 1)) || 5000;
          const hTotal = roomPrice * nights; // SYNCHRONIZED NIGHTS!
          const obPrice = ob.totalPrice || ob.price || 5000;
          const rtPrice = rt.totalPrice || rt.price || 5000;
          const a1Price = a1.totalPrice || a1.price || 0;
          const a2Price = a2.totalPrice || a2.price || 0;

          const subtotal = (obPrice + rtPrice + hTotal + a1Price + a2Price) * guests; // SYNCHRONIZED GUESTS!
          const pkgDiscount = Math.floor(subtotal * 0.15);
          let grandTotal = subtotal - pkgDiscount;

          let vipDiscount = 0;
          const isVipUser = (typeof isUserVip === 'function') ? isUserVip() : false;
          if (isVipUser) {
            vipDiscount = Math.floor(grandTotal * 0.05); // 5% On-top discount for VIPs
            grandTotal -= vipDiscount;
          }

          return { ob, rt, h, a1, a2, guests, nights, totals: { subtotal, pkgDiscount, vipDiscount, grandTotal } };
        }

        // VALUE TIER
        const v_ob = flightsOut[0];
        const v_rt = flightsRet[0] || flightsOut[0];
        const v_h = hotels[0];
        const v_a1 = acts[0];
        const v_a2 = acts.length > 1 ? acts[1] : acts[0];

        // SIGNATURE TIER
        const s_ob = flightsOut[Math.floor(flightsOut.length / 2)];
        const s_rt = flightsRet[Math.floor(flightsRet.length / 2)] || flightsOut[0];
        const s_h = hotels[Math.floor(hotels.length / 2)];
        const s_a1 = acts[Math.floor(acts.length / 2)];
        const s_a2 = acts.length > 2 ? acts[Math.floor(acts.length / 2) + 1] : acts[0];

        // VIP TIER
        const vip_ob = flightsOut[flightsOut.length - 1];
        const vip_rt = flightsRet[flightsRet.length - 1] || flightsOut[flightsOut.length - 1];
        const vip_h = hotels[hotels.length - 1];
        const vip_a1 = acts[acts.length - 1];
        const vip_a2 = acts.length > 1 ? acts[acts.length - 2] : acts[acts.length - 1];

        currentSmartTripData = {
          value: buildTier(v_ob, v_rt, v_h, v_a1, v_a2),
          signature: buildTier(s_ob, s_rt, s_h, s_a1, s_a2),
          vip: buildTier(vip_ob, vip_rt, vip_h, vip_a1, vip_a2)
        };
        selectedSmartTripTier = 'signature';

        renderSmartTripResult();

        btn.innerHTML = originalText;
        btn.disabled = false;

        const resDiv = document.getElementById('smart-trip-result');
        resDiv.classList.remove('hidden');
        resDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

      } catch (err) {
        console.error('Smart Trip Error:', err);
        showToast('เกิดข้อผิดพลาดในการสร้างทริป', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }

    window.selectSmartTripTier = function (tier) {
      selectedSmartTripTier = tier;
      renderSmartTripResult();
    }

    function renderSmartTripResult() {
      if (!currentSmartTripData) return;
      const d = currentSmartTripData[selectedSmartTripTier];

      const destSelect = document.getElementById('smart-dest');
      const dest = destSelect ? destSelect.value : '';
      const destName = destSelect.options[destSelect.selectedIndex].text.replace(/ \(.*\)/, ''); // Remove the (NRT) part

      // Build Tier Cards
      const tiers = [
        { id: 'value', badge: 'Value Luxury', title: 'เที่ยวคุ้ม สบายกระเป๋า', price: currentSmartTripData.value.totals.grandTotal },
        { id: 'signature', badge: 'Signature (แนะนำ)', title: 'สมดุลแห่งความหรูหรา', price: currentSmartTripData.signature.totals.grandTotal, isHot: true },
        { id: 'vip', badge: 'Ultra VIP Elite', title: 'ที่สุดแห่งความเอ็กซ์คลูซีฟ', price: currentSmartTripData.vip.totals.grandTotal }
      ];

      const isVipUser = (typeof isUserVip === 'function') ? isUserVip() : false;
      const cardsHtml = tiers.map(t => {
        const isLocked = t.id === 'vip' && !isVipUser && !window.unlockedUltraVip;
        const isActive = selectedSmartTripTier === t.id;
        const activeClass = isActive ? 'border-secondary ring-2 ring-secondary bg-[#fe932c]/5' : 'border-gray-200 hover:border-secondary/50 bg-white';
        const textClass = isActive ? 'text-secondary font-bold' : 'text-gray-500';
        const hotBadge = t.isHot ? '<span class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Hot</span>' : '';

        if (isLocked) {
          return `
               <div onclick="handleUltraVipClick()" class="relative cursor-pointer rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/40 p-4 transition-all hover:bg-orange-50 text-center group overflow-hidden">
                   <div class="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 transition-opacity group-hover:opacity-0">
                       <span class="material-symbols-outlined text-orange-500 text-2xl mb-1">lock</span>
                       <span class="text-[10px] font-bold text-orange-600">VIP Exclusive</span>
                   </div>
                   <div class="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 flex flex-col items-center justify-center z-20 transition-opacity shadow-sm hover:bg-orange-100 transform scale-105 duration-300">
                       <span class="material-symbols-outlined text-white text-xl mb-1">workspace_premium</span>
                       <span class="text-[11px] font-bold text-white">รับส่วนลดพิเศษ ปลดล็อกเลย</span>
                   </div>
                   <p class="text-xs font-bold mb-1 text-gray-400">${t.badge}</p>
                   <p class="text-xs text-gray-400 mb-3">${t.title}</p>
                   <p class="text-lg font-bold text-gray-400 blur-[2px]">฿${t.price.toLocaleString()}</p>
                   <p class="text-[10px] text-gray-400 mt-2">คลิกเพื่อปลดล็อก</p>
               </div>
               `;
        }

        return `
           <div onclick="selectSmartTripTier('${t.id}')" class="relative cursor-pointer rounded-xl border-2 ${activeClass} p-4 transition-all hover:shadow-md text-center">
              ${hotBadge}
              <p class="text-xs font-bold mb-1 ${isActive ? 'text-secondary' : 'text-primary'}">${t.badge}</p>
              <p class="text-xs text-gray-500 mb-3">${t.title}</p>
              <p class="text-lg font-bold text-gray-800">฿${t.price.toLocaleString()}</p>
              <p class="text-[10px] ${textClass} mt-2">${isActive ? 'กำลังเลือก ✓' : 'คลิกเพื่อดูแผน'}</p>
           </div>
           `;
      }).join('');

      const html = `
         <div class="mt-8 border-t border-gray-100 pt-8 animate-[fadeIn_0.5s_ease-out]">
            <div class="mb-8">
               <h3 class="text-2xl font-display font-bold text-primary text-center mb-6">เลือกแพ็กเกจทริป: ${destName} (3 วัน 2 คืน)</h3>
               <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-2">
                   ${cardsHtml}
               </div>
            </div>

            <!-- Timeline & Map Wrapper -->
             <div class="mt-10 flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
               
               <!-- Left Column: Timeline -->
               <div class="flex-1 space-y-6">
                  <!-- DAY 1 -->
                  <div class="relative pl-8 border-l-2 border-gray-200">
                    <div class="absolute w-8 h-8 bg-white border-2 border-primary rounded-full -left-[17px] top-0 flex items-center justify-center font-bold text-primary text-xs shadow-sm">1</div>
                    <h4 class="font-bold text-lg text-gray-800 mb-4 ml-2">วันที่ 1: เดินทาง & เช็คอิน</h4>
                    
                    <div class="bg-gray-50 rounded-xl p-4 mb-3 flex items-center gap-4 hover:shadow-md transition border border-gray-100">
                       <div class="w-12 h-12 bg-blue-100 text-primary rounded-lg flex items-center justify-center shrink-0"><span class="material-symbols-outlined">flight_takeoff</span></div>
                       <div class="flex-1">
                          <p class="text-xs text-gray-500 font-bold mb-0.5">เที่ยวบินขาไป • ${d.ob.airline || d.ob.details?.airline}</p>
                          <p class="text-sm font-bold text-gray-800">${d.ob.details?.origin || d.ob.origin || ''} ➔ ${d.ob.details?.destination || d.ob.destination || ''} (${d.ob.flightNo || d.ob.details?.flightNo})</p>
                       </div>
                    </div>
                    
                    <div class="bg-gray-50 rounded-xl p-4 mb-3 flex items-center gap-4 hover:shadow-md transition border border-gray-100 relative group">
                       <img src="${d.h.imageUrl || d.h.details?.imageUrl}" class="w-16 h-12 object-cover rounded-lg shrink-0" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80'">
                       <div class="flex-1">
                          <div class="flex justify-between items-start">
                              <p class="text-xs text-gray-500 font-bold mb-0.5">เช็คอินเข้าพัก (${d.nights || 2} คืน)</p>
                              <button onclick="openSwapModal('hotel')" class="text-[11px] text-secondary font-bold hover:underline bg-orange-50 px-2 py-0.5 rounded flex items-center gap-1 transition-opacity shadow-sm hover:bg-orange-100"><span class="material-symbols-outlined text-[12px]">swap_horiz</span> เปลี่ยน</button>
                          </div>
                          <p class="text-sm font-bold text-gray-800 pr-16">${d.h.hotelName || d.h.details?.hotelName}</p>
                          <p class="text-xs text-secondary mt-0.5">${d.h.roomType || d.h.details?.roomType || 'Standard Room'}</p>
                       </div>
                    </div>
                  </div>

                  <!-- DAY 2 -->
                  <div class="relative pl-8 border-l-2 border-gray-200">
                    <div class="absolute w-8 h-8 bg-white border-2 border-primary rounded-full -left-[17px] top-0 flex items-center justify-center font-bold text-primary text-xs shadow-sm">2</div>
                    <h4 class="font-bold text-lg text-gray-800 mb-4 ml-2">วันที่ 2: เที่ยวชมไฮไลต์</h4>
                    
                    <div class="bg-white rounded-xl p-4 mb-3 flex items-center gap-4 shadow-sm hover:shadow-md transition border border-gray-200 relative group">
                       <img src="${d.a1.imageUrl || d.a1.details?.imageUrl}" class="w-20 h-16 object-cover rounded-lg shrink-0" onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&q=80'">
                       <div class="flex-1">
                          <div class="flex justify-between items-start">
                              <p class="text-xs text-secondary font-bold mb-0.5">กิจกรรมหลักประจำทริป</p>
                              <button onclick="openSwapModal('a1')" class="text-[11px] text-secondary font-bold hover:underline bg-orange-50 px-2 py-0.5 rounded flex items-center gap-1 transition-opacity shadow-sm hover:bg-orange-100"><span class="material-symbols-outlined text-[12px]">swap_horiz</span> เปลี่ยน</button>
                          </div>
                          <p class="text-sm font-bold text-gray-800 line-clamp-1 pr-16">${d.a1.title || d.a1.details?.title}</p>
                       </div>
                    </div>
                  </div>

                  <!-- DAY 3 -->
                  <div class="relative pl-8 border-l-2 border-transparent">
                    <div class="absolute w-8 h-8 bg-white border-2 border-primary rounded-full -left-[17px] top-0 flex items-center justify-center font-bold text-primary text-xs shadow-sm">3</div>
                    <h4 class="font-bold text-lg text-gray-800 mb-4 ml-2">วันที่ 3: เก็บตก & เดินทางกลับ</h4>
                    
                    <div class="bg-white rounded-xl p-4 mb-3 flex items-center gap-4 shadow-sm hover:shadow-md transition border border-gray-200 relative group">
                       <img src="${d.a2.imageUrl || d.a2.details?.imageUrl}" class="w-20 h-16 object-cover rounded-lg shrink-0" onerror="this.src='https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=80'">
                       <div class="flex-1">
                          <div class="flex justify-between items-start">
                              <p class="text-xs text-secondary font-bold mb-0.5">กิจกรรมยามเช้า</p>
                              <button onclick="openSwapModal('a2')" class="text-[11px] text-secondary font-bold hover:underline bg-orange-50 px-2 py-0.5 rounded flex items-center gap-1 transition-opacity shadow-sm hover:bg-orange-100"><span class="material-symbols-outlined text-[12px]">swap_horiz</span> เปลี่ยน</button>
                          </div>
                          <p class="text-sm font-bold text-gray-800 line-clamp-1 pr-16">${d.a2.title || d.a2.details?.title}</p>
                       </div>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-4 mb-3 flex items-center gap-4 hover:shadow-md transition border border-gray-100">
                       <div class="w-12 h-12 bg-gray-200 text-primary rounded-lg flex items-center justify-center shrink-0"><span class="material-symbols-outlined">flight_land</span></div>
                       <div class="flex-1">
                          <p class="text-xs text-gray-500 font-bold mb-0.5">เที่ยวบินขากลับ • ${d.rt.airline || d.rt.details?.airline}</p>
                          <p class="text-sm font-bold text-gray-800">${d.rt.details?.origin || d.rt.origin || ''} ➔ ${d.rt.details?.destination || d.rt.destination || ''} (${d.rt.flightNo || d.rt.details?.flightNo})</p>
                       </div>
                    </div>
                  </div>
               </div>
               
               <!-- Right Column: Visual Dashboard -->
               <div class="lg:w-1/3 w-full">
                  <div class="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 sticky top-24">
                     <!-- Weather Widget -->
                     ${(() => {
                         const weatherMap = {
                             'CNX': { temp: '22°C', desc: 'เย็นสบาย หมอกบาง', icon: 'partly_cloudy_day', color: 'text-blue-500' },
                             'HKT': { temp: '29°C', desc: 'แดดจัด ทะเลสวย', icon: 'sunny', color: 'text-orange-500' },
                             'KBV': { temp: '28°C', desc: 'แดดดี คลื่นสงบ', icon: 'sunny', color: 'text-orange-500' },
                             'BKK': { temp: '32°C', desc: 'ร้อน ท้องฟ้าโปร่ง', icon: 'sunny', color: 'text-orange-600' },
                             'PMI': { temp: '26°C', desc: 'ลมเย็น แดดเมดิเตอร์เรเนียน', icon: 'sunny', color: 'text-orange-500' },
                             'NRT': { temp: '18°C', desc: 'อากาศเย็นสบาย', icon: 'cloud', color: 'text-gray-500' },
                             'CTS': { temp: '-2°C', desc: 'หิมะตก สกีรีสอร์ท', icon: 'ac_unit', color: 'text-blue-400' }
                         };
                         const w = weatherMap[dest] || { temp: '25°C', desc: 'อากาศกำลังดี', icon: 'partly_cloudy_day', color: 'text-blue-500' };
                         return `
                         <div class="bg-white rounded-xl p-4 shadow-sm mb-5 flex items-center justify-between border border-gray-100">
                             <div>
                                 <p class="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">สภาพอากาศโดยประมาณ</p>
                                 <div class="flex items-center gap-2 mt-1">
                                     <span class="material-symbols-outlined ${w.color} text-3xl drop-shadow-sm">${w.icon}</span>
                                     <div>
                                         <p class="font-black text-gray-800 text-lg leading-tight">${w.temp}</p>
                                         <p class="text-xs text-gray-500 font-medium">${w.desc}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>`;
                     })()}
                     
                     <!-- Map Mockup -->
                     <h4 class="font-bold text-gray-800 mb-3 text-sm flex items-center gap-1"><span class="material-symbols-outlined text-primary text-[18px]">explore</span> แผนที่เส้นทาง (Interactive Route)</h4>
                     <div onclick="openMapModal()" class="relative w-full h-[220px] bg-gray-200 rounded-xl overflow-hidden shadow-inner border border-gray-200 cursor-pointer group hover:shadow-md transition-shadow">
                         <!-- Overlay for hover -->
                         <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-[60]">
                             <span class="bg-white text-primary font-bold px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 border border-gray-100"><span class="material-symbols-outlined text-lg">zoom_in</span> ขยายแผนที่ (ฟรี)</span>
                         </div>
                         <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80" class="w-full h-full object-cover opacity-[0.65]" style="filter: sepia(0.2) hue-rotate(190deg) contrast(0.9);" />
                         <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                             <style>
                                 @keyframes dashanim { to { stroke-dashoffset: -20; } }
                                 .route-line { stroke-dasharray: 4,4; animation: dashanim 3s linear infinite; }
                             </style>
                             <path d="M 23,17 L 78,42 L 53,77 L 18,52 L 23,17" fill="none" stroke="#fe932c" stroke-width="2.5" class="route-line" />
                         </svg>
                         <div class="absolute top-[15%] left-[20%] flex flex-col items-center group cursor-pointer hover:z-50">
                             <div class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-lg ring-2 ring-white hover:scale-110 transition-transform"><span class="material-symbols-outlined text-[14px]">flight_land</span></div>
                             <div class="absolute top-7 bg-white text-[10px] px-2 py-1 rounded shadow text-gray-700 whitespace-nowrap transition-opacity shadow-sm hover:bg-orange-100 font-bold">สนามบินปลายทาง</div>
                         </div>
                         <div class="absolute top-[40%] left-[75%] flex flex-col items-center group cursor-pointer hover:z-50">
                             <div class="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-lg ring-2 ring-white hover:scale-110 transition-transform"><span class="material-symbols-outlined text-[14px]">hotel</span></div>
                             <div class="absolute top-7 right-0 bg-white text-[10px] px-2 py-1 rounded shadow text-gray-700 whitespace-nowrap transition-opacity shadow-sm hover:bg-orange-100 font-bold line-clamp-1 max-w-[100px]">${d.h.hotelName || d.h.details?.hotelName}</div>
                         </div>
                         <div class="absolute top-[75%] left-[50%] flex flex-col items-center group cursor-pointer hover:z-50">
                             <div class="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-lg ring-2 ring-white hover:scale-110 transition-transform"><span class="material-symbols-outlined text-[14px]">local_activity</span></div>
                             <div class="absolute top-7 bg-white text-[10px] px-2 py-1 rounded shadow text-gray-700 whitespace-nowrap transition-opacity shadow-sm hover:bg-orange-100 font-bold line-clamp-1 max-w-[120px]">${d.a1.title || d.a1.details?.title}</div>
                         </div>
                         <div class="absolute top-[50%] left-[15%] flex flex-col items-center group cursor-pointer hover:z-50">
                             <div class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-lg ring-2 ring-white hover:scale-110 transition-transform"><span class="material-symbols-outlined text-[14px]">photo_camera</span></div>
                             <div class="absolute top-7 bg-white text-[10px] px-2 py-1 rounded shadow text-gray-700 whitespace-nowrap transition-opacity shadow-sm hover:bg-orange-100 font-bold line-clamp-1 max-w-[120px]">${d.a2.title || d.a2.details?.title}</div>
                         </div>
                     </div>
                  </div>
               </div>
               
             </div>

            <div class="mt-10 pt-6 border-t border-gray-200 text-center">
               <div class="flex flex-col md:flex-row gap-4 justify-center items-center">
               <button onclick="saveCurrentSmartTrip()" class="w-full md:w-auto px-6 py-4 bg-white border-2 border-secondary text-secondary hover:bg-secondary/10 rounded-xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2">
                 <span class="material-symbols-outlined">bookmark_add</span> บันทึกทริปนี้
               </button>
               <button onclick="bookSmartTrip()" class="w-full md:w-auto px-10 py-4 bg-primary hover:bg-blue-900 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                 <span class="material-symbols-outlined">shopping_cart_checkout</span> จองแพ็กเกจนี้ (฿${d.totals.grandTotal.toLocaleString()})
               </button>
               </div>
               <p class="text-xs text-gray-500 mt-4"><span class="material-symbols-outlined text-[12px]">security</span> ชำระเงินปลอดภัยและยืนยันทันที พร้อมส่วนลด Bundle 15%</p>
            </div>
         </div>
       `;
      document.getElementById('smart-trip-result').innerHTML = html;
    }

    function bookSmartTrip() {
      if (!isLoggedIn()) {
        showToast('กรุณาเข้าสู่ระบบก่อนทำการจอง', 'warning');
        setTimeout(() => navigateTo('login'), 1500);
        return;
      }
      const d = currentSmartTripData[selectedSmartTripTier];
      const guests = d.guests;
      const pkgId = `smart-${Date.now()}`;

      // Add Flight OB
      addToCart({
        itemId: d.ob.flightItemId || d.ob.itemId,
        itemType: 'flight',
        quantity: guests,
        unitPrice: Math.floor((d.ob.price || d.ob.totalPrice) * 0.85),
        totalPrice: Math.floor((d.ob.price || d.ob.totalPrice) * 0.85) * guests,
        details: { flightNo: d.ob.flightNo || d.ob.details?.flightNo, airline: d.ob.airline || d.ob.details?.airline, origin: d.ob.origin, destination: d.ob.destination, isPackage: true, packageId: pkgId }
      });

      // Add Flight RT
      addToCart({
        itemId: d.rt.flightItemId || d.rt.itemId,
        itemType: 'flight',
        quantity: guests,
        unitPrice: Math.floor((d.rt.price || d.rt.totalPrice) * 0.85),
        totalPrice: Math.floor((d.rt.price || d.rt.totalPrice) * 0.85) * guests,
        details: { flightNo: d.rt.flightNo || d.rt.details?.flightNo, airline: d.rt.airline || d.rt.details?.airline, origin: d.rt.origin, destination: d.rt.destination, isPackage: true, packageId: pkgId }
      });

      // Add Hotel
      const roomPrice = d.h.pricePerNight || (d.h.totalPrice / (d.h.details?.nights || 1)) || 5000;
      const hTotal = roomPrice * d.nights;
      addToCart({
        itemId: d.h.hotelItemId || d.h.itemId,
        itemType: 'hotel',
        quantity: 1,
        unitPrice: Math.floor(hTotal * 0.85),
        totalPrice: Math.floor(hTotal * 0.85),
        details: { hotelName: d.h.hotelName || d.h.details?.hotelName, roomType: d.h.roomType || d.h.details?.roomType || 'Deluxe Room', checkInDate: new Date().toISOString().split('T')[0], nights: d.nights, isPackage: true, packageId: pkgId }
      });

      // Add Activity 1
      const a1Price = d.a1.price || d.a1.totalPrice || 0;
      addToCart({
        itemId: d.a1.itemId,
        itemType: 'activity',
        quantity: guests,
        unitPrice: Math.floor(a1Price * 0.85),
        totalPrice: Math.floor(a1Price * 0.85) * guests,
        details: { title: d.a1.title || d.a1.details?.title, category: d.a1.category || d.a1.details?.category, selectedAddOns: ['Smart Package VIP'] }
      });

      // Add Activity 2
      const a2Price = d.a2.price || d.a2.totalPrice || 0;
      addToCart({
        itemId: d.a2.itemId,
        itemType: 'activity',
        quantity: guests,
        unitPrice: Math.floor(a2Price * 0.85),
        totalPrice: Math.floor(a2Price * 0.85) * guests,
        details: { title: d.a2.title || d.a2.details?.title, category: d.a2.category || d.a2.details?.category, selectedAddOns: ['Smart Package VIP'] }
      });

      updateFloatingCart();
      showToast('เพิ่มทริปอัจฉริยะลงตะกร้าสำเร็จ!', 'success');
      setTimeout(() => navigateTo('trip-details'), 1500);
    }


    // --- SMART HUB LOGIC ---
    window.switchSmartHubTab = function (tab) {
      document.getElementById('smart-hub-ai').classList.add('hidden');
      document.getElementById('smart-hub-explore').classList.add('hidden');
      document.getElementById('smart-hub-saved').classList.add('hidden');

      document.getElementById('tab-btn-ai').className = 'font-medium text-gray-500 hover:text-gray-800 px-2 py-1 transition-all';
      document.getElementById('tab-btn-explore').className = 'font-medium text-gray-500 hover:text-gray-800 px-2 py-1 transition-all';
      document.getElementById('tab-btn-saved').className = 'font-medium text-gray-500 hover:text-gray-800 px-2 py-1 transition-all';

      document.getElementById(`smart-hub-${tab}`).classList.remove('hidden');
      document.getElementById(`tab-btn-${tab}`).className = 'font-bold text-secondary border-b-2 border-secondary px-2 py-1 transition-all';

      if (tab === 'explore') renderExploreTrips();
      if (tab === 'saved') renderSavedTrips();
    };


  

    window.handleUltraVipClick = function () {
      if (!currentSmartTripData || !currentSmartTripData.vip) return;

      // Calculate potential 5% savings if they were VIP
      // Currently, currentSmartTripData.vip.totals.grandTotal does not have the 5% discount applied (since user is not VIP).
      // So the discount would be 5% of this normal grandTotal.
      const normalTotal = currentSmartTripData.vip.totals.grandTotal;
      const potentialDiscount = Math.floor(normalTotal * 0.05);

      document.getElementById('upsell-discount-amt').textContent = potentialDiscount.toLocaleString();
      document.getElementById('vip-upsell-modal').classList.remove('hidden');
    }

    window.closeUpsellModal = function () {
      document.getElementById('vip-upsell-modal').classList.add('hidden');
    }

    window.unlockUltraVipNormal = function () {
      closeUpsellModal();
      window.unlockedUltraVip = true;
      if (typeof selectSmartTripTier === 'function') {
        selectSmartTripTier('vip');
      }
    }

    window.goToVipSignup = function () {
      closeUpsellModal();
      if (typeof openVipModal === 'function') {
        openVipModal();
      }
    }
  

window.currentSwapTarget = null;
window.openSwapModal = function(targetType) {
    if (!window.currentSmartTripItems || !currentSmartTripData) return;
    
    window.currentSwapTarget = targetType;
    const dest = document.getElementById('smart-dest').value;
    const tierData = currentSmartTripData[selectedSmartTripTier];
    const currentItemPrice = targetType === 'hotel' 
        ? (tierData.h.pricePerNight || (tierData.h.totalPrice / (tierData.h.details?.nights || 1)) || 5000) 
        : (tierData[targetType].price || tierData[targetType].totalPrice || 0);

    let items = [];
    if (targetType === 'hotel') {
        document.getElementById('swap-title').textContent = 'เลือกโรงแรมที่ต้องการเปลี่ยน';
        items = window.currentSmartTripItems?.hotels || [];
    } else {
        document.getElementById('swap-title').textContent = 'เลือกกิจกรรมที่ต้องการเปลี่ยน';
        items = window.currentSmartTripItems?.acts || [];
    }

    const container = document.getElementById('swap-items-container');
    container.innerHTML = items.map(item => {
        const itemPrice = item.pricePerNight || item.price || item.totalPrice || 0;
        const diff = itemPrice - currentItemPrice;
        let diffHtml = '';
        if (diff > 0) diffHtml = `<span class="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">+฿${diff.toLocaleString()}</span>`;
        else if (diff < 0) diffHtml = `<span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">-฿${Math.abs(diff).toLocaleString()}</span>`;
        else diffHtml = `<span class="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">ราคาเท่าเดิม</span>`;

        const title = item.hotelName || item.title || item.details?.hotelName || item.details?.title;
        const img = item.imageUrl || item.details?.imageUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=80';
        
        // Pass item id to select
        const id = item.hotelItemId || item.itemId || item.activityItemId || item.id;
        
        return `
        <div class="bg-white rounded-xl p-3 mb-3 flex items-center gap-4 shadow-sm border border-gray-100 hover:border-secondary transition cursor-pointer" onclick="confirmSwap('${id}', '${targetType}')">
            <img src="${img}" class="w-24 h-20 object-cover rounded-lg shrink-0">
            <div class="flex-1">
                <p class="font-bold text-gray-800 text-sm line-clamp-1 mb-1">${title}</p>
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs text-gray-500">฿${itemPrice.toLocaleString()}</span>
                    ${diffHtml}
                </div>
            </div>
            <button class="bg-secondary text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-orange-600 shadow-md">เลือก</button>
        </div>
        `;
    }).join('');

    document.getElementById('swap-item-modal').classList.remove('hidden');
}

window.closeSwapModal = function() {
    document.getElementById('swap-item-modal').classList.add('hidden');
}

window.confirmSwap = function(itemId, targetType) {
    closeSwapModal();
    const dest = document.getElementById('smart-dest').value;
    const tierData = currentSmartTripData[selectedSmartTripTier];
    
    let newItem = null;
    if (targetType === 'hotel') {
        newItem = (window.currentSmartTripItems?.hotels || []).find(h => (h.hotelItemId || h.itemId || h.id) == itemId);
        if (newItem) tierData.h = newItem;
    } else {
        newItem = (window.currentSmartTripItems?.acts || []).find(a => (a.activityItemId || a.itemId || a.id) == itemId);
        if (newItem) tierData[targetType] = newItem;
    }

    if (!newItem) return;

    // Recalculate totals
    const guests = tierData.guests;
    const nights = tierData.nights;
    
    const obPrice = tierData.ob.price || tierData.ob.totalPrice || 5000;
    const rtPrice = tierData.rt.price || tierData.rt.totalPrice || 5000;
    
    const roomPrice = tierData.h.pricePerNight || (tierData.h.totalPrice / (tierData.h.details?.nights || 1)) || 5000;
    const hTotal = roomPrice * nights;
    
    const a1Price = tierData.a1.price || tierData.a1.totalPrice || 0;
    const a2Price = tierData.a2.price || tierData.a2.totalPrice || 0;

    const subtotal = (obPrice + rtPrice + hTotal + a1Price + a2Price) * guests;
    const pkgDiscount = Math.floor(subtotal * 0.15);
    let grandTotal = subtotal - pkgDiscount;
    
    let vipDiscount = 0;
    const isVipUser = (typeof isUserVip === 'function') ? isUserVip() : false;
    if (isVipUser) {
        vipDiscount = Math.floor(grandTotal * 0.05);
        grandTotal -= vipDiscount;
    }

    tierData.totals = { subtotal, pkgDiscount, vipDiscount, grandTotal };
    
    // Re-render UI
    renderSmartTripResult();
    
    // Smooth scroll to timeline
    setTimeout(() => {
        document.getElementById('smart-trip-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('อัปเดตแผนการเดินทางสำเร็จ!', 'success');
    }, 100);
}


window.realLeafletMap = null;
window.mapRouteLine = null;
window.mapMarkers = [];

window.openMapModal = function() {
    if (!currentSmartTripData) return;
    document.getElementById('real-map-modal').classList.remove('hidden');
    document.getElementById('real-map-modal').classList.add('flex');
    
    const dest = document.getElementById('smart-dest').value;
    const d = currentSmartTripData[selectedSmartTripTier];
    
    const destSelect = document.getElementById('smart-dest');
    const destName = destSelect ? destSelect.options[destSelect.selectedIndex].text.replace(/ \(.*\)/, '') : dest;

    const airportName = 'สนามบิน ' + destName;
    const hotelName = d.h.hotelName || d.h.details?.hotelName || 'โรงแรมที่พัก';
    const actName = d.a1.title || d.a1.details?.title || 'สถานที่ทำกิจกรรม 1';
    const act2Name = d.a2.title || d.a2.details?.title || 'สถานที่ทำกิจกรรม 2';
    
    const gmLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(airportName)}&destination=${encodeURIComponent(airportName)}&waypoints=${encodeURIComponent(hotelName)}|${encodeURIComponent(actName)}|${encodeURIComponent(act2Name)}`;
    document.getElementById('btn-google-maps').href = gmLink;
    
    setTimeout(() => {
        if (!window.realLeafletMap) {
            window.realLeafletMap = L.map('real-map-container');
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(window.realLeafletMap);
        }
        
        window.mapMarkers.forEach(m => window.realLeafletMap.removeLayer(m));
        if (window.mapRouteLine) window.realLeafletMap.removeLayer(window.mapRouteLine);
        window.mapMarkers = [];
        
        const knownLocations = {
            'Hilton Pattaya': [12.9354, 100.8837],
            'Centara Grand Mirage Beach Resort Pattaya': [12.9575, 100.8856],
            'The Shore at Katathani': [7.7946, 98.3005],
            'Hilton London Park Lane': [51.5055, -0.1504],
            'Swissôtel The Stamford': [1.2933, 103.8532],
            'ทัวร์สตูดิโอ Harry Potter Warner Bros.': [51.6904, -0.4180],
            'บัตร Universal Studios Singapore VIP': [1.2540, 103.8238],
            'พาราเซลลิ่ง พัทยา': [12.9248, 100.8710],
            'ดำน้ำลึก Scuba Diving พร้อมครูฝึกส่วนตัว': [12.9220, 100.7950],
            'ล่องเรือยอร์ชคาตามารัน เที่ยวเกาะเฮ-เกาะราชา': [7.7471, 98.3614],
            'ตั๋วเครื่องบิน': [13.69, 100.75]
        };

        const cityCoords = {
            'CNX': [18.7668, 98.9626], 'HKT': [8.1132, 98.3169], 'KBV': [8.0965, 98.9843],
            'BKK': [13.6900, 100.7501], 'PMI': [39.5517, 2.7388], 'LHR': [51.4700, -0.4543],
            'CTS': [42.7752, 141.6923], 'NRT': [35.7720, 140.3929], 'SYD': [-33.9399, 151.1753],
            'CDG': [49.0097, 2.5479], 'PYX': [12.6799, 101.0050]
        };
        const airportLatLng = cityCoords[dest] || [13.75, 100.50];
        
        const getOffset = (str, scale) => {
            let hash = 0;
            if (!str) str = "default";
            for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
            return [(((hash % 100) / 100.0) * scale) - (scale/2), ((((hash >> 2) % 100) / 100.0) * scale) - (scale/2)];
        };

        const hotelLatLng = knownLocations[hotelName] || [airportLatLng[0] + getOffset(hotelName, 0.15)[0], airportLatLng[1] + getOffset(hotelName, 0.15)[1]];
        const actLatLng = knownLocations[actName] || [hotelLatLng[0] + getOffset(actName, 0.25)[0], hotelLatLng[1] + getOffset(actName, 0.25)[1]];
        const act2LatLng = knownLocations[act2Name] || [hotelLatLng[0] + getOffset(act2Name, 0.35)[0], hotelLatLng[1] + getOffset(act2Name, 0.35)[1]];
        
        const createIcon = (iconName, colorClass, title) => {
            return L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%); width: max-content;">
                           <div class="w-10 h-10 ${colorClass} text-white rounded-full flex items-center justify-center font-bold shadow-lg ring-2 ring-white z-50 border-2 border-white transition-transform group-hover:scale-110 group-hover:shadow-xl group-hover:ring-orange-200">
                               <span class="material-symbols-outlined text-[20px]">${iconName}</span>
                           </div>
                           <div class="mt-1.5 bg-white px-3 py-1.5 text-[11px] rounded-xl shadow-lg text-gray-800 font-bold border border-gray-100 whitespace-nowrap transition-colors">${title}</div>
                       </div>`,
                iconSize: [0, 0],
                iconAnchor: [0, 0]
            });
        };
        
        const bindPopupToMarker = (marker, title, query) => {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
            const popupContent = `
                <div class="text-center p-2 min-w-[160px] pb-1">
                    <p class="font-bold text-gray-800 text-sm mb-3 line-clamp-2">${title}</p>
                    <a href="${url}" target="_blank" class="inline-flex items-center gap-1.5 bg-[#4285F4] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#3367D6] transition-colors w-full justify-center shadow-md">
                        <span class="material-symbols-outlined text-[16px]">location_on</span> ดูสถานที่จริง
                    </a>
                </div>
            `;
            marker.bindPopup(popupContent, { closeButton: true, offset: [0, -45], className: 'custom-popup' });
        };
        
        const m1 = L.marker(airportLatLng, {icon: createIcon('flight_land', 'bg-blue-600', airportName)}).addTo(window.realLeafletMap);
        const m2 = L.marker(hotelLatLng, {icon: createIcon('hotel', 'bg-orange-500', hotelName)}).addTo(window.realLeafletMap);
        const m3 = L.marker(actLatLng, {icon: createIcon('local_activity', 'bg-teal-500', actName)}).addTo(window.realLeafletMap);
        const m4 = L.marker(act2LatLng, {icon: createIcon('photo_camera', 'bg-purple-500', act2Name)}).addTo(window.realLeafletMap);
        
        bindPopupToMarker(m1, airportName, airportName);
        bindPopupToMarker(m2, hotelName, hotelName);
        bindPopupToMarker(m3, actName, actName);
        bindPopupToMarker(m4, act2Name, act2Name);
        
        window.mapMarkers.push(m1, m2, m3, m4);
        
        const latlngs = [airportLatLng, hotelLatLng, actLatLng, act2LatLng, airportLatLng];
        window.mapRouteLine = L.polyline(latlngs, {color: '#fe932c', weight: 4, dashArray: '8, 8'}).addTo(window.realLeafletMap);
        
        window.realLeafletMap.fitBounds(window.mapRouteLine.getBounds(), {padding: [80, 80]});
        window.realLeafletMap.invalidateSize();
    }, 150);
};

window.closeMapModal = function() {
    document.getElementById('real-map-modal').classList.add('hidden');
    document.getElementById('real-map-modal').classList.remove('flex');
};
