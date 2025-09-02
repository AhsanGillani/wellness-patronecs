import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Button from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Simple tag input component (chips) used for topics
const TagInput = ({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) => {
  const [input, setInput] = useState("");
  const addTag = () => {
    const tag = input.trim();
    if (!tag) return;
    if (!value.includes(tag)) onChange([...value, tag]);
    setInput("");
  };
  return (
    <div className="rounded-lg border border-slate-200 p-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
            {t}
            <button className="text-violet-600 hover:text-violet-800" onClick={() => onChange(value.filter(x => x !== t))}>×</button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
        placeholder={placeholder || 'Type and press Enter'}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
      />
    </div>
  );
};
import { useQuestions, useCreateQuestion, useCreateTopic, Question } from "@/hooks/useCommunity";

const Community = () => {
  const { data: dbQuestions = [], isLoading } = useQuestions();
  const tags = ["Nutrition", "Mental Health", "Fitness", "Sleep", "Women Health", "Men Health"];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'recent' | 'answers' | 'views'>("recent");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [guestName, setGuestName] = useState("");

  // Hooks
  const createQuestion = useCreateQuestion();
  const createTopic = useCreateTopic();

  useEffect(() => { setPage(1); }, [selectedTags, searchQuery, sortBy]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmitQuestion = async () => {
    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body");
      return;
    }

    try {
      // Ensure each tag exists as a topic; collect their IDs
      const topicIds: string[] = [];
      for (const t of selectedTags) {
        const slug = t.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const topic = await createTopic.mutateAsync({
          title: t.trim(),
          slug,
          description: `Questions about ${t.trim()}`
        });
        if (topic?.id) topicIds.push(topic.id);
      }

      await createQuestion.mutateAsync({
        topicIds,
        title: title.trim(),
        body: body.trim(),
        isAnonymous,
        guestName: guestName.trim() || undefined
      });

      setTitle("");
      setBody("");
      setSelectedTags([]);
      setIsAnonymous(false);
      setGuestName("");

      alert("Question posted successfully!");
    } catch (error) {
      console.error("Error posting question:", error);
      alert("Failed to post question. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          {/* Left: Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-xl border bg-white p-5 hover:shadow-lg transition-all duration-300 group">
              <div className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                <span className="mr-2">🔍</span>
                Search
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all duration-300 group-hover:border-violet-200"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 hover:shadow-lg transition-all duration-300">
              <div className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                <span className="mr-2">🏷️</span>
                Topics
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button 
                    key={t} 
                    onClick={() => toggleTag(t)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedTags.includes(t)
                        ? 'border-violet-500 bg-violet-100 text-violet-700 shadow-lg'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 hover:shadow-lg transition-all duration-300 group">
              <div className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Sort by
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'answers' | 'views')}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all duration-300 group-hover:border-violet-200 appearance-none"
                >
                  <option value="recent">Most recent</option>
                  <option value="answers">Most answered</option>
                  <option value="views">Most viewed</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </aside>

          {/* Center: Questions */}
          <section className="lg:col-span-6 space-y-4">
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-white p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-slate-200" />
                      <div className="min-w-0 flex-1">
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                        <div className="mt-1 h-3 w-5/6 rounded bg-slate-100" />
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-5 w-20 rounded-full bg-slate-100" />
                          <div className="h-5 w-16 rounded-full bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && (() => {
              const filtered = dbQuestions.filter((q) => {
                // For now, just filter by search query since we don't have topic info
                const ql = searchQuery.trim().toLowerCase();
                const inSearch = ql.length === 0 || [q.title, q.body].some(v => (v || '').toLowerCase().includes(ql));
                return inSearch;
              });
              const sorted = [...filtered];
              switch (sortBy) {
                case 'answers':
                  sorted.sort((a, b) => (b.answer_count ?? 0) - (a.answer_count ?? 0));
                  break;
                case 'views':
                  sorted.sort((a, b) => {
                    const aViews = (a as Question & { views?: number }).views ?? 0;
                    const bViews = (b as Question & { views?: number }).views ?? 0;
                    return bViews - aViews;
                  });
                  break;
                case 'recent':
                default:
                  sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              }
              if (sorted.length === 0) {
                return (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/70">
                      <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                    </div>
                    <div className="text-sm font-medium text-slate-900">No questions yet</div>
                    <div className="mt-1 text-xs text-slate-600">Be the first to ask a question! Use the form on the right to get started.</div>
                  </div>
                );
              }
              const total = sorted.length;
              const totalPages = Math.max(1, Math.ceil(total / pageSize));
              const startIndex = (page - 1) * pageSize;
              const endIndex = Math.min(total, startIndex + pageSize);
              const paged = sorted.slice(startIndex, endIndex);
              return (
                <>
                  {paged.map((q, index) => (
              <article 
                key={q.id} 
                className="group relative overflow-hidden rounded-xl border bg-white p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-violet-50/60 to-blue-50/40" />
                <div className="relative z-10 flex items-start gap-4">
                  {q.author?.avatar_url ? (
                    <img src={q.author.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover border-2 border-white" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-medium">
                      {(() => {
                        const initials = `${q.author?.first_name?.[0] || q.guest_name?.[0] || 'U'}${q.author?.last_name?.[0] || ''}`.toUpperCase();
                        return initials;
                      })()}
                  </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link to={`/community/q/${q.id}`} className="block">
                      <h3 className="text-lg font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-violet-700 transition-colors duration-300">
                        {q.title}
                      </h3>
                    </Link>
                    <p className="mt-1.5 text-sm text-slate-600 line-clamp-3 group-hover:text-slate-700 transition-colors duration-300">{q.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {/* Role (plain text) */}
                      <span className="text-slate-700">{q.author?.role === 'admin' ? 'Wellness' : (q.author?.role || 'patient')}</span>
                      <span className="text-slate-500">•</span>
                      {/* Full name */}
                      <span className="text-slate-700">{`${q.author?.first_name || q.guest_name || 'User'} ${q.author?.last_name || ''}`.trim()}</span>
                      <span className="text-slate-500">•</span>
                      {/* Asked time */}
                      <span className="text-slate-600">Asked {new Date(q.created_at).toLocaleString()}</span>
                      <span className="ml-auto text-slate-500 group-hover:text-slate-600 transition-colors duration-300">{(q.answer_count ?? 0)} answers</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-500">👁️ {(q.views ?? 0)}</span>
                    </div>
                    {/* NEW badge on second line if within 24h */}
                    {(() => { const isNew = Date.now() - new Date(q.created_at).getTime() < 24*60*60*1000; return isNew; })() && (
                      <div className="mt-1 text-xs flex items-center gap-2">
                        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-200">NEW</span>
                        {q.topic?.title && (
                          <span className="rounded-full bg-violet-50 text-violet-700 px-2 py-0.5 border border-violet-200">{q.topic.title}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Floating interaction indicators */}
                
                <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-violet-200 transition-colors duration-300" />
              </article>
            ))}
                  {total > 0 && (
                    <div className="pt-4 flex flex-col items-center gap-2">
                      <div className="text-sm text-slate-600">Showing {total === 0 ? 0 : startIndex + 1}–{endIndex} of {total}</div>
                      <div className="inline-flex items-center gap-3">
                        <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full px-4 py-2">Previous</Button>
                        <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
                        <Button size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-full px-4 py-2">Next</Button>
              </div>
            </div>
                  )}
                </>
              );
            })()}

            {/* Pagination moved into the dynamic render above */}
          </section>

          {/* Right: Ask */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="relative rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-500" style={{animationDelay: '0.5s'}}></div>
              
              <h3 className="text-lg font-semibold relative z-10">Ask the community</h3>
              <p className="mt-1 text-white/80 text-sm relative z-10">Get answers from verified professionals and experienced members.</p>
              
              {/* Floating sparkle */}
              <div className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform rotate-12 group-hover:rotate-0">
                ✨
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 hover:shadow-lg transition-all duration-300 group">
              {/* Tip removed per request */}
              <label className="text-sm font-medium text-slate-700 mb-2 block">Title</label>
              <input
                type="text"
                placeholder="Write a clear question title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all duration-300 group-hover:border-violet-200"
              />

              <label className="mt-4 block text-sm font-medium text-slate-700 mb-2">Details</label>
              <textarea
                rows={5}
                placeholder="Give more context so others can help better"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all duration-300 group-hover:border-violet-200"
              />

              <label className="mt-4 block text-sm font-medium text-slate-700 mb-2">Topics</label>
              <TagInput value={selectedTags} onChange={setSelectedTags} placeholder="Type a topic and press Enter" />

              

              <div className="mt-8">
                <Button 
                  onClick={handleSubmitQuestion}
                  disabled={createQuestion.isPending}
                  className="w-full rounded-full px-6 py-3 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createQuestion.isPending ? "Posting..." : "Post question"}
                </Button>
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


