import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import usePolling from "../hooks/usePolling";

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Admin's own notification bell — polls the shared admin inbox (see
 * adminNotifications.controller.ts) so new orders, deliveries, payments,
 * and bulk quotations show up on the Dashboard without a manual refresh.
 * Distinct from the "Notifications" sidebar page, which is the admin's
 * outbound broadcast composer to users/vendors/drivers.
 */
export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/notifications/inbox");
      setItems(res.data?.data || []);
      setUnreadCount(res.data?.meta?.unreadCount || 0);
    } catch {
      // stay quiet — the bell just won't update this tick
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePolling(load, 15000);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((v) => !v);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await api.patch("/notifications/inbox/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
      setUnreadCount(0);
    } catch {
      // ignore — next poll reconciles
    }
  };

  const handleItemClick = async (n) => {
    if (n.unread) {
      try {
        await api.patch(`/notifications/inbox/${n._id}/read`);
        setItems((prev) =>
          prev.map((it) => (it._id === n._id ? { ...it, unread: false } : it)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }
    setOpen(false);
    if (n.booking) {
      navigate("/bookings");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-orange-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No notifications yet
            </div>
          ) : (
            items.map((n) => (
              <button
                key={n._id}
                onClick={() => handleItemClick(n)}
                className={`block w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 ${
                  n.unread ? "bg-orange-50/50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {n.title}
                  </span>
                  {n.unread && (
                    <span className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {n.message}
                </p>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {timeAgo(n.createdAt)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
