import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/useDatabase";
import { Link } from "react-router-dom";

const Blogs = () => {
  const { posts, loading, error } = useBlogPosts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading blog posts...</p>
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
            <p className="text-red-600">Error loading blog posts: {error}</p>
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
            {posts.map((p) => (
              <Link key={p.id} to={`/blogs/${p.id}`} className="group block overflow-hidden rounded-2xl border bg-white">
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <img src={p.image} alt="cover" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <div className="text-sm text-slate-500">{p.category} • {p.readTime}</div>
                  <div className="mt-1 text-base font-semibold text-slate-900 group-hover:underline">{p.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blogs;


