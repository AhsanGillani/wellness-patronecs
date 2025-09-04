import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useMarketplace";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";



const Notifications = () => {
  const { data: items = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const { profile, effectiveRole } = useAuth();



  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {profile && (
              <div className="text-sm text-slate-600">
                Showing notifications for: <span className="font-medium capitalize">{effectiveRole}</span>
                {profile.first_name && (
                  <span> - {profile.first_name} {profile.last_name}</span>
                )}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>

          {isLoading ? (
            <div className="mt-6 text-sm text-slate-600">Loading...</div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No updates for now</h3>
              <p className="text-slate-600">You're all caught up! We'll notify you when there are new updates.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((n) => {
                const mapLink = (raw?: string | null) => {
                  const link = raw || "";
                  if (link === "/appointments") {
                    return effectiveRole === 'professional' 
                      ? "/doctor-dashboard?tab=appointments&sub=completed"
                      : "/profile?section=bookings&filter=no_show";
                  }
                  if (link === "/bookings") {
                    return "/profile?section=bookings";
                  }
                  return link;
                };
                const resolvedLink = mapLink(n.link_url);
                return (
                <div key={n.id} className={`rounded-xl border bg-white p-4 ${!n.read_at ? 'border-blue-200 bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/notifications/${n.id}`} className="block flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-slate-900 line-clamp-1">{n.title}</div>
                        {!n.read_at && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                      {n.body && <div className="mt-1 text-sm text-slate-700 line-clamp-2">{n.body}</div>}
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                        {n.recipient_role && (
                          <span className="capitalize">Role: {n.recipient_role}</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {resolvedLink && (
                        <Button as="link" to={resolvedLink} size="sm" variant="secondary">View</Button>
                      )}
                      {!n.read_at && (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => markRead.mutate({ id: n.id })}
                          disabled={markRead.isPending}
                        >
                          {markRead.isPending ? 'Marking...' : 'Mark read'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;




