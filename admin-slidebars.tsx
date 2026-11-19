"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Hospital,
  Users,
  Recycle,
  Truck,
  BrainCircuit,
  Bell,
  FileText,
  Settings,
  Leaf,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Hospitals", icon: Hospital, href: "/admin/hospitals" },
  { label: "Collectors", icon: Users, href: "/admin/collectors" },
  { label: "Collection Requests", icon: Recycle, href: "/admin/requests" },
  { label: "Vehicle Tracking", icon: Truck, href: "/admin/vehicles" },
  { label: "AI Analysis", icon: BrainCircuit, href: "/admin/ai-analysis" },
  { label: "Notifications", icon: Bell, href: "/admin/notifications" },
  { label: "Generate Report", icon: FileText, href: "/admin/reports" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X /> : <Menu />}
      </button>

      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      <aside className={`admin-sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Leaf size={23} /></div>
          <div>
            <h2>SegreMed</h2>
            <span>Smart Waste Management</span>
          </div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.label === "Notifications" && (
                  <span className="notification-count">3</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
