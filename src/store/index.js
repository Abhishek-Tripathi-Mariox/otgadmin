import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import subCategoryReducer from "./slices/subCategorySlice";
import materialReducer from "./slices/materialSlice";
import vendorReducer from "./slices/vendorSlice";
import userReducer from "./slices/userSlice";
import driverReducer from "./slices/driverSlice";
import bookingReducer from "./slices/bookingSlice";
import transactionReducer from "./slices/transactionSlice";
import staffReducer from "./slices/staffSlice";
import roleReducer from "./slices/roleSlice";
import bannerReducer from "./slices/bannerSlice";
import sellerRequestReducer from "./slices/sellerRequestSlice";
import cmsPageReducer from "./slices/cmsPageSlice";
import quotationReducer from "./slices/quotationSlice";
import offerReducer from "./slices/offerSlice";
import helpSettingsReducer from "./slices/helpSettingsSlice";
import supportTicketReducer from "./slices/supportTicketSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    subCategories: subCategoryReducer,
    materials: materialReducer,
    vendors: vendorReducer,
    users: userReducer,
    drivers: driverReducer,
    bookings: bookingReducer,
    transactions: transactionReducer,
    staff: staffReducer,
    roles: roleReducer,
    banners: bannerReducer,
    sellerRequests: sellerRequestReducer,
    cmsPages: cmsPageReducer,
    quotations: quotationReducer,
    offers: offerReducer,
    helpSettings: helpSettingsReducer,
    supportTickets: supportTicketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
