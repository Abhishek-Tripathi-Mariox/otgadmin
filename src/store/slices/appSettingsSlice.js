import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  settings: null,
  loading: false,
  saving: false,
  error: null,
  message: null,
};

export const getAppSettings = createAsyncThunk(
  "appSettings/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/app-settings/settings");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load app settings.",
      );
    }
  },
);

export const saveAppSettings = createAsyncThunk(
  "appSettings/save",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put("/app-settings/settings", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save app settings.",
      );
    }
  },
);

const appSettingsSlice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {
    clearError: (s) => {
      s.error = null;
    },
    clearMessage: (s) => {
      s.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAppSettings.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getAppSettings.fulfilled, (s, a) => {
        s.loading = false;
        s.settings = a.payload.data;
      })
      .addCase(getAppSettings.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(saveAppSettings.pending, (s) => {
        s.saving = true;
      })
      .addCase(saveAppSettings.fulfilled, (s, a) => {
        s.saving = false;
        s.settings = a.payload.data;
        s.message = a.payload.message || "Settings saved.";
      })
      .addCase(saveAppSettings.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      });
  },
});

export const { clearError, clearMessage } = appSettingsSlice.actions;
export default appSettingsSlice.reducer;
