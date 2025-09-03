import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { useQuestion, useCreateAnswer, useQuestions, useAnswers } from "@/hooks/useCommunity";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import Breadcrumbs from "@/components/site/Breadcrumbs";

const CommunityQuestion = () => {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { data: q, isLoading } = useQuestion(id);
  const createAnswer = useCreateAnswer();
  const [answer, setAnswer] = useState("");
  const [guestName, setGuestName] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    user_id: string;
    role: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    email?: string;
  } | null>(null);
  const { data: relatedList = [] } = useQuestions(q?.topic?.id);
  const { data: answers = [], isLoading: answersLoading, error: answersError, refetch } = useAnswers(id);

<<<<<<< HEAD
  // Increment views on open
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await supabase.rpc('increment_question_views', { qid: id });
      } catch {}
    })();
  }, [id]);

=======
>>>>>>> main
  // Fetch current user profile
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setCurrentUser(profile);
      }
    };
    fetchCurrentUser();
  }, []);

  const onPostAnswer = async () => {
    if (!q?.id || !answer.trim()) return;
    try {
      await createAnswer.mutateAsync({ questionId: q.id, body: answer.trim(), guestName: guestName.trim() || undefined });
      setAnswer("");
      setGuestName("");
    } catch (e) {
      // noop
    }
  };

  const onPostReply = async (answerId: string) => {
    if (!q?.id || !replyText.trim()) return;
    
    try {
      // Insert reply with parent_id
      const { data, error } = await supabase
        .from('community_answers')
        .insert({
          question_id: q.id,
          body: replyText.trim(),
          author_user_id: currentUser?.user_id || null,
          parent_id: answerId,
          status: 'published'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setReplyText("");
      setReplyingTo(null);
      
      // Refresh the answers data
      await refetch();
    } catch (e) {
      console.error('Error posting reply:', e);
    }
  };

  const handleReplyClick = (answerId: string) => {
    setReplyingTo(answerId);
    setReplyText("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-6 sm:py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-slate-600">
                <li>
                  <Link to="/" className="hover:text-violet-700 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mx-2 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to="/community" className="hover:text-violet-700 transition-colors">
                    Community
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mx-2 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-400">Loading...</span>
                </li>
              </ol>
            </nav>
            
            <div className="animate-pulse space-y-4">
              <div className="h-7 w-2/3 bg-slate-200 rounded" />
              <div className="h-4 w-1/3 bg-slate-100 rounded" />
              <div className="mt-6 h-28 w-full bg-slate-100 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-6 sm:py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-slate-600">
                <li>
                  <Link to="/" className="hover:text-violet-700 transition-colors">
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mx-2 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to="/community" className="hover:text-violet-700 transition-colors">
                    Community
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mx-2 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-400">Question Not Found</span>
                </li>
              </ol>
            </nav>
            
            <h1 className="text-2xl font-bold text-slate-900">Discussion not found</h1>
            <p className="mt-2 text-slate-600">The question you are looking for does not exist.</p>
            <div className="mt-6">
              <Link to="/community" className="text-violet-700 hover:underline">Back to Community</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-6 sm:py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs />

          <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            <section className="lg:col-span-8 space-y-4 sm:space-y-6">
              <article className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">{q?.title}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-slate-600">
                      <span className="bg-slate-100 px-2 py-1 rounded-full text-xs">
                        {q?.author?.role === 'admin' ? 'Wellness' : (q?.author?.role || 'patient')}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="break-words font-medium">{`${q?.author?.first_name || q?.guest_name || 'User'} ${q?.author?.last_name || ''}`.trim()}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs">Asked {q ? new Date(q.created_at).toLocaleString() : ''}</span>
                      {q?.topic?.title && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="rounded-full bg-violet-50 text-violet-700 px-2 py-1 border border-violet-200 text-xs">
                            {q.topic.title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-slate-800 leading-relaxed text-sm sm:text-base">{q?.body}</p>
            </article>

              {/* Answers Section */}
              {answersLoading && (
                <div className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 w-32 bg-slate-200 rounded" />
                    <div className="space-y-3">
                      <div className="h-20 bg-slate-100 rounded" />
                      <div className="h-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
              )}

              {!answersLoading && answersError && (
                <div className="rounded-xl sm:rounded-2xl border bg-red-50 p-4 sm:p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Error loading answers</h3>
                    <p className="text-red-700 text-sm">There was a problem loading the answers. Please try again.</p>
                    <div className="mt-2 text-xs text-red-600">
                      Debug: {answersError?.message || 'Unknown error'}
                    </div>
                  </div>
                </div>
              )}

              {!answersLoading && !answersError && answers.length > 0 && (
                <div className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Answers ({answers.length})</h2>
                  <div className="space-y-4">
                    {answers.map((answer) => (
                      <div key={answer.id} className="border-l-4 border-violet-200 pl-3 sm:pl-4 py-3">
                        <div className="flex items-start gap-3 mb-3">
                          {/* User Avatar/Initials */}
                          <div className="flex-shrink-0">
                            {answer.profiles?.avatar_url ? (
                              <img 
                                src={answer.profiles.avatar_url} 
                                alt="User avatar"
                                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-violet-100 flex items-center justify-center">
                                <span className="text-violet-700 font-semibold text-xs sm:text-sm">
                                  {answer.profiles?.first_name && answer.profiles?.last_name 
                                    ? `${answer.profiles.first_name[0]}${answer.profiles.last_name[0]}`
                                    : answer.guest_name 
                                      ? answer.guest_name.substring(0, 2).toUpperCase()
                                      : 'U'
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* User Info and Answer */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-slate-900 text-sm sm:text-base">
                                  {currentUser?.user_id === answer.author_user_id 
                                    ? 'You'
                                    : answer.profiles?.first_name && answer.profiles?.last_name 
                                      ? `${answer.profiles.first_name} ${answer.profiles.last_name}`
                                      : answer.guest_name || 'Anonymous User'
                                  }
                                </span>
                                
                                {/* Role Tag */}
                                {answer.profiles?.role && (
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                    answer.profiles.role === 'admin' 
                                      ? 'bg-violet-50 text-violet-700 border-violet-200'
                                      : answer.profiles.role === 'professional' 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-green-50 text-green-700 border-green-200'
                                  }`}>
                                    {answer.profiles.role === 'admin' ? 'Wellness' : 
                                     answer.profiles.role === 'professional' ? 'Professional' : 
                                     answer.profiles.role === 'patient' ? 'Patient' : 
                                     answer.profiles.role}
                                  </span>
                                )}
                                
                                {/* Professional Badge */}
                                {answer.is_professional && !answer.profiles?.role && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    Professional
                                  </span>
                                )}
                              </div>
                              
                              {/* Reply Tag - Upper Right */}
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full flex-shrink-0">
                                Answer
                              </span>
                            </div>
                            
                            <p className="text-slate-700 text-sm leading-relaxed mb-2">{answer.body}</p>
                            
                            {/* Nested Replies - Always Visible */}
                            {answer.replies && answer.replies.length > 0 && (
                              <div className="ml-3 sm:ml-6 mt-3 mb-3 space-y-3">
                                {answer.replies.map((reply) => (
                                  <div key={reply.id} className="bg-slate-50 rounded-lg p-3 border-l-4 border-blue-200">
                                    <div className="flex items-start gap-3">
                                      {/* Reply User Avatar/Initials */}
                                      <div className="flex-shrink-0">
                                        {reply.profiles?.avatar_url ? (
                                          <img 
                                            src={reply.profiles.avatar_url} 
                                            alt="User avatar"
                                            className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-blue-700 font-semibold text-xs">
                                              {reply.profiles?.first_name && reply.profiles?.last_name 
                                                ? `${reply.profiles.first_name[0]}${reply.profiles.last_name[0]}`
                                                : reply.guest_name 
                                                  ? reply.guest_name.substring(0, 2).toUpperCase()
                                                  : 'U'
                                              }
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Reply Content */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-slate-900 text-sm">
                                              {currentUser?.user_id === reply.author_user_id 
                                                ? 'You'
                                                : reply.profiles?.first_name && reply.profiles?.last_name 
                                                  ? `${reply.profiles.first_name} ${reply.profiles.last_name}`
                                                  : reply.guest_name || 'Anonymous User'
                                              }
                                            </span>
                                            
                                            {/* Reply Role Tag */}
                                            {reply.profiles?.role && (
                                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                                reply.profiles.role === 'admin' 
                                                  ? 'bg-violet-50 text-violet-700 border-violet-200'
                                                  : reply.profiles.role === 'professional' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : 'bg-green-50 text-green-700 border-green-200'
                                              }`}>
                                                {reply.profiles.role === 'admin' ? 'Wellness' : 
                                                 reply.profiles.role === 'professional' ? 'Professional' : 
                                                 reply.profiles.role === 'patient' ? 'Patient' : 
                                                 reply.profiles.role}
                                              </span>
                                            )}
                                          </div>
                                          
                                          {/* Reply Tag - Upper Right */}
                                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full flex-shrink-0">
                                            Reply
                                          </span>
                                        </div>
                                        
                                        <p className="text-slate-700 text-sm leading-relaxed mb-2">
                                          {reply.body}
                                        </p>
                                        
                                        {/* Reply Date */}
                                        <div className="text-right">
                                          <span className="text-xs text-slate-500">
                                            {new Date(reply.created_at).toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Reply Button */}
                            <div className="flex items-center justify-between mb-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs px-3 py-1 h-7 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                                onClick={() => handleReplyClick(answer.id)}
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Reply
                              </Button>
                            </div>

                            {/* Reply Form */}
                            {replyingTo === answer.id && (
                              <div className="bg-slate-50 rounded-lg p-3 mb-3 border-l-4 border-violet-300">
                                <div className="space-y-3">
                                  {/* User Info Display */}
                                  <div className="flex items-center gap-3">
                                    {/* User Avatar/Initials */}
                                    <div className="flex-shrink-0">
                                      {currentUser?.avatar_url ? (
                                        <img 
                                          src={currentUser.avatar_url} 
                                          alt="User avatar"
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                                          <span className="text-violet-700 font-semibold text-xs">
                                            {currentUser?.first_name && currentUser?.last_name 
                                              ? `${currentUser.first_name[0]}${currentUser.last_name[0]}`
                                              : 'U'
                                            }
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* User Info */}
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-slate-900 text-sm">
                                        {currentUser?.first_name && currentUser?.last_name 
                                          ? `${currentUser.first_name} ${currentUser.last_name}`
                                          : 'User'
                                        }
                                      </span>
                                      
                                      {/* Role Tag */}
                                      {currentUser?.role && (
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                          currentUser.role === 'admin' 
                                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                                            : currentUser.role === 'professional' 
                                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                                              : 'bg-green-50 text-green-700 border-green-200'
                                        }`}>
                                          {currentUser.role === 'admin' ? 'Wellness' : 
                                           currentUser.role === 'professional' ? 'Professional' : 
                                           currentUser.role === 'patient' ? 'Patient' : 
                                           currentUser.role}
                                        </span>
                                      )}
                                    </div>
            </div>

                                  <textarea
                                    rows={3}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write your reply..."
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                                  />
                                  
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      onClick={() => onPostReply(answer.id)}
                                      disabled={createAnswer.isPending}
                                      size="sm"
                                      className="px-3 py-1 h-8 text-xs"
                                    >
                                      {createAnswer.isPending ? (
                                        <span className="flex items-center">
                                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Sending...
                                        </span>
                                      ) : (
                                        <span className="flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                          </svg>
                                          Send
                                        </span>
                                      )}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={cancelReply}
                                      className="px-3 py-1 h-8 text-xs text-slate-600 hover:text-slate-800"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Date and Time - Bottom Right */}
                            <div className="text-right">
                              <span className="text-xs text-slate-500">
                                {new Date(answer.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Answers Section - Coming Soon */}
              {!answersLoading && !answersError && answers.length === 0 && (
                <div className="rounded-xl sm:rounded-2xl border bg-white p-6 sm:p-8 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 bg-violet-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 sm:w-8 h-6 sm:h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No answers yet</h3>
                    <p className="text-slate-600 mb-4 text-sm sm:text-base">Be the first to share your thoughts and help the community.</p>
                    <div className="text-sm text-slate-500">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </section>

            <aside className="lg:col-span-4 space-y-4 sm:space-y-6">
              <div className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Start the discussion</h2>
              </div>
              <div className="mt-4 space-y-3">
                <textarea
                    rows={3}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Write your answer..."
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                />
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                />
                <div className="flex justify-end">
                    <Button onClick={onPostAnswer} disabled={createAnswer.isPending}>
                    {createAnswer.isPending ? 'Posting…' : 'Post answer'}
                  </Button>
                </div>
              </div>
            </div>

              <div className="rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-slate-900">Related Discussions</h3>
                <div className="mt-3 space-y-3">
                  {relatedList.filter((x) => x.id !== id).length > 0 ? (
                    relatedList.filter((x) => x.id !== id).slice(0, 4).map((x) => (
                      <div key={x.id} className="border-l-2 border-violet-200 pl-3 py-2 hover:bg-slate-50 rounded-r-md transition-colors">
                        <Link 
                          to={`/community/question/${x.id}`}
                          className="block group"
                        >
                          <h4 className="font-medium text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-2 text-sm sm:text-base">
                            {x.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-1 sm:gap-2 text-xs text-slate-500">
                            <span>{x.author?.role === 'admin' ? 'Wellness' : (x.author?.role || 'User')}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{x.answer_count || 0} answers</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{new Date(x.created_at).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 text-sm">No other discussions in this topic yet</p>
                      <p className="text-slate-400 text-xs mt-1">Be the first to start a new discussion!</p>
                    </div>
                  )}
                </div>
                
                {/* Show current topic info */}
                {q?.topic && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Topic:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
                        {q.topic.title}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityQuestion;


