import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Star,
  AlertTriangle,
  CheckCircle,
  Truck,
  Calendar,
} from "lucide-react";

import Card from "../components/ui/Card";
import api from "../services/api";
import usePolling from "../hooks/usePolling";

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topMaterials, setTopMaterials] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [chartFilter, setChartFilter] = useState("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchRevenueTrend();
  }, [chartFilter]);

  // Keep dashboard KPIs (pending/in-transit/completed orders, revenue) in sync
  // with the backend without a manual reload.
  usePolling(() => {
    fetchDashboardData();
    fetchRevenueTrend();
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, materialsRes, vendorsRes] = await Promise.all([
        api.get("/bookings/stats/dashboard"),
        api.get("/bookings/stats/top-materials"),
        api.get("/bookings/stats/top-vendors"),
      ]);

      setDashboardStats(statsRes.data.data);
      setTopMaterials(materialsRes.data.data);
      setTopVendors(vendorsRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardStats({
        totalOrders: 0,
        pendingOrders: 0,
        inTransitOrders: 0,
        deliveredOrders: 0,
        today: {
          todayOrders: 0,
          todayPending: 0,
          todayCompleted: 0,
          todayRevenue: 0,
        },
      });
      setTopMaterials([]);
      setTopVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (filter) => {
    const to = new Date();
    const from = new Date();
    switch (filter) {
      case "week":
        from.setDate(to.getDate() - 6);
        break;
      case "month":
        from.setMonth(to.getMonth() - 1);
        break;
      case "3months":
        from.setMonth(to.getMonth() - 3);
        break;
      case "6months":
        from.setMonth(to.getMonth() - 6);
        break;
      case "year":
        from.setFullYear(to.getFullYear() - 1);
        break;
      default:
        from.setDate(to.getDate() - 6);
    }
    return {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    };
  };

  const fetchRevenueTrend = async (fromOverride, toOverride) => {
    try {
      let from, to;
      if (fromOverride && toOverride) {
        from = fromOverride;
        to = toOverride;
      } else if (chartFilter === "custom") {
        if (!customFrom || !customTo) return;
        from = customFrom;
        to = customTo;
      } else {
        const range = getDateRange(chartFilter);
        from = range.from;
        to = range.to;
      }
      const res = await api.get(
        `/bookings/stats/revenue-trend?from=${from}&to=${to}`,
      );
      setRevenueTrend(res.data.data || []);
    } catch (error) {
      console.error("Error fetching revenue trend:", error);
      setRevenueTrend([]);
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      fetchRevenueTrend(customFrom, customTo);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const maxRevenue = Math.max(...revenueTrend.map((d) => d.revenue), 1);

  /* ---------------- KPIs ---------------- */

  const statCards = [
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: dashboardStats?.totalOrders || 0,
      change: "",
      trend: "up",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Package,
      label: "Today's Pending",
      value: dashboardStats?.today?.todayPending || 0,
      change: `${dashboardStats?.today?.todayOrders || 0} today`,
      trend: "up",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Truck,
      label: "In-Transit Orders",
      value: dashboardStats?.inTransitOrders || 0,
      change: "",
      trend: "up",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: CheckCircle,
      label: "Completed Orders",
      value: dashboardStats?.deliveredOrders || 0,
      change: `${dashboardStats?.today?.todayCompleted || 0} today`,
      trend: "up",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: TrendingUp,
      label: "Total Revenue",
      value: `₹${(dashboardStats?.totalRevenue || 0).toLocaleString()}`,
      change: `₹${(dashboardStats?.today?.todayRevenue || 0).toLocaleString()} today`,
      trend: "up",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  const pendingOrders = dashboardStats?.pendingOrders || 0;
  const inTransitOrders = dashboardStats?.inTransitOrders || 0;
  const completedOrders = dashboardStats?.deliveredOrders || 0;

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      {/* KPI GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
          const trendColor =
            stat.trend === "up" ? "text-green-600" : "text-red-600";

          return (
            <Card key={idx} className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}
                >
                  <TrendIcon size={16} />
                  {stat.change}
                </div>
              </div>

              <p className="mb-2 text-sm font-medium text-gray-600">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* MIDDLE GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-50">
                <BarChart3 size={20} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Revenue Trend</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "week", label: "Week" },
                { key: "month", label: "Month" },
                { key: "3months", label: "3M" },
                { key: "6months", label: "6M" },
                { key: "year", label: "Year" },
                { key: "custom", label: "Custom" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setChartFilter(f.key)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                    chartFilter === f.key
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {chartFilter === "custom" && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="input-field text-sm !py-1 !px-2 w-auto"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="input-field text-sm !py-1 !px-2 w-auto"
              />
              <button
                onClick={handleCustomApply}
                className="px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                Apply
              </button>
            </div>
          )}

          {revenueTrend.length > 0 ? (
            <div className="flex items-end justify-between gap-1 h-48 overflow-x-auto">
              {revenueTrend.map((d, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center flex-1 min-w-[24px] gap-1 group relative"
                >
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    ₹{d.revenue.toLocaleString()} | {d.orders} orders
                  </div>
                  <div
                    className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-orange-500 to-orange-400 transition-all"
                    style={{
                      height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%`,
                    }}
                  />
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">
                    {formatDate(d.date)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              No revenue data for selected period
            </div>
          )}
        </Card>

        {/* Order Status */}
        <Card title="Order Status" icon={AlertTriangle}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
              <span className="text-sm font-medium">Pending Orders</span>
              <span className="font-bold text-yellow-600">{pendingOrders}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
              <span className="text-sm font-medium">In-Transit Orders</span>
              <span className="font-bold text-purple-600">
                {inTransitOrders}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
              <span className="text-sm font-medium">Completed Orders</span>
              <span className="font-bold text-green-600">
                {completedOrders}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="font-bold text-orange-600">
                ₹{(dashboardStats?.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 5 Materials */}
        <Card title="Top 5 Materials" icon={Package}>
          {topMaterials && topMaterials.length > 0 ? (
            <div className="space-y-3">
              {topMaterials.map((material, idx) => (
                <div
                  key={material._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white bg-orange-500 rounded-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {material.materialName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Orders: {material.count} | Qty: {material.totalQuantity}{" "}
                        {material.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-600">
                      ₹{(material.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <Package size={18} />
              <span className="text-sm">No materials data available</span>
            </div>
          )}
        </Card>

        {/* Top Vendors */}
        <Card title="Top Performing Vendors" icon={Users}>
          {topVendors && topVendors.length > 0 ? (
            <div className="space-y-3">
              {topVendors.map((vendor, idx) => (
                <div
                  key={vendor._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-white bg-orange-500 rounded-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{vendor.vendorName}</p>
                      <p className="text-xs text-gray-500">
                        Orders: {vendor.count} | Revenue: ₹
                        {(vendor.totalRevenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={18} />
              <span className="text-sm">No vendor data available</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
