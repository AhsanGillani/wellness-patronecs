import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { questions } from "@/lib/communityData";

const CommunityQuestion = () => {
  const params = useParams();
  const id = Number(params.id);
  const q = questions.find((x) => x.id === id);

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-2xl font-bold text-slate-900">Discussion not found</h1>
            <p className="mt-2 text-slate-600">The question you are looking for does not exist.</p>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-6">
            <article className="rounded-2xl border bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{q.title}</h1>
                <div className="text-sm text-slate-600">{q.views} views • {q.createdAt}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {q.tags.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{t}</span>
                ))}
              </div>
              <p className="mt-4 text-slate-800 leading-relaxed">{q.body}</p>
            </article>

            <div className="rounded-2xl border bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Answers ({q.answersCount})</h2>
                <Button size="sm">Answer</Button>
              </div>

              <div className="mt-4 space-y-4">
                {q.answers.map((a) => (
                  <div key={a.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{a.author}{a.role ? ` • ${a.role}` : ""}</div>
                        <div className="text-xs text-slate-500">{a.createdAt}</div>
                      </div>
                      <div className="text-xs text-slate-500">▲ {a.upvotes}</div>
                    </div>
                    <p className="mt-2 text-slate-800 text-sm leading-relaxed">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-base font-semibold text-slate-900">Your answer</h3>
              <textarea rows={5} placeholder="Write your answer..." className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" />
              <div className="mt-3 flex justify-end">
                <Button>Post answer</Button>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-violet-600 text-white p-6">
              <h3 className="text-lg font-semibold">Ask the community</h3>
              <p className="mt-1 text-white/80 text-sm">Get help from experts and members.</p>
              <Button variant="secondary" className="mt-4">Ask a question</Button>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Related</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {questions.filter((x) => x.id !== q.id).slice(0, 4).map((x) => (
                  <li key={x.id} className="line-clamp-2">{x.title}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityQuestion;


