import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Video, Mic, MicOff, VideoOff, PhoneOff, Users, Send, Paperclip, Smile, Star, X, MonitorUp, MonitorX, Settings, Maximize2, Minimize2, MessageSquare, UsersRound } from "lucide-react";
import { addRating } from "@/lib/ratings";
import { addFeedback } from "@/lib/feedback";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAgora } from "@/hooks/useAgora";
import { fetchAgoraToken } from "@/lib/agora";
import { supabase } from "@/integrations/supabase/client";
import { simpleSupabase } from "@/lib/simple-supabase";

const LiveSession = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  // Agora wiring
  const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID as string;
  const channel = `appt_${id}`; // use appointment id as channel name
  const { joined, remoteUsers, join, leave, muteMic, muteCam, localVideoTrackRef, listCameras, listMicrophones, switchCamera, switchMic, startScreenShare, stopScreenShare, sharing, screenVideoTrackRef } = useAgora(AGORA_APP_ID);
  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [devices, setDevices] = useState<{ cams: MediaDeviceInfo[]; mics: MediaDeviceInfo[] }>({ cams: [], mics: [] });
  const [selectedCam, setSelectedCam] = useState<string | undefined>(undefined);
  const [selectedMic, setSelectedMic] = useState<string | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string>("");
  const [waitingNotice, setWaitingNotice] = useState<string | null>(null);
  const [joiningDots, setJoiningDots] = useState<number>(1);
  const applySettings = async () => {
    try {
      if (selectedCam) await switchCamera(selectedCam);
      if (selectedMic) await switchMic(selectedMic);
    } finally {
      setSettingsOpen(false);
    }
  };
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [serviceDurationSec, setServiceDurationSec] = useState<number | null>(null);
  const [showEndingSoon, setShowEndingSoon] = useState<boolean>(false);
  const [endingWarned, setEndingWarned] = useState<boolean>(false);
  const endingHandledRef = useRef<boolean>(false);
  const remoteEverJoinedRef = useRef<boolean>(false);
  const [endMessage, setEndMessage] = useState<string>("");
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await videoContainerRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch {}
  };
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  const [localPrimary, setLocalPrimary] = useState<boolean>(false); // click-to-swap big/small
  
  const [participantsOpen, setParticipantsOpen] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // Deterministic mapping from profile.id (uuid) -> Agora numeric uid (stable)
  const computeAgoraUid = (profileId: string): number => {
    let hash = 0;
    for (let i = 0; i < profileId.length; i++) {
      hash = (hash * 31 + profileId.charCodeAt(i)) | 0;
    }
    const positive = (hash >>> 0) % 2147483647;
    return positive === 0 ? 1 : positive;
  };

  // Map of Agora uid (string) -> display info
  const [uidToDisplay, setUidToDisplay] = useState<Record<string, { name: string; role?: string; avatar_url?: string }>>({});
  const [myAgoraUid, setMyAgoraUid] = useState<number | null>(null);

  const getRemoteDisplayName = (): string => {
    const first = remoteUsers[0];
    if (!first) return 'Remote';
    const info = uidToDisplay[String(first.uid)];
    return info?.name || `User ${String(first.uid)}`;
  };

  useEffect(() => {
    (async () => {
      // Load available devices for pre-join selection
      const cams = await listCameras();
      const mics = await listMicrophones();
      setDevices({ cams, mics });
      setSelectedCam(cams[0]?.deviceId);
      setSelectedMic(mics[0]?.deviceId);
    })();
    return () => {
      leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AGORA_APP_ID, channel]);

  // Gate access: only the booking patient can join; if invalid, show 404
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const { data, error } = await supabase
          .from('appointments')
          .select('patient_profile_id, date, start_time, appointment_status, service_id, services:services!appointments_service_id_fkey(name,duration_min, professionals:professionals!services_professional_id_fkey(profile_id))')
          .eq('id', Number(id))
          .maybeSingle();
        if (!error && data?.services?.name) {
          setServiceName(data.services.name as string);
        }
        // Access control (strict): only the booking patient may join
        const bookingPatientId = (data as any)?.patient_profile_id as string | undefined;
        const me = profile?.id;
        if (!me || !bookingPatientId || me !== bookingPatientId) {
          navigate(`/404?message=${encodeURIComponent("Sorry, you don't have any appointments. Please book one first.")}`, { replace: true });
          return;
        }
        const durMin = (data?.services as any)?.duration_min;
        if (typeof durMin === 'number' && durMin > 0) {
          setServiceDurationSec(Math.floor(durMin * 60));
        }
        // If appointment already past its window and still scheduled -> mark no_show
        try {
          const apptStatus = data?.appointment_status as string | undefined;
          const dateStr = data?.date as string | undefined;
          const startStr = data?.start_time as string | undefined;
          if (apptStatus === 'scheduled' && dateStr && startStr && typeof durMin === 'number') {
            const [h, m] = (startStr || '00:00').split(':').map((s: string) => parseInt(s, 10));
            const [Y, M, D] = dateStr.split('-').map((s: string) => parseInt(s, 10));
            const start = new Date(Y, (M - 1), D, h, m, 0, 0);
            const end = new Date(start.getTime() + durMin * 60 * 1000);
            if (Date.now() > end.getTime()) {
              await (simpleSupabase as any).from('appointments').update({ appointment_status: 'no_show' }).eq('id', Number(id));
            }
          }
        } catch {}
      } catch {}
    })();
  }, [id]);

  // Enforce auto-end based on service duration and show 2-minute warning
  useEffect(() => {
    if (!serviceDurationSec || sessionEnded) return;
    const remaining = serviceDurationSec - sessionTimer;
    if (!endingWarned && remaining <= 120 && remaining > 0) {
      setShowEndingSoon(true);
      setEndingWarned(true);
      window.setTimeout(() => setShowEndingSoon(false), 6000);
    }
    if (remaining <= 0 && !endingHandledRef.current) {
      endingHandledRef.current = true;
      (async () => {
        try {
          if (id) {
            const newStatus = remoteEverJoinedRef.current ? 'completed' : 'no_show';
            await (simpleSupabase as any)
              .from('appointments')
              .update({ appointment_status: newStatus })
              .eq('id', Number(id));
          }
        } finally {
          handleLeave();
        }
      })();
    }
  }, [sessionTimer, serviceDurationSec, sessionEnded]);

  // Track if we ever saw a remote participant in this session
  useEffect(() => {
    if (remoteUsers.length > 0) remoteEverJoinedRef.current = true;
  }, [remoteUsers.length]);

  // Auto mark no-show after 10 minutes if only one participant
  useEffect(() => {
    if (sessionEnded) return;
    if (!joined) return;
    const hasRemote = remoteUsers.length > 0;
    if (hasRemote) return;
    const timeout = window.setTimeout(async () => {
      let endMsg: string = 'Session ended due to the other participant not joining in time.';
      try {
        if (!id) return;
        // Mark appointment as no_show
        await (simpleSupabase as any)
          .from('appointments')
          .update({ appointment_status: 'no_show' })
          .eq('id', Number(id));
        // Notify the other participant (both roles for safety)
        const appt = await (simpleSupabase as any)
          .from('appointments')
          .select(`patient_profile_id, services:services!appointments_service_id_fkey(professionals:professionals!services_professional_id_fkey(profile_id), name)`) 
          .eq('id', Number(id))
          .maybeSingle();
        const patientProfileId = appt?.data?.patient_profile_id as string | null;
        const professionalProfileId = appt?.data?.services?.professionals?.profile_id as string | null;
        const svcName = appt?.data?.services?.name as string | null;
        const title = 'Appointment marked no-show';
        const currentProfileId = profile?.id;
        const presentIsPatient = currentProfileId && patientProfileId && currentProfileId === patientProfileId;
        if (presentIsPatient === true) endMsg = 'Session ended: the doctor did not join in time.';
        if (presentIsPatient === false) endMsg = 'Session ended: the patient did not join in time.';
        // Patient notification
        if (patientProfileId) {
          const bodyForPatient = presentIsPatient
            ? `The doctor didn't join your ${svcName || 'appointment'} in time.`
            : `You didn't join your ${svcName || 'appointment'} in time.`;
          await (simpleSupabase as any)
            .from('notifications')
            .insert({ recipient_profile_id: patientProfileId, recipient_role: null, title, body: bodyForPatient, link_url: '/profile?section=bookings&filter=no_show', data: { type: 'no_show', appointmentId: id } });
        }
        // Professional notification
        if (professionalProfileId) {
          const bodyForDoctor = presentIsPatient === true
            ? `You didn't join your ${svcName || 'appointment'} in time.`
            : `The patient didn't join your ${svcName || 'appointment'} in time.`;
          await (simpleSupabase as any)
            .from('notifications')
            .insert({ recipient_profile_id: professionalProfileId, recipient_role: null, title, body: bodyForDoctor, link_url: '/doctor-dashboard?tab=appointments&sub=completed', data: { type: 'no_show', appointmentId: id } });
        }
      } finally {
        setEndMessage(endMsg);
        handleLeave();
      }
    }, 10 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, [joined, remoteUsers.length, sessionEnded, id, profile?.id]);

  // Keep videos in sync; supports click-to-swap big/small containers
  useEffect(() => {
    const big = remoteVideoRef.current;    // main (large) container
    const small = localVideoRef.current;   // small overlay container
    if (!big || !small) return;

    const getLabel = (track: any): string | null => {
      try {
        if (!track) return null;
        const mediaTrack = track.getMediaStreamTrack?.();
        if (mediaTrack && typeof mediaTrack.label === 'string') return mediaTrack.label;
        const label = track.getTrackLabel?.();
        if (typeof label === 'string') return label;
      } catch {}
      return null;
    };

    const remoteScreen = remoteUsers.find(u => {
      const label = getLabel(u.videoTrack as any);
      return !!u.videoTrack && typeof label === 'string' && label.toLowerCase().includes('screen');
    });
    const remoteTrack = (remoteScreen?.videoTrack || remoteUsers[0]?.videoTrack) as any;
    const localTrack = (sharing && screenVideoTrackRef?.current) ? screenVideoTrackRef.current as any : localVideoTrackRef.current as any;

    try { big.innerHTML = ''; } catch {}
    try { small.innerHTML = ''; } catch {}

    if (localPrimary) {
      // Show local on big, remote on small
      if (localTrack) localTrack.play(big);
      if (remoteTrack) remoteTrack.play(small);
    } else {
      // Show remote on big, local on small
      if (remoteTrack) remoteTrack.play(big);
      if (localTrack) localTrack.play(small);
    }
  }, [remoteUsers, sharing, localPrimary]);

  // Waiting logic: if only one side joined for too long, notify and optionally end
  useEffect(() => {
    if (sessionEnded) return;
    const hasRemote = remoteUsers.length > 0;
    if (joined && !hasRemote) {
      const t = window.setTimeout(() => {
        setWaitingNotice('Waiting for the other participant to join…');
      }, 90_000); // 1.5 minutes
      return () => clearTimeout(t);
    } else {
      setWaitingNotice(null);
    }
  }, [joined, remoteUsers.length, sessionEnded]);

  // Show animated "Joining..." while waiting for the other participant after join
  useEffect(() => {
    if (sessionEnded) return;
    if (joined && remoteUsers.length === 0) {
      const iv = window.setInterval(() => setJoiningDots((n) => (n % 3) + 1), 500);
      return () => clearInterval(iv);
    }
  }, [joined, remoteUsers.length, sessionEnded]);
  
  const handleJoin = async () => {
    try {
      setConnecting(true);
      setConnectError("");
      if (!AGORA_APP_ID) {
        setConnectError('Missing VITE_AGORA_APP_ID in .env');
        setConnecting(false);
        return;
      }
      if (!id) {
        setConnectError('Missing appointment id in URL');
        setConnecting(false);
        return;
      }
      const uid = myAgoraUid ?? (profile?.id ? computeAgoraUid(String(profile.id)) : undefined);
      const token = await fetchAgoraToken(channel, uid);
      if (token === null) {
        setConnectError('Token fetch failed (500/CORS). Ensure AGORA_APP_ID/AGORA_APP_CERTIFICATE secrets are set and the function returns JSON.');
        setConnecting(false);
        return;
      }
      const { localVideoTrack } = await (join(channel, token, uid) || ({} as any));
      if (selectedCam) await switchCamera(selectedCam);
      if (selectedMic) await switchMic(selectedMic);
      if (localVideoTrack && localVideoRef.current) {
        localVideoTrack.play(localVideoRef.current);
      }
      setSettingsOpen(false);
      timerRef.current = window.setInterval(() => setSessionTimer((t) => t + 1), 1000) as unknown as number;
    } catch (e: any) {
      console.error('Join failed:', e);
      setConnectError(e?.message || 'Failed to join session. Please check token/App ID and permissions.');
    } finally {
      setConnecting(false);
    }
  };

  // Compute my Agora UID once profile is available
  useEffect(() => {
    if (profile?.id) {
      setMyAgoraUid(computeAgoraUid(String(profile.id)));
    }
  }, [profile?.id]);

  // Fetch appointment participants and build UID->display mapping
  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const { data: appt, error } = await supabase
          .from('appointments')
          .select(`
            id,
            patient_profile_id,
            services:services!appointments_service_id_fkey(
              professional_id,
              professionals:professionals!services_professional_id_fkey(
                profile_id
              )
            )
          `)
          .eq('id', Number(id))
          .single();
        if (error || !appt) return;

        const patientProfileId: string | null = appt.patient_profile_id ?? null;
        const professionalProfileId: string | null = appt?.services?.professionals?.profile_id ?? null;
        const ids = [patientProfileId, professionalProfileId].filter(Boolean) as string[];
        if (ids.length === 0) return;

        const { data: profs } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role, avatar_url')
          .in('id', ids);

        const mapping: Record<string, { name: string; role?: string; avatar_url?: string }> = {};
        (profs || []).forEach((p: any) => {
          const uidNum = computeAgoraUid(String(p.id));
          const uidKey = String(uidNum);
          const fullName = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Participant';
          mapping[uidKey] = { name: fullName, role: p.role || undefined, avatar_url: p.avatar_url || undefined };
        });
        setUidToDisplay(mapping);
      } catch (e) {
        // best-effort
      }
    })();
  }, [id]);

  const handleLeave = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSessionTimer(0);
    await leave();
    setSessionEnded(true);
    setShowFeedbackModal(true);
  };
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

  // Realtime chat via Supabase Realtime broadcast
  type ChatMessage = { id: string; senderId: string; senderName: string; text: string; time: string };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const chatChannelRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<Set<string>>(new Set());
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 0);
    }
  }, [chatOpen]);

  useEffect(() => {
    if (!id) return;
    try {
      const ch = supabase.channel(`live_chat_${id}`);
      chatChannelRef.current = ch;
      ch.on('broadcast', { event: 'message' }, (payload: any) => {
        const msg = payload?.payload as ChatMessage | undefined;
        if (!msg || !msg.text) return;
        // Ignore echoes of our own message (we already optimistically added)
        if (msg.senderId && profile?.id && msg.senderId === profile.id) return;
        // Basic de-duplication by id
        if (messagesRef.current.has(msg.id)) return;
        messagesRef.current.add(msg.id);
        setMessages(prev => [...prev, msg]);
      }).subscribe();
    } catch {}
    return () => { try { chatChannelRef.current?.unsubscribe(); } catch {}; chatChannelRef.current = null; };
  }, [id, profile?.id]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !id || !profile?.id) return;
    const senderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
    const msg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: profile.id,
      senderName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, msg]);
    setDraft("");
    try { await chatChannelRef.current?.send({ type: 'broadcast', event: 'message', payload: msg }); } catch {}
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
                {sessionEnded ? (
                  "Session Ended"
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>{serviceName || "Session"}</span>
                    <span className="text-[10px] leading-4 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Live session</span>
                  </span>
                )}
              </h1>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <span>Appointment ID: {id}</span>
                <span className="relative inline-flex h-2.5 w-2.5" title={joined ? 'Connected' : 'Not connected'} aria-label={joined ? 'Connected' : 'Not connected'}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${joined ? 'bg-emerald-400' : 'bg-rose-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${joined ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                </span>
              </p>
              {sessionEnded && (
                <p className="text-amber-600 text-sm mt-1">Please provide feedback to complete your session</p>
              )}
            </div>
            <div className="text-sm text-gray-700">Duration: {Math.floor(sessionTimer / 60).toString().padStart(2,'0')}:{(sessionTimer % 60).toString().padStart(2,'0')}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Video Area */}
            <div ref={videoContainerRef} className="lg:col-span-3 bg-black rounded-xl overflow-hidden relative h-[420px] sm:h-[480px] lg:h-[640px] xl:h-[720px]">
              {/* Device Settings / Pre-join Modal */}
              {settingsOpen && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                  <div className="bg-white rounded-xl w-full max-w-md mx-4 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-gray-900">Device Settings</div>
                      <button onClick={() => setSettingsOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
                    </div>
                    {connectError && !joined && (
                      <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-xs px-2 py-1 mb-3">{connectError}</div>
                    )}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Camera</label>
                        <select value={selectedCam} onChange={(e) => setSelectedCam(e.target.value)} className="w-full rounded-md border px-2 py-1 text-sm">
                          {devices.cams.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Microphone</label>
                        <select value={selectedMic} onChange={(e) => setSelectedMic(e.target.value)} className="w-full rounded-md border px-2 py-1 text-sm">
                          {devices.mics.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
                          ))}
                        </select>
                      </div>
                      {!joined ? (
                        <button onClick={handleJoin} disabled={connecting} className={`w-full mt-1 px-3 py-2 rounded-lg text-white text-sm ${connecting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                          {connecting ? 'Connecting…' : 'Join Session'}
                        </button>
                      ) : (
                        <button onClick={applySettings} className="w-full mt-1 px-3 py-2 rounded-lg text-white text-sm bg-blue-600 hover:bg-blue-700">Apply & Close</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Large Remote feed centered */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div ref={remoteVideoRef} className="w-full h-full" />
              </div>
              {/* Joining indicator when other party not yet connected */}
              {!sessionEnded && joined && remoteUsers.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-2 bg-black/40 text-white text-sm px-3 py-1 rounded-full">
                    <span className="relative inline-flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                    <span>Waiting for the other participant to join{'.'.repeat(joiningDots)}</span>
                  </div>
                </div>
              )}
              {/* Ending soon notice */}
              {!sessionEnded && showEndingSoon && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/90 text-white text-xs px-3 py-1 rounded-full shadow">
                  Session will end in 2 minutes
                </div>
              )}
              {!sessionEnded && waitingNotice && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-gray-800/80 text-white text-xs px-3 py-1 rounded-full shadow">
                  {waitingNotice}
                </div>
              )}
              
              {/* Session Ended Overlay */}
              {sessionEnded && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-4">📹</div>
                    <h3 className="text-xl font-semibold mb-2">Session Ended</h3>
                    <p className="text-sm opacity-80">{endMessage || 'Please provide feedback to complete your session'}</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur rounded-lg px-3 py-1 text-white text-xs">
                {localPrimary ? 'You' : getRemoteDisplayName()}
              </div>
              {/* Small overlay (click to swap) */}
              <div className="absolute top-4 right-4 w-40 h-28 lg:w-56 lg:h-36 bg-white/10 backdrop-blur rounded-md overflow-hidden cursor-pointer"
                   onClick={() => setLocalPrimary(prev => !prev)}
                   title="Swap views">
                <div ref={localVideoRef} className="w-full h-full" />
                <div className="absolute bottom-1 left-1 bg-white/20 rounded px-1.5 py-0.5 text-[10px] text-white">{localPrimary ? getRemoteDisplayName() : 'You'}</div>
              </div>

              {/* Controls overlay inside player */}
              {!sessionEnded && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full p-2">
                    <button onClick={() => setSettingsOpen(true)} className="px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 bg-gray-700 hover:opacity-90" title="Settings" aria-label="Settings">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => setChatOpen((v) => !v)} className={`px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 ${chatOpen ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90`} title={chatOpen ? 'Hide Chat' : 'Show Chat'} aria-label={chatOpen ? 'Hide Chat' : 'Show Chat'}>
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setParticipantsOpen((v) => !v)} className={`px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 ${participantsOpen ? 'bg-blue-600' : 'bg-gray-700'} hover:opacity-90`} title={participantsOpen ? 'Hide Participants' : 'Show Participants'} aria-label={participantsOpen ? 'Hide Participants' : 'Show Participants'}>
                      <UsersRound className="w-4 h-4" />
                    </button>
                    <button onClick={async () => { const next = !muted; setMuted(next); await muteMic(next); }} className={`px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 ${muted ? 'bg-gray-600' : 'bg-blue-600'} hover:opacity-90`} title={muted ? 'Unmute' : 'Mute'} aria-label={muted ? 'Unmute' : 'Mute'}>
                      {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button onClick={async () => { const next = !cameraOff; setCameraOff(next); await muteCam(next); }} className={`px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 ${cameraOff ? 'bg-gray-600' : 'bg-blue-600'} hover:opacity-90`} title={cameraOff ? 'Start Camera' : 'Stop Camera'} aria-label={cameraOff ? 'Start Camera' : 'Stop Camera'}>
                      {cameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                    <button onClick={toggleFullscreen} className="px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 bg-gray-700 hover:opacity-90" title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    {!sharing ? (
                      <button onClick={startScreenShare} className="px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 bg-purple-600 hover:bg-purple-700" title="Share Screen" aria-label="Share Screen">
                        <MonitorUp className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={stopScreenShare} className="px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 bg-purple-600 hover:bg-purple-700" title="Stop Share" aria-label="Stop Share">
                        <MonitorX className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={handleLeave} className="px-3 py-2 rounded-full text-white text-sm flex items-center gap-2 bg-rose-600 hover:bg-rose-700" title="End Session" aria-label="End Session">
                      <PhoneOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-4">
              {(participantsOpen || remoteUsers.length > 0) && (
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Participants</h3>
                  <span className="text-xs text-gray-500">{remoteUsers.length + 1}</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="relative">
                      <img src={profile?.avatar_url || doctorImageUrl} alt="You" className="w-9 h-9 rounded-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">You</div>
                      <div className="text-[11px] inline-flex px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 mt-0.5">{profile?.role || 'Doctor/Patient'}</div>
                    </div>
                  </li>
                  {remoteUsers.map(u => {
                    const info = uidToDisplay[String(u.uid)];
                    const displayName = info?.name || `User ${String(u.uid)}`;
                    const displayRole = info?.role || 'Connected';
                    const avatarSrc = info?.avatar_url || ((displayRole === 'professional' || displayRole === 'doctor') ? doctorImageUrl : patientImageUrl);
                    return (
                    <li key={String(u.uid)} className="flex items-center gap-3">
                        <div className="relative">
                          <img src={avatarSrc} alt={displayName} className="w-9 h-9 rounded-full object-cover" />
                        </div>
                      <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{displayName}</div>
                          <div className="text-[11px] inline-flex px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 mt-0.5">{displayRole}</div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              </div>
              )}

              {chatOpen && (
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Chat</h3>
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <div className="h-56 bg-gray-50 border rounded p-3 overflow-y-auto space-y-2">
                  {messages.map(m => {
                    const mine = m.senderId === profile?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                          <div className={`mb-1 text-[11px] ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
                            <span>{mine ? 'You' : m.senderName}</span>
                            <span className={`ml-2 ${mine ? 'text-blue-100' : 'text-gray-400'}`}>• {m.time}</span>
                          </div>
                        <div>{m.text}</div>
                        </div>
                      </div>
                    );
                  })}
                  {messages.length === 0 && (
                    <div className="text-xs text-gray-500">No messages</div>
                  )}
                  <div ref={messagesEndRef} />
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
                      ref={chatInputRef}
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none focus:ring-0 text-sm"
                      placeholder="Type a message..."
                    />
                  </div>
                  <button onClick={handleSend} className="shrink-0 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-2">
                    <Send className="w-4 h-4" /> <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
              )}
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
