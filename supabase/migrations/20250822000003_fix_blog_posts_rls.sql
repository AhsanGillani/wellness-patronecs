-- Fix blog_posts RLS policies to allow admins to read all blogs
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Published blogs readable by everyone" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors manage their blogs" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors update their blogs" ON public.blog_posts;

-- Create new policies that allow admins to read all blogs
CREATE POLICY "Published blogs readable by everyone" ON public.blog_posts FOR SELECT USING (visibility = 'published');
CREATE POLICY "Authenticated users can read all blogs" ON public.blog_posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authors manage their blogs" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (author_user_id = auth.uid());
CREATE POLICY "Authors update their blogs" ON public.blog_posts FOR UPDATE TO authenticated USING (author_user_id = auth.uid()) WITH CHECK (author_user_id = auth.uid());
