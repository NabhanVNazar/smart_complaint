import { create } from 'zustand';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useStore = create((set, get) => ({
  // --- STATE ---
  user: apiClient.getCurrentUser(),
  isAuthenticated: apiClient.isAuthenticated(),
  complaints: [],
  authorities: [],
  states: [],
  districts: [],
  pagination: {
    page: 1,
    totalPages: 1,
    totalComplaints: 0,
  },
  isLoading: false, // Add isLoading state

  // --- ACTIONS ---

  // Authentication
  login: async (credentials, userType) => {
    let response;
    if (userType === 'user') {
      response = await apiClient.login(credentials);
    } else { // department
      response = await apiClient.verifyDeptLoginOtp(credentials);
    }
    if (response.token) {
      set({ user: response.user, isAuthenticated: true });
    }
    return response;
  },

  logout: () => {
    apiClient.logout();
    set({ user: null, isAuthenticated: false, complaints: [] });
  },

  generateDepartmentOtp: async (payload) => {
    try {
      await apiClient.registerDepartment(payload);
      toast.info('OTP has been logged to the server console.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to generate OTP');
      return false;
    }
  },

  verifyDepartmentOtp: async (payload) => {
    try {
      const response = await apiClient.verifyDepartmentOtp(payload);
      if (response.token) {
        set({ user: response.user, isAuthenticated: true });
        toast.success('Department registered successfully!');
        return true;
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
    return false;
  },

  generateDeptLoginOtp: async (payload) => {
    try {
      await apiClient.generateDeptLoginOtp(payload);
      toast.info('OTP has been logged to the server console.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to generate OTP');
      return false;
    }
  },

  // Authorities
  fetchStates: async () => {
    set({ isLoading: true });
    try {
      const data = await apiClient.getStates();
      set({ states: data });
    } catch (error) {
      toast.error('Failed to load states.');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDistricts: async (state) => {
    set({ isLoading: true, districts: [] }); // Clear old districts
    try {
      const data = await apiClient.getDistricts(state);
      set({ districts: data });
    } catch (error) {
      toast.error('Failed to load districts.');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAuthorities: async (filters) => {
    set({ isLoading: true }); // Set loading to true
    try {
      const data = await apiClient.getAuthorities(filters);
      set({ authorities: data });
    } catch (error) {
      toast.error('Failed to load departments.');
    } finally {
      set({ isLoading: false }); // Set loading to false
    }
  },

  // User Complaints
  fetchUserComplaints: async () => {
    try {
      const data = await apiClient.getComplaints();
      const currentUser = get().user;
      if (currentUser) {
        const userComplaints = data.filter(c => c.userId?._id === currentUser.id);
        set({ complaints: userComplaints });
      }
    } catch (error) {
      toast.error('Failed to load complaints.');
    }
  },

  createComplaint: async (complaintData) => {
    try {
      const response = await apiClient.createComplaint(complaintData);
      toast.success(response.message || 'Complaint submitted successfully!');
      get().fetchUserComplaints(); // Re-fetch to update the list
      return true; // Indicate success
    } catch (error) {
      toast.error(error.message || 'Failed to submit complaint.');
      return false; // Indicate failure
    }
  },

  // Department Complaints
  fetchDepartmentComplaints: async (page) => {
    try {
      const data = await apiClient.getDepartmentComplaints({ page });
      const severityOrder = { 'S': 1, 'A': 2, 'B': 3, 'C': 4 };
      data.complaints.sort((a, b) => {
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      set({
        complaints: data.complaints,
        pagination: { page: data.page, totalPages: data.totalPages, totalComplaints: data.totalComplaints },
      });
    } catch (error) {
      toast.error('Failed to load data.');
    }
  },

  updateComplaintStatus: async (complaintId, newStatus) => {
    try {
      const updatedComplaint = await apiClient.updateComplaintStatus(complaintId, newStatus);
      set(state => ({
        complaints: state.complaints.map(c =>
          c._id === complaintId ? updatedComplaint : c
        ),
      }));
      toast.success('Complaint status updated successfully.');
    } catch (error) {
      toast.error('Failed to update complaint status.');
    }
  },

  setPage: (page) => {
    const { totalPages } = get().pagination;
    if (page >= 1 && page <= totalPages) {
      set(state => ({ pagination: { ...state.pagination, page } }));
      get().fetchDepartmentComplaints(page);
    }
  },

  // WebSocket Message Handler
  handleStatusUpdateMessage: (payload) => {
    const { complaintId, status } = payload;
    toast.info(`A complaint status was updated to "${status}".`);
    set(state => ({
      complaints: state.complaints.map(c =>
        c._id === complaintId ? { ...c, status } : c
      ),
    }));
  },
}));