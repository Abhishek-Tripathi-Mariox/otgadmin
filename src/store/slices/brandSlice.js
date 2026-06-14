import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  brands: [],
  deletedBrands: [],
  brand: null,
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

// Get all brands
export const getBrands = createAsyncThunk(
  "brands/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/brands", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brands.",
      );
    }
  },
);

// Get deleted brands
export const getDeletedBrands = createAsyncThunk(
  "brands/getDeleted",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/brands", {
        params: { ...params, showDeleted: "true" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deleted brands.",
      );
    }
  },
);

// Get single brand
export const getBrand = createAsyncThunk(
  "brands/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brand.",
      );
    }
  },
);

// Create brand
export const createBrand = createAsyncThunk(
  "brands/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/brands", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create brand.",
      );
    }
  },
);

// Update brand
export const updateBrand = createAsyncThunk(
  "brands/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/brands/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update brand.",
      );
    }
  },
);

// Delete brand (soft delete)
export const deleteBrand = createAsyncThunk(
  "brands/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/brands/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete brand.",
      );
    }
  },
);

// Restore brand
export const restoreBrand = createAsyncThunk(
  "brands/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/brands/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore brand.",
      );
    }
  },
);

// Permanently delete brand
export const permanentDeleteBrand = createAsyncThunk(
  "brands/permanentDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/brands/${id}/permanent`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to permanently delete brand.",
      );
    }
  },
);

// Toggle brand status
export const toggleBrandStatus = createAsyncThunk(
  "brands/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/brands/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update brand status.",
      );
    }
  },
);

const brandSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearBrand: (state) => {
      state.brand = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Deleted
      .addCase(getDeletedBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeletedBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedBrands = action.payload.data || action.payload;
      })
      .addCase(getDeletedBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get One
      .addCase(getBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brand = action.payload.data;
      })
      .addCase(getBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands.unshift(action.payload.data);
        state.message = action.payload.message || "Brand created successfully.";
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.brands.findIndex(
          (b) => b._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.brands[index] = action.payload.data;
        }
        state.message = action.payload.message || "Brand updated successfully.";
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = state.brands.filter((b) => b._id !== action.payload.id);
        state.message = action.payload.message || "Brand deleted successfully.";
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore
      .addCase(restoreBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedBrands = state.deletedBrands.filter(
          (b) => b._id !== action.payload.data._id,
        );
        state.brands.unshift(action.payload.data);
        state.message =
          action.payload.message || "Brand restored successfully.";
      })
      .addCase(restoreBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent Delete
      .addCase(permanentDeleteBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedBrands = state.deletedBrands.filter(
          (b) => b._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Brand permanently deleted.";
      })
      .addCase(permanentDeleteBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleBrandStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleBrandStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.brands.findIndex(
          (b) => b._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.brands[index] = action.payload.data;
        }
        state.message = action.payload.message || "Brand status updated.";
      })
      .addCase(toggleBrandStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearBrand } = brandSlice.actions;
export default brandSlice.reducer;
