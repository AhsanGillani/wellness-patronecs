import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, MapPin, Calendar, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PatientSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    healthGoals: "",
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const canSubmit = formData.firstName && formData.lastName && formData.email && 
                formData.password && formData.confirmPassword && formData.agreeToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // First, create the user account
      const { data: signUpData, error: signUpError } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: 'patient'
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(signUpError.message || 'An error occurred during signup.');
        }
        setLoading(false);
        return;
      }

      // Wait a moment for the database trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the current user - try multiple approaches
      let user = null;
      
      // Try to get user from signup response first
      if (signUpData?.user) {
        user = signUpData.user;
      } else {
        // Fallback to getCurrentUser
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        user = currentUser;
      }

      if (!user) {
        setError('Account created but unable to create profile. Please try logging in.');
        setLoading(false);
        return;
      }
      
      if (user) {
        // First check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        let profileId = existingProfile?.id;
        
        // If profile doesn't exist (either no data or error), create it manually
        if (!existingProfile) {
          try {
            const { data: newProfile, error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName,
                slug: `${formData.firstName.toLowerCase()}-${formData.lastName.toLowerCase()}-${Date.now()}`,
                role: 'patient',
                phone: formData.phone || null,
                date_of_birth: formData.dateOfBirth || null,
                location: formData.address && formData.city && formData.state && formData.zipCode 
                  ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim()
                  : null,
                health_goals: formData.healthGoals || null
              })
              .select()
              .single();
            
            if (createProfileError) {
              // Try a simpler insert without the complex fields
              const { data: simpleProfile, error: simpleError } = await supabase
                .from('profiles')
                .insert({
                  user_id: user.id,
                  email: formData.email,
                  first_name: formData.firstName,
                  last_name: formData.lastName,
                  slug: `${formData.firstName.toLowerCase()}-${formData.lastName.toLowerCase()}-${Date.now()}`,
                  role: 'patient'
                })
                .select()
                .single();
             
              if (simpleError) {
                // Don't fail the signup if simple profile creation fails
              } else {
                profileId = simpleProfile.id;
              }
            } else {
              profileId = newProfile.id;
            }
          } catch (insertError) {
            // Don't fail the signup if profile creation fails
          }
        } else if (existingProfile) {
          try {
            // Update the existing profile with additional information
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                phone: formData.phone || null,
                date_of_birth: formData.dateOfBirth || null,
                location: formData.address && formData.city && formData.state && formData.zipCode 
                  ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim()
                  : null,
                health_goals: formData.healthGoals || null,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (profileError) {
              // Don't fail the signup if profile update fails
            }
          } catch (updateError) {
            // Don't fail the signup if profile update fails
          }
        }
      }

      setSuccess('Account created successfully! Please check your email to confirm your account.');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: unknown) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            {/* Form Side */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border bg-white p-8">
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create Patient Account</h1>
                  <p className="mt-2 text-slate-600">Join our wellness community and start your health journey</p>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-lg bg-green-50 border-l-4 border-green-400 p-4">
                    <p className="text-sm text-green-800">{success}</p>
                    <p className="text-sm text-green-700 mt-1">You will be redirected to the login page in a few seconds...</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <User className="inline h-4 w-4 mr-2" />
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <User className="inline h-4 w-4 mr-2" />
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Lock className="inline h-4 w-4 mr-2" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                          placeholder="Create a password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Lock className="inline h-4 w-4 mr-2" />
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                          placeholder="Confirm password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        placeholder="ZIP"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Health Goals
                    </label>
                    <textarea
                      name="healthGoals"
                      value={formData.healthGoals}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="Tell us about your health goals and what you're looking for..."
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 mt-1"
                      required
                    />
                    <label className="ml-2 block text-sm text-slate-700">
                      I agree to the{" "}
                      <Link to="/terms" className="text-violet-600 hover:text-violet-500">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-violet-600 hover:text-violet-500">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button 
                    type="submit"
                    disabled={!canSubmit || loading} 
                    className="w-full py-4 text-base font-semibold bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-violet-600 hover:text-violet-500">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl border bg-white p-8 h-full">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-violet-100">
                    <User className="h-12 w-12 text-violet-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Your Wellness Journey</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Join thousands of patients who have found their path to better health through our platform.
                  </p>
                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-violet-400"></div>
                      Connect with qualified wellness professionals
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-violet-400"></div>
                      Book appointments that fit your schedule
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-violet-400"></div>
                      Access personalized health resources
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-violet-400"></div>
                      Join a supportive wellness community
                    </div>
                  </div>
                  
                  {/* Patient Wellness Image */}
                  <div className="mt-8 overflow-hidden rounded-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                      alt="Patient wellness consultation"
                      className="w-full h-48 object-cover"
                    />
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

export default PatientSignup;
