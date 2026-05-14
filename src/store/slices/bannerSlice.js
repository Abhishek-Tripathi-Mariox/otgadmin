import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  banners: [],
  deletedBanners: [],
  banner: null,
  loading: false,
  error: null,
  message: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Get all banners
export const getBanners = createAsyncThunk(
  "banners/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/banners", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banners.",
      );
    }
  },
);

// Get deleted banners
export const getDeletedBanners = createAsyncThunk(
  "banners/getDeleted",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/banners", {
        params: { ...params, showDeleted: "true" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deleted banners.",
      );
    }
  },
);

// Create banner
export const createBanner = createAsyncThunk(
  "banners/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create banner.",
      );
    }
  },
);

// Update banner
export const updateBanner = createAsyncThunk(
  "banners/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/banners/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update banner.",
      );
    }
  },
);

// Delete banner (soft)
export const deleteBanner = createAsyncThunk(
  "banners/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/banners/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete banner.",
      );
    }
  },
);

// Restore banner
export const restoreBanner = createAsyncThunk(
  "banners/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/banners/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore banner.",
      );
    }
  },
);

// Permanently delete banner
export const permanentDeleteBanner = createAsyncThunk(
  "banners/permanentDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/banners/${id}/permanent`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to permanently delete banner.",
      );
    }
  },
);

// Toggle banner status
export const toggleBannerStatus = createAsyncThunk(
  "banners/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/banners/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update banner status.",
      );
    }
  },
);

// Reorder banners
export const reorderBanners = createAsyncThunk(
  "banners/reorder",
  async (orderedIds, { rejectWithValue }) => {
    try {
      const response = await api.patch("/banners/reorder", { orderedIds });
      return { ...response.data, orderedIds };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reorder banners.",
      );
    }
  },
);

const bannerSlice = createSlice({
  name: "banners",
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
      // Get All
      .addCase(getBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Deleted
      .addCase(getDeletedBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeletedBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedBanners = action.payload.data || action.payload;
      })
      .addCase(getDeletedBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.push(action.payload.data);
        state.message =
          action.payload.message || "Banner created successfully.";
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex(
          (b) => b._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.banners[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Banner updated successfully.";
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter(
          (b) => b._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Banner deleted successfully.";
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore
      .addCase(restoreBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedBanners = state.deletedBanners.filter(
          (b) => b._id !== action.payload.data?._id,
        );
        state.message =
          action.payload.message || "Banner restored successfully.";
      })
      .addCase(restoreBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent Delete
      .addCase(permanentDeleteBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedBanners = state.deletedBanners.filter(
          (b) => b._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Banner permanently deleted.";
      })
      .addCase(permanentDeleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleBannerStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.banners.findIndex(
          (b) => b._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.banners[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reorder
      .addCase(reorderBanners.pending, (state) => {
        state.error = null;
      })
      .addCase(reorderBanners.fulfilled, (state, action) => {
        const { orderedIds } = action.payload;
        const map = new Map(state.banners.map((b) => [b._id, b]));
        const next = [];
        orderedIds.forEach((id, idx) => {
          const b = map.get(id);
          if (b) next.push({ ...b, order: idx });
        });
        // Preserve any banner not present in orderedIds (defensive)
        state.banners.forEach((b) => {
          if (!orderedIds.includes(b._id)) next.push(b);
        });
        state.banners = next;
        state.message = action.payload.message || "Banners reordered.";
      })
      .addCase(reorderBanners.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage } = bannerSlice.actions;
export default bannerSlice.reducer;
