import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Bell } from "lucide-react";
import Button from "@/components/ui/button";
import avatarImg from "@/assets/avatar-1.jpg";

const Header = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New patient registration: Maria Garcia", time: "2 min ago", type: "info", read: false },
    { id: 2, message: "Appointment reminder: Sarah Johnson at 9:00 AM", time: "15 min ago", type: "reminder", read: false },
    { id: 3, message: "Lab results available for Michael Chen", time: "1 hour ago", type: "results", read: false },
    { id: 4, message: "Patient feedback received", time: "2 hours ago", type: "feedback", read: false }
  ]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" title="Go to Home">
          <img src="/favicon.ico" alt="Wellness logo" className="h-8 w-8 rounded" />
          <span className="font-semibold text-slate-900">Wellness</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2 text-sm text-slate-600">
          <Link to="/community" className={(isActive("/community") ? "text-slate-900 font-medium " : "") + "hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition relative"}>
            Community
            {isActive("/community") && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded bg-violet-600" />}
          </Link>
          <Link to="/services" className={(isActive("/services") ? "text-slate-900 font-medium " : "") + "hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition relative"}>
            Services
            {isActive("/services") && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded bg-violet-600" />}
          </Link>
          <Link to="/professionals" className={(isActive("/professionals") ? "text-slate-900 font-medium " : "") + "hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition relative"}>
            Find Professionals
            {isActive("/professionals") && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded bg-violet-600" />}
          </Link>
          <Link to="/events" className={(isActive("/events") ? "text-slate-900 font-medium " : "") + "hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition relative"}>
            Events
            {isActive("/events") && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded bg-violet-600" />}
          </Link>
          <Link to="/blogs" className={(isActive("/blogs") ? "text-slate-900 font-medium " : "") + "hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition relative"}>
            Blogs
            {isActive("/blogs") && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded bg-violet-600" />}
          </Link>
          <Link to="/contact" className={(isActive("/contact") ? "text-slate-900 font-medium " : "") + "hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition relative"}>
            Contact
            {isActive("/contact") && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded bg-violet-600" />}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {/* Notification bell in header */}
          <div className="relative" ref={notifRef}>
            <button
              aria-label="Open notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border text-slate-700"
              onClick={() => setIsNotifOpen(v => !v)}
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white shadow-md p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <span className="text-sm font-medium text-slate-900">Notifications</span>
                  <button
                    className="text-xs text-violet-600 hover:text-violet-700"
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">No notifications</div>
                  )}
                  {notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b last:border-0 ${n.read ? 'bg-white' : 'bg-violet-50/50'}`}>
                      <div className="text-sm text-slate-800">{n.message}</div>
                      <div className="text-xs text-slate-500">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Login
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              aria-label="Open profile menu"
              className="h-9 w-9 rounded-full border border-slate-200 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              onClick={() => setOpen((v) => !v)}
            >
              <img src={avatarImg} alt="Profile" className="h-full w-full object-cover" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-md p-1">
                {/* On mobile, include main nav links here */}
                <div className="block md:hidden">
                  <Link to="/community" className={(isActive("/community") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Community</Link>
                  <Link to="/services" className={(isActive("/services") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Services</Link>
                  <Link to="/professionals" className={(isActive("/professionals") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Find Professionals</Link>
                  <Link to="/events" className={(isActive("/events") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Events</Link>
                  <Link to="/blogs" className={(isActive("/blogs") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Blogs</Link>
                  <Link to="/contact" className={(isActive("/contact") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Contact</Link>
                  <div className="my-1 h-px bg-slate-100" />
                </div>
                <a href="/profile" className="block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</a>
                <a href="/admin" className="block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin</a>
                <a href="/login" className="block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Logout</a>
              </div>
            )}
          </div>
          {/* Mobile sidebar hamburger intentionally removed per requirement */}
        </div>
      </div>
    </header>
  );
};

export default Header;


