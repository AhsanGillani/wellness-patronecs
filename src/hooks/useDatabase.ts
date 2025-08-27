import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if we're online
        if (!navigator.onLine) {
          throw new Error('You appear to be offline. Please check your internet connection and try again.');
        }
        
        // Test Supabase connectivity first
        try {
          const { data: testData, error: testError } = await supabase
            .from('professionals')
            .select('id')
            .limit(1);
          
          if (testError) {
            console.error('Supabase connectivity test failed:', testError);
            throw new Error(`Database connection failed: ${testError.message}`);
          }
        } catch (connectivityError: any) {
          console.error('Connectivity test error:', connectivityError);
          
          // Check if it's a connection refused/closed error
          if (connectivityError.message?.includes('Failed to fetch') || 
              connectivityError.message?.includes('ERR_CONNECTION_CLOSED') ||
              connectivityError.message?.includes('ERR_CONNECTION_REFUSED')) {
            throw new Error('Unable to connect to the database. Your Supabase project may be paused, deleted, or unreachable. Please check your Supabase dashboard.');
          }
          
          throw new Error('Unable to connect to the database. Please check your internet connection.');
        }
        
        // First, fetch all professionals with their profile data
        const { data: professionalsData, error: professionalsError } = await supabase
          .from('professionals')
          .select(`
            *,
            profiles (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (professionalsError) {
          console.error('Professionals fetch error:', professionalsError);
          throw professionalsError;
        }

        // Then, fetch ratings for all professionals
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('professional_ratings')
          .select('*');

        if (ratingsError) {
          console.error('Ratings fetch error:', ratingsError);
          // Don't throw here, just log the error and continue without ratings
          console.warn('Continuing without ratings data');
        }

        // Create a map of professional_id to ratings
        const ratingsMap = new Map();
        ratingsData?.forEach(rating => {
          ratingsMap.set(rating.professional_id, {
            rating: rating.rating,
            reviews: rating.reviews
          });
        });

        // Transform data to match expected format
        const transformedData = professionalsData?.map(prof => {
          const profRatings = ratingsMap.get(prof.id);
          
          // Get profile data safely
          const profileData = prof.profiles as { first_name?: string; last_name?: string; avatar_url?: string } | null;
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
      } catch (err: any) {
        console.error('Error in useProfessionals:', err);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load professionals';
        
        if (err.message === 'Failed to fetch') {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else if (err.message?.includes('fetch')) {
          errorMessage = 'Connection error: Please check your internet connection and try again.';
        } else if (err.message?.includes('offline')) {
          errorMessage = err.message;
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
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

export const useEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'approved')
          .order('date', { ascending: true });

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
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
};

export const useServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            professionals!services_professional_id_fkey (
              profession,
              slug,
              profiles!professionals_profile_id_fkey (
                first_name,
                last_name
              )
            )
          `)
          .eq('active', true);

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(service => ({
          id: service.id,
          name: service.name,
          duration: `${service.duration_min || 45} min`,
          price: service.price_cents ? `$${(service.price_cents / 100).toFixed(0)}` : '$100',
          description: service.description,
          mode: service.mode,
          professional: service.professionals ? {
            name: `${service.professionals.profiles?.first_name || ''} ${service.professionals.profiles?.last_name || ''}`.trim(),
            profession: service.professionals.profession,
            slug: service.professionals.slug
          } : null,
          benefits: Array.isArray(service.benefits) ? service.benefits : [],
          slug: service.slug
        })) || [];

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
          .select('*')
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
          categories: { name: 'General', slug: 'general' }, // Default category for now
          benefits: Array.isArray(service.benefits) ? service.benefits : [],
          slug: service.slug
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