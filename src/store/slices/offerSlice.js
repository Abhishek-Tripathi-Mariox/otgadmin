import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  offers: [],
  offer: null,
  stats: null,
  meta: { scopes: [], discountTypes: [] },
  loading: false,
  error: null,
  message: null,
  pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
};

export const getOffers = createAsyncThunk(
  "offers/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/offers", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch offers.",
      );
    }
  },
);

export const getOffer = createAsyncThunk(
  "offers/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/offers/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch offer.",
      );
    }
  },
);

export const createOffer = createAsyncThunk(
  "offers/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/offers", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create offer.",
      );
    }
  },
);

export const updateOffer = createAsyncThunk(
  "offers/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/offers/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update offer.",
      );
    }
  },
);

export const toggleOfferStatus = createAsyncThunk(
  "offers/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/offers/${id}/status`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update status.",
      );
    }
  },
);

export const deleteOffer = createAsyncThunk(
  "offers/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/offers/${id}`);
      return { ...res.data, id };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete offer.",
      );
    }
  },
);

const offerSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    clearError: (s) => { s.error = null; },
    clearMessage: (s) => { s.message = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOffers.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(getOffers.fulfilled, (s, a) => {
        s.loading = false;
        s.offers = a.payload.data || [];
        s.stats = a.payload.stats || s.stats;
        if (a.payload.pagination) s.pagination = a.payload.pagination;
        if (a.payload.meta) s.meta = a.payload.meta;
      })
      .addCase(getOffers.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(getOffer.fulfilled, (s, a) => { s.offer = a.payload.data; })

      .addCase(createOffer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createOffer.fulfilled, (s, a) => {
        s.loading = false;
        s.offers.unshift(a.payload.data);
        s.message = a.payload.message;
      })
      .addCase(createOffer.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateOffer.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateOffer.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.offers.findIndex((o) => o._id === a.payload.data._id);
        if (idx !== -1) s.offers[idx] = { ...s.offers[idx], ...a.payload.data };
        s.message = a.payload.message;
      })
      .addCase(updateOffer.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(toggleOfferStatus.fulfilled, (s, a) => {
        const idx = s.offers.findIndex((o) => o._id === a.payload.data._id);
        if (idx !== -1) s.offers[idx] = { ...s.offers[idx], ...a.payload.data };
        s.message = a.payload.message;
      })
      .addCase(toggleOfferStatus.rejected, (s, a) => { s.error = a.payload; })

      .addCase(deleteOffer.fulfilled, (s, a) => {
        s.offers = s.offers.filter((o) => o._id !== a.payload.id);
        s.message = a.payload.message;
      })
      .addCase(deleteOffer.rejected, (s, a) => { s.error = a.payload; });
  },
});

export const { clearError, clearMessage } = offerSlice.actions;
export default offerSlice.reducer;
