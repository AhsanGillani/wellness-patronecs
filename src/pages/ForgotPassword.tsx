import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const remembered = localStorage.getItem('remembered_email');
      if (remembered) setEmail(remembered);
    } catch {}
  }, []);

  const canSubmit = !!email && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) {
        setError(error.message || 'Failed to send reset email.');
      } else {
        setSuccess('Reset email sent. Please check your inbox.');
      }
    } catch (err: any) {
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
              <h1 className="text-2xl font-bold text-slate-900">Forgot your password?</h1>
              <p className="mt-2 text-slate-600">Enter your email to receive a reset link.</p>
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

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-3"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Remembered your password? {""}
                  <Link to="/login" className="font-medium text-violet-600 hover:text-violet-500">Back to sign in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;


