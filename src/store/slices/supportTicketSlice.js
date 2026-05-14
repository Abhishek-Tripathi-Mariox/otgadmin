import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  tickets: [],
  counts: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
  loading: false,
  saving: false,
  error: null,
  message: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

export const getSupportTickets = createAsyncThunk(
  "supportTickets/list",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/help/tickets", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load tickets.",
      );
    }
  },
);

export const getSupportTicketCounts = createAsyncThunk(
  "supportTickets/counts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/help/tickets/counts");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load counts.",
      );
    }
  },
);

export const replyToSupportTicket = createAsyncThunk(
  "supportTickets/reply",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/help/tickets/${id}/reply`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reply.",
      );
    }
  },
);

export const updateSupportTicketStatus = createAsyncThunk(
  "supportTickets/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/help/tickets/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status.",
      );
    }
  },
);

export const deleteSupportTicket = createAsyncThunk(
  "supportTickets/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/help/tickets/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete ticket.",
      );
    }
  },
);

const slice = createSlice({
  name: "supportTickets",
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
      .addCase(getSupportTickets.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(getSupportTickets.fulfilled, (s, a) => {
        s.loading = false;
        s.tickets = a.payload.data || [];
        if (a.payload.pagination) s.pagination = a.payload.pagination;
      })
      .addCase(getSupportTickets.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      .addCase(getSupportTicketCounts.fulfilled, (s, a) => {
        s.counts = a.payload.data || s.counts;
      })
      .addCase(replyToSupportTicket.pending, (s) => {
        s.saving = true;
      })
      .addCase(replyToSupportTicket.fulfilled, (s, a) => {
        s.saving = false;
        const updated = a.payload.data;
        s.tickets = s.tickets.map((t) =>
          t._id === updated._id ? { ...t, ...updated } : t,
        );
        s.message = a.payload.message || "Reply sent.";
      })
      .addCase(replyToSupportTicket.rejected, (s, a) => {
        s.saving = false;
        s.error = a.payload;
      })
      .addCase(updateSupportTicketStatus.fulfilled, (s, a) => {
        const updated = a.payload.data;
        s.tickets = s.tickets.map((t) =>
          t._id === updated._id ? { ...t, ...updated } : t,
        );
        s.message = a.payload.message || "Status updated.";
      })
      .addCase(updateSupportTicketStatus.rejected, (s, a) => {
        s.error = a.payload;
      })
      .addCase(deleteSupportTicket.fulfilled, (s, a) => {
        s.tickets = s.tickets.filter((t) => t._id !== a.payload.id);
        s.message = a.payload.message || "Ticket deleted.";
      })
      .addCase(deleteSupportTicket.rejected, (s, a) => {
        s.error = a.payload;
      });
  },
});

export const { clearError, clearMessage } = slice.actions;
export default slice.reducer;
