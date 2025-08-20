import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { posts } from "@/lib/blogData";
import { useParams } from "react-router-dom";

const BlogDetail = () => {
  const params = useParams();
  const id = Number(params.id);
  const post = posts.find((p) => p.id === id);

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
          <div className="text-sm text-slate-500">{post.category} • {post.readTime} • {post.publishedAt}</div>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{post.title}</h1>
          <div className="mt-1 text-sm text-slate-600">By {post.author}</div>

          <div className="mt-6 overflow-hidden rounded-2xl border">
            <img src={post.image} alt="cover" className="w-full h-auto object-cover" />
          </div>

          <div className="prose prose-slate max-w-none mt-6">
            {post.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogDetail;


