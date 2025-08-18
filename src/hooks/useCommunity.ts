import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getGuestFingerprint } from "@/lib/guest-fingerprint";
import { toast } from "sonner";

// Types
export interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  user_id: string | null;
  guest_name: string | null;
  created_at: string;
  question_count?: number;
}

export interface Question {
  id: string;
  topic_id: string;
  title: string;
  body: string;
  user_id: string | null;
  guest_name: string | null;
  is_anonymous: boolean;
  created_at: string;
  answer_count?: number;
  score?: number;
}

export interface Answer {
  id: string;
  question_id: string;
  body: string;
  user_id: string | null;
  guest_name: string | null;
  is_from_professional: boolean;
  is_verified: boolean;
  created_at: string;
  score?: number;
}

// Hooks for fetching data
export function useTopics() {
  return useQuery({
    queryKey: ['community', 'topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_topics')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useTopic(slug: string) {
  return useQuery({
    queryKey: ['community', 'topic', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_topics')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data as Topic | null;
    },
  });
}

export function useQuestions(topicId?: string) {
  return useQuery({
    queryKey: ['community', 'questions', topicId],
    queryFn: async () => {
      let query = supabase
        .from('community_questions')
        .select(`
          *
        `)
        .eq('status', 'published');

      if (topicId) {
        query = query.eq('topic_id', topicId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Question[];
    },
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['community', 'question', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_questions')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data as Question | null;
    },
  });
}

export function useAnswers(questionId: string) {
  return useQuery({
    queryKey: ['community', 'answers', questionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_answers')
        .select('*')
        .eq('question_id', questionId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Answer[];
    },
  });
}

// Mutation hooks
export function useCreateTopic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ title, slug, description, guestName }: { title: string; slug: string; description?: string; guestName?: string }) => {
      const insertData: any = {
        title,
        slug,
        description,
      };

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        insertData.user_id = user.id;
      } else {
        insertData.guest_name = guestName;
        insertData.guest_fingerprint = getGuestFingerprint();
      }

      const { data, error } = await supabase
        .from('community_topics')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'topics'] });
      toast.success('Topic created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create topic: ' + error.message);
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ topicId, title, body, isAnonymous, guestName }: { topicId: string; title: string; body: string; isAnonymous: boolean; guestName?: string }) => {
      const insertData: any = {
        topic_id: topicId,
        title,
        body,
        is_anonymous: isAnonymous,
      };

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        insertData.user_id = user.id;
      } else {
        insertData.guest_name = guestName;
        insertData.guest_fingerprint = getGuestFingerprint();
      }

      const { data, error } = await supabase
        .from('community_questions')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'questions'] });
      toast.success('Question posted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to post question: ' + error.message);
    },
  });
}

export function useCreateAnswer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questionId, body, guestName }: { questionId: string; body: string; guestName?: string }) => {
      const insertData: any = {
        question_id: questionId,
        body,
      };

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        insertData.user_id = user.id;
      } else {
        insertData.guest_name = guestName;
        insertData.guest_fingerprint = getGuestFingerprint();
      }

      const { data, error } = await supabase
        .from('community_answers')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'answers'] });
      toast.success('Answer posted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to post answer: ' + error.message);
    },
  });
}