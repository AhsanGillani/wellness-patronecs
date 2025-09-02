/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CACHE_KEY = 'cached_professionals_v1';
  const CACHE_TTL_MS = 5 * 60 * 1000;
  const readCached = (): any[] | null => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (Date.now() - (parsed.ts || 0) > CACHE_TTL_MS) return null;
      return Array.isArray(parsed.data) ? parsed.data : null;
    } catch {
      return null;
    }
  };
  const writeCached = (data: any[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
      // ignore cache write errors
    }
  };

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = readCached();
        if (cached && cached.length > 0) {
          setProfessionals(cached);
        }
        
        // Build a lighter query with limit to avoid timeouts
        const professionalsAbort = new AbortController();
        const professionalsPromise = supabase
          .from('professionals')
          .select(`
            id,
            profile_id,
            profession,
            specialization,
            years_experience,
            price_per_session,
            verification,
            slug
          `)
          .range(0, 19)
          .abortSignal(professionalsAbort.signal);

        // Timeout guard
        let timerId: ReturnType<typeof setTimeout> | null = null;
        const timeoutPromise: Promise<never> = new Promise((_, reject) => {
          timerId = setTimeout(() => {
            professionalsAbort.abort();
            reject(new Error('Request timed out. Please try again.'));
          }, 12000);
        });

        const raceResult = await Promise.race([
          professionalsPromise,
          timeoutPromise,
        ]);
        clearTimeout(timerId);
        const professionalsData: any[] | null = (raceResult as any)?.data || null;
        const professionalsError: any = (raceResult as any)?.error || null;

        if (professionalsError) {
          console.error('Professionals fetch error:', professionalsError);
          try {
            console.error('Professionals fetch error details:', {
              code: (professionalsError as any)?.code,
              message: (professionalsError as any)?.message,
              details: (professionalsError as any)?.details,
              hint: (professionalsError as any)?.hint,
            });
          } catch (logErr) {
            // ignore log error
          }
          throw professionalsError;
        }

        // Then, fetch ratings only for returned professionals (short timeout, non-blocking on failure)
        let ratingsData: { professional_id: string; rating: number; reviews: number }[] | null = null;
        try {
          const ids = ((professionalsData as Array<{ id: string }> ) || []).map((p) => p.id).filter(Boolean);
          if (ids.length > 0) {
            const ratingsAbort = new AbortController();
            const ratingsTimeout = setTimeout(() => { ratingsAbort.abort(); }, 6000);
            const { data: rd, error: ratingsError } = await supabase
              .from('professional_ratings')
              .select('professional_id, rating, reviews')
              .in('professional_id', ids)
              .abortSignal(ratingsAbort.signal);
            clearTimeout(ratingsTimeout);
            if (ratingsError) {
              console.error('Ratings fetch error:', ratingsError);
            } else {
              ratingsData = rd || null;
            }
          }
        } catch (ratingsErr) {
          console.warn('Ratings fetch skipped due to timeout or error');
        }

        // Fetch minimal profiles for returned professionals (6s abort)
        const profilesMap: Map<string, { first_name?: string; last_name?: string; avatar_url?: string }> = new Map();
        try {
          const profileIds = ((professionalsData as Array<{ profile_id: string }>) || [])
            .map(p => p.profile_id)
            .filter(Boolean);
          if (profileIds.length > 0) {
            const profAbort = new AbortController();
            const profTimeout = setTimeout(() => { profAbort.abort(); }, 6000);
            const { data: profRows } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .in('id', profileIds)
              .abortSignal(profAbort.signal);
            clearTimeout(profTimeout);
            (profRows || []).forEach((row: any) => {
              profilesMap.set(row.id, { first_name: row.first_name, last_name: row.last_name, avatar_url: row.avatar_url });
            });
          }
        } catch (e) {
          // ignore profile hydration errors
        }

        // Create a map of professional_id to ratings
        const ratingsMap = new Map();
        ratingsData?.forEach((rating) => {
          ratingsMap.set(rating.professional_id, {
            rating: rating.rating,
            reviews: rating.reviews
          });
        });

        // Transform data to match expected format
        const transformedData = (professionalsData || []).map((prof: any) => {
          const profRatings = ratingsMap.get(prof.id);
          
          // Get profile data from fetched profiles map
          const profileData = profilesMap.get(prof.profile_id) || null;
          const firstName = profileData?.first_name || '';
          const lastName = profileData?.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Professional';
          const displayName = fullName !== 'Professional' ? `Dr. ${fullName}` : 'Professional';
          
          return {
            id: prof.id,
            name: displayName,
            title: prof.profession || prof.specialization,
            years: prof.years_experience || 0,
            rating: profRatings?.rating || 4.5, // Use real rating or fallback
            reviews: profRatings?.reviews || 0, // Use real review count or fallback
            price: prof.price_per_session ? `$${(prof.price_per_session / 100).toFixed(0)} / session` : '$50 / session',
            image: profileData?.avatar_url || '/placeholder-avatar.jpg',
            avatar_url: profileData?.avatar_url || null,
            tags: prof.specialization ? prof.specialization.split(', ') : [],
            bio: prof.bio,
            about: prof.bio,
            location: prof.location,
            slug: prof.slug,
            profession: prof.profession,
            specialization: prof.specialization,
            years_experience: prof.years_experience,
            price_per_session: prof.price_per_session,
            verification: prof.verification,
            // Add the raw profiles data for debugging
            profiles: profileData
          };
        }) || [];

        setProfessionals(transformedData);
        writeCached(transformedData);
      } catch (err: any) {
        console.error('Error in useProfessionals:', err);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load professionals';
        
        if (err?.name === 'AbortError' || /aborted/i.test(String(err?.message || ''))) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message === 'Failed to fetch') {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else if (err.message?.includes('fetch')) {
          errorMessage = 'Connection error: Please check your internet connection and try again.';
        } else if (err.message?.includes('offline')) {
          errorMessage = err.message;
        } else if ((err as any)?.code || (err as any)?.details) {
          const code = (err as any)?.code ? ` [${(err as any).code}]` : '';
          const details = (err as any)?.details ? `: ${(err as any).details}` : '';
          errorMessage = `Error${code}${details}`;
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
        
        const cached = readCached();
        if (cached && cached.length > 0) {
          setProfessionals(cached);
          setError(null);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  return { professionals, loading, error };
};

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('visibility', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(post => ({
          id: post.id,
          title: post.title,
          category: post.tags?.[0] || 'Wellness',
          readTime: '5 min read', // Default read time
          image: post.cover_url || '/placeholder-article.jpg',
          publishedAt: new Date(post.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          author: 'Editorial Team', // Default author
          content: post.body ? [post.body] : [],
          slug: post.slug,
          tags: post.tags || []
        })) || [];

        setPosts(transformedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, loading, error };
};

export const useEvents = (page = 1, pageSize = 10) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Add pagination and count
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error, count } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .eq('status', 'approved')
          .order('date', { ascending: true })
          .range(from, to);

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(event => ({
          id: event.id,
          title: event.title,
          type: event.type || 'Event',
          date: new Date(event.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          time: event.start_time && event.end_time 
            ? `${event.start_time} – ${event.end_time}` 
            : event.start_time || 'Time TBA',
          startTime: event.start_time,
          endTime: event.end_time,
          location: event.location,
          category: 'General', // Default category for now
          description: event.summary || event.details,
          details: event.details,
          agenda: Array.isArray(event.agenda) ? event.agenda : [],
          registrationUrl: event.registration_url,
          imageUrl: event.image_url,
          ticketPrice: event.ticket_price_cents ? event.ticket_price_cents / 100 : 0,
          slug: event.slug
        })) || [];

        setEvents(transformedData);
        setTotal(count || 0);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page, pageSize]);

  return { events, loading, error, total };
};

export const useServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        // Keep the initial fetch light to avoid statement timeouts
        const { data, error } = await supabase
          .from('services')
          .select(`
            id,
            name,
            duration_min,
            price_cents,
            description,
            mode,
            benefits,
            slug,
            professionals:professionals!services_professional_id_fkey(
              profile_id,
              profession,
              slug
            )
          `)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Map profile_id -> name with a second, small query
        const profileIds = Array.from(new Set((data || [])
          .map((s: any) => s?.professionals?.profile_id)
          .filter(Boolean)));

        const idToName: Record<string, string> = {};
        if (profileIds.length > 0) {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', profileIds);
          (profs || []).forEach((p: any) => {
            idToName[p.id] = `${p.first_name || ''} ${p.last_name || ''}`.trim();
          });
        }

        // Transform data to match expected format
        const transformedData = (data || []).map((service: any) => ({
          id: service.id,
          name: service.name,
          duration: `${service.duration_min || 45} min`,
          price: service.price_cents ? `$${(service.price_cents / 100).toFixed(0)}` : '$100',
          description: service.description,
          mode: service.mode,
          professional: service.professionals ? {
            name: idToName[service.professionals.profile_id] || 'Professional',
            profession: service.professionals.profession,
            slug: service.professionals.slug
          } : null,
          benefits: Array.isArray(service.benefits) ? service.benefits : [],
          slug: service.slug
        }));

        setServices(transformedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};

export const useProfessionalFeedback = (professionalId: string) => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('professional_id', professionalId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(feedbackItem => ({
          id: feedbackItem.id,
          rating: feedbackItem.rating,
          review: feedbackItem.feedback_text || '',
          patientName: 'Anonymous', // For now, just use anonymous since we're not joining profiles
          date: new Date(feedbackItem.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          avatarUrl: null
        })) || [];

        setFeedback(transformedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching professional feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    if (professionalId) {
      fetchFeedback();
    }
  }, [professionalId]);

  return { feedback, loading, error };
};

export const useProfessionalServices = (professionalId: string) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            category:categories!services_category_id_fkey(
              id,
              name,
              slug
            )
          `)
          .eq('professional_id', professionalId)
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(service => ({
          id: service.id,
          name: service.name,
          duration_min: service.duration_min,
          price_cents: service.price_cents,
          description: service.description,
          mode: service.mode,
          category: service.category || { name: 'General', slug: 'general' },
          benefits: Array.isArray(service.benefits) ? service.benefits : [],
          slug: service.slug,
          image_url: service.image_url,
          availability: service.availability // expose JSONB availability to consumers
        })) || [];

        setServices(transformedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching professional services:', err);
      } finally {
        setLoading(false);
      }
    };

    if (professionalId) {
      fetchServices();
    }
  }, [professionalId]);

  return { services, loading, error };
};

export const usePatients = (professionalId: string) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('usePatients hook called with professionalId:', professionalId);
        
        if (!professionalId) {
          console.log('No professional ID provided, skipping fetch');
          setPatients([]);
          setLoading(false);
          return;
        }
        
        // Fetch patients who have appointments with this professional
        // First get services for this professional
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id')
          .eq('professional_id', professionalId);
        
        if (servicesError) throw servicesError;
        
        if (!servicesData || servicesData.length === 0) {
          console.log('No services found for professional:', professionalId);
          setPatients([]);
          return;
        }
        
        const serviceIds = servicesData.map(s => s.id);
        console.log('Found services for professional:', serviceIds);
        
        // Then get appointments for those services
        const appointmentsRes = await supabase
          .from('appointments')
          .select(`
            *,
            patient_profile:profiles(
              id,
              first_name,
              last_name,
              email,
              phone,
              avatar_url
            )
          `)
          .in('service_id', serviceIds)
          .order('created_at', { ascending: false });
        let appointmentsData = appointmentsRes.data;
        const appointmentsError = appointmentsRes.error;
        
        // If no appointments found, try a simpler approach - just get any appointments
        if (!appointmentsData || appointmentsData.length === 0) {
          console.log('No appointments found for services, trying direct appointments query');
          const { data: directAppointments, error: directError } = await supabase
            .from('appointments')
            .select(`
              *,
              patient_profile:profiles(
                id,
                first_name,
                last_name,
                email,
                phone,
                avatar_url
              )
            `)
            .limit(10)
            .order('created_at', { ascending: false });
          
          if (directError) {
            console.error('Direct appointments query error:', directError);
          } else {
            console.log('Direct appointments found:', directAppointments?.length || 0);
            appointmentsData = directAppointments;
          }
        }

        if (appointmentsError) throw appointmentsError;
        
        console.log('Found appointments:', appointmentsData?.length || 0);
        console.log('Appointments data:', appointmentsData);

        // Group by patient and get latest appointment info
        const patientMap = new Map();
        appointmentsData?.forEach(appointment => {
          const patientProfile = appointment.patient_profile;
          const patientId = patientProfile?.id;
          
          if (patientId && !patientMap.has(patientId)) {
            patientMap.set(patientId, {
              id: patientId,
              name: `${patientProfile.first_name || ''} ${patientProfile.last_name || ''}`.trim() || 'Unknown Patient',
              email: patientProfile.email || 'No email',
              phone: patientProfile.phone || 'No phone',
              lastVisit: appointment.date,
              status: appointment.appointment_status === 'completed' ? 'active' : 'pending',
              avatar: patientProfile.avatar_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=256&auto=format&fit=crop',
              totalAppointments: 1,
              lastAppointmentId: appointment.id
            });
          } else if (patientId) {
            // Update existing patient with latest appointment info
            const existingPatient = patientMap.get(patientId);
            existingPatient.totalAppointments += 1;
            if (new Date(appointment.date) > new Date(existingPatient.lastVisit)) {
              existingPatient.lastVisit = appointment.date;
              existingPatient.lastAppointmentId = appointment.id;
            }
          }
        });

        const transformedPatients = Array.from(patientMap.values());
        setPatients(transformedPatients);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    if (professionalId) {
      fetchPatients();
    }
  }, [professionalId]);

  return { patients, loading, error };
};