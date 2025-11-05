const API_BASE_URL = 'http://localhost:4000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
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
      console.error('API request failed:', error);
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

  async registerDepartment(deptData) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(deptData),
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
