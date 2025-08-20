import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'patient' | 'professional' | 'doctor'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else {
            setError(error.message);
          }
        } else {
          // Will be handled by useEffect redirect
        }
      } else {
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          role: role
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Account created successfully! Please check your email for a confirmation link.');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFirstName('');
          setLastName('');
          setRole('patient');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-violet-600" />
            <span className="text-2xl font-bold text-slate-900">Wellness</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Join our wellness community today'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required={!isLogin}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required={!isLogin}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                    I am a
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'patient' | 'professional' | 'doctor')}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="patient">Patient</option>
                    <option value="professional">Healthcare Professional</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required={!isLogin}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-sm text-violet-600 hover:text-violet-500"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;