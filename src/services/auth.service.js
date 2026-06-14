import api from "./api";

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Forgot password - request reset link
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
  },
};

export default authService;
