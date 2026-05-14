import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  transactions: [],
  transaction: null,
  stats: { settled: 0, pending: 0, refunds: 0, failed: 0, count: 0 },
  loading: false,
  saving: false,
  error: null,
  message: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Get all transactions
export const getTransactions = createAsyncThunk(
  "transactions/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/transactions", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transactions.",
      );
    }
  },
);

// Get single transaction
export const getTransaction = createAsyncThunk(
  "transactions/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transaction.",
      );
    }
  },
);

// Stats
export const getTransactionStats = createAsyncThunk(
  "transactions/stats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/transactions/stats", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats.",
      );
    }
  },
);

// Create transaction
export const createTransaction = createAsyncThunk(
  "transactions/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/transactions", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create transaction.",
      );
    }
  },
);

// Delete transaction
export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete transaction.",
      );
    }
  },
);

// Update transaction status
export const updateTransactionStatus = createAsyncThunk(
  "transactions/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/transactions/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update transaction status.",
      );
    }
  },
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearTransaction: (state) => {
      state.transaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get One
      .addCase(getTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload.data;
      })
      .addCase(getTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateTransactionStatus.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.transactions.findIndex(
          (t) => t._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.transactions[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Transaction status updated successfully.";
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Stats
      .addCase(getTransactionStats.fulfilled, (state, action) => {
        state.stats = action.payload.data || state.stats;
      })
      // Create
      .addCase(createTransaction.pending, (state) => {
        state.saving = true;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload.data) {
          state.transactions.unshift(action.payload.data);
        }
        state.message = action.payload.message || "Transaction recorded.";
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t._id !== action.payload.id,
        );
        state.message = action.payload.message || "Transaction deleted.";
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearTransaction } =
  transactionSlice.actions;
export default transactionSlice.reducer;
