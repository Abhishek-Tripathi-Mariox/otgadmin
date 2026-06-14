import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Admin Pages
import Dashboard from "../pages/Dashboard";
import Users from "../pages/User";
import Vendors from "../pages/Vendors";
import NewSellerRequests from "../pages/NewSellerRequests";
import Drivers from "../pages/Drivers";
import VendorMaterials from "../pages/VendorMaterials";
import Categories from "../pages/Categories";
import Brands from "../pages/Brands";
import SubCategories from "../pages/SubCategories";
import Materials from "../pages/Materials";
import Bookings from "../pages/Booking";
import Transactions from "../pages/Transactions";
import Staff from "../pages/Staff";
import Roles from "../pages/Roles";
import CMS from "../pages/CMS";
import CmsPageEditor from "../pages/CmsPageEditor";
import HomeBanners from "../pages/HomeBanners";
import Configuration from "../pages/Configuration";
import Notifications from "../pages/Notifications";
import Quotations from "../pages/Quotations";
import Offers from "../pages/Offers";
import HelpSettings from "../pages/HelpSettings";
import SupportTickets from "../pages/SupportTickets";
import Reviews from "../pages/Reviews";
import Faqs from "../pages/Faqs";

// Layout & Route Guards
import AdminLayout from "../components/layout/AdminLayout";
import PrivateRoute from "../components/PrivateRoute";
import PublicRoute from "../components/PublicRoute";
import PermissionRoute from "../components/PermissionRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* ===== PRIVATE/ADMIN ROUTES ===== */}
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<PermissionRoute module="dashboard"><Dashboard /></PermissionRoute>} />
          <Route path="/users" element={<PermissionRoute module="users"><Users /></PermissionRoute>} />
          <Route path="/vendors" element={<PermissionRoute module="vendors"><Vendors /></PermissionRoute>} />
          <Route path="/vendors/seller-requests" element={<PermissionRoute module="vendors"><NewSellerRequests /></PermissionRoute>} />
          <Route path="/drivers" element={<PermissionRoute module="drivers"><Drivers /></PermissionRoute>} />
          <Route
            path="/vendors/:vendorId/materials"
            element={<PermissionRoute module="vendors"><VendorMaterials /></PermissionRoute>}
          />
          <Route path="/categories" element={<PermissionRoute module="categories"><Categories /></PermissionRoute>} />
          <Route path="/brands" element={<PermissionRoute module="categories"><Brands /></PermissionRoute>} />
          <Route path="/sub-categories" element={<PermissionRoute module="subCategories"><SubCategories /></PermissionRoute>} />
          <Route path="/materials" element={<PermissionRoute module="materials"><Materials /></PermissionRoute>} />
          <Route path="/reviews" element={<PermissionRoute module="materials"><Reviews /></PermissionRoute>} />
          <Route path="/bookings" element={<PermissionRoute module="bookings"><Bookings /></PermissionRoute>} />
          <Route path="/quotations" element={<PermissionRoute module="bookings"><Quotations /></PermissionRoute>} />
          <Route path="/transactions" element={<PermissionRoute module="transactions"><Transactions /></PermissionRoute>} />
          <Route path="/staff" element={<PermissionRoute module="staff"><Staff /></PermissionRoute>} />
          <Route path="/roles" element={<PermissionRoute module="roles"><Roles /></PermissionRoute>} />
          <Route path="/cms" element={<PermissionRoute module="cms"><CMS /></PermissionRoute>} />
          <Route path="/cms/home-banners" element={<PermissionRoute module="cms"><HomeBanners /></PermissionRoute>} />
          <Route path="/cms/edit/:slug" element={<PermissionRoute module="cms"><CmsPageEditor /></PermissionRoute>} />
          <Route path="/config/:service" element={<Configuration />} />
          <Route path="/notifications" element={<PermissionRoute module="notifications"><Notifications /></PermissionRoute>} />
          <Route path="/offers" element={<PermissionRoute module="offers"><Offers /></PermissionRoute>} />
          <Route path="/help/settings" element={<PermissionRoute module="cms"><HelpSettings /></PermissionRoute>} />
          <Route path="/help/tickets" element={<PermissionRoute module="cms"><SupportTickets /></PermissionRoute>} />
          <Route path="/faqs" element={<PermissionRoute module="cms"><Faqs /></PermissionRoute>} />
        </Route>
      </Route>

      {/* ===== DEFAULT REDIRECT ===== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
