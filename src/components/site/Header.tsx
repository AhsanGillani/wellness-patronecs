import { useEffect, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useMarketplace";
import avatarImg from "@/assets/avatar-1.jpg";

const Header = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [activeNotifId, setActiveNotifId] = useState<string | null>(null);

  const { user, profile, signOut, loading } = useAuth();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();
  const navigate = useNavigate();

  const allRead = notifications.every(n => n.read_at);

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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/');
    }
    setOpen(false);
  };

  const handleProfileClick = () => {
    if (!user || !profile) return;
    
    // Role-based routing
    if (profile.role === 'doctor' || profile.role === 'professional') {
      navigate('/doctor-dashboard');
    } else if (profile.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
    setOpen(false);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" title="Go to Home">
          <img src="/favicon.ico" alt="Wellness logo" className="h-8 w-8 rounded" />
          <span className="font-semibold text-slate-900">Wellness</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2 text-sm text-slate-600">
          <Link to="/" className={(isActive("/") ? "text-slate-900 font-medium " : "") + "hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-50 transition relative"}>
            Home
            {isActive("/") && <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded bg-violet-600" />}
          </Link>
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
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                aria-label="Open notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border text-slate-700"
                onClick={() => setIsNotifOpen(v => !v)}
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read_at) && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />}
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white shadow-md p-0 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="text-sm font-medium text-slate-900">{activeNotifId === null ? 'Notifications' : 'Notification'}</span>
                    <div className="flex items-center gap-2">
                      {activeNotifId === null ? (
                        <span className="text-xs text-slate-400">
                          {allRead ? 'All read' : `${notifications.filter(n => !n.read_at).length} unread`}
                        </span>
                      ) : (
                        <button
                          className="text-xs text-slate-600 hover:text-slate-800"
                          onClick={() => setActiveNotifId(null)}
                        >
                          Back
                    </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notificationsLoading ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <Bell className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="text-sm font-medium text-slate-900 mb-1">No updates for now</div>
                        <div className="text-xs text-slate-500 mb-3">You're all caught up!</div>
                        <Link
                          to="/notifications"
                          className="inline-block text-sm text-violet-600 hover:text-violet-700 font-medium"
                          onClick={() => setIsNotifOpen(false)}
                        >
                          View notifications page
                        </Link>
                      </div>
                    ) : activeNotifId === null ? (
                      <>
                        {notifications.map(n => (
                        <div
                          key={n.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setActiveNotifId(n.id);
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { setActiveNotifId(n.id); }}}
                            className={`px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-slate-50 ${n.read_at ? 'bg-white' : 'bg-violet-50/50'}`}
                          >
                            <div className="text-sm text-slate-800">{n.title}</div>
                            {n.body && <div className="text-xs text-slate-600 mt-1 line-clamp-2">{n.body}</div>}
                            <div className="text-xs text-slate-500 mt-1">{formatTimeAgo(n.created_at)}</div>
                          </div>
                        ))}
                        {notifications.length > 0 && (
                          <div className="px-4 py-3 border-t bg-slate-50">
                            <Link
                              to="/notifications"
                              className="block text-center text-sm text-violet-600 hover:text-violet-700 font-medium"
                              onClick={() => setIsNotifOpen(false)}
                            >
                              View all notifications
                            </Link>
                      </div>
                        )}
                      </>
                    ) : (
                      (() => {
                        const n = notifications.find(x => x.id === activeNotifId);
                        if (!n) return null;
                        return (
                          <div className="px-4 py-4">
                            <div className="text-sm font-medium text-slate-900">{n.title}</div>
                            {n.body && <div className="mt-2 text-sm text-slate-700">{n.body}</div>}
                            <div className="mt-2 text-xs text-slate-500">{formatTimeAgo(n.created_at)}</div>
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                                onClick={() => setActiveNotifId(null)}
                              >
                                Back
                              </button>
                              {n.link_url && (
                                <Link
                                  to={n.link_url}
                                  className="rounded-full bg-violet-600 px-3 py-1 text-xs text-white hover:bg-violet-700"
                                  onClick={() => setIsNotifOpen(false)}
                                >
                                  View
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!user && !loading ? (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
                Login
              </Link>
              <Button as="link" to="/signup" size="sm">
                Get Started
              </Button>
            </div>
          ) : loading || !profile ? (
            <div className="flex items-center gap-4">
              {/* Search skeleton */}
              <div className="hidden md:block">
                <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              {/* Profile skeleton */}
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                aria-label="Open profile menu"
                className="h-9 w-9 rounded-full border border-slate-200 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 flex items-center justify-center bg-violet-100 text-violet-700 font-medium text-sm"
                onClick={() => setOpen((v) => !v)}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span>{getInitials(profile?.first_name, profile?.last_name)}</span>
                )}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-md p-1">
                  {/* On mobile, include main nav links here */}
                  <div className="block md:hidden">
                    <Link to="/" className={(isActive("/") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Home</Link>
                    <Link to="/community" className={(isActive("/community") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Community</Link>
                    <Link to="/services" className={(isActive("/services") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Services</Link>
                    <Link to="/professionals" className={(isActive("/professionals") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Find Professionals</Link>
                    <Link to="/events" className={(isActive("/events") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Events</Link>
                    <Link to="/blogs" className={(isActive("/blogs") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Blogs</Link>
                    <Link to="/contact" className={(isActive("/contact") ? "font-medium " : "") + "block rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"}>Contact</Link>
                    <div className="my-1 h-px bg-slate-100" />
                  </div>
                  
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <div className="text-sm font-medium text-slate-900">
                      {profile?.first_name} {profile?.last_name}
                    </div>
                    <div className="text-xs text-slate-500 capitalize">
                      {profile?.role || 'Patient'}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleProfileClick}
                    className="block w-full text-left rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {profile?.role === 'doctor' || profile?.role === 'professional' ? 'Dashboard' : 
                     profile?.role === 'admin' ? 'Admin Panel' : 'Profile'}
                  </button>
                  
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left rounded-sm px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Mobile sidebar hamburger intentionally removed per requirement */}
        </div>
      </div>
    </header>
  );
};

export default Header;


