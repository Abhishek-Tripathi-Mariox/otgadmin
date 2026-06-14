import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  vendors: [],
  deletedVendors: [],
  vendor: null,
  vendorMaterials: [],
  states: [],
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

// Get all vendors
export const getVendors = createAsyncThunk(
  "vendors/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendors", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendors.",
      );
    }
  },
);

// Get deleted vendors
export const getDeletedVendors = createAsyncThunk(
  "vendors/getDeleted",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendors", {
        params: { ...params, showDeleted: "true" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deleted vendors.",
      );
    }
  },
);

// Get single vendor
export const getVendor = createAsyncThunk(
  "vendors/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendor.",
      );
    }
  },
);

// Get vendors by location
export const getVendorsByLocation = createAsyncThunk(
  "vendors/getByLocation",
  async ({ longitude, latitude, radius = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendors/nearby", {
        params: { longitude, latitude, radius },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch nearby vendors.",
      );
    }
  },
);

// Get states list
export const getStates = createAsyncThunk(
  "vendors/getStates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/vendors/states");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch states.",
      );
    }
  },
);

// Create vendor
export const createVendor = createAsyncThunk(
  "vendors/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/vendors", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create vendor.",
      );
    }
  },
);

// Update vendor
export const updateVendor = createAsyncThunk(
  "vendors/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/vendors/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vendor.",
      );
    }
  },
);

// Delete vendor (soft)
export const deleteVendor = createAsyncThunk(
  "vendors/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/vendors/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete vendor.",
      );
    }
  },
);

// Restore vendor
export const restoreVendor = createAsyncThunk(
  "vendors/restore",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/vendors/${id}/restore`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore vendor.",
      );
    }
  },
);

// Permanently delete vendor
export const permanentDeleteVendor = createAsyncThunk(
  "vendors/permanentDelete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/vendors/${id}/permanent`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to permanently delete vendor.",
      );
    }
  },
);

// Toggle vendor status
export const toggleVendorStatus = createAsyncThunk(
  "vendors/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/vendors/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vendor status.",
      );
    }
  },
);

// ==================== VENDOR MATERIALS ====================

// Get vendor materials
export const getVendorMaterials = createAsyncThunk(
  "vendors/getMaterials",
  async ({ vendorId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vendors/${vendorId}/materials`, {
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vendor materials.",
      );
    }
  },
);

// Add material to vendor
export const addVendorMaterial = createAsyncThunk(
  "vendors/addMaterial",
  async ({ vendorId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/vendors/${vendorId}/materials`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add material to vendor.",
      );
    }
  },
);

// Update vendor material
export const updateVendorMaterial = createAsyncThunk(
  "vendors/updateMaterial",
  async ({ vendorId, materialId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/vendors/${vendorId}/materials/${materialId}`,
        data,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update vendor material.",
      );
    }
  },
);

// Remove material from vendor
export const removeVendorMaterial = createAsyncThunk(
  "vendors/removeMaterial",
  async ({ vendorId, materialId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/vendors/${vendorId}/materials/${materialId}`,
      );
      return { ...response.data, materialId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to remove material from vendor.",
      );
    }
  },
);

// Toggle vendor material availability
export const toggleVendorMaterialAvailability = createAsyncThunk(
  "vendors/toggleMaterialAvailability",
  async ({ vendorId, materialId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/vendors/${vendorId}/materials/${materialId}/toggle-availability`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to toggle material availability.",
      );
    }
  },
);

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearVendor: (state) => {
      state.vendor = null;
    },
    clearVendorMaterials: (state) => {
      state.vendorMaterials = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Deleted
      .addCase(getDeletedVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeletedVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedVendors = action.payload.data || action.payload;
      })
      .addCase(getDeletedVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get One
      .addCase(getVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendor = action.payload.data;
      })
      .addCase(getVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get By Location
      .addCase(getVendorsByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorsByLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = action.payload.data || action.payload;
      })
      .addCase(getVendorsByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get States
      .addCase(getStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload.data || action.payload;
      })
      .addCase(getStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors.unshift(action.payload.data);
        state.message =
          action.payload.message || "Vendor created successfully.";
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex(
          (v) => v._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.vendors[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Vendor updated successfully.";
      })
      .addCase(updateVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.vendors = state.vendors.filter(
          (v) => v._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Vendor deleted successfully.";
      })
      .addCase(deleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore
      .addCase(restoreVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedVendors = state.deletedVendors.filter(
          (v) => v._id !== action.payload.data._id,
        );
        state.vendors.unshift(action.payload.data);
        state.message =
          action.payload.message || "Vendor restored successfully.";
      })
      .addCase(restoreVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Permanent Delete
      .addCase(permanentDeleteVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(permanentDeleteVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedVendors = state.deletedVendors.filter(
          (v) => v._id !== action.payload.id,
        );
        state.message = action.payload.message || "Vendor permanently deleted.";
      })
      .addCase(permanentDeleteVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Status
      .addCase(toggleVendorStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleVendorStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendors.findIndex(
          (v) => v._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.vendors[index] = action.payload.data;
        }
        state.message = action.payload.message || "Vendor status updated.";
      })
      .addCase(toggleVendorStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ==================== VENDOR MATERIALS ====================
      // Get Vendor Materials
      .addCase(getVendorMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVendorMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorMaterials = action.payload.data || action.payload;
        state.vendor = action.payload.vendor || state.vendor;
      })
      .addCase(getVendorMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Material
      .addCase(addVendorMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVendorMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorMaterials.unshift(action.payload.data);
        state.message =
          action.payload.message || "Material added successfully.";
      })
      .addCase(addVendorMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Material
      .addCase(updateVendorMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVendorMaterial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendorMaterials.findIndex(
          (vm) => vm._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.vendorMaterials[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Material updated successfully.";
      })
      .addCase(updateVendorMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Material
      .addCase(removeVendorMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeVendorMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorMaterials = state.vendorMaterials.filter(
          (vm) => vm.material?._id !== action.payload.materialId,
        );
        state.message =
          action.payload.message || "Material removed successfully.";
      })
      .addCase(removeVendorMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Material Availability
      .addCase(toggleVendorMaterialAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleVendorMaterialAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vendorMaterials.findIndex(
          (vm) => vm._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.vendorMaterials[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Material availability updated.";
      })
      .addCase(toggleVendorMaterialAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearVendor, clearVendorMaterials } =
  vendorSlice.actions;
export default vendorSlice.reducer;
