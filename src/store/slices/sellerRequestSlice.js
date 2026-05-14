import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  requests: [],
  request: null,
  counts: { pending: 0, approved: 0, rejected: 0 },
  loading: false,
  error: null,
  message: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

export const getSellerRequests = createAsyncThunk(
  "sellerRequests/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/seller-requests", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch seller requests.",
      );
    }
  },
);

export const getSellerRequestCounts = createAsyncThunk(
  "sellerRequests/counts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/seller-requests/counts");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch counts.",
      );
    }
  },
);

export const updateSellerRequest = createAsyncThunk(
  "sellerRequests/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/seller-requests/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update request.",
      );
    }
  },
);

export const approveSellerRequest = createAsyncThunk(
  "sellerRequests/approve",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/seller-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve request.",
      );
    }
  },
);

export const rejectSellerRequest = createAsyncThunk(
  "sellerRequests/reject",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/seller-requests/${id}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject request.",
      );
    }
  },
);

export const deleteSellerRequest = createAsyncThunk(
  "sellerRequests/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/seller-requests/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete request.",
      );
    }
  },
);

const sellerRequestSlice = createSlice({
  name: "sellerRequests",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSellerRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSellerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getSellerRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSellerRequestCounts.fulfilled, (state, action) => {
        state.counts = action.payload.data || state.counts;
      })
      .addCase(updateSellerRequest.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.requests = state.requests.map((r) =>
          r._id === updated._id ? { ...r, ...updated } : r,
        );
        state.message = action.payload.message || "Request updated.";
      })
      .addCase(updateSellerRequest.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(approveSellerRequest.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.requests = state.requests.map((r) =>
          r._id === updated._id ? { ...r, ...updated } : r,
        );
        state.message = action.payload.message || "Request approved.";
      })
      .addCase(approveSellerRequest.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(rejectSellerRequest.fulfilled, (state, action) => {
        const updated = action.payload.data;
        state.requests = state.requests.map((r) =>
          r._id === updated._id ? { ...r, ...updated } : r,
        );
        state.message = action.payload.message || "Request rejected.";
      })
      .addCase(rejectSellerRequest.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteSellerRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (r) => r._id !== action.payload.id,
        );
        state.message = action.payload.message || "Request deleted.";
      })
      .addCase(deleteSellerRequest.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage } = sellerRequestSlice.actions;
export default sellerRequestSlice.reducer;
