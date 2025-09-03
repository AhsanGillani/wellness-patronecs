import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      <main className="py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sorry, you don’t have any appointments. Please book one first.</h1>
          <p className="mt-3 text-slate-600">If you believe this is a mistake, return to Services and book an appointment.</p>
          <div className="mt-6">
            <a href="/services" className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">Browse services</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;


