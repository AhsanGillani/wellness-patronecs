-- Create community status enum
CREATE TYPE public.community_status AS ENUM ('draft', 'published', 'archived');

-- Create community topics table
CREATE TABLE public.community_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_fingerprint TEXT,
  status community_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community questions table
CREATE TABLE public.community_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.community_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_fingerprint TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status community_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community answers table
CREATE TABLE public.community_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.community_questions(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_fingerprint TEXT,
  is_professional BOOLEAN NOT NULL DEFAULT false,
  status community_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_topics
CREATE POLICY "Published topics are viewable by everyone" 
ON public.community_topics 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authenticated users can create topics" 
ON public.community_topics 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = author_user_id);

CREATE POLICY "Guests can create topics" 
ON public.community_topics 
FOR INSERT 
TO anon
WITH CHECK (author_user_id IS NULL AND guest_name IS NOT NULL AND guest_fingerprint IS NOT NULL);

CREATE POLICY "Authors can update their own topics" 
ON public.community_topics 
FOR UPDATE 
USING (auth.uid() = author_user_id)
WITH CHECK (auth.uid() = author_user_id);

-- RLS Policies for community_questions
CREATE POLICY "Published questions are viewable by everyone" 
ON public.community_questions 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authenticated users can create questions" 
ON public.community_questions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = author_user_id);

CREATE POLICY "Guests can create questions" 
ON public.community_questions 
FOR INSERT 
TO anon
WITH CHECK (author_user_id IS NULL AND guest_name IS NOT NULL AND guest_fingerprint IS NOT NULL);

CREATE POLICY "Authors can update their own questions" 
ON public.community_questions 
FOR UPDATE 
USING (auth.uid() = author_user_id)
WITH CHECK (auth.uid() = author_user_id);

-- RLS Policies for community_answers
CREATE POLICY "Published answers are viewable by everyone" 
ON public.community_answers 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authenticated users can create answers" 
ON public.community_answers 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = author_user_id);

CREATE POLICY "Guests can create answers" 
ON public.community_answers 
FOR INSERT 
TO anon
WITH CHECK (author_user_id IS NULL AND guest_name IS NOT NULL AND guest_fingerprint IS NOT NULL);

CREATE POLICY "Authors can update their own answers" 
ON public.community_answers 
FOR UPDATE 
USING (auth.uid() = author_user_id)
WITH CHECK (auth.uid() = author_user_id);

-- Create function to automatically mark professional answers
CREATE OR REPLACE FUNCTION public.set_answer_professional_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is a professional
  IF NEW.author_user_id IS NOT NULL THEN
    SELECT CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = NEW.author_user_id 
        AND role IN ('doctor', 'professional')
      ) THEN true
      ELSE false
    END INTO NEW.is_professional;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic professional flag setting
CREATE TRIGGER set_answer_professional_flag_trigger
  BEFORE INSERT OR UPDATE ON public.community_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_answer_professional_flag();

-- Create indexes for better performance
CREATE INDEX idx_community_topics_slug ON public.community_topics(slug);
CREATE INDEX idx_community_topics_status ON public.community_topics(status);
CREATE INDEX idx_community_questions_topic_id ON public.community_questions(topic_id);
CREATE INDEX idx_community_questions_status ON public.community_questions(status);
CREATE INDEX idx_community_answers_question_id ON public.community_answers(question_id);
CREATE INDEX idx_community_answers_status ON public.community_answers(status);