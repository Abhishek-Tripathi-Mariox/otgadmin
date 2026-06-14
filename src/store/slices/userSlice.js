import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  users: [],
  deletedUsers: [],
  user: null,
  stats: null,
  loading: false,
  error: null,
  message: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  deletedPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Get all users
export const getUsers = createAsyncThunk(
  "users/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users.",
      );
    }
  },
);

// Get deleted users
export const getDeletedUsers = createAsyncThunk(
  "users/getDeleted",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/users", {
        params: { ...params, showDeleted: "true" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deleted users.",
      );
    }
  },
);

// Get single user
export const getUser = createAsyncThunk(
  "users/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user.",
      );
    }
  },
);

// Get user stats
export const getUserStats = createAsyncThunk(
  "users/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/stats");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user stats.",
      );
    }
  },
);

// Update user
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user.",
      );
    }
  },
);

// Delete user (soft delete)
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user.",
      );
    }
  },
);

// Restore user
export const restoreUser = createAsyncThunk(
  "users/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}/restore`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore user.",
      );
    }
  },
);

// Permanent delete user
export const permanentDeleteUser = createAsyncThunk(
  "users/permanentDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${id}/permanent`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to permanently delete user.",
      );
    }
  },
);

// Toggle user status
export const toggleUserStatus = createAsyncThunk(
  "users/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user status.",
      );
    }
  },
);

// Block user
export const blockUser = createAsyncThunk(
  "users/block",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}/block`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to block user.",
      );
    }
  },
);

// Unblock user
export const unblockUser = createAsyncThunk(
  "users/unblock",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}/unblock`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unblock user.",
      );
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || [];
        state.stats = action.payload.stats || state.stats;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Deleted
      .addCase(getDeletedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeletedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedUsers = action.payload.data || [];
        if (action.payload.pagination) {
          state.deletedPagination = action.payload.pagination;
        }
      })
      .addCase(getDeletedUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get One
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Stats
      .addCase(getUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
        state.message = action.payload.message || "User updated successfully.";
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload.id);
        state.message = action.payload.message || "User deleted successfully.";
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore
      .addCase(restoreUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreUser.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedUsers = state.deletedUsers.filter(
          (u) => u._id !== action.payload.id,
        );
        state.message = action.payload.message || "User restored successfully.";
      })
      .addCase(restoreUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent Delete
      .addCase(permanentDeleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedUsers = state.deletedUsers.filter(
          (u) => u._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "User permanently deleted successfully.";
      })
      .addCase(permanentDeleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "User status updated successfully.";
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Block
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
        state.message = action.payload.message || "User blocked successfully.";
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Unblock
      .addCase(unblockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(
          (u) => u._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "User unblocked successfully.";
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearUser } = userSlice.actions;
export default userSlice.reducer;
