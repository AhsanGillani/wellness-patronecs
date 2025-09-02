import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-white p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-slate max-w-none">
              <h2>1. Overview</h2>
              <p>
                This Privacy Policy explains how Wellness Patronecs collects, uses, and protects your information.
              </p>

              <h2>2. Information We Collect</h2>
              <p>
                We may collect account information, usage data, and communications you provide. Some information may be collected automatically through cookies and similar technologies.
              </p>

              <h2>3. How We Use Information</h2>
              <ul>
                <li>To provide and improve our services</li>
                <li>To communicate with you about your account and updates</li>
                <li>To maintain security and prevent misuse</li>
              </ul>

              <h2>4. Sharing</h2>
              <p>
                We do not sell your personal information. We may share data with service providers under contractual obligations to process it on our behalf.
              </p>

              <h2>5. Data Security</h2>
              <p>
                We implement reasonable security measures to protect your data; however, no method of transmission is 100% secure.
              </p>

              <h2>6. Your Choices</h2>
              <p>
                You may access or update your information in your profile. For deletion requests, contact us via the <Link to="/contact">Contact</Link> page.
              </p>

              <h2>7. Changes</h2>
              <p>
                We may update this Policy from time to time. Continued use indicates acceptance of changes.
              </p>

              <h2>8. Contact</h2>
              <p>
                Questions about this Policy? Reach out via the <Link to="/contact">Contact</Link> page.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;


