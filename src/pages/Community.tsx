import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import { Link } from "react-router-dom";
import { questions } from "@/lib/communityData";

const Community = () => {
  const tags = ["Nutrition", "Mental Health", "Fitness", "Sleep", "Women Health", "Men Health"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          {/* Left: Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Search</div>
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Topics</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button key={t} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Sort by</div>
              <div className="mt-3">
                <select className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200">
                  <option>Most recent</option>
                  <option>Most answered</option>
                  <option>Most viewed</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Center: Questions */}
          <section className="lg:col-span-6 space-y-4">
            {questions.map((q) => (
              <article key={q.id} className="rounded-xl border bg-white p-5 hover:shadow-soft transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex -space-x-2">
                    <img src={avatar1} alt="avatar" className="h-8 w-8 rounded-full border border-white bg-slate-200" />
                    <img src={avatar2} alt="avatar" className="h-8 w-8 rounded-full border border-white bg-slate-200" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/community/q/${q.id}`} className="block">
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2 hover:underline">
                        {q.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{q.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {q.tags.map((t) => (
                        <span key={t} className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1">{t}</span>
                      ))}
                      <span className="ml-auto text-slate-500">{q.answersCount} answers • {q.views.toLocaleString()} views</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Asked {q.createdAt} by {q.author}</div>
                  </div>
                </div>
              </article>
            ))}

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-slate-600">Showing 1–5 of 120</div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">Previous</Button>
                <Button size="sm">Next</Button>
              </div>
            </div>
          </section>

          {/* Right: Ask */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl bg-violet-600 text-white p-6">
              <h3 className="text-lg font-semibold">Ask the community</h3>
              <p className="mt-1 text-white/80 text-sm">Get answers from verified professionals and experienced members.</p>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                placeholder="Write a clear question title"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              />

              <label className="mt-4 block text-sm font-medium text-slate-700">Details</label>
              <textarea
                rows={5}
                placeholder="Give more context so others can help better"
                className="mt-1 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              />

              <label className="mt-4 block text-sm font-medium text-slate-700">Tags</label>
              <input
                type="text"
                placeholder="e.g. Sleep, Routine"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              />

              <div className="mt-4">
                <Button className="w-full">Post question</Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;


