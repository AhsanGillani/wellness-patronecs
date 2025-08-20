import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, Stethoscope } from "lucide-react";

const SignupSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Join Wellness Patronecs</h1>
            <p className="mt-4 text-lg text-slate-600">Choose how you'd like to use our platform</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Patient Option */}
            <Link to="/signup/patient" className="group">
              <div className="h-full rounded-2xl border bg-white p-8 transition-all duration-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 group-hover:bg-violet-200 transition-colors">
                    <User className="h-10 w-10 text-violet-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">I'm a Patient</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Find qualified wellness professionals, book appointments, and join our community to support your health journey.
                  </p>
                  <div className="space-y-3 text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400"></div>
                      Book appointments with professionals
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400"></div>
                      Access wellness resources and articles
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400"></div>
                      Join community discussions
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Professional Option */}
            <Link to="/signup/professional" className="group">
              <div className="h-full rounded-2xl border bg-white p-8 transition-all duration-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                    <Stethoscope className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">I'm a Professional</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Grow your practice, connect with patients, and showcase your expertise in the wellness community.
                  </p>
                  <div className="space-y-3 text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                      Manage your practice and appointments
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                      Build your professional profile
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                      Connect with wellness community
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-violet-600 hover:text-violet-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignupSelection;
