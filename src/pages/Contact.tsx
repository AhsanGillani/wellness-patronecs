import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useState } from "react";
import heroImg from "@/assets/hero-wellness.jpg";
import Breadcrumbs from "@/components/site/Breadcrumbs";

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
          <Breadcrumbs />
          {/* Hero */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                    <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                      Contact us
                    </span>
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>

                <div className="rounded-2xl border bg-white p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-violet-50 transition-colors duration-300 group/item">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                        <span className="text-violet-600 text-lg">📧</span>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Email</div>
                        <a href="mailto:support@wellness.example" className="text-slate-900 hover:text-violet-600 transition-colors duration-300 font-medium">support@wellness.example</a>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-300 group/item">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                        <span className="text-blue-600 text-lg">📞</span>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Phone</div>
                        <a href="tel:+10000000000" className="text-slate-900 hover:text-blue-600 transition-colors duration-300 font-medium">+1 (000) 000-0000</a>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-violet-50 transition-colors duration-300 group/item">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                        <span className="text-violet-600 text-lg">📍</span>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Address</div>
                        <div className="text-slate-900 font-medium">123 Wellness St, Suite 200, Healthy City</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Image */}
                <div className="relative overflow-hidden rounded-2xl border bg-white group">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img 
                      src={heroImg} 
                      alt="Wellness care and consultations" 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                    ✨ Get in Touch
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-6 right-6 w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-6 right-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border bg-white p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-xl">💬</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Send a message</h2>
                    <p className="text-slate-600 text-sm">We're here to help and answer any questions</p>
                  </div>
                </div>
                
                {sent ? (
                  <div className="mb-6 rounded-lg bg-violet-50 p-4 text-sm text-violet-800 border border-violet-200 flex items-center space-x-2">
                    <span className="text-violet-600 text-lg">✅</span>
                    <span>Thanks! Your message has been sent. We'll get back to you soon.</span>
                  </div>
                ) : null}
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-1 group">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Name</label>
                    <input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-300 group-hover:border-violet-200" 
                      placeholder="Your full name" 
                    />
                  </div>
                  <div className="sm:col-span-1 group">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Email</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-300 group-hover:border-violet-200" 
                      placeholder="you@example.com" 
                    />
                  </div>
                  <div className="sm:col-span-2 group">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Subject</label>
                    <input 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)} 
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-300 group-hover:border-violet-200" 
                      placeholder="How can we help?" 
                    />
                  </div>
                  <div className="sm:col-span-2 group">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Message</label>
                    <textarea 
                      rows={6} 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-300 group-hover:border-violet-200 resize-y" 
                      placeholder="Write your message..." 
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <Button 
                    variant="secondary" 
                    className="rounded-full px-6 py-2 hover:text-violet-700 transition-colors duration-300"
                    onClick={() => {
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    disabled={!canSubmit} 
                    onClick={() => setSent(true)}
                    className="rounded-full px-6 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Send message
                  </Button>
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


