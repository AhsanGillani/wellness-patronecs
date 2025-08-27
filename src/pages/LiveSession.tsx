import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Video, Mic, MicOff, VideoOff, PhoneOff, Users, Send, Paperclip, Smile, Star, X } from "lucide-react";
import { addRating } from "@/lib/ratings";
import { addFeedback } from "@/lib/feedback";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const LiveSession = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 0,
    feedbackText: "",
    sessionQuality: {
      videoQuality: 5,
      audioQuality: 5,
      connectionStability: 5,
      doctorProfessionalism: 5,
      overallExperience: 5
    },
    wouldRecommend: true,
    additionalComments: ""
  });

  // Placeholder images: Patient (large), Doctor (small)
  const patientImageUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop";
  const doctorImageUrl = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop";

  // Sidebar: improved participants
  const participants = [
    {
      id: "doctor",
      name: profile ? `Dr. ${profile.first_name} ${profile.last_name}` : "Dr. Sarah Wilson",
      role: profile?.specialization || profile?.profession || "Doctor",
      avatar: profile?.avatar_url || doctorImageUrl,
      online: true
    },
    {
      id: "patient",
      name: "Live Patient",
      role: "Patient",
      avatar: patientImageUrl,
      online: true
    }
  ];

  // Mock chat messages and input
  type ChatMessage = { id: string; sender: "Doctor" | "Patient"; text: string; time: string };
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", sender: "Patient", text: "Hello doctor!", time: "09:58" },
    { id: "m2", sender: "Doctor", text: "Hi! How are you feeling today?", time: "10:00" }
  ]);
  const [draft, setDraft] = useState("");
  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const next: ChatMessage = {
      id: `m${Date.now()}`,
      sender: "Doctor",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, next]);
    setDraft("");
  };

  const handleEndSession = () => {
    setSessionEnded(true);
    setShowFeedbackModal(true);
  };

  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleQualityChange = (metric: keyof typeof feedback.sessionQuality, value: number) => {
    setFeedback(prev => ({
      ...prev,
      sessionQuality: {
        ...prev.sessionQuality,
        [metric]: value
      }
    }));
  };

  const handleFeedbackSubmit = () => {
    // Validate required fields
    if (feedback.rating === 0) {
      alert("Please provide an overall rating before submitting.");
      return;
    }
    
    // Here you would typically send the feedback to your backend
    console.log("Feedback submitted:", feedback);
    // Persist rating to local overrides, if we can infer professional id
    const apptId = Number(id);
    // Prefer profId from query params; fallback to sessionStorage mapping
    const params = new URLSearchParams(location.search);
    const profIdFromQuery = params.get("profId");
    const profIdRaw = profIdFromQuery ?? sessionStorage.getItem(`live_session_prof_${apptId}`);
    const profId = profIdRaw ? Number(profIdRaw) : NaN;
    if (Number.isFinite(profId)) {
      addRating(profId, feedback.rating);
      addFeedback(profId, {
        id: `fb_${Date.now()}`,
        appointmentId: apptId,
        patientName: profile ? `${profile.first_name} ${profile.last_name}` : "You", // Use profile name if available
        createdAt: new Date().toISOString(),
        rating: feedback.rating,
        feedbackText: feedback.feedbackText,
        additionalComments: feedback.additionalComments,
        wouldRecommend: feedback.wouldRecommend,
        sessionQuality: feedback.sessionQuality
      });
    }
    
    // Show success message and redirect
    alert("Thank you for your feedback! Your session has ended.");
    navigate(-1);
  };

  const handleSkipFeedback = () => {
    setShowFeedbackModal(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Header />
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sessionEnded ? "Session Ended" : "Live Session"}
              </h1>
              <p className="text-gray-600 text-sm">Appointment ID: {id}</p>
              {sessionEnded && (
                <p className="text-amber-600 text-sm mt-1">Please provide feedback to complete your session</p>
              )}
            </div>
            {!sessionEnded && (
              <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:text-blue-700">Back</button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Video Area */}
            <div className="lg:col-span-3 bg-black rounded-xl overflow-hidden relative h-[420px] sm:h-[480px] lg:h-[640px] xl:h-[720px]">
              {/* Large Patient feed centered */}
              <div className="absolute inset-0 flex items-center justify-center">
                {!cameraOff ? (
                  <img src={patientImageUrl} alt="Patient" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-white/80 text-sm">Camera is off</div>
                )}
              </div>
              
              {/* Session Ended Overlay */}
              {sessionEnded && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-4">📹</div>
                    <h3 className="text-xl font-semibold mb-2">Session Ended</h3>
                    <p className="text-sm opacity-80">Please provide feedback to complete your session</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur rounded-lg px-3 py-1 text-white text-xs">
                Patient
              </div>
              {/* Small Doctor feed */}
              <div className="absolute top-4 right-4 w-40 h-28 lg:w-56 lg:h-36 bg-white/10 backdrop-blur rounded-md overflow-hidden">
                {!cameraOff ? (
                  <img src={doctorImageUrl} alt="Doctor" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/80 text-xs">Camera off</div>
                )}
                <div className="absolute bottom-1 left-1 bg-white/20 rounded px-1.5 py-0.5 text-[10px] text-white">Doctor</div>
              </div>

              {/* Controls overlay inside player */}
              {!sessionEnded && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full p-2">
                    <button onClick={() => setMuted(m => !m)} className={`px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 ${muted ? 'bg-gray-600' : 'bg-blue-600'} hover:opacity-90`}>
                      {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />} <span className="hidden sm:inline">{muted ? 'Unmute' : 'Mute'}</span>
                    </button>
                    <button onClick={() => setCameraOff(c => !c)} className={`px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 ${cameraOff ? 'bg-gray-600' : 'bg-blue-600'} hover:opacity-90`}>
                      {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />} <span className="hidden sm:inline">{cameraOff ? 'Start Camera' : 'Stop Camera'}</span>
                    </button>
                    <button onClick={handleEndSession} className="px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 bg-rose-600 hover:bg-rose-700">
                      <PhoneOff className="w-4 h-4" /> <span className="hidden sm:inline">End Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Participants</h3>
                  <span className="text-xs text-gray-500">{participants.length}</span>
                </div>
                <ul className="space-y-3">
                  {participants.map(p => (
                    <li key={p.id} className="flex items-center gap-3">
                      <div className="relative">
                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover" />
                        {p.online && <span className="absolute -bottom-0 -right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                        <div className="text-[11px] inline-flex px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 mt-0.5">{p.role}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Chat</h3>
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div className="h-56 bg-gray-50 border rounded p-3 overflow-y-auto space-y-2">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'Doctor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.sender === 'Doctor' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                        <div>{m.text}</div>
                        <div className={`mt-1 text-[10px] ${m.sender === 'Doctor' ? 'text-blue-100' : 'text-gray-500'}`}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-xs text-gray-500">No messages</div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0 border rounded-lg px-2 py-1 bg-white">
                    <button className="p-2 rounded-md text-gray-500 hover:bg-gray-50" title="Attach">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-md text-gray-500 hover:bg-gray-50" title="Emoji">
                      <Smile className="w-4 h-4" />
                    </button>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none focus:ring-0 text-sm"
                      placeholder="Type a message..."
                    />
                  </div>
                  <button onClick={handleSend} className="shrink-0 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-2">
                    <Send className="w-4 h-4" /> <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900">Session Feedback</h2>
                <button 
                  onClick={handleSkipFeedback} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (feedback.rating > 0 ? 20 : 0) + 
                      (feedback.feedbackText ? 20 : 0) + 
                      (feedback.additionalComments ? 20 : 0) + 
                      (feedback.wouldRecommend !== undefined ? 20 : 0) + 
                      (Object.values(feedback.sessionQuality).some(v => v !== 5) ? 20 : 0))}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {feedback.rating === 0 ? "Start by rating your session" : "Almost done! Complete the remaining fields"}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Overall Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Overall Session Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          feedback.rating >= star 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        <Star className={`w-8 h-8 ${feedback.rating >= star ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {feedback.rating === 0 && "Click to rate your session"}
                    {feedback.rating === 1 && "Poor"}
                    {feedback.rating === 2 && "Fair"}
                    {feedback.rating === 3 && "Good"}
                    {feedback.rating === 4 && "Very Good"}
                    {feedback.rating === 5 && "Excellent"}
                  </p>
                </div>

                {/* Session Quality Metrics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Session Quality</label>
                  <div className="space-y-4">
                    {Object.entries(feedback.sessionQuality).map(([metric, value]) => (
                      <div key={metric} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {metric.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-8 text-right">{value}/5</span>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={value}
                            onChange={(e) => handleQualityChange(metric as keyof typeof feedback.sessionQuality, parseInt(e.target.value))}
                            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Would Recommend */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Would you recommend this doctor?</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recommend"
                        checked={feedback.wouldRecommend}
                        onChange={() => setFeedback(prev => ({ ...prev, wouldRecommend: true }))}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Yes, definitely</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recommend"
                        checked={!feedback.wouldRecommend}
                        onChange={() => setFeedback(prev => ({ ...prev, wouldRecommend: false }))}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">No, not really</span>
                    </label>
                  </div>
                </div>

                {/* General Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What went well in this session?</label>
                  <textarea
                    value={feedback.feedbackText}
                    onChange={(e) => setFeedback(prev => ({ ...prev, feedbackText: e.target.value }))}
                    placeholder="Share what you liked about the session, what was helpful, or any positive aspects..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Additional Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments (Optional)</label>
                  <textarea
                    value={feedback.additionalComments}
                    onChange={(e) => setFeedback(prev => ({ ...prev, additionalComments: e.target.value }))}
                    placeholder="Any other feedback, suggestions for improvement, or additional thoughts..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleSkipFeedback}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Skip Feedback
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={feedback.rating === 0}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default LiveSession;
