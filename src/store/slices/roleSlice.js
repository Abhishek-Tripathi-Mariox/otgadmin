import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  roles: [],
  meta: { modules: [], actions: [] },
  loading: false,
  error: null,
  message: null,
};

export const getRoles = createAsyncThunk(
  "roles/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/roles");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles.",
      );
    }
  },
);

export const getRoleMeta = createAsyncThunk(
  "roles/getMeta",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/roles/meta");
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch role meta.",
      );
    }
  },
);

export const createRole = createAsyncThunk(
  "roles/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/roles", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create role.",
      );
    }
  },
);

export const updateRole = createAsyncThunk(
  "roles/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/roles/${id}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role.",
      );
    }
  },
);

export const deleteRole = createAsyncThunk(
  "roles/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/roles/${id}`);
      return { ...res.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete role.",
      );
    }
  },
);

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearError: (s) => { s.error = null; },
    clearMessage: (s) => { s.message = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRoles.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(getRoles.fulfilled, (s, a) => {
        s.loading = false;
        s.roles = a.payload.data || [];
        if (a.payload.meta) s.meta = a.payload.meta;
      })
      .addCase(getRoles.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(getRoleMeta.fulfilled, (s, a) => {
        s.meta = a.payload.data || s.meta;
      })

      .addCase(createRole.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createRole.fulfilled, (s, a) => {
        s.loading = false;
        s.roles.push({ ...a.payload.data, staffCount: 0 });
        s.message = a.payload.message;
      })
      .addCase(createRole.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateRole.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateRole.fulfilled, (s, a) => {
        s.loading = false;
        const idx = s.roles.findIndex((r) => r._id === a.payload.data._id);
        if (idx !== -1) s.roles[idx] = { ...s.roles[idx], ...a.payload.data };
        s.message = a.payload.message;
      })
      .addCase(updateRole.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(deleteRole.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(deleteRole.fulfilled, (s, a) => {
        s.loading = false;
        s.roles = s.roles.filter((r) => r._id !== a.payload.id);
        s.message = a.payload.message;
      })
      .addCase(deleteRole.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearError, clearMessage } = roleSlice.actions;
export default roleSlice.reducer;
