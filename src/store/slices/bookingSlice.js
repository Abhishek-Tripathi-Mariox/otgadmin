import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const initialState = {
  bookings: [],
  booking: null,
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

// Get all bookings
export const getBookings = createAsyncThunk(
  "bookings/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/bookings", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookings.",
      );
    }
  },
);

// Get single booking
export const getBooking = createAsyncThunk(
  "bookings/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking.",
      );
    }
  },
);

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  "bookings/updateStatus",
  async ({ id, status, paymentStatus }, { rejectWithValue }) => {
    try {
      const body = {};
      if (status) body.status = status;
      if (paymentStatus) body.paymentStatus = paymentStatus;
      const response = await api.patch(`/bookings/${id}/status`, body);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update booking status.",
      );
    }
  },
);

// Allocate (or change) the vendor for a booking
export const allocateVendor = createAsyncThunk(
  "bookings/allocateVendor",
  async ({ id, vendorId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bookings/${id}/vendor`, { vendorId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to allocate vendor.",
      );
    }
  },
);

// Allocate (or change) the driver for a booking — dispatches it to the driver app
export const allocateDriver = createAsyncThunk(
  "bookings/allocateDriver",
  async ({ id, driverId, vehicleNumber, vehicleType }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bookings/${id}/driver`, {
        driverId,
        vehicleNumber,
        vehicleType,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign driver.",
      );
    }
  },
);

// Delete booking
export const deleteBooking = createAsyncThunk(
  "bookings/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/bookings/${id}`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete booking.",
      );
    }
  },
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    clearBooking: (state) => {
      state.booking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get One
      .addCase(getBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.booking = action.payload.data;
      })
      .addCase(getBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(
          (b) => b._id === action.payload.data._id,
        );
        if (index !== -1) {
          state.bookings[index] = action.payload.data;
        }
        state.message =
          action.payload.message || "Booking status updated successfully.";
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Allocate Vendor
      .addCase(allocateVendor.pending, (state) => {
        state.error = null;
      })
      .addCase(allocateVendor.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.bookings.findIndex((b) => b._id === updated._id);
        if (index !== -1) {
          state.bookings[index] = updated;
        }
        if (state.booking && state.booking._id === updated._id) {
          state.booking = updated;
        }
        state.message = action.payload.message || "Vendor allocated.";
      })
      .addCase(allocateVendor.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Allocate Driver
      .addCase(allocateDriver.pending, (state) => {
        state.error = null;
      })
      .addCase(allocateDriver.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.bookings.findIndex((b) => b._id === updated._id);
        if (index !== -1) {
          state.bookings[index] = updated;
        }
        if (state.booking && state.booking._id === updated._id) {
          state.booking = updated;
        }
        state.message = action.payload.message || "Driver assigned.";
      })
      .addCase(allocateDriver.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter(
          (b) => b._id !== action.payload.id,
        );
        state.message =
          action.payload.message || "Booking deleted successfully.";
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearMessage, clearBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
