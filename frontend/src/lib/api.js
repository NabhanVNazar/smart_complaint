const API_BASE_URL = 'http://localhost:4000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    console.log(`Making API request to: ${this.baseURL}${endpoint}`); // Log the full URL
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request to ${endpoint} failed:`, error); // More specific error logging
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // New Department Auth
  async getStates() {
    return this.request('/locations/states');
  }

  async getDistricts(state) {
    return this.request(`/locations/districts?state=${state}`);
  }

  async getAuthorities({ level, state, district }) {
    const params = new URLSearchParams({ level, state, district });
    // remove empty params
    for (let p of params) if (!p[1]) params.delete(p[0]);
    return this.request(`/departments/authorities?${params.toString()}`);
  }

  async registerDepartment(deptData) {
    // This now generates OTP
    return this.request('/departments/register', {
      method: 'POST',
      body: JSON.stringify(deptData),
    });
  }

  async verifyDepartmentOtp(otpData) {
    const response = await this.request('/departments/verify-otp', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  }

  async generateDeptLoginOtp(credentials) {
    return this.request('/departments/login/generate-otp', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async verifyDeptLoginOtp(credentials) {
    return this.request('/departments/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Complaints endpoints
  async getComplaints() {
    return this.request('/complaints');
  }

  async createComplaint(complaintData) {
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  }

  async updateComplaintStatus(complaintId, status) {
    return this.request(`/complaints/${complaintId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Department-specific complaints
  async getDepartmentComplaints({ page = 1, limit = 5 }) {
    return this.request(`/departments/complaints?page=${page}&limit=${limit}`);
  }

  // Users endpoints
  async getUsers() {
    return this.request('/users');
  }

  // Departments endpoints
  async getDepartments() {
    return this.request('/departments');
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export const apiClient = new ApiClient();
