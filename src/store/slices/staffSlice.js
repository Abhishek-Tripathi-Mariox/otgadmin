import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  staffList: [],
  staff: null,
  stats: null,
  meta: { roles: [], departments: [] },
  loading: false,
  error: null,
  message: null,
  pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
};

// Get all staff
export const getStaffList = createAsyncThunk(
  "staff/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/staff", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch staff.");
    }
  },
);

// Get single staff
export const getStaff = createAsyncThunk(
  "staff/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/staff/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch staff.");
    }
  },
);

// Create staff
export const createStaff = createAsyncThunk(
  "staff/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/staff", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create staff.");
    }
  },
);

// Update staff
export const updateStaff = createAsyncThunk(
  "staff/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/staff/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update staff.");
    }
  },
);

// Toggle status
export const toggleStaffStatus = createAsyncThunk(
  "staff/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/staff/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status.");
    }
  },
);

// Reset password
export const resetStaffPassword = createAsyncThunk(
  "staff/resetPassword",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/staff/${id}/reset-password`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reset password.");
    }
  },
);

// Delete staff
export const deleteStaff = createAsyncThunk(
  "staff/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/staff/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete staff.");
    }
  },
);

// Get meta (roles, departments)
export const getStaffMeta = createAsyncThunk(
  "staff/getMeta",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/staff/meta");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch meta.");
    }
  },
);

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearMessage: (state) => { state.message = null; },
    clearStaff: (state) => { state.staff = null; },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getStaffList.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getStaffList.fulfilled, (state, action) => {
        state.loading = false;
        state.staffList = action.payload.data || [];
        state.stats = action.payload.stats || state.stats;
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(getStaffList.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Get One
      .addCase(getStaff.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getStaff.fulfilled, (state, action) => { state.loading = false; state.staff = action.payload.data; })
      .addCase(getStaff.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Create
      .addCase(createStaff.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staffList.unshift(action.payload.data);
        state.message = action.payload.message || "Staff created successfully.";
      })
      .addCase(createStaff.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update
      .addCase(updateStaff.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.staffList.findIndex((s) => s._id === action.payload.data._id);
        if (idx !== -1) state.staffList[idx] = action.payload.data;
        state.message = action.payload.message || "Staff updated successfully.";
      })
      .addCase(updateStaff.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Toggle Status
      .addCase(toggleStaffStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(toggleStaffStatus.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.staffList.findIndex((s) => s._id === action.payload.data._id);
        if (idx !== -1) state.staffList[idx] = action.payload.data;
        state.message = action.payload.message || "Status updated.";
      })
      .addCase(toggleStaffStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Reset Password
      .addCase(resetStaffPassword.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(resetStaffPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "Password reset successfully.";
      })
      .addCase(resetStaffPassword.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Delete
      .addCase(deleteStaff.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.staffList = state.staffList.filter((s) => s._id !== action.payload.id);
        state.message = action.payload.message || "Staff deleted.";
      })
      .addCase(deleteStaff.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Get Meta
      .addCase(getStaffMeta.fulfilled, (state, action) => {
        state.meta = action.payload.data || { roles: [], departments: [] };
      });
  },
});

export const { clearError, clearMessage, clearStaff } = staffSlice.actions;
export default staffSlice.reducer;
