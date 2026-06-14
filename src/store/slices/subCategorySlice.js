import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  subCategories: [],
  deletedSubCategories: [],
  subCategory: null,
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

// Get all sub-categories
export const getSubCategories = createAsyncThunk(
  "subCategories/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/sub-categories", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sub-categories.",
      );
    }
  },
);

// Get deleted sub-categories
export const getDeletedSubCategories = createAsyncThunk(
  "subCategories/getDeleted",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/sub-categories", {
        params: { ...params, showDeleted: "true" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch deleted sub-categories.",
      );
    }
  },
);

// Get sub-categories by category
export const getSubCategoriesByCategory = createAsyncThunk(
  "subCategories/getByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sub-categories/category/${categoryId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sub-categories.",
      );
    }
  },
);

// Get single sub-category
export const getSubCategory = createAsyncThunk(
  "subCategories/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/sub-categories/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sub-category.",
      );
    }
  },
);

// Create sub-category
export const createSubCategory = createAsyncThunk(
  "subCategories/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/sub-categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create sub-category.",
      );
    }
  },
);

// Update sub-category
export const updateSubCategory = createAsyncThunk(
  "subCategories/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sub-categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update sub-category.",
      );
    }
  },
);

// Delete sub-category (soft delete)
export const deleteSubCategory = createAsyncThunk(
  "subCategories/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/sub-categories/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete sub-category.",
      );
    }
  },
);

// Restore sub-category
export const restoreSubCategory = createAsyncThunk(
  "subCategories/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sub-categories/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore sub-category.",
      );
    }
  },
);

// Permanently delete sub-category
export const permanentDeleteSubCategory = createAsyncThunk(
  "subCategories/permanentDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/sub-categories/${id}/permanent`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to permanently delete sub-category.",
      );
    }
  },
);

// Toggle sub-category status
export const toggleSubCategoryStatus = createAsyncThunk(
  "subCategories/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/sub-categories/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update sub-category status.",
      );
    }
  },
);

const subCategorySlice = createSlice({
  name: "subCategories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearSubCategory: (state) => {
      state.subCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Deleted
      .addCase(getDeletedSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeletedSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedSubCategories = action.payload.data || action.payload;
      })
      .addCase(getDeletedSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get By Category
      .addCase(getSubCategoriesByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubCategoriesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload.data || action.payload;
      })
      .addCase(getSubCategoriesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get One
      .addCase(getSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategory = action.payload.data;
      })
      .addCase(getSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories.unshift(action.payload.data);
        state.message =
          action.payload.message || "Sub-category created successfully.";
      })
      .addCase(createSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subCategories.findIndex(
          (sub) => sub._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.subCategories[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Sub-category updated successfully.";
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = state.subCategories.filter(
          (sub) => sub._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Sub-category deleted successfully.";
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore
      .addCase(restoreSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedSubCategories = state.deletedSubCategories.filter(
          (sub) => sub._id !== action.payload.data._id,
        );
        state.subCategories.unshift(action.payload.data);
        state.message =
          action.payload.message || "Sub-category restored successfully.";
      })
      .addCase(restoreSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent Delete
      .addCase(permanentDeleteSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedSubCategories = state.deletedSubCategories.filter(
          (sub) => sub._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Sub-category permanently deleted.";
      })
      .addCase(permanentDeleteSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleSubCategoryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleSubCategoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subCategories.findIndex(
          (sub) => sub._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.subCategories[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Sub-category status updated.";
      })
      .addCase(toggleSubCategoryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearSubCategory } =
  subCategorySlice.actions;
export default subCategorySlice.reducer;
