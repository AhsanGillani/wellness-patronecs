import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useNotification, useMarkNotificationRead } from "@/hooks/useMarketplace";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";

const NotificationDetail = () => {
  const { id } = useParams();
  const { effectiveRole } = useAuth();
  const { data: n, isLoading } = useNotification(id);
  const markRead = useMarkNotificationRead();

  // Auto-mark as read on open (once)
  const triedMarkRef = useRef(false);
  useEffect(() => {
    if (!n || n.read_at) return;
    if (triedMarkRef.current) return;
    triedMarkRef.current = true;
    markRead.mutate({ id: n.id });
  }, [n?.id, n?.read_at, markRead]);

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
              {n.body ? (
                <p className="mt-2 text-slate-700">{n.body}</p>
              ) : (() => {
                try {
                  const d: any = n.data || {};
                  let msg: string | null = null;
                  switch (d.type) {
                    case 'refund_request':
                      msg = `Refund requested for appointment #${d.appointmentId ?? ''}. The doctor will review it.`;
                      break;
                    case 'refund_response':
                      msg = d.status === 'approved' ? 'Your refund request has been approved.' : 'Your refund request was rejected.';
                      break;
                    case 'no_show':
                      msg = 'Appointment was marked as missed.';
                      break;
                    case 'appointment_booked':
                      msg = `${d.patientName ?? 'A patient'} booked ${d.serviceName ?? 'a service'} on ${d.appointmentDate ?? ''}.`;
                      break;
                    case 'appointment_status_changed':
                      msg = `Your appointment with ${d.professionalName ?? 'the professional'} for ${d.serviceName ?? 'the service'} was ${d.status ?? 'updated'}.`;
                      break;
                    case 'reschedule_requested':
                      msg = `${d.patientName ?? 'Patient'} requested to reschedule ${d.serviceName ?? 'the service'} from ${d.oldDate ?? ''} to ${d.newDate ?? ''}.`;
                      break;
                    case 'reschedule_response':
                      msg = d.status === 'approved' ? `Reschedule approved. New date: ${d.newDate ?? ''}.` : 'Reschedule request rejected.';
                      break;
                    case 'system_notification':
                      msg = n.title;
                      break;
                    default:
                      msg = null;
                  }
                  return msg ? <p className="mt-2 text-slate-700">{msg}</p> : null;
                } catch { return null; }
              })()}
              {/* Hidden raw data to avoid showing code */}
              <div className="mt-4 flex gap-2">
                {!n.read_at && <Button size="sm" variant="secondary" onClick={() => markRead.mutate({ id: n.id })}>Mark as read</Button>}
                {(() => {
                  const link = n.link_url || '';
                  const resolved = link === '/appointments' 
                    ? (effectiveRole === 'professional' ? '/doctor-dashboard?tab=appointments&sub=completed' : '/profile?section=bookings&filter=no_show')
                    : link === '/bookings' ? '/profile?section=bookings' : link;
                  return resolved ? <Button as="link" to={resolved} size="sm">View</Button> : null;
                })()}
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


