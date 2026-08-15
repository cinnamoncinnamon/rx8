import React, { useState, useEffect } from "react";
import { G, CSS, gradient } from "../constants";
import { apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead } from "../api";

const TYPE_COLORS = { announcement: "#3B82F6", alert: "#EF5350", promo: "#7C3AED" };
const TYPE_LABELS = { announcement: "Announcement", alert: "Alert", promo: "Promo" };

function BellIcon({ size = 40, color = "#ccc" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen({ onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    apiGetNotifications()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function openNotification(n) {
    if (!n.is_read) {
      apiMarkNotificationRead(n.id).catch(() => {});
      setNotifications(list => list.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    }
  }

  function markAllRead() {
    apiMarkAllNotificationsRead().catch(() => {});
    setNotifications(list => list.map(x => ({ ...x, is_read: true })));
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "#F4F4F8", minHeight: "100vh", fontFamily: "'Poppins',sans-serif", paddingBottom: 30 }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ background: gradient }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px" }}>
          <button onClick={onBack} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.18)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>‹</button>
          <span style={{ flex: 1, textAlign: "center", color: "#fff", fontWeight: 700, fontSize: 17 }}>Notifications</span>
          <button onClick={markAllRead} disabled={unreadCount === 0} style={{ background: "none", border: "none", color: unreadCount === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, cursor: unreadCount === 0 ? "default" : "pointer", fontFamily: "'Poppins',sans-serif", whiteSpace: "nowrap" }}>
            Mark all read
          </button>
        </div>
      </div>

      <div style={{ padding: "14px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#aaa", padding: 60, fontSize: 13 }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 20px" }}>
            <BellIcon size={48} color="#ddd" />
            <div style={{ color: "#999", fontSize: 14, fontWeight: 600, marginTop: 14 }}>Nothing here yet</div>
            <div style={{ color: "#bbb", fontSize: 12, marginTop: 4 }}>Announcements and alerts will show up here.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map(n => (
              <div key={n.id} onClick={() => openNotification(n)} style={{
                background: "#fff", borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                boxShadow: "0 1px 2px rgba(16,24,40,0.04), 0 8px 20px -12px rgba(16,24,40,0.14)",
                border: n.is_read ? "1px solid rgba(16,24,40,0.05)" : `1px solid ${TYPE_COLORS[n.type]}33`,
                position: "relative",
              }}>
                {!n.is_read && <div style={{ position: "absolute", top: 16, right: 14, width: 8, height: 8, borderRadius: 4, background: TYPE_COLORS[n.type] || G.red }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ background: `${TYPE_COLORS[n.type]}18`, color: TYPE_COLORS[n.type], fontSize: 10, padding: "2px 9px", borderRadius: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {TYPE_LABELS[n.type] || n.type}
                  </span>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{timeAgo(n.created_at)}</span>
                </div>
                <div style={{ fontWeight: n.is_read ? 600 : 700, fontSize: 14, color: G.text, marginBottom: 4, paddingRight: 16 }}>{n.title}</div>
                <div style={{ fontSize: 12.5, color: "#777", lineHeight: 1.5 }}>{n.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
