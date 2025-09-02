import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-white p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Terms of Service</h1>
            <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-slate max-w-none">
              <h2>1. Introduction</h2>
              <p>
                Welcome to Wellness Patronecs. By accessing or using our services, you agree to be bound by these Terms.
              </p>

              <h2>2. Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
              </p>

              <h2>3. Use of Services</h2>
              <p>
                You agree not to misuse the services or assist anyone in doing so. Prohibited activities include violating applicable laws, infringing others’ rights, or interfering with the services.
              </p>

              <h2>4. Content</h2>
              <p>
                You retain ownership of content you submit, but grant us a license to host and display it to operate the services.
              </p>

              <h2>5. Disclaimers</h2>
              <p>
                Our services are provided “as is” without warranties of any kind. We do not provide medical advice; consult qualified professionals for health decisions.
              </p>

              <h2>6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Wellness Patronecs shall not be liable for any indirect or consequential damages.
              </p>

              <h2>7. Changes</h2>
              <p>
                We may update these Terms from time to time. Continued use constitutes acceptance of the updated Terms.
              </p>

              <h2>8. Contact</h2>
              <p>
                Questions about these Terms? Contact us via the <Link to="/contact">Contact</Link> page.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;


