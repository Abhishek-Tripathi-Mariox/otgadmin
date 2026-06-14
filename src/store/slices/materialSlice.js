import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  materials: [],
  deletedMaterials: [],
  material: null,
  units: [],
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

// Get all materials
export const getMaterials = createAsyncThunk(
  "materials/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/materials", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch materials.",
      );
    }
  },
);

// Get deleted materials
export const getDeletedMaterials = createAsyncThunk(
  "materials/getDeleted",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/materials", {
        params: { ...params, showDeleted: "true" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deleted materials.",
      );
    }
  },
);

// Get materials by category
export const getMaterialsByCategory = createAsyncThunk(
  "materials/getByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/materials/category/${categoryId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch materials.",
      );
    }
  },
);

// Get materials by sub-category
export const getMaterialsBySubCategory = createAsyncThunk(
  "materials/getBySubCategory",
  async (subCategoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/materials/sub-category/${subCategoryId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch materials.",
      );
    }
  },
);

// Get single material
export const getMaterial = createAsyncThunk(
  "materials/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch material.",
      );
    }
  },
);

// Get units list
export const getUnits = createAsyncThunk(
  "materials/getUnits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/materials/units");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch units.",
      );
    }
  },
);

// Create material
export const createMaterial = createAsyncThunk(
  "materials/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/materials", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create material.",
      );
    }
  },
);

// Update material
export const updateMaterial = createAsyncThunk(
  "materials/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/materials/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update material.",
      );
    }
  },
);

// Delete material (soft delete)
export const deleteMaterial = createAsyncThunk(
  "materials/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/materials/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete material.",
      );
    }
  },
);

// Restore material
export const restoreMaterial = createAsyncThunk(
  "materials/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/materials/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore material.",
      );
    }
  },
);

// Permanently delete material
export const permanentDeleteMaterial = createAsyncThunk(
  "materials/permanentDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/materials/${id}/permanent`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to permanently delete material.",
      );
    }
  },
);

// Toggle material status
export const toggleMaterialStatus = createAsyncThunk(
  "materials/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/materials/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update material status.",
      );
    }
  },
);

const materialSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearMaterial: (state) => {
      state.material = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Deleted
      .addCase(getDeletedMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeletedMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedMaterials = action.payload.data || action.payload;
      })
      .addCase(getDeletedMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get By Category
      .addCase(getMaterialsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterialsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload.data || action.payload;
      })
      .addCase(getMaterialsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get By SubCategory
      .addCase(getMaterialsBySubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterialsBySubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload.data || action.payload;
      })
      .addCase(getMaterialsBySubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get One
      .addCase(getMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.material = action.payload.data;
      })
      .addCase(getMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Units
      .addCase(getUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload.data || action.payload;
      })
      .addCase(getUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials.unshift(action.payload.data);
        state.message =
          action.payload.message || "Material created successfully.";
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.materials.findIndex(
          (mat) => mat._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.materials[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Material updated successfully.";
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = state.materials.filter(
          (mat) => mat._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Material deleted successfully.";
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore
      .addCase(restoreMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedMaterials = state.deletedMaterials.filter(
          (mat) => mat._id !== action.payload.data._id,
        );
        state.materials.unshift(action.payload.data);
        state.message =
          action.payload.message || "Material restored successfully.";
      })
      .addCase(restoreMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent Delete
      .addCase(permanentDeleteMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedMaterials = state.deletedMaterials.filter(
          (mat) => mat._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Material permanently deleted.";
      })
      .addCase(permanentDeleteMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleMaterialStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleMaterialStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.materials.findIndex(
          (mat) => mat._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.materials[index] = action.payload.data;
        }
        state.message = action.payload.message || "Material status updated.";
      })
      .addCase(toggleMaterialStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearMaterial } =
  materialSlice.actions;
export default materialSlice.reducer;
