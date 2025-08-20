import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const canSubmit = name && email && message;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Contact us</h1>
              <p className="mt-2 text-slate-600">We'd love to hear from you. Send us a message and we’ll respond as soon as possible.</p>

              <div className="mt-6 rounded-2xl border bg-white p-6">
                <div className="space-y-4 text-sm text-slate-700">
                  <div>
                    <div className="text-slate-500">Email</div>
                    <a href="mailto:support@wellness.example" className="text-slate-900 hover:underline">support@wellness.example</a>
                  </div>
                  <div>
                    <div className="text-slate-500">Phone</div>
                    <a href="tel:+10000000000" className="text-slate-900 hover:underline">+1 (000) 000-0000</a>
                  </div>
                  <div>
                    <div className="text-slate-500">Address</div>
                    <div className="text-slate-900">123 Wellness St, Suite 200, Healthy City</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border bg-white">
                <div className="h-44 bg-[radial-gradient(60%_60%_at_20%_10%,rgba(124,58,237,0.12),rgba(255,255,255,0))]" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Send a message</h2>
                {sent ? (
                  <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 border border-green-200">
                    Thanks! Your message has been sent. We’ll get back to you soon.
                  </div>
                ) : null}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium text-slate-700">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="Your full name" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="you@example.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Subject</label>
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="How can we help?" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Message</label>
                    <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="Write your message..." />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary">Cancel</Button>
                  <Button disabled={!canSubmit} onClick={() => setSent(true)}>Send message</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;


