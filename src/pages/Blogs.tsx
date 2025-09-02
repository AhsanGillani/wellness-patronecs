import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useBlogs } from "@/hooks/useMarketplace";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Skeleton from "@/components/ui/Skeleton";

const Blogs = () => {
  const { data: posts, isLoading: loading, error } = useBlogs();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumbs />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border bg-white">
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-full mb-3" />
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
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
          <div className="mx-auto max-w-7xl px-4 text-center">
            <p className="text-red-600">Error loading blog posts: {error.message}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Blogs</h1>
              <p className="mt-1 text-slate-600">Insights, tips, and stories curated by our editors.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">Latest</Button>
              <Button>Trending</Button>
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {!posts || posts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 text-violet-600 mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Coming Soon!</h3>
                <p className="text-slate-600 mb-6 text-lg">We're working on some amazing wellness content for you.</p>
                <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <div className="mt-8">
                  <Button variant="secondary" as="link" to="/">Back to Home</Button>
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <Link key={post.id} to={`/blogs/${post.slug}`} className="group block overflow-hidden rounded-2xl border bg-white">
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    {post.cover_url ? (
                      <img 
                        src={post.cover_url.startsWith('data:') ? post.cover_url : `data:image/*;base64,${post.cover_url}`}
                        alt="cover" 
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-slate-500">
                      {post.tags && post.tags.length > 0 ? post.tags[0] : 'General'} • 
                      {new Date(post.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="mt-1 text-base font-semibold text-slate-900 group-hover:underline">{post.title}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blogs;


