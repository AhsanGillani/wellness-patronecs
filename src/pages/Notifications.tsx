import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useMarketplace";
import Breadcrumbs from "@/components/site/Breadcrumbs";

const Notifications = () => {
  const { data: items = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs />
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
              {items.map((n) => (
                <div key={n.id} className="rounded-xl border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/notifications/${n.id}`} className="block flex-1">
                      <div className="text-sm font-medium text-slate-900 line-clamp-1">{n.title}</div>
                      {n.body && <div className="mt-1 text-sm text-slate-700 line-clamp-2">{n.body}</div>}
                    </Link>
                    <div className="flex items-center gap-2">
                      {n.link_url && (
                        <Button as="link" to={n.link_url} size="sm" variant="secondary">View related</Button>
                      )}
                      {!n.read_at && (
                        <Button size="sm" variant="secondary" onClick={() => markRead.mutate({ id: n.id })}>Mark read</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;


