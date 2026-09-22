import { useEffect, useState, useCallback } from "react";
import { Wallet, Banknote, PiggyBank, Search } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import usePolling from "../hooks/usePolling";

const formatCurrency = (amt) => `₹${Number(amt || 0).toLocaleString("en-IN")}`;

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-4 p-5 bg-white border rounded-xl">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  </div>
);

export default function CODReconciliation() {
  const [data, setData] = useState({ totals: {}, drivers: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.get("/drivers/cod-reconciliation");
      if (res.data?.success) setData(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load COD reconciliation.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cash balances change in near real time as deliveries complete — keep
  // this view fresh without a manual refresh, same as other admin pages.
  usePolling(load);

  const { totals = {}, drivers = [] } = data;
  const filteredDrivers = search
    ? drivers.filter(
        (d) =>
          d.driverName?.toLowerCase().includes(search.toLowerCase()) ||
          d.driverMobile?.includes(search),
      )
    : drivers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          COD Reconciliation
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Cash collected on delivery, deposited back to the office, and
          what's still outstanding — per driver.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          icon={Banknote}
          label="Total COD Collected"
          value={formatCurrency(totals.collected)}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={PiggyBank}
          label="Total Deposited"
          value={formatCurrency(totals.deposited)}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={Wallet}
          label="Outstanding Cash In Hand"
          value={formatCurrency(totals.cashInHand)}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
        />
        <input
          type="text"
          placeholder="Search driver by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 input-field"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-b-2 border-orange-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white border rounded-xl">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4 font-medium text-left text-gray-600">
                  Driver
                </th>
                <th className="p-4 font-medium text-right text-gray-600">
                  Deliveries
                </th>
                <th className="p-4 font-medium text-right text-gray-600">
                  Collected
                </th>
                <th className="p-4 font-medium text-right text-gray-600">
                  Deposited
                </th>
                <th className="p-4 font-medium text-right text-gray-600">
                  Cash In Hand
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((d) => (
                <tr
                  key={d.driverId}
                  className="transition border-b hover:bg-gray-50"
                >
                  <td className="p-4">
                    <div className="font-medium text-gray-900">
                      {d.driverName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {d.driverMobile}
                    </div>
                  </td>
                  <td className="p-4 text-right text-gray-600">
                    {d.deliveries}
                  </td>
                  <td className="p-4 text-right text-gray-900">
                    {formatCurrency(d.collected)}
                  </td>
                  <td className="p-4 text-right text-gray-600">
                    {formatCurrency(d.deposited)}
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={`font-semibold ${
                        d.cashInHand > 0 ? "text-amber-600" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(d.cashInHand)}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-500">
                    No COD activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
