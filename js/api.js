// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for fetch with error handling
async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error [${response.status}]:`, data);
      return { error: true, message: data.message || 'API Error', status: response.status };
    }
    
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    return { error: true, message: 'Network error: ' + error.message };
  }
}

// API utility functions
const api = {
  // Authentication endpoints
  register: async (name, email, password, phone = '', address = '') => {
    return fetchAPI(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, address })
    });
  },

  login: async (email, password) => {
    return fetchAPI(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getCurrentUser: async (token) => {
    return fetchAPI(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  updateProfile: async (token, name, phone, address) => {
    return fetchAPI(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, phone, address })
    });
  },

  // Bus endpoints
  getAllBuses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/buses?${queryString}` : `${API_BASE_URL}/buses`;
    return fetchAPI(url);
  },

  getBusById: async (id) => {
    return fetchAPI(`${API_BASE_URL}/buses/${id}`);
  },

  // Route endpoints
  getAllRoutes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_BASE_URL}/routes?${queryString}` : `${API_BASE_URL}/routes`;
    return fetchAPI(url);
  },

  // Booking endpoints
  createBooking: async (token, busId, passengers, seatNumbers) => {
    return fetchAPI(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ busId, passengers, seatNumbers })
    });
  },

  getUserBookings: async (token) => {
    return fetchAPI(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  getBookingById: async (token, id) => {
    return fetchAPI(`${API_BASE_URL}/bookings/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  cancelBooking: async (token, id) => {
    return fetchAPI(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin endpoints - Users
  getAdminUsers: async (token) => {
    return fetchAPI(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  getAdminUserById: async (token, id) => {
    return fetchAPI(`${API_BASE_URL}/admin/users/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  updateAdminUser: async (token, id, userData) => {
    return fetchAPI(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(userData)
    });
  },

  deleteAdminUser: async (token, id) => {
    return fetchAPI(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin endpoints - Buses
  getAdminBuses: async (token) => {
    return fetchAPI(`${API_BASE_URL}/admin/buses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  createAdminBus: async (token, busData) => {
    return fetchAPI(`${API_BASE_URL}/admin/buses`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(busData)
    });
  },

  updateAdminBus: async (token, id, busData) => {
    return fetchAPI(`${API_BASE_URL}/admin/buses/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(busData)
    });
  },

  deleteAdminBus: async (token, id) => {
    return fetchAPI(`${API_BASE_URL}/admin/buses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin endpoints - Routes
  getAdminRoutes: async (token) => {
    return fetchAPI(`${API_BASE_URL}/admin/routes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  createAdminRoute: async (token, routeData) => {
    return fetchAPI(`${API_BASE_URL}/admin/routes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(routeData)
    });
  },

  updateAdminRoute: async (token, id, routeData) => {
    return fetchAPI(`${API_BASE_URL}/admin/routes/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(routeData)
    });
  },

  deleteAdminRoute: async (token, id) => {
    return fetchAPI(`${API_BASE_URL}/admin/routes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin endpoints - Bookings
  getAdminBookings: async (token) => {
    return fetchAPI(`${API_BASE_URL}/admin/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  getAdminBookingById: async (token, id) => {
    return fetchAPI(`${API_BASE_URL}/admin/bookings/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  updateAdminBookingStatus: async (token, id, status) => {
    return fetchAPI(`${API_BASE_URL}/admin/bookings/${id}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
  },

  cancelAdminBooking: async (token, id) => {
    return fetchAPI(`${API_BASE_URL}/admin/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Admin endpoints - Dashboard
  getAdminDashboardStats: async (token) => {
    return fetchAPI(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Helper methods
  getBuses: async () => {
    const result = await fetchAPI(`${API_BASE_URL}/buses`);
    return result.buses || [];
  },

  getRoutes: async () => {
    const result = await fetchAPI(`${API_BASE_URL}/routes`);
    return result.routes || [];
  }
};
