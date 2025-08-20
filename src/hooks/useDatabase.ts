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
        const { data, error } = await supabase
          .from('professionals')
          .select(`
            *,
            profiles!professionals_profile_id_fkey (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('verification', 'verified');

        if (error) throw error;

        // Transform data to match expected format
        const transformedData = data?.map(prof => ({
          id: prof.id,
          name: prof.profiles ? `${prof.profiles.first_name || ''} ${prof.profiles.last_name || ''}`.trim() : 'Professional',
          title: prof.profession || prof.specialization,
          years: prof.years_experience || 0,
          rating: 4.8, // Default rating for now
          reviews: 150, // Default reviews for now
          price: prof.price_per_session ? `$${(prof.price_per_session / 100).toFixed(0)} / session` : '$100 / session',
          image: prof.profiles?.avatar_url || '/placeholder-avatar.jpg',
          tags: prof.specialization ? prof.specialization.split(', ') : [],
          bio: prof.bio,
          about: prof.bio,
          location: prof.location,
          slug: prof.slug
        })) || [];

        setProfessionals(transformedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching professionals:', err);
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