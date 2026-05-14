import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  pages: [],
  page: null,
  loading: false,
  saving: false,
  error: null,
  message: null,
};

export const getCmsPages = createAsyncThunk(
  "cmsPages/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cms-pages");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pages.",
      );
    }
  },
);

export const getCmsPage = createAsyncThunk(
  "cmsPages/get",
  async (idOrSlug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cms-pages/${idOrSlug}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch page.",
      );
    }
  },
);

export const saveCmsPage = createAsyncThunk(
  "cmsPages/save",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/cms-pages", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save page.",
      );
    }
  },
);

export const deleteCmsPage = createAsyncThunk(
  "cmsPages/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cms-pages/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete page.",
      );
    }
  },
);

const cmsPageSlice = createSlice({
  name: "cmsPages",
  initialState,
  reducers: {
    clearError: (s) => {
      s.error = null;
    },
    clearMessage: (s) => {
      s.message = null;
    },
    clearPage: (s) => {
      s.page = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCmsPages.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getCmsPages.fulfilled, (s, a) => {
        s.loading = false;
        s.pages = a.payload.data || [];
      })
      .addCase(getCmsPages.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(getCmsPage.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.page = null;
      })
      .addCase(getCmsPage.fulfilled, (s, a) => {
        s.loading = false;
        s.page = a.payload.data;
      })
      .addCase(getCmsPage.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(saveCmsPage.pending, (s) => {
        s.saving = true;
        s.error = null;
      })
      .addCase(saveCmsPage.fulfilled, (s, a) => {
        s.saving = false;
        s.page = a.payload.data;
        s.message = a.payload.message || "Page saved.";
      })
      .addCase(saveCmsPage.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      })
      .addCase(deleteCmsPage.fulfilled, (s, a) => {
        s.pages = s.pages.filter((p) => p._id !== a.payload.id);
        s.message = a.payload.message || "Page deleted.";
      })
      .addCase(deleteCmsPage.rejected, (s, a) => {
        s.error = a.payload;
      });
  },
});

export const { clearError, clearMessage, clearPage } = cmsPageSlice.actions;
export default cmsPageSlice.reducer;
