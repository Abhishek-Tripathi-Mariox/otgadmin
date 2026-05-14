import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  settings: null,
  loading: false,
  saving: false,
  error: null,
  message: null,
};

export const getHelpSettings = createAsyncThunk(
  "helpSettings/get",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/help/settings");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load help settings.",
      );
    }
  },
);

export const saveHelpSettings = createAsyncThunk(
  "helpSettings/save",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put("/help/settings", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save settings.",
      );
    }
  },
);

const helpSettingsSlice = createSlice({
  name: "helpSettings",
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
      .addCase(getHelpSettings.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getHelpSettings.fulfilled, (s, a) => {
        s.loading = false;
        s.settings = a.payload.data;
      })
      .addCase(getHelpSettings.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(saveHelpSettings.pending, (s) => {
        s.saving = true;
      })
      .addCase(saveHelpSettings.fulfilled, (s, a) => {
        s.saving = false;
        s.settings = a.payload.data;
        s.message = a.payload.message || "Settings saved.";
      })
      .addCase(saveHelpSettings.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      });
  },
});

export const { clearError, clearMessage } = helpSettingsSlice.actions;
export default helpSettingsSlice.reducer;
