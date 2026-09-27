
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

    let currentSmartTripData = null;

    function generateSmartTrip() {
      const dest = document.getElementById('smart-dest').value;
      const style = document.getElementById('smart-style').value;
      
      const btn = document.querySelector('#smart-trip-container button[onclick="generateSmartTrip()"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> กำลังสร้าง...`;
      btn.disabled = true;

      setTimeout(() => {
        const flightsOut = allData.flight.filter(f => f.destinationCode === dest);
        const flightsRet = allData.flight.filter(f => f.originCode === dest);
        
        const hotels = allData.hotel.filter(h => h.locationCode === dest || (h.details && h.details.locationCode === dest) || h.location.includes(dest) || (h.details && h.details.location.includes(dest)));
        
        let acts = allData.activity.filter(a => a.destinationCode === dest || (a.details && a.details.destinationCode === dest));
        
        // Sort/Filter activities based on style
        if (style === 'luxury') acts = acts.sort((a,b) => b.price - a.price);
        if (style === 'romantic') acts = acts.filter(a => (a.category||'').includes('luxury') || (a.category||'').includes('culture'));
        if (style === 'adventure') acts = acts.filter(a => (a.category||'').includes('adventure'));
        
        if(acts.length === 0) acts = allData.activity; // fallback

        if (flightsOut.length === 0 || hotels.length === 0) {
           showToast('ไม่พบข้อมูลเที่ยวบินหรือโรงแรมที่รองรับสำหรับเมืองนี้', 'warning');
           btn.innerHTML = originalText;
           btn.disabled = false;
           return;
        }

        const ob = flightsOut[0];
        const rt = flightsRet.length > 0 ? flightsRet[flightsRet.length - 1] : flightsOut[0]; // fallback
        const h = hotels[0];
        const a1 = acts[0] || allData.activity[0];
        const a2 = acts.length > 1 ? acts[1] : allData.activity[1];

        const nights = 2;
        const guestsStr = document.getElementById('search-guests') ? document.getElementById('search-guests').value : '1';
        const guests = parseInt(guestsStr) || 1;
        const roomPrice = h.pricePerNight || (h.totalPrice / (h.details?.nights || 1)) || 5000;
        const hTotal = roomPrice * nights;
        
        const a1Price = a1.price || a1.totalPrice || 0;
        const a2Price = a2.price || a2.totalPrice || 0;

        const subtotal = (ob.price + rt.price + hTotal + a1Price + a2Price) * guests;
        const pkgDiscount = Math.floor(subtotal * 0.15);
        const grandTotal = subtotal - pkgDiscount;

        currentSmartTripData = {
          ob, rt, h, a1, a2, guests, nights,
          totals: { subtotal, pkgDiscount, grandTotal }
        };

        renderSmartTripResult();

        btn.innerHTML = originalText;
        btn.disabled = false;
        
        const resDiv = document.getElementById('smart-trip-result');
        resDiv.classList.remove('hidden');
        resDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 1500);
    }

    function renderSmartTripResult() {
       const data = currentSmartTripData;
       const d = data;
       
       const destSelect = document.getElementById('smart-dest');
       const destName = destSelect.options[destSelect.selectedIndex].text.replace(/ \(.*\)/, ''); // Remove the (NRT) part
       
       const html = `
         <div class="mt-8 border-t border-gray-100 pt-8 animate-[fadeIn_0.5s_ease-out]">
            <div class="flex items-center justify-between mb-6">
               <div>
                  <h3 class="text-2xl font-display font-bold text-primary">ทริป 3 วัน 2 คืน: ${destName}</h3>
                  <p class="text-gray-500">คัดสรรประสบการณ์ที่ดีที่สุดโดย AI Concierge สำหรับ ${d.guests} ท่าน</p>
               </div>
               <div class="text-right">
                  <p class="text-xs text-gray-400 line-through">มูลค่ารวม ฿${d.totals.subtotal.toLocaleString()}</p>
                  <p class="text-2xl font-bold text-tertiary">฿${d.totals.grandTotal.toLocaleString()}</p>
                  <span class="inline-block bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold mt-1">Bundle ลด 15%</span>
               </div>
            </div>

            <!-- Timeline -->
            <div class="space-y-6">
              
              <!-- DAY 1 -->
              <div class="relative pl-8 border-l-2 border-gray-200">
                <div class="absolute w-8 h-8 bg-white border-2 border-primary rounded-full -left-[17px] top-0 flex items-center justify-center font-bold text-primary text-xs shadow-sm">1</div>
                <h4 class="font-bold text-lg text-gray-800 mb-4 ml-2">วันที่ 1: เดินทาง & พักผ่อน</h4>
                
                <div class="bg-gray-50 rounded-xl p-4 mb-3 flex items-center gap-4 hover:shadow-md transition border border-gray-100">
                   <div class="w-12 h-12 bg-blue-100 text-primary rounded-lg flex items-center justify-center shrink-0"><span class="material-symbols-outlined">flight_takeoff</span></div>
                   <div class="flex-1">
                      <p class="text-xs text-gray-500 font-bold mb-0.5">เที่ยวบินขาไป • ${d.ob.airline || d.ob.details?.airline}</p>
                      <p class="text-sm font-bold text-gray-800">${d.ob.origin} ➔ ${d.ob.destination} (${d.ob.flightNo || d.ob.details?.flightNo})</p>
                   </div>
                </div>
                
                <div class="bg-gray-50 rounded-xl p-4 mb-3 flex items-center gap-4 hover:shadow-md transition border border-gray-100">
                   <img src="${d.h.imageUrl || d.h.details?.imageUrl}" class="w-16 h-12 object-cover rounded-lg shrink-0" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&q=80'">
                   <div class="flex-1">
                      <p class="text-xs text-gray-500 font-bold mb-0.5">เช็คอินเข้าพัก (2 คืน)</p>
                      <p class="text-sm font-bold text-gray-800">${d.h.hotelName || d.h.details?.hotelName}</p>
                   </div>
                </div>
              </div>

              <!-- DAY 2 -->
              <div class="relative pl-8 border-l-2 border-gray-200">
                <div class="absolute w-8 h-8 bg-white border-2 border-primary rounded-full -left-[17px] top-0 flex items-center justify-center font-bold text-primary text-xs shadow-sm">2</div>
                <h4 class="font-bold text-lg text-gray-800 mb-4 ml-2">วันที่ 2: เที่ยวชมไฮไลต์</h4>
                
                <div class="bg-white rounded-xl p-4 mb-3 flex items-center gap-4 shadow-sm hover:shadow-md transition border border-gray-200">
                   <img src="${d.a1.imageUrl || d.a1.details?.imageUrl}" class="w-20 h-16 object-cover rounded-lg shrink-0" onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&q=80'">
                   <div class="flex-1">
                      <p class="text-xs text-secondary font-bold mb-0.5">กิจกรรมหลักประจำทริป</p>
                      <p class="text-sm font-bold text-gray-800 line-clamp-1">${d.a1.title || d.a1.details?.title}</p>
                   </div>
                </div>
              </div>

              <!-- DAY 3 -->
              <div class="relative pl-8 border-l-2 border-transparent">
                <div class="absolute w-8 h-8 bg-white border-2 border-primary rounded-full -left-[17px] top-0 flex items-center justify-center font-bold text-primary text-xs shadow-sm">3</div>
                <h4 class="font-bold text-lg text-gray-800 mb-4 ml-2">วันที่ 3: เก็บตก & เดินทางกลับ</h4>
                
                <div class="bg-white rounded-xl p-4 mb-3 flex items-center gap-4 shadow-sm hover:shadow-md transition border border-gray-200">
                   <img src="${d.a2.imageUrl || d.a2.details?.imageUrl}" class="w-20 h-16 object-cover rounded-lg shrink-0" onerror="this.src='https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200&q=80'">
                   <div class="flex-1">
                      <p class="text-xs text-secondary font-bold mb-0.5">กิจกรรมยามเช้า</p>
                      <p class="text-sm font-bold text-gray-800 line-clamp-1">${d.a2.title || d.a2.details?.title}</p>
                   </div>
                </div>

                <div class="bg-gray-50 rounded-xl p-4 mb-3 flex items-center gap-4 hover:shadow-md transition border border-gray-100">
                   <div class="w-12 h-12 bg-gray-200 text-primary rounded-lg flex items-center justify-center shrink-0"><span class="material-symbols-outlined">flight_land</span></div>
                   <div class="flex-1">
                      <p class="text-xs text-gray-500 font-bold mb-0.5">เที่ยวบินขากลับ • ${d.rt.airline || d.rt.details?.airline}</p>
                      <p class="text-sm font-bold text-gray-800">${d.rt.origin} ➔ ${d.rt.destination} (${d.rt.flightNo || d.rt.details?.flightNo})</p>
                   </div>
                </div>
              </div>

            </div>

            <div class="mt-8 pt-6 border-t border-gray-200 text-center">
               <button onclick="bookSmartTrip()" class="w-full md:w-auto px-10 py-4 bg-primary hover:bg-blue-900 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto">
                 <span class="material-symbols-outlined">shopping_cart_checkout</span> จองทั้งทริปในคลิกเดียว (฿${d.totals.grandTotal.toLocaleString()})
               </button>
               <p class="text-xs text-gray-500 mt-4"><span class="material-symbols-outlined text-[12px]">security</span> การชำระเงินปลอดภัยและยืนยันทันที</p>
            </div>
         </div>
       `;
       document.getElementById('smart-trip-result').innerHTML = html;
    }

    function bookSmartTrip() {
       if(!isLoggedIn()) {
         showToast('กรุณาเข้าสู่ระบบก่อนทำการจอง', 'warning');
         setTimeout(() => navigateTo('login'), 1500);
         return;
       }
       const d = currentSmartTripData;
       const guests = d.guests;
       const pkgId = `smart-${Date.now()}`;
       
       // Add Flight OB
       addToCart({
          itemId: d.ob.flightItemId || d.ob.itemId,
          itemType: 'flight',
          quantity: guests,
          unitPrice: Math.floor(d.ob.price * 0.85),
          totalPrice: Math.floor(d.ob.price * 0.85) * guests,
          details: { flightNo: d.ob.flightNo || d.ob.details?.flightNo, airline: d.ob.airline || d.ob.details?.airline, origin: d.ob.origin, destination: d.ob.destination, isPackage: true, packageId: pkgId }
       });
       
       // Add Flight RT
       addToCart({
          itemId: d.rt.flightItemId || d.rt.itemId,
          itemType: 'flight',
          quantity: guests,
          unitPrice: Math.floor(d.rt.price * 0.85),
          totalPrice: Math.floor(d.rt.price * 0.85) * guests,
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
  