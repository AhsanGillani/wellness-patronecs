import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { professionals } from "@/lib/mockData";
import { useParams } from "react-router-dom";

const imageFor = (query: string) => `https://source.unsplash.com/960x540/?${encodeURIComponent(query)}`;

const ServiceDetail = () => {
  const params = useParams();
  const providerId = Number(params.providerId);
  const serviceId = Number(params.serviceId);

  const prof = professionals.find((p) => p.id === providerId);
  const svc = prof?.services?.find((s) => s.id === serviceId);

  if (!prof || !svc) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-2xl font-bold text-slate-900">Service not found</h1>
            <p className="mt-2 text-slate-600">The service you are looking for does not exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{svc.name}</h1>
            <div className="mt-2 text-slate-600">{svc.duration} • By {prof.name} ({prof.title})</div>
            <p className="mt-4 text-slate-700">{svc.description}</p>
            <div className="mt-5 flex items-center gap-3">
              <Button as="link" to={`/book/${prof.id}`}>Book now</Button>
              <Button variant="secondary">Contact provider</Button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-slate-100">
              <img src={imageFor(`${svc.name} ${prof.title}`)} alt={svc.name} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-12">
          <section className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">What to expect</h2>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li>• Personalized assessment and clear next steps</li>
                <li>• Evidence-based guidance tailored to your needs</li>
                <li>• Time for Q&A and practical tips</li>
              </ul>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Included</h2>
              <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                <li>• Appointment summary</li>
                <li>• Follow-up recommendations</li>
                <li>• Resources and handouts</li>
                <li>• Optional telehealth</li>
              </ul>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border bg-white p-6">
              <div className="text-sm text-slate-600">Price</div>
              <div className="text-2xl font-semibold text-slate-900">{svc.price}</div>
              <div className="mt-4 flex gap-2">
                <Button as="link" to={`/book/${prof.id}`} className="flex-1">Book</Button>
                <Button variant="secondary" className="flex-1">Ask a question</Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">About the provider</h3>
              <div className="mt-2 text-sm text-slate-700">{prof.about || prof.bio}</div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;


