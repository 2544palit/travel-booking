// Litrip API Client
const API_BASE = '';

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, ...data };
    }
    return data;
  } catch (error) {
    if (error.status) throw error;
    console.error('API Error:', error);
    throw { status: 500, message: 'Network error - cannot connect to server' };
  }
}

// --- Auth API ---
async function apiRegister(name, email, password, phone) {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone })
  });
}

async function apiLogin(email, password) {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

async function apiGetMe() {
  return apiCall('/api/auth/me');
}

// --- Search API ---
async function apiSearchFlights(params = {}) {
  const query = new URLSearchParams({ type: 'flight', ...params }).toString();
  return apiCall(`/api/search?${query}`);
}

async function apiSearchHotels(params = {}) {
  const query = new URLSearchParams({ type: 'hotel', ...params }).toString();
  return apiCall(`/api/search?${query}`);
}

async function apiGetFlights() { return apiCall('/api/flights'); }
async function apiGetHotels() { return apiCall('/api/hotels'); }

// --- Locations API (Autocomplete / Cascading) ---
async function apiGetLocations(origin = '') {
  const params = origin ? `?origin=${encodeURIComponent(origin)}` : '';
  return apiCall(`/api/locations${params}`);
}

// --- Booking API ---
async function apiCreateBooking(travelerId, travelerEmail) {
  return apiCall('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ travelerId, travelerEmail })
  });
}

async function apiAddItemToBooking(bookingId, itemData) {
  return apiCall(`/api/bookings/${bookingId}/items`, {
    method: 'POST',
    body: JSON.stringify(itemData)
  });
}

async function apiApplyPromo(bookingId, code) {
  return apiCall(`/api/bookings/${bookingId}/promo`, {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

async function apiPayBooking(bookingId, paymentData) {
  return apiCall(`/api/bookings/${bookingId}/pay`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
}

async function apiCancelBooking(bookingId) {
  return apiCall(`/api/bookings/${bookingId}/cancel`, { method: 'PUT' });
}

async function apiGetBooking(bookingId) {
  return apiCall(`/api/bookings/${bookingId}`);
}

async function apiGetMyBookings(travelerId) {
  return apiCall(`/api/bookings?travelerId=${travelerId}`);
}

// --- Reviews API ---
async function apiCreateReview(travelerId, itemId, itemType, rating, comment) {
  return apiCall('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({ travelerId, itemId, itemType, rating, comment })
  });
}
