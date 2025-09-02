import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import avatar from "@/assets/avatar-1.jpg";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Upload } from "lucide-react";
import { parse, isToday, differenceInMinutes, addMinutes, format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PatientTabs = () => {
	const { profile } = useAuth();
	const { toast } = useToast();
	const now = new Date();
	const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
	const [rescheduleReason, setRescheduleReason] = useState("");
	const [rescheduleTime, setRescheduleTime] = useState("");
	const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
	const [submittingReschedule, setSubmittingReschedule] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [allBookings, setAllBookings] = useState<any[]>([]);
	const [filter, setFilter] = useState<'upcoming' | 'completed' | 'no_show' | 'all'>('upcoming');
	const bookingsLocation = useLocation();
	const [showServiceModal, setShowServiceModal] = useState(false);
	const [serviceDetails, setServiceDetails] = useState<any | null>(null);
	const [serviceBooking, setServiceBooking] = useState<any | null>(null);
	const [isRefundOpen, setIsRefundOpen] = useState(false);
	const [refundReason, setRefundReason] = useState("");
	const [refundBooking, setRefundBooking] = useState<any | null>(null);

	// Preselect filter from query param
	useEffect(() => {
		try {
			const params = new URLSearchParams(bookingsLocation.search);
			const qp = params.get('filter');
			if (qp && (['upcoming','completed','no_show','all'] as const).includes(qp as any)) {
				setFilter(qp as any);
			}
		} catch {}
	}, [bookingsLocation.search]);

	const buildDateTime = (dateStr?: string | null, timeStr?: string | null) => {
		if (!dateStr || !timeStr) return null;
		const [year, month, day] = String(dateStr).split("-").map(Number);
		const [hour, minute] = String(timeStr).split(":").map(Number);
		if (!year || !month || !day || hour === undefined || minute === undefined) return null;
		return new Date(year, month - 1, day, hour, minute, 0, 0);
	};

	const openServiceDetails = async (serviceId: number, booking?: any) => {
		try {
			const { data, error } = await supabase
				.from('services')
				.select('id,name,description,duration_min,mode,price_cents,image_url')
				.eq('id', serviceId)
				.maybeSingle();
			if (error) throw error;
			setServiceDetails(data);
			setServiceBooking(booking || null);
			setShowServiceModal(true);
		} catch (e: any) {
			toast({ title: 'Failed to load', description: e?.message || 'Unable to load service details' });
		}
	};

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				setLoading(true);
				setError(null);
				if (!profile?.id) {
					setAllBookings([]);
					return;
				}

				const { data, error } = await supabase
					.from('appointments')
					.select(`
						id,
						date,
						start_time,
						end_time,
						mode,
						appointment_status,
						service_id,
						services!appointments_service_id_fkey(
							name,
							professional_id,
							professionals!services_professional_id_fkey(
								profile_id
							)
						)
					`)
					.eq('patient_profile_id', profile.id)
					.order('date', { ascending: false })
					.order('start_time', { ascending: false });

				if (error) throw error;

				// Load pending reschedule requests for this patient
				const { data: pendingReqs } = await supabase
					.from('reschedule_requests')
					.select('appointment_id,status')
					.eq('patient_profile_id', profile.id)
					.eq('status', 'pending');
				const pendingSet = new Set<number>((pendingReqs || []).map((r: any) => r.appointment_id));

				// Load refund request statuses for this patient (latest per appointment)
				const { data: refundRows } = await supabase
					.from('refund_requests')
					.select('appointment_id,status,created_at')
					.eq('patient_profile_id', profile.id)
					.order('created_at', { ascending: false });
				const refundStatusByAppt = new Map<number, string>();
				(refundRows || []).forEach((row: any) => {
					const aid = Number(row.appointment_id);
					if (!refundStatusByAppt.has(aid)) refundStatusByAppt.set(aid, String(row.status));
				});

				const mapped = (data || []).map((appt: any) => ({
					id: appt.id,
					title: appt.services?.name || 'Service',
					subtitle: appt.mode ? `${String(appt.mode).charAt(0).toUpperCase()}${String(appt.mode).slice(1)} call` : 'Session',
					date: appt.date,
					time: appt.start_time,
					endTime: appt.end_time,
					professionalId: appt.services?.professional_id || null,
					professionalProfileId: appt.services?.professionals?.profile_id || null,
					serviceId: appt.service_id,
					status: appt.appointment_status || 'scheduled',
					reschedulePending: pendingSet.has(appt.id),
					refundPending: refundStatusByAppt.get(appt.id) === 'pending',
					refundStatus: refundStatusByAppt.get(appt.id) || null,
					isLive: appt.appointment_status === 'in_progress',
					isPast: (() => { const dt = buildDateTime(appt.date, appt.start_time); return dt ? dt.getTime() < now.getTime() : false; })()
				}));

				setAllBookings(mapped);
			} catch (e: any) {
				console.error('Failed to load appointments', e);
				setError(e?.message || 'Failed to load appointments');
				setAllBookings([]);
			} finally {
				setLoading(false);
			}
		};

		fetchAppointments();
	}, [profile?.id]);

	const formatDisplayDate = (dateStr?: string | null) => {
		if (!dateStr) return '';
		try {
			const [y, m, d] = String(dateStr).split("-").map(Number);
			return format(new Date(y, m - 1, d), "MMM dd, yyyy");
		} catch {
			return String(dateStr);
		}
	};

	const StatusBadge = ({ status, pending }: { status?: string; pending?: boolean }) => {
		if (pending) {
			return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-amber-100 text-amber-700`}>Pending approval</span>;
		}
		const s = (status || '').toLowerCase();
		const cls = s === 'completed' ? 'bg-emerald-100 text-emerald-700'
			: s === 'cancelled' ? 'bg-rose-100 text-rose-700'
			: s === 'in_progress' ? 'bg-blue-100 text-blue-700'
			: 'bg-amber-100 text-amber-700';
		const label = s.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
		return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>{label || 'Scheduled'}</span>;
	};

	return (
		<div>
			<div className="border-b px-4 pt-4">
				<h3 className="text-sm font-medium text-slate-900">Bookings</h3>
			</div>

			<div className="p-4 sm:p-6">
					<div className="space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="text-sm text-slate-600">Your booked services</div>
						<div className="flex items-center gap-1 bg-slate-50 border rounded-lg p-1">
							{([
								{ key: 'upcoming', label: 'Upcoming' },
								{ key: 'completed', label: 'Completed' },
								{ key: 'no_show', label: 'Missed' },
								{ key: 'all', label: 'All' },
							] as const).map(t => (
								<button key={t.key} onClick={() => setFilter(t.key)} className={`px-2.5 py-1 text-xs rounded-md ${filter === t.key ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-white'}`}>{t.label}</button>
							))}
						</div>
					</div>
					{loading ? (
						<div className="rounded-xl border p-4 text-sm text-slate-600">Loading...</div>
					) : error ? (
						<div className="rounded-xl border p-4 text-sm text-rose-600">{error}</div>
					) : allBookings.length > 0 ? (
						<div className="grid gap-3 lg:grid-cols-1">
							{allBookings
								.filter((item) => {
									if (filter === 'all') return true;
									if (filter === 'upcoming') return (item.status === 'scheduled' || item.status === 'in_progress');
									return item.status === filter;
								})
								.map((item) => (
									<div key={item.id} className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow-md transition">
										<div className="flex items-center gap-3">
											<div className="h-9 w-9 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
											</div>
											<div className="min-w-0 flex-1">
												<button onClick={() => openServiceDetails(item.serviceId, item)} className="block truncate font-semibold text-slate-900 hover:underline text-left">{item.title}</button>
												<div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
													<span>{item.subtitle}</span>
													<span className="text-slate-400">•</span>
													<span>{formatDisplayDate(item.date)} {(() => { const dt = buildDateTime(item.date, item.time); return dt ? `• ${format(dt, 'hh:mm a')}` : `• ${item.time}`; })()}</span>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<StatusBadge status={item.status} pending={item.reschedulePending} />
												{item.isLive && (
													<a href={`/live-session/${item.id}`}
														onClick={() => { try { sessionStorage.setItem(`live_session_prof_${item.id}`, String(1)); } catch {} }}
														className="inline-flex items-center rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700">Join</a>
												)}
												{item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'no_show' && !item.reschedulePending && !item.refundPending && !item.refundStatus && (
													<Button size="sm" variant="secondary" onClick={() => { setSelectedBooking(item); setIsRescheduleOpen(true); }}>Reschedule</Button>
												)}
												{item.reschedulePending && (
													<span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">Reschedule requested</span>
												)}
												{item.status === 'no_show' && !item.reschedulePending && (
													!item.refundPending && !item.refundStatus ? <Button size="sm" variant="secondary" onClick={async () => {
														try {
															const professionalProfileId = item.professionalProfileId;
															if (!professionalProfileId) { toast({ title: 'Unavailable', description: 'Professional not linked to this service.' }); return; }
															await supabase.from('refund_requests').insert({
																appointment_id: item.id,
																patient_profile_id: profile.id,
																professional_profile_id: professionalProfileId,
																reason: 'No-show by professional'
															});
															await supabase.from('notifications').insert({
																recipient_profile_id: professionalProfileId,
																recipient_role: 'professional',
																title: 'Refund requested',
																body: `${item.title} on ${formatDisplayDate(item.date)} – patient requested a refund`,
																link_url: '/doctor-dashboard?tab=refunds',
																data: { type: 'refund_request', appointmentId: item.id }
															});
															toast({ title: 'Requested', description: 'Refund request sent to the doctor for review.' });
															setAllBookings(prev => prev.map(b => b.id === item.id ? { ...b, refundPending: true, refundStatus: 'pending' } : b));
														} catch (e: any) {
															toast({ title: 'Failed', description: e?.message || 'Could not submit refund request' });
														}
													}}>Request refund</Button> : <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-xs">Refund requested</span>
												)}
												{item.status === 'no_show' && item.refundStatus === 'approved' && (
													<span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs">Refund approved</span>
												)}
												{item.status === 'no_show' && item.refundStatus === 'rejected' && (
													<span className="inline-flex items-center rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-xs">Refund rejected</span>
												)}
											</div>
										</div>
									</div>
								))}
						</div>
					) : (
						<div className="rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-slate-500">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 9.75h18M4.5 7.5h15A1.5 1.5 0 0 1 21 9v9.75A1.5 1.5 0 0 1 19.5 20.25H4.5A1.5 1.5 0 0 1 3 18.75V9A1.5 1.5 0 0 1 4.5 7.5Zm3 6h3m-3 3h6" />
								</svg>
							</div>
							<h4 className="text-sm font-semibold text-slate-900">No meetings today</h4>
							<p className="mt-1 text-sm text-slate-600">You're all caught up. Explore services or check your bookings.</p>
							<div className="mt-4 flex justify-center gap-2">
								<a href="/services" className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700">Browse services</a>
								<a href="#bookings" onClick={(e) => { e.preventDefault(); setActiveSection("bookings"); }} className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">View bookings</a>
							</div>
						</div>
					)}
					</div>
				{isRescheduleOpen && (
					<div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
						<div className="w-full max-w-md rounded-xl bg-white p-4 sm:p-6 shadow-lg">
							<h3 className="text-lg font-semibold text-slate-900">Request reschedule</h3>
							{selectedBooking && (
								<div className="mt-2 rounded-md border bg-slate-50 p-3 text-sm text-slate-700">
									<div className="font-medium text-slate-900">{selectedBooking.title}</div>
									{(() => {
										try {
											const [y,m,d] = String(selectedBooking.date).split('-').map(Number);
											const dt = new Date(y, m - 1, d);
											const [hh,mm] = String(selectedBooking.time || '').split(':').map(Number);
											const dtTime = new Date(y, m - 1, d, isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm);
											const weekday = dt.toLocaleDateString(undefined, { weekday: 'short' });
											const pretty = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
											const timePretty = format(dtTime, 'hh:mm a');
											return <div className="text-xs text-slate-600">Current: {weekday}, {pretty} • {timePretty}</div>;
										} catch { return <div className="text-xs text-slate-600">Current: {selectedBooking.date} • {selectedBooking.time}</div>; }
									})()}
								</div>
							)}
							<div className="mt-4 space-y-3">
								<div>
									<label className="text-sm font-medium text-slate-700">Reason</label>
									<textarea rows={3} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} placeholder="Please describe your reason" />
								</div>
								<div>
									<label className="text-sm font-medium text-slate-700">Preferred new time</label>
									<input type="datetime-local" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
								</div>
							</div>
							<div className="mt-4 flex justify-end gap-2">
								<Button variant="secondary" onClick={() => { setIsRescheduleOpen(false); setSelectedBooking(null); }}>Cancel</Button>
								<Button onClick={async () => {
									if (!selectedBooking) return;
									if (!rescheduleTime) { toast({ title: 'Select time', description: 'Please choose a preferred new time.' }); return; }
									try {
										setSubmittingReschedule(true);
										// Parse requested datetime
										const req = new Date(rescheduleTime);
										const reqDate = `${req.getFullYear()}-${String(req.getMonth()+1).padStart(2,'0')}-${String(req.getDate()).padStart(2,'0')}`;
										const reqStart = `${String(req.getHours()).padStart(2,'0')}:${String(req.getMinutes()).padStart(2,'0')}:00`;
										// Compute duration from current booking
										const [sh, sm] = String(selectedBooking.time || '00:00').split(':').map(Number);
										const [eh, em] = String(selectedBooking.endTime || '00:00').split(':').map(Number);
										const curMin = (eh*60+em) - (sh*60+sm);
										const dur = Number.isFinite(curMin) && curMin > 0 ? curMin : 30;
										const reqEndDate = new Date(req);
										reqEndDate.setMinutes(reqEndDate.getMinutes() + dur);
										const reqEnd = `${String(reqEndDate.getHours()).padStart(2,'0')}:${String(reqEndDate.getMinutes()).padStart(2,'0')}:00`;

										// Normalize times to HH:MM:SS (avoid double ":00")
										const toHms = (t: string) => {
											if (!t) return '00:00:00';
											const parts = t.split(':');
											if (parts.length >= 3) {
												return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:${parts[2].padStart(2,'0')}`;
											}
											if (parts.length === 2) {
												return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:00`;
											}
											return '00:00:00';
										};

										let professionalProfileId = selectedBooking.professionalProfileId;
										if (!professionalProfileId && selectedBooking.serviceId) {
											const { data: svc, error: svcErr } = await supabase
												.from('services')
												.select('professionals!services_professional_id_fkey(profile_id)')
												.eq('id', selectedBooking.serviceId)
												.maybeSingle();
											if (!svcErr) {
												professionalProfileId = (svc as any)?.professionals?.profile_id || null;
											}
										}
										if (!professionalProfileId) {
											toast({ title: 'Unable to submit', description: 'Missing professional profile. Please try again later.' });
											setSubmittingReschedule(false);
											return;
										}

										const payload = {
											appointment_id: selectedBooking.id,
											patient_profile_id: profile?.id,
											professional_profile_id: professionalProfileId,
											current_appointment_date: selectedBooking.date,
											current_appointment_start_time: toHms(String(selectedBooking.time || '00:00')), 
											current_appointment_end_time: toHms(String(selectedBooking.endTime || selectedBooking.time || '00:00')),
											requested_appointment_date: reqDate,
											requested_appointment_start_time: toHms(reqStart),
											requested_appointment_end_time: toHms(reqEnd),
											reason: rescheduleReason || 'Not specified',
											status: 'pending'
										};
										console.log('Submitting reschedule request payload:', payload);

										const { error } = await supabase.from('reschedule_requests').insert(payload);
										if (error) { 
											console.error('Reschedule insert error:', error);
											toast({ title: 'Failed', description: `${error.message || 'Bad Request'}${error.details ? ` • ${error.details}` : ''}${error.hint ? ` • ${error.hint}` : ''}` }); 
										}
										else { 
											toast({ title: 'Request sent', description: 'We have sent your reschedule request.' });
											// Optimistically flag the booking as pending approval
											setAllBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, reschedulePending: true } : b));
											// Notify the professional who owns this service
											try {
												await supabase.from('notifications').insert({
													recipient_profile_id: professionalProfileId,
													recipient_role: 'professional',
													title: 'New reschedule request',
													body: 'A patient requested to reschedule an appointment.'
												});
											} catch {}
										}
									} finally {
										setSubmittingReschedule(false);
										setIsRescheduleOpen(false); setRescheduleReason(""); setRescheduleTime(""); setSelectedBooking(null);
									}
								}} disabled={submittingReschedule}>Submit</Button>
							</div>
						</div>
					</div>
				)}

				{showServiceModal && serviceDetails && (
					<div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
						<div className="w-full max-w-lg rounded-2xl bg-white shadow-lg overflow-hidden">
							<div className="p-5 border-b">
								<h3 className="text-lg font-semibold text-slate-900">{serviceDetails.name}</h3>
							</div>
							<div className="p-5 space-y-3">
								{serviceDetails.image_url && (<img src={serviceDetails.image_url} alt={serviceDetails.name} className="w-full h-40 object-cover rounded" />)}
								<div className="text-sm text-slate-700">{serviceDetails.description || 'No description provided.'}</div>
								<div className="flex flex-wrap gap-2 text-xs text-slate-600">
									<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">{serviceDetails.duration_min} min</span>
									<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">{serviceDetails.mode}</span>
									{typeof serviceDetails.price_cents === 'number' && (
										<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">${(serviceDetails.price_cents/100).toFixed(2)}</span>
									)}
								</div>
								{serviceBooking && (
									<div className="mt-2 rounded border p-3 bg-slate-50">
										<div className="text-xs font-medium text-slate-900 mb-1">Booked</div>
										<div className="text-xs text-slate-700">
											{(() => { 
												try {
													const [y,m,d] = String(serviceBooking.date).split('-').map(Number);
													const dt = new Date(y, m-1, d);
													const pretty = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
													return `${pretty} • ${serviceBooking.time}`;
												} catch { return `${serviceBooking.date} • ${serviceBooking.time}`; }
											})()}
											<span className="ml-2">• {serviceBooking.subtitle}</span>
										</div>
										<div className="mt-1">
											<StatusBadge status={serviceBooking.status} pending={serviceBooking.reschedulePending} />
										</div>
									</div>
								)}
							</div>
							<div className="p-4 border-t text-right">
								<Button variant="secondary" onClick={() => { setShowServiceModal(false); setServiceDetails(null); }}>Close</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const Profile = () => {
	const { profile } = useAuth();
	const { toast } = useToast();
	const [activeSection, setActiveSection] = useState<"overview" | "bookings" | "account">("overview");
	const profileLocation = useLocation();

	// Preselect section from query param, e.g., ?section=bookings
	useEffect(() => {
		try {
			const params = new URLSearchParams(profileLocation.search);
			const sec = params.get('section');
			if (sec === 'bookings' || sec === 'overview' || sec === 'account') {
				setActiveSection(sec as any);
			}
		} catch {}
	}, [profileLocation.search]);
	const [profileImageUrl, setProfileImageUrl] = useState<string>(avatar);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [location, setLocation] = useState("");
	const [bio, setBio] = useState("");
	const [healthGoals, setHealthGoals] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [bookingsCount, setBookingsCount] = useState<number>(0);
	const [reviewsCount, setReviewsCount] = useState<number>(0);
	const [savedCount, setSavedCount] = useState<number>(0);
	const [saving, setSaving] = useState<boolean>(false);
	const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);
	const [startedNow, setStartedNow] = useState<any[]>([]);

	const readFileAsDataUrl = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	};

	const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		if (file.size > 2.5 * 1024 * 1024) {
			alert("Please select an image smaller than 2.5MB");
			return;
		}
		try {
			const dataUrl = await readFileAsDataUrl(file);
			setProfileImageUrl(dataUrl);
		} catch (err) {
			console.error(err);
		}
	};

	const now = new Date();

	useEffect(() => {
		const fetchToday = async () => {
			try {
				if (!profile?.id) { setTodaysAppointments([]); setStartedNow([]); return; }
				const yyyy = now.getFullYear();
				const mm = String(now.getMonth() + 1).padStart(2, '0');
				const dd = String(now.getDate()).padStart(2, '0');
				const todayStr = `${yyyy}-${mm}-${dd}`;
				const { data, error } = await supabase
					.from('appointments')
					.select(`id, date, start_time, appointment_status, services!appointments_service_id_fkey(name)`) 
					.eq('patient_profile_id', profile.id)
					.eq('date', todayStr)
					.order('start_time', { ascending: true });
				if (error) throw error;
				const list = (data || []).map((a: any) => ({
					id: a.id,
					title: a.services?.name || 'Appointment',
					time: a.start_time,
					date: a.date,
					isLive: a.appointment_status === 'in_progress'
				}));
				setTodaysAppointments(list);
				const started = list.filter((x) => {
					if (x.isLive) return true;
					const [h, m] = String(x.time || '').split(':').map(Number);
					if (Number.isNaN(h) || Number.isNaN(m)) return false;
					const scheduled = new Date(yyyy, Number(mm) - 1, Number(dd), h, m, 0, 0);
					return Math.abs(differenceInMinutes(scheduled, now)) <= 5;
				});
				setStartedNow(started);
			} catch (e) {
				setTodaysAppointments([]);
				setStartedNow([]);
			}
		};
		fetchToday();
	}, [profile?.id]);

	// Listen for reschedule request rejections and notify/show toast
	useEffect(() => {
		if (!profile?.id) return;
		const channel = supabase
			.channel('reschedule-updates')
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reschedule_requests', filter: `patient_profile_id=eq.${profile.id}` }, async (payload) => {
			try {
				const next = (payload as any)?.new;
				if (next?.status === 'rejected') {
					toast({ title: 'Reschedule rejected', description: 'Your reschedule request was declined.' });
					// Create a notification for the patient
					await supabase.from('notifications').insert({
						recipient_profile_id: profile.id,
						recipient_role: 'patient',
						title: 'Reschedule request rejected',
						body: 'Your reschedule request was rejected. Please pick another time.'
					});
				} else if (next?.status === 'approved') {
					// Apply the new schedule to the appointment
					const apptId = next.appointment_id;
					const update = {
						date: next.requested_appointment_date,
						start_time: next.requested_appointment_start_time,
						end_time: next.requested_appointment_end_time,
					};
					const { error: updErr } = await supabase.from('appointments').update(update).eq('id', apptId);
					if (!updErr) {
						// Update UI row
						setAllBookings(prev => prev.map(b => b.id === apptId ? { ...b, date: update.date, time: String(update.start_time).slice(0,5), endTime: String(update.end_time).slice(0,5), reschedulePending: false } : b));
						toast({ title: 'Reschedule approved', description: 'Your appointment has been moved to the approved time.' });
						// Notify the patient
						await supabase.from('notifications').insert({
							recipient_profile_id: profile.id,
							recipient_role: 'patient',
							title: 'Reschedule approved',
							body: 'Your appointment has been rescheduled successfully.'
						});
					}
				}
			} catch {}
		});
		channel.subscribe();
		return () => { try { channel.unsubscribe(); } catch {} };
	}, [profile?.id, toast]);

	// Listen for refund request status updates
	useEffect(() => {
		if (!profile?.id) return;
		const channel = supabase
			.channel('refund-updates')
			.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'refund_requests', filter: `patient_profile_id=eq.${profile.id}` }, async (payload) => {
				try {
					const next = (payload as any)?.new;
					const apptId = Number(next?.appointment_id);
					const status = String(next?.status || 'pending');
					setAllBookings(prev => prev.map(b => b.id === apptId ? { ...b, refundPending: status === 'pending', refundStatus: status } : b));
					if (status === 'approved') {
						toast({ title: 'Refund approved', description: 'Your refund has been approved.' });
					} else if (status === 'rejected') {
						toast({ title: 'Refund rejected', description: 'Your refund request was rejected.' });
					}
				} catch {}
			});
		channel.subscribe();
		return () => { try { channel.unsubscribe(); } catch {} };
	}, [profile?.id, toast]);

	// Load real bookings count for logged-in patient
	useEffect(() => {
		const loadCounts = async () => {
			try {
				if (!profile?.id) { setBookingsCount(0); return; }
				const { count, error } = await supabase
					.from('appointments')
					.select('id', { count: 'exact', head: true })
					.eq('patient_profile_id', profile.id);
				if (error) throw error;
				setBookingsCount(count || 0);
			} catch (e) {
				setBookingsCount(0);
			}
		};
		loadCounts();
	}, [profile?.id]);

	// Hydrate fields from profile
	useEffect(() => {
		if (!profile) return;
		setFirstName(profile.first_name || "");
		setLastName(profile.last_name || "");
		setEmail(profile.email || "");
		setProfileImageUrl(profile.avatar_url || avatar);
		setPhone((profile as any).phone || "");
		setLocation((profile as any).location || "");
		setBio((profile as any).bio || "");
		setHealthGoals(((profile as any).health_goals as string) || "");
		setDateOfBirth(((profile as any).date_of_birth as string) || "");
	}, [profile]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
			<Header />

			<main className="py-10 sm:py-14">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 lg:gap-8">
					{/* Main Content first on mobile */}
					<section className="lg:col-span-8 space-y-6 order-1">
						{/* Top Tabs Bar */}
						<div className="rounded-2xl border bg-white p-2">
							<div className="flex flex-wrap items-center gap-2">
								<button onClick={() => setActiveSection("overview")} className={`rounded-md px-3 py-2 text-sm font-medium ${activeSection === 'overview' ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Overview</button>
								<button onClick={() => setActiveSection("bookings")} className={`rounded-md px-3 py-2 text-sm font-medium ${activeSection === 'bookings' ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Bookings</button>
								<button onClick={() => setActiveSection("account")} className={`rounded-md px-3 py-2 text-sm font-medium ${activeSection === 'account' ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>Account</button>
							</div>
						</div>

						{activeSection === "overview" && (
						<div id="overview" className="rounded-2xl border bg-white p-4 sm:p-6">
							<h2 className="text-lg sm:text-xl font-semibold text-slate-900">Overview</h2>
							<p className="mt-2 text-slate-700">Welcome to your profile. Track your sessions and manage your account details easily. Use Bookings to review your services.</p>
							<div className="mt-4 space-y-4">
								{todaysAppointments.length > 0 ? (
									<>
										{/* Happening now */}
										{startedNow.length > 0 && (
											<div className="rounded-xl border p-4">
												<div className="mb-2 flex items-center justify-between">
													<h4 className="text-sm font-semibold text-slate-900">Happening now</h4>
													<span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Live</span>
												</div>
												<div className="grid gap-3 sm:grid-cols-2">
													{startedNow.map(a => (
														<div key={a.id} className="rounded-lg border p-3">
															<div className="flex items-center justify-between">
																<div>
																	<div className="text-sm font-medium text-slate-900">{a.title}</div>
																	<div className="text-xs text-slate-600">Today • {a.time}</div>
																</div>
																<a href={`/live-session/${a.id}`} className="inline-flex items-center rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700">Join session</a>
															</div>
														</div>
													))}
												</div>
											</div>
										)}

										{/* Today's appointments (excluding happening now) */}
										{todaysAppointments.filter(a => !startedNow.some(s => s.id === a.id)).length > 0 && (
											<div className="rounded-xl border p-4">
												<div className="mb-2 flex items-center justify-between">
													<h4 className="text-sm font-semibold text-slate-900">Today's appointments</h4>
													<div className="text-xs text-slate-600">You have <span className="font-medium text-slate-900">{todaysAppointments.length}</span> today</div>
												</div>
												<div className="grid gap-3 sm:grid-cols-1">
													{todaysAppointments.filter(a => !startedNow.some(s => s.id === a.id)).map(a => (
														<div key={a.id} className="rounded-lg border p-3">
															<div className="flex items-center justify-between">
																<div>
																	<div className="text-sm font-medium text-slate-900">{a.title}</div>
																	<div className="text-xs text-slate-600">Today • {a.time}</div>
																</div>
														</div>
														</div>
													))}
												</div>
											</div>
										)}
									</>
								) : (
									<div className="rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
										<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 9.75h18M4.5 7.5h15A1.5 1.5 0 0 1 21 9v9.75A1.5 1.5 0 0 1 19.5 20.25H4.5A1.5 1.5 0 0 1 3 18.75V9A1.5 1.5 0 0 1 4.5 7.5Zm3 6h3m-3 3h6" /></svg>
										</div>
										<h4 className="text-sm font-semibold text-slate-900">No meetings today</h4>
										<p className="mt-1 text-sm text-slate-600">You're all caught up. Explore services or check your bookings.</p>
										<div className="mt-4 flex justify-center gap-2">
											<a href="/services" className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700">Browse services</a>
											<a href="#bookings" onClick={(e) => { e.preventDefault(); setActiveSection("bookings"); }} className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">View bookings</a>
										</div>
									</div>
								)}
							</div>
						</div>
						)}

						{/* Patient tabs */}
						{activeSection === "bookings" && (
						<div id="bookings" className="rounded-2xl border bg-white p-0 overflow-hidden">
							<PatientTabs />
						</div>
						)}

						{activeSection === "account" && (
						<div id="account" className="rounded-2xl border bg-white p-4 sm:p-6">
							<h2 className="text-lg font-semibold text-slate-900">Account</h2>
							<div className="mt-4">
								<label className="text-sm font-medium text-slate-700">Profile image</label>
								<div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center">
									{profileImageUrl ? (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<img src={profileImageUrl} alt="profile" className="w-16 h-16 rounded object-cover" />
												<div className="text-left">
													<p className="text-sm font-medium text-slate-900">Preview</p>
													<p className="text-xs text-slate-500">PNG/JPG up to 2.5MB</p>
												</div>
											</div>
											<button onClick={() => setProfileImageUrl("")} className="text-sm text-red-600 hover:underline">Remove</button>
										</div>
									) : (
										<label className="flex flex-col items-center justify-center cursor-pointer">
											<Upload className="w-6 h-6 text-slate-500" />
											<span className="text-sm text-slate-700">Click to upload</span>
											<span className="text-xs text-slate-500">PNG/JPG up to 2.5MB</span>
											<input type="file" accept="image/*" className="hidden" onChange={handleAvatarSelected} />
										</label>
									)}
								</div>
							</div>
							<div className="mt-4 grid sm:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-slate-700">First name</label>
									<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
								</div>
								<div>
									<label className="text-sm font-medium text-slate-700">Last name</label>
									<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" value={lastName} onChange={(e) => setLastName(e.target.value)} />
								</div>
								<div>
									<label className="text-sm font-medium text-slate-700">Email</label>
									<input type="email" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-600" value={email} readOnly />
								</div>
								<div>
									<label className="text-sm font-medium text-slate-700">Phone</label>
									<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
								</div>
							</div>
							<div className="mt-4 grid sm:grid-cols-2 gap-4">
								<div className="sm:col-span-2">
									<label className="text-sm font-medium text-slate-700">Location</label>
									<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="e.g. Lahore, Punjab" value={location} onChange={(e) => setLocation(e.target.value)} />
									</div>
								<div className="sm:col-span-2">
									<label className="text-sm font-medium text-slate-700">Bio</label>
									<textarea rows={4} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="Tell us about yourself, health background, preferences" value={bio} onChange={(e) => setBio(e.target.value)} />
								</div>
								<div className="sm:col-span-2">
									<label className="text-sm font-medium text-slate-700">Health Goals</label>
									<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="e.g. Weight loss, Cardio fitness" value={healthGoals} onChange={(e) => setHealthGoals(e.target.value)} />
								</div>
							</div>
							<div className="mt-4 grid sm:grid-cols-2 gap-4">
								<div>
									<label className="text-sm font-medium text-slate-700">Date of Birth</label>
									<input type="date" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
								</div>
							</div>
							<div className="mt-4 flex gap-2">
								<Button variant="secondary" onClick={() => { if (!profile) return; setFirstName(profile.first_name || ""); setLastName(profile.last_name || ""); setEmail(profile.email || ""); setProfileImageUrl(profile.avatar_url || avatar); setPhone((profile as any).phone || ""); setLocation((profile as any).location || ""); setBio((profile as any).bio || ""); setHealthGoals(((profile as any).health_goals as string) || ""); setDateOfBirth(((profile as any).date_of_birth as string) || ""); }}>Cancel</Button>
								<Button onClick={async () => { try { if (!profile?.id) return; const updates: any = { first_name: firstName || null, last_name: lastName || null, avatar_url: profileImageUrl || null, email: email || null, phone: phone || null, location: location || null, date_of_birth: dateOfBirth || null, bio: bio || null, health_goals: healthGoals || null, }; const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id); if (error) { alert('Failed to save changes: ' + error.message); return; } alert('Profile updated'); } catch (e) { alert('Unexpected error'); } }}>Save changes</Button>
							</div>
						</div>
						)}
					</section>

					{/* Sidebar second on mobile */}
					<aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 order-2">
						<div className="rounded-2xl border bg-white p-4 sm:p-6 text-center">
							<img src={profileImageUrl} alt="avatar" className="mx-auto h-24 w-24 rounded-full object-cover" />
							<h1 className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900">{firstName} {lastName}</h1>
							<div className="text-sm text-slate-600 break-all">{email}</div>
							<div className="mt-4 grid grid-cols-3 gap-3 text-center">
								<div>
									<div className="text-base sm:text-lg font-semibold text-slate-900">{bookingsCount}</div>
									<div className="text-xs text-slate-600">Bookings</div>
								</div>
								<div>
									<div className="text-base sm:text-lg font-semibold text-slate-900">{reviewsCount}</div>
									<div className="text-xs text-slate-600">Reviews</div>
								</div>
								<div>
									<div className="text-base sm:text-lg font-semibold text-slate-900">{savedCount}</div>
									<div className="text-xs text-slate-600">Saved</div>
								</div>
							</div>
						</div>
					</aside>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Profile;


