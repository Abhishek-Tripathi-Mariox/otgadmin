import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  categories: [],
  deletedCategories: [],
  category: null,
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

// Get all categories
export const getCategories = createAsyncThunk(
  "categories/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories.",
      );
    }
  },
);

// Get deleted categories
export const getDeletedCategories = createAsyncThunk(
  "categories/getDeleted",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories", {
        params: { ...params, showDeleted: "true" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deleted categories.",
      );
    }
  },
);

// Get single category
export const getCategory = createAsyncThunk(
  "categories/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category.",
      );
    }
  },
);

// Create category
export const createCategory = createAsyncThunk(
  "categories/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category.",
      );
    }
  },
);

// Update category
export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category.",
      );
    }
  },
);

// Delete category (soft delete)
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category.",
      );
    }
  },
);

// Restore category
export const restoreCategory = createAsyncThunk(
  "categories/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/categories/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore category.",
      );
    }
  },
);

// Permanently delete category
export const permanentDeleteCategory = createAsyncThunk(
  "categories/permanentDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/categories/${id}/permanent`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to permanently delete category.",
      );
    }
  },
);

// Toggle category status
export const toggleCategoryStatus = createAsyncThunk(
  "categories/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/categories/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category status.",
      );
    }
  },
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearCategory: (state) => {
      state.category = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Deleted
      .addCase(getDeletedCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeletedCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedCategories = action.payload.data || action.payload;
      })
      .addCase(getDeletedCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get One
      .addCase(getCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload.data;
      })
      .addCase(getCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload.data);
        state.message =
          action.payload.message || "Category created successfully.";
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (cat) => cat._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Category updated successfully.";
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Category deleted successfully.";
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore
      .addCase(restoreCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedCategories = state.deletedCategories.filter(
          (cat) => cat._id !== action.payload.data._id,
        );
        state.categories.unshift(action.payload.data);
        state.message =
          action.payload.message || "Category restored successfully.";
      })
      .addCase(restoreCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent Delete
      .addCase(permanentDeleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedCategories = state.deletedCategories.filter(
          (cat) => cat._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Category permanently deleted.";
      })
      .addCase(permanentDeleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleCategoryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(
          (cat) => cat._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
        state.message = action.payload.message || "Category status updated.";
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearCategory } =
  categorySlice.actions;
export default categorySlice.reducer;
