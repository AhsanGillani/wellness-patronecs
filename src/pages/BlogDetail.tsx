import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { useParams } from "react-router-dom";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { useBlogs } from "@/hooks/useMarketplace";
import { useEffect, useState } from "react";

const BlogDetail = () => {
  const params = useParams();
  const slug = params.slug; // Use slug instead of id
  const { data: blogs, isLoading, error } = useBlogs();
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (blogs && slug) {
      const foundPost = blogs.find((blog) => blog.slug === slug);
      setPost(foundPost);
    }
  }, [blogs, slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-2xl font-bold text-slate-900">Error loading blog</h1>
            <p className="mt-2 text-slate-600">Failed to load the blog post. Please try again.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-2xl font-bold text-slate-900">Post not found</h1>
            <p className="mt-2 text-slate-600">The blog post you are looking for does not exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <article className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4">
          <Breadcrumbs />
          
          <div className="text-sm text-slate-500">
            {post.tags && post.tags.length > 0 ? post.tags.join(', ') : 'General'} • 
            {new Date(post.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{post.title}</h1>
          <div className="mt-1 text-sm text-slate-600">By Wellness Patronecs Team</div>

          {post.cover_url && (
            <div className="mt-6 overflow-hidden rounded-2xl border">
              <img 
                src={post.cover_url.startsWith('data:') ? post.cover_url : `data:image/*;base64,${post.cover_url}`}
                alt="cover" 
                className="w-full h-auto object-cover" 
              />
            </div>
          )}

          <div className="prose prose-slate max-w-none mt-6">
            <style>
              {`
                .ql-align-center { text-align: center !important; }
                .ql-align-right { text-align: right !important; }
                .ql-align-justify { text-align: justify !important; }
                .ql-align-left { text-align: left !important; }
                .ql-size-small { font-size: 0.875em !important; }
                .ql-size-large { font-size: 1.5em !important; }
                .ql-size-huge { font-size: 2.5em !important; }
                .ql-color-red { color: #e53e3e !important; }
                .ql-color-orange { color: #dd6b20 !important; }
                .ql-color-yellow { color: #d69e2e !important; }
                .ql-color-green { color: #38a169 !important; }
                .ql-color-blue { color: #3182ce !important; }
                .ql-color-purple { color: #805ad5 !important; }
                .ql-bg-red { background-color: #fed7d7 !important; }
                .ql-bg-orange { background-color: #feebc8 !important; }
                .ql-bg-yellow { background-color: #fef5e7 !important; }
                .ql-bg-green { background-color: #c6f6d5 !important; }
                .ql-bg-blue { background-color: #bee3f8 !important; }
                .ql-bg-purple { background-color: #e9d8fd !important; }
                .ql-font-serif { font-family: Georgia, Times, "Times New Roman", serif !important; }
                .ql-font-monospace { font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important; }
                .ql-indent-1 { padding-left: 3em !important; }
                .ql-indent-2 { padding-left: 6em !important; }
                .ql-indent-3 { padding-left: 9em !important; }
                .ql-indent-4 { padding-left: 12em !important; }
                .ql-indent-5 { padding-left: 15em !important; }
                .ql-indent-6 { padding-left: 18em !important; }
                .ql-indent-7 { padding-left: 21em !important; }
                .ql-indent-8 { padding-left: 24em !important; }
                .ql-direction-rtl { direction: rtl !important; }
                .ql-direction-ltr { direction: ltr !important; }
                blockquote { border-left: 4px solid #ccc; margin: 1.5em 0; padding-left: 1em; }
                pre { background-color: #f0f0f0; border-radius: 3px; padding: 1em; overflow-x: auto; }
                code { background-color: #f0f0f0; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
                .ql-editor h1 { font-size: 2em; margin: 0.67em 0; }
                .ql-editor h2 { font-size: 1.5em; margin: 0.75em 0; }
                .ql-editor h3 { font-size: 1.17em; margin: 0.83em 0; }
                .ql-editor h4 { font-size: 1em; margin: 1.12em 0; }
                .ql-editor h5 { font-size: 0.83em; margin: 1.5em 0; }
                .ql-editor h6 { font-size: 0.75em; margin: 1.67em 0; }
                .ql-editor p { margin: 1em 0; }
                .ql-editor ul, .ql-editor ol { margin: 1em 0; padding-left: 2em; }
                .ql-editor li { margin: 0.5em 0; }
                .ql-editor img { max-width: 100%; height: auto; }
                .ql-editor a { color: #3182ce; text-decoration: underline; }
                .ql-editor a:hover { color: #2c5aa0; }
              `}
            </style>
            <div className="ql-editor" dangerouslySetInnerHTML={{ __html: post.body }} />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogDetail;


