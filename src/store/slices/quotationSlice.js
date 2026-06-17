import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  quotations: [],
  quotation: null,
  counts: { new: 0, quoted: 0, accepted: 0, rejected: 0, expired: 0 },
  loading: false,
  saving: false,
  error: null,
  message: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

export const getQuotations = createAsyncThunk(
  "quotations/list",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/quotations", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch quotations.",
      );
    }
  },
);

export const getQuotationCounts = createAsyncThunk(
  "quotations/counts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/quotations/counts");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch counts.",
      );
    }
  },
);

export const getQuotation = createAsyncThunk(
  "quotations/get",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch quotation.",
      );
    }
  },
);

export const respondToQuotation = createAsyncThunk(
  "quotations/respond",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/quotations/${id}/respond`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send quotation.",
      );
    }
  },
);

export const uploadQuotationPdf = createAsyncThunk(
  "quotations/uploadPdf",
  async ({ id, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const response = await api.patch(`/quotations/${id}/pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload PDF.",
      );
    }
  },
);

export const updateQuotationStatus = createAsyncThunk(
  "quotations/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/quotations/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status.",
      );
    }
  },
);

export const assignVendorToQuotation = createAsyncThunk(
  "quotations/assignVendor",
  async ({ id, vendorId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/quotations/${id}/assign-vendor`, {
        vendorId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign vendor.",
      );
    }
  },
);

export const deleteQuotation = createAsyncThunk(
  "quotations/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/quotations/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete quotation.",
      );
    }
  },
);

const quotationSlice = createSlice({
  name: "quotations",
  initialState,
  reducers: {
    clearError: (s) => {
      s.error = null;
    },
    clearMessage: (s) => {
      s.message = null;
    },
    clearQuotation: (s) => {
      s.quotation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getQuotations.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getQuotations.fulfilled, (s, a) => {
        s.loading = false;
        s.quotations = a.payload.data || [];
        if (a.payload.pagination) s.pagination = a.payload.pagination;
      })
      .addCase(getQuotations.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(getQuotationCounts.fulfilled, (s, a) => {
        s.counts = a.payload.data || s.counts;
      })
      .addCase(getQuotation.fulfilled, (s, a) => {
        s.quotation = a.payload.data;
      })
      .addCase(respondToQuotation.pending, (s) => {
        s.saving = true;
      })
      .addCase(respondToQuotation.fulfilled, (s, a) => {
        s.saving = false;
        const updated = a.payload.data;
        s.quotations = s.quotations.map((q) =>
          q._id === updated._id ? { ...q, ...updated } : q,
        );
        if (s.quotation && s.quotation._id === updated._id) {
          s.quotation = { ...s.quotation, ...updated };
        }
        s.message = a.payload.message || "Quotation sent.";
      })
      .addCase(respondToQuotation.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      })
      .addCase(uploadQuotationPdf.pending, (s) => {
        s.saving = true;
      })
      .addCase(uploadQuotationPdf.fulfilled, (s, a) => {
        s.saving = false;
        const updated = a.payload.data;
        s.quotations = s.quotations.map((q) =>
          q._id === updated._id ? { ...q, ...updated } : q,
        );
        if (s.quotation && s.quotation._id === updated._id) {
          s.quotation = { ...s.quotation, ...updated };
        }
        s.message = a.payload.message || "Quotation PDF uploaded.";
      })
      .addCase(uploadQuotationPdf.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      })
      .addCase(updateQuotationStatus.fulfilled, (s, a) => {
        const updated = a.payload.data;
        s.quotations = s.quotations.map((q) =>
          q._id === updated._id ? { ...q, ...updated } : q,
        );
        s.message = a.payload.message || "Status updated.";
      })
      .addCase(updateQuotationStatus.rejected, (s, a) => {
        s.error = a.payload;
      })
      .addCase(assignVendorToQuotation.pending, (s) => {
        s.error = null;
      })
      .addCase(assignVendorToQuotation.fulfilled, (s, a) => {
        const updated = a.payload.data;
        s.quotations = s.quotations.map((q) =>
          q._id === updated._id ? { ...q, ...updated } : q,
        );
        if (s.quotation && s.quotation._id === updated._id) {
          s.quotation = { ...s.quotation, ...updated };
        }
        s.message = a.payload.message || "Vendor assigned.";
      })
      .addCase(assignVendorToQuotation.rejected, (s, a) => {
        s.error = a.payload;
      })
      .addCase(deleteQuotation.fulfilled, (s, a) => {
        s.quotations = s.quotations.filter((q) => q._id !== a.payload.id);
        s.message = a.payload.message || "Quotation deleted.";
      })
      .addCase(deleteQuotation.rejected, (s, a) => {
        s.error = a.payload;
      });
  },
});

export const { clearError, clearMessage, clearQuotation } =
  quotationSlice.actions;
export default quotationSlice.reducer;
