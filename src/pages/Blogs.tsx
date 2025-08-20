import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { posts } from "@/lib/blogData";
import { Link } from "react-router-dom";

const Blogs = () => {
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


