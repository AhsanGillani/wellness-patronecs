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
  author_user_id: string | null;
  guest_name: string | null;
  guest_fingerprint: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  question_count?: number;
  author?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

export interface Question {
  id: string;
  topic_id: string;
  title: string;
  body: string;
  author_user_id: string | null;
  guest_name: string | null;
  guest_fingerprint: string | null;
  is_anonymous: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  answer_count?: number;
  score?: number;
  author?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  };
  topic?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface Answer {
  id: string;
  question_id: string;
  body: string;
  author_user_id: string | null;
  guest_name: string | null;
  guest_fingerprint: string | null;
  is_professional: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  score?: number;
  author?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  };
}

// Query functions
async function fetchTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('community_topics')
    .select(`
      *,
      author:profiles!author_user_id(first_name, last_name, role)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Topic[];
}

async function fetchTopic(slug: string): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('community_topics')
    .select(`
      *,
      author:profiles!author_user_id(first_name, last_name, role)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as Topic | null;
}

async function fetchQuestions(topicId?: string): Promise<Question[]> {
  let query = supabase
    .from('community_questions')
    .select(`
      *,
      author:profiles!author_user_id(first_name, last_name, role),
      topic:community_topics!topic_id(id, title, slug)
    `)
    .eq('status', 'published');

  if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Question[];
}

async function fetchQuestion(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('community_questions')
    .select(`
      *,
      author:profiles!author_user_id(first_name, last_name, role),
      topic:community_topics!topic_id(id, title, slug)
    `)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as Question | null;
}

async function fetchAnswers(questionId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from('community_answers')
    .select(`
      *,
      author:profiles!author_user_id(first_name, last_name, role)
    `)
    .eq('question_id', questionId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Answer[];
}

// Hooks for fetching data
export function useTopics() {
  return useQuery({
    queryKey: ['community', 'topics'],
    queryFn: fetchTopics,
  });
}

export function useTopic(slug: string) {
  return useQuery({
    queryKey: ['community', 'topic', slug],
    queryFn: () => fetchTopic(slug),
  });
}

export function useQuestions(topicId?: string) {
  return useQuery({
    queryKey: ['community', 'questions', topicId],
    queryFn: () => fetchQuestions(topicId),
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['community', 'question', id],
    queryFn: () => fetchQuestion(id),
  });
}

export function useAnswers(questionId: string) {
  return useQuery({
    queryKey: ['community', 'answers', questionId],
    queryFn: () => fetchAnswers(questionId),
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
        status: 'published'
      };

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        insertData.author_user_id = user.id;
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
    onError: (error: any) => {
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
        status: 'published'
      };

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        insertData.author_user_id = user.id;
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
    onError: (error: any) => {
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
        status: 'published'
      };

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        insertData.author_user_id = user.id;
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
    onError: (error: any) => {
      toast.error('Failed to post answer: ' + error.message);
    },
  });
}