import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sends a type=recovery token in the URL; when present, allow reset
    const hash = window.location.hash || ""; // for email link variants
    const search = window.location.search || ""; // for redirectTo variants
    const url = `${window.location.origin}${window.location.pathname}${search}${hash}`;
    // Exchange token to set session so updateUser can work
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setCanReset(true);
    });
    // For hash-based tokens, supabase-js auto-detects on load; ensure we trigger detection by calling getSession
    supabase.auth.getSession().then(() => {
      // After parsing, if we already have a user, enable reset
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setCanReset(true);
      });
    });
    // For safety, also try exchanging from URL directly
    supabase.auth.exchangeCodeForSession(window.location.href).catch(() => {});
  }, []);

  const canSubmit = !loading && canReset && password.length >= 6 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message || 'Failed to reset password.');
      } else {
        setSuccess('Password updated successfully. Redirecting to sign in...');
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err: unknown) {
      setError('An unexpected error occurred. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-white p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
              <p className="mt-2 text-slate-600">Enter a new password below.</p>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="mt-4 rounded-lg bg-emerald-50 border-l-4 border-emerald-400 p-4">
                <p className="text-sm text-emerald-800">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                    placeholder="Enter new password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3"
              >
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </form>

            {!canReset && (
              <p className="mt-4 text-xs text-slate-500 text-center">
                Waiting for verification token... If this page was not opened from your email link, request a new reset link.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;


