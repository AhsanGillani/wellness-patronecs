import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, Mail, Lock, Phone, MapPin, Calendar, Award, Building, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ProfessionalSignup = () => {
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
    profession: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    education: "",
    certifications: "",
    practiceName: "",
    practiceAddress: "",
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
                   formData.password && formData.confirmPassword && formData.profession && formData.agreeToTerms;

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
        role: 'professional'
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
                role: 'professional',
                phone: formData.phone || null,
                date_of_birth: formData.dateOfBirth || null,
                location: formData.address && formData.city && formData.state && formData.zipCode 
                  ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim()
                  : null,
                specialization: formData.specialization || null,
                years_experience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
                practice_name: formData.practiceName || null,
                practice_address: formData.practiceAddress || null,
                license_number: formData.licenseNumber || null,
                education_certifications: formData.education || null
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
                  role: 'professional'
                })
                .select()
                .single();
             
              if (simpleError) {
                setError('Profile creation failed. Please contact support.');
                setLoading(false);
                return;
              } else {
                profileId = simpleProfile.id;
              }
            } else {
              profileId = newProfile.id;
            }
          } catch (insertError) {
            setError('Profile creation failed. Please contact support.');
            setLoading(false);
            return;
          }
        } else if (existingProfile) {
          try {
            // Update the existing profile with additional professional information
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                phone: formData.phone || null,
                date_of_birth: formData.dateOfBirth || null,
                location: formData.address && formData.city && formData.state && formData.zipCode 
                  ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim()
                  : null,
                specialization: formData.specialization || null,
                years_experience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
                practice_name: formData.practiceName || null,
                practice_address: formData.practiceAddress || null,
                license_number: formData.licenseNumber || null,
                education_certifications: formData.education || null,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (profileError) {
              // Don't fail the signup if profile update fails, but log it
            }
          } catch (updateError) {
            // Don't fail the signup if profile update fails
          }
        }

      }

      toast({
        title: "Professional Account Created!",
        description: "Please check your email and verify your account. Wellness will review your profile and add a verified tag within 24-48 hours.",
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

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
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create Professional Account</h1>
                  <p className="mt-2 text-slate-600">Join our platform and grow your wellness practice</p>
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
                        <Stethoscope className="inline h-4 w-4 mr-2" />
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
                        <Stethoscope className="inline h-4 w-4 mr-2" />
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Award className="inline h-4 w-4 mr-2" />
                        Profession
                      </label>
                      <select
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        required
                      >
                        <option value="">Select profession</option>
                        <option value="therapist">Therapist</option>
                        <option value="nutritionist">Nutritionist</option>
                        <option value="personal-trainer">Personal Trainer</option>
                        <option value="yoga-instructor">Yoga Instructor</option>
                        <option value="massage-therapist">Massage Therapist</option>
                        <option value="chiropractor">Chiropractor</option>
                        <option value="acupuncturist">Acupuncturist</option>
                        <option value="life-coach">Life Coach</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Award className="inline h-4 w-4 mr-2" />
                        Years of Experience
                      </label>
                      <select
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      >
                        <option value="">Select experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="e.g., Anxiety, Sports Nutrition, Power Yoga"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      License Number (if applicable)
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="Enter license number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Building className="inline h-4 w-4 mr-2" />
                      Practice Name
                    </label>
                    <input
                      type="text"
                      name="practiceName"
                      value={formData.practiceName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="Enter practice name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <MapPin className="inline h-4 w-4 mr-2" />
                      Practice Address
                    </label>
                    <input
                      type="text"
                      name="practiceAddress"
                      value={formData.practiceAddress}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="Enter practice address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Education & Certifications
                    </label>
                    <textarea
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      placeholder="List your degrees, certifications, and relevant training..."
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
                    className="w-full py-4 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                  >
                    {loading ? 'Creating Account...' : 'Create Professional Account'}
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
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                    <Stethoscope className="h-12 w-12 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Grow Your Wellness Practice</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Join our platform and connect with patients who are looking for your expertise and services.
                  </p>
                  <div className="space-y-4 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      Manage appointments and patient relationships
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      Build your professional profile and reputation
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      Access wellness community and resources
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      Grow your practice with our platform
                    </div>
                  </div>
                  
                  {/* Professional Doctor Image */}
                  <div className="mt-8 overflow-hidden rounded-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                      alt="Professional doctor consultation"
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

export default ProfessionalSignup;
