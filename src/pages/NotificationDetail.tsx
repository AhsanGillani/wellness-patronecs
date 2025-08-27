import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useNotification, useMarkNotificationRead } from "@/hooks/useMarketplace";
import Breadcrumbs from "@/components/site/Breadcrumbs";

const NotificationDetail = () => {
  const { id } = useParams();
  const { data: n, isLoading } = useNotification(id);
  const markRead = useMarkNotificationRead();

  // Auto-mark as read on open
  if (n && !n.read_at) {
    markRead.mutate({ id: n.id });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs />
          {isLoading ? (
            <div className="text-sm text-slate-600">Loading...</div>
          ) : !n ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">Notification not found</div>
          ) : (
            <div className="rounded-2xl border bg-white p-6">
              <h1 className="text-xl font-semibold text-slate-900">{n.title}</h1>
              {n.body && <p className="mt-2 text-slate-700">{n.body}</p>}
              {n.data && (
                <pre className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-slate-700 overflow-auto">{JSON.stringify(n.data, null, 2)}</pre>
              )}
              <div className="mt-4 flex gap-2">
                {!n.read_at && <Button size="sm" variant="secondary" onClick={() => markRead.mutate({ id: n.id })}>Mark as read</Button>}
                {n.link_url && <Button as="link" to={n.link_url} size="sm">Open link</Button>}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotificationDetail;


