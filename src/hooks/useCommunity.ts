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
    avatar_url?: string;
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
  parent_id?: string | null; // For nested replies
  profiles?: {
    first_name?: string;
    last_name?: string;
    role?: string;
    avatar_url?: string;
  } | null;
  replies?: Answer[]; // Nested replies
}

// Query functions
async function fetchTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('community_topics')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Topic[];
}

async function fetchTopic(slug: string): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('community_topics')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as Topic | null;
}

async function fetchQuestions(topicId?: string): Promise<Question[]> {
  let query = supabase
    .from('community_questions')
    .select('*')
    .eq('status', 'published');

  if (topicId) {
    query = query.eq('topic_id', topicId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  const questions = (data || []) as Question[];

  // Collect ids to enrich
  const authorUserIds = Array.from(
    new Set(
      questions
        .map((q) => q.author_user_id)
        .filter((v): v is string => Boolean(v))
    )
  );
  const topicIds = Array.from(new Set(questions.map((q) => q.topic_id).filter(Boolean)));

  // Fetch profiles
  let profilesData: any[] | null = null;
  if (authorUserIds.length > 0) {
    const { data: pData } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, role, avatar_url')
      .in('user_id', authorUserIds);
    profilesData = pData || [];
  }

  // Fetch topics
  let topicsData: any[] | null = null;
  if (topicIds.length > 0) {
    const { data: tData } = await supabase
      .from('community_topics')
      .select('id, title, slug')
      .in('id', topicIds);
    topicsData = tData || [];
  }

  const userIdToProfile = new Map<string, any>();
  (profilesData || []).forEach((p: any) => {
    userIdToProfile.set(p.user_id, p);
  });

  const topicIdToTopic = new Map<string, any>();
  (topicsData || []).forEach((t: any) => {
    topicIdToTopic.set(t.id, t);
  });

  return questions.map((q) => {
    const profile = q.author_user_id ? userIdToProfile.get(q.author_user_id) : null;
    const topic = q.topic_id ? topicIdToTopic.get(q.topic_id) : null;
    return {
      ...q,
      author: profile
        ? {
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role,
            avatar_url: profile.avatar_url,
          }
        : q.guest_name
        ? { first_name: q.guest_name, last_name: '', role: 'patient' }
        : undefined,
      topic: topic
        ? { id: topic.id, title: topic.title, slug: topic.slug }
        : undefined,
    } as Question;
  });
}

async function fetchQuestion(id: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('community_questions')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const question = data as Question;

  // Enrich author
  let author: any | undefined = undefined;
  if (question.author_user_id) {
    const { data: pData } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, role, avatar_url')
      .eq('user_id', question.author_user_id)
      .maybeSingle();
    if (pData) {
      author = {
        first_name: pData.first_name,
        last_name: pData.last_name,
        role: pData.role,
        avatar_url: pData.avatar_url,
      };
    }
  } else if (question.guest_name) {
    author = { first_name: question.guest_name, last_name: '', role: 'patient' };
  }

  // Enrich topic
  let topic: any | undefined = undefined;
  if (question.topic_id) {
    const { data: tData } = await supabase
      .from('community_topics')
      .select('id, title, slug')
      .eq('id', question.topic_id)
      .maybeSingle();
    if (tData) {
      topic = { id: tData.id, title: tData.title, slug: tData.slug };
    }
  }

  return { ...question, author, topic } as Question;
}

async function fetchAnswers(questionId: string): Promise<Answer[]> {
  const { data, error } = await supabase
    .from('community_answers')
    .select('*')
    .eq('question_id', questionId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // If we have answers with author_user_id, fetch profile data separately
  if (data && data.length > 0) {
    const userIds = data
      .filter(answer => answer.author_user_id)
      .map(answer => answer.author_user_id);
    
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, role, avatar_url')
        .in('user_id', userIds);
      
      if (!profilesError && profiles) {
        // Merge profile data with answers
        const answersWithProfiles = data.map(answer => ({
          ...answer,
          profiles: answer.author_user_id 
            ? profiles.find(p => p.user_id === answer.author_user_id) || null
            : null
        })) as Answer[];

        // Organize into nested structure
        const answers = answersWithProfiles.filter(answer => !answer.parent_id);
        const replies = answersWithProfiles.filter(answer => answer.parent_id);
        
        // Attach replies to their parent answers
        answers.forEach(answer => {
          answer.replies = replies.filter(reply => reply.parent_id === answer.id);
        });
        
        return answers;
      }
    }
  }
  
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
      const normalizedSlug = slug.trim().toLowerCase();

      // 1) Try to find existing topic first (avoid 409 noise)
      const { data: existing, error: fetchErr } = await supabase
        .from('community_topics')
        .select('*')
        .eq('status', 'published')
        .ilike('slug', normalizedSlug)
        .maybeSingle();
      if (!fetchErr && existing) {
        return existing;
      }

      // 2) Prepare insert payload
      const insertData: any = {
        title,
        slug: normalizedSlug,
        description,
        status: 'published'
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        insertData.author_user_id = user.id;
      } else {
        insertData.guest_name = guestName;
        insertData.guest_fingerprint = getGuestFingerprint();
      }

      // 3) Insert new topic
      const { data, error } = await supabase
        .from('community_topics')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

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