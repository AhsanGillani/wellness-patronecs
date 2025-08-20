import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email && password;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            {/* Form Side */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border bg-white p-8">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
                  <p className="mt-2 text-slate-600">Sign in to your account to continue</p>
                </div>

                <form className="mt-8 space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-violet-600 hover:text-violet-500">
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                     disabled={!canSubmit} 
                     className="w-full py-4 text-base font-semibold bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                     onClick={() => {
                       if (canSubmit) {
                         console.log('Signing in...', { email, password, rememberMe });
                         // Add your login logic here
                       }
                     }}
                   >
                     Sign in
                   </Button>

                  <div className="text-center">
                    <p className="text-sm text-slate-600">
                      Don't have an account?{" "}
                      <Link to="/signup" className="font-medium text-violet-600 hover:text-violet-500">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Image Side */}
            <div className="order-1 lg:order-2">
              <div className="relative rounded-2xl border bg-white p-8 h-full overflow-hidden">
                {/* 45-degree cut design */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 transform rotate-45 translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100 transform -rotate-45 -translate-x-12 translate-y-12"></div>
                
                <div className="relative text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-emerald-100">
                    <svg className="h-12 w-12 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Wellness Patronecs</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Connect with wellness professionals and start your health journey today.
                  </p>
                  
                  {/* Patient and Doctor Image */}
                  <div className="relative mt-8 overflow-hidden rounded-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                      alt="Patient and doctor consultation"
                      className="w-full h-64 object-cover"
                    />
                    {/* Overlay with 45-degree accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/20 transform rotate-45 translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500/20 transform -rotate-45 -translate-x-8 translate-y-8"></div>
                  </div>
                  
                  <div className="mt-6 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-violet-400"></div>
                      Access your wellness dashboard
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      Manage your appointments
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-violet-400"></div>
                      Connect with professionals
                    </div>
                  </div>
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

export default Login;
