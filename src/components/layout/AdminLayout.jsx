import {
  LogOut,
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileText,
  CreditCard,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Grid3X3,
  Box,
  Shield,
  UserCog,
  KeyRound,
  Settings,
  MapPin,
  Flame,
  Wallet,
  MessageSquare,
  Bell,
  Store,
  Truck,
  UserPlus,
  Image,
  ClipboardList,
  Ticket,
  LifeBuoy,
  Headphones,
} from "lucide-react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout, getProfile } from "../../store/slices/authSlice";
import usePermission from "../../hooks/usePermission";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { can, isSuperAdmin } = usePermission();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Refresh profile on mount so permissions stay current after role edits
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Sidebar sections — every item declares the permission module it requires
  const rawSidebarSections = [
    {
      label: "Operations",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", perm: "dashboard" },
        { icon: Layers, label: "Bookings", path: "/bookings", perm: "bookings" },
        { icon: ClipboardList, label: "Quotations", path: "/quotations", perm: "bookings" },
        { icon: CreditCard, label: "Transactions", path: "/transactions", perm: "transactions" },
      ],
    },
    {
      label: "Catalog",
      items: [
        {
          icon: Package,
          label: "Material Management",
          key: "material",
          subItems: [
            { icon: FolderOpen, label: "Categories", path: "/categories", perm: "categories" },
            { icon: Grid3X3, label: "Sub Categories", path: "/sub-categories", perm: "subCategories" },
            { icon: Box, label: "Materials", path: "/materials", perm: "materials" },
          ],
        },
      ],
    },
    {
      label: "Domain Management",
      items: [
        { icon: Users, label: "Users", path: "/users", perm: "users" },
        {
          icon: Store,
          label: "Vendors",
          key: "vendors",
          subItems: [
            { icon: Store, label: "Vendors", path: "/vendors", perm: "vendors" },
            {
              icon: UserPlus,
              label: "New Sellers Requests",
              path: "/vendors/seller-requests",
              perm: "vendors",
            },
          ],
        },
        { icon: Truck, label: "Drivers", path: "/drivers", perm: "drivers" },
      ],
    },
    {
      label: "Team Management",
      items: [
        {
          icon: Shield,
          label: "Staff Management",
          key: "staff",
          subItems: [
            { icon: UserCog, label: "Staff", path: "/staff", perm: "staff" },
            { icon: KeyRound, label: "Roles & Permissions", path: "/roles", perm: "roles" },
          ],
        },
      ],
    },
    {
      label: "Content",
      items: [
        {
          icon: FileText,
          label: "CMS Management",
          key: "cms",
          subItems: [
            { icon: FileText, label: "Overview", path: "/cms", perm: "cms" },
            { icon: Image, label: "Homepage Banners", path: "/cms/home-banners", perm: "cms" },
          ],
        },
        { icon: Ticket, label: "Offers & Coupons", path: "/offers", perm: "offers" },
        {
          icon: LifeBuoy,
          label: "Help & Support",
          key: "help",
          subItems: [
            { icon: Headphones, label: "Help Settings", path: "/help/settings", perm: "cms" },
            { icon: LifeBuoy, label: "Support Tickets", path: "/help/tickets", perm: "cms" },
          ],
        },
        { icon: Bell, label: "Notifications", path: "/notifications", perm: "notifications" },
      ],
    },
    {
      label: "Configuration",
      items: [
        {
          icon: Settings,
          label: "Configurations",
          key: "config",
          adminOnly: true,
          subItems: [
            { icon: MapPin, label: "Google API", path: "/config/google-api" },
            { icon: Flame, label: "Firebase", path: "/config/firebase" },
            { icon: Wallet, label: "Razorpay", path: "/config/razorpay" },
            { icon: MessageSquare, label: "SMS", path: "/config/sms" },
          ],
        },
      ],
    },
  ];

  const sidebarSections = rawSidebarSections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          if (item.subItems) {
            if (item.adminOnly && !isSuperAdmin) return null;
            const allowedSubs = item.subItems.filter((sub) =>
              sub.perm ? can(sub.perm, "view") : true,
            );
            if (!allowedSubs.length) return null;
            return { ...item, subItems: allowedSubs };
          }
          if (item.perm && !can(item.perm, "view")) return null;
          return item;
        })
        .filter(Boolean),
    }))
    .filter((s) => s.items.length > 0);

  // Auto-expand menus if a sub-item is active
  useEffect(() => {
    sidebarSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.subItems) {
          const isSubActive = item.subItems.some(
            (sub) => location.pathname === sub.path,
          );
          if (isSubActive) {
            setOpenMenus((prev) => ({ ...prev, [item.key]: true }));
          }
        }
      });
    });
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-12 border-b border-gray-100">
          <div className="pl-4">
            <h1 className="text-xl font-semibold text-gray-900">OTG</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Admin Panel
            </p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg md:hidden hover:bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {sidebarSections.map((section) => (
            <div key={section.label}>
              <p className="px-4 mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  // Expandable menu with sub-items
                  if (item.subItems) {
                    const isSubActive = item.subItems.some(
                      (sub) => location.pathname === sub.path,
                    );
                    const isOpen = openMenus[item.key];

                    return (
                      <div key={item.key}>
                        <button
                          onClick={() => toggleMenu(item.key)}
                          className={`flex items-center justify-between w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            isSubActive
                              ? "bg-orange-100 text-orange-600"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              size={20}
                              className={
                                isSubActive ? "text-orange-500" : "text-gray-500"
                              }
                            />
                            <span
                              className={`text-sm ${
                                isSubActive ? "font-semibold" : "font-normal"
                              }`}
                            >
                              {item.label}
                            </span>
                          </div>
                          {isOpen ? (
                            <ChevronDown size={16} className="text-gray-500" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-500" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="pl-4 mt-1 ml-4 space-y-1 border-l-2 border-gray-200">
                            {item.subItems.map((sub) => {
                              const SubIcon = sub.icon;
                              const active = isActive(sub.path);

                              return (
                                <Link
                                  key={sub.path}
                                  to={sub.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                    active
                                      ? "bg-orange-500 text-white"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  <SubIcon
                                    size={18}
                                    className={active ? "text-white" : "text-gray-400"}
                                  />
                                  <span
                                    className={`text-sm ${
                                      active ? "font-semibold" : "font-normal"
                                    }`}
                                  >
                                    {sub.label}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Simple menu item
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={active ? "text-white" : "text-gray-500"}
                      />
                      <span
                        className={`text-sm ${
                          active ? "font-semibold" : "font-normal"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile Header with hamburger */}
        <div className="flex items-center h-14 px-4 border-b border-gray-200 bg-white md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
          <span className="ml-3 text-lg font-semibold text-gray-900">OTG Admin</span>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children || <Outlet />}</div>
        </main>
      </div>
    </div>
  );
}
