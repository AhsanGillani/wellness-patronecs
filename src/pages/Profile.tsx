import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import avatar from "@/assets/avatar-1.jpg";
import { useState } from "react";
import { Upload } from "lucide-react";
import { parse, isToday, differenceInMinutes, addMinutes, format } from "date-fns";

const PatientTabs = () => {
	// Pull from the same upcomingAppointments mock as Overview for consistency
	const now = new Date();
	const todayLabel = format(now, "MMM dd, yyyy");
	const timeNowLabel = format(now, "h:mm a");
	const laterTodayLabel = format(addMinutes(now, 30), "h:mm a");
	const upcomingAppointments = [
		{ id: 1, title: "Dr. Jane Cooper", subtitle: "Cardiologist", date: todayLabel, time: timeNowLabel, status: "Confirmed", isLive: true },
		{ id: 2, title: "Alex Morgan", subtitle: "Nutritionist", date: todayLabel, time: laterTodayLabel, status: "Confirmed", isLive: false },
	];
	const [activeTab, setActiveTab] = useState<"appointments" | "visits">("appointments");
	const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
	const [rescheduleReason, setRescheduleReason] = useState("");
	const [rescheduleTime, setRescheduleTime] = useState("");

	return (
		<div>
			<div className="flex flex-wrap items-center gap-2 border-b px-4 pt-4">
				{([
					{ key: "appointments", label: "Bookings" },
					{ key: "visits", label: "Appointments" },
				] as const).map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						className={
							`rounded-md px-3 py-2 text-sm font-medium ` +
							(activeTab === tab.key
								? "bg-violet-600 text-white"
								: "text-slate-700 hover:bg-slate-50")
						}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className="p-4 sm:p-6">
				{activeTab === "appointments" && (
					<div className="space-y-3">
						<div className="text-sm text-slate-600">Your booked appointments</div>
						<div className="rounded-xl border p-4 space-y-3">
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium text-slate-900">{upcomingAppointments[0].title}</div>
									<div className="text-xs text-slate-600">Today • {upcomingAppointments[0].time}</div>
								</div>
								<div className="flex gap-2">
									{upcomingAppointments[0].isLive && (
										<a href={`/live-session/${upcomingAppointments[0].id}`}
											onClick={() => { try { sessionStorage.setItem(`live_session_prof_${upcomingAppointments[0].id}`, String(1)); } catch {} }}
											className="inline-flex items-center rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700">Join session</a>
									)}
									<Button size="sm" variant="secondary" onClick={() => setIsRescheduleOpen(true)}>Reschedule</Button>
								</div>
							</div>
							<div className="text-sm text-slate-700">Nutrition • Video call</div>
						</div>
						<div className="rounded-xl border p-4">
							<div className="text-sm text-slate-700">No other upcoming appointments.</div>
						</div>
					</div>
				)}

				{activeTab === "visits" && (
					<div className="space-y-3">
						<div className="text-sm text-slate-600">Your attended appointments</div>
						<div className="rounded-xl border p-4 space-y-2">
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium text-slate-900">Alex Morgan</div>
									<div className="text-xs text-slate-600">Mar 15, 2025 • 02:00 PM</div>
								</div>
								<div className="text-xs text-slate-600">Completed</div>
							</div>
							<div className="text-sm text-slate-700">Nutrition Follow-up • Video call</div>
						</div>
					</div>
				)}

				{isRescheduleOpen && (
					<div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
						<div className="w-full max-w-md rounded-xl bg-white p-4 sm:p-6 shadow-lg">
							<h3 className="text-lg font-semibold text-slate-900">Request reschedule</h3>
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
								<Button variant="secondary" onClick={() => setIsRescheduleOpen(false)}>Cancel</Button>
								<Button onClick={() => { setIsRescheduleOpen(false); setRescheduleReason(""); setRescheduleTime(""); }}>Submit</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const Profile = () => {
	const [activeSection, setActiveSection] = useState<"overview" | "bookings" | "account">("overview");
	const [profileImageUrl, setProfileImageUrl] = useState<string>(avatar);
	const [firstName, setFirstName] = useState("John");
	const [lastName, setLastName] = useState("Doe");
	const [email, setEmail] = useState("john@example.com");

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
	const todayLabel = format(now, "MMM dd, yyyy");
	const timeNowLabel = format(now, "h:mm a");
	const laterTodayLabel = format(addMinutes(now, 30), "h:mm a");

	const upcomingAppointments = [
		// Today, starting now (doctor has started session -> Join enabled)
		{ id: 1, title: "Dr. Jane Cooper", subtitle: "Cardiologist", date: todayLabel, time: timeNowLabel, status: "Confirmed", isLive: true },
		// Today, later (not live yet -> Join hidden until doctor starts)
		{ id: 2, title: "Alex Morgan", subtitle: "Nutritionist", date: todayLabel, time: laterTodayLabel, status: "Confirmed", isLive: false },
		// Future example
		{ id: 3, title: "Jamie Lee", subtitle: "Therapist", date: format(addMinutes(now, 60*24*3), "MMM dd, yyyy"), time: "11:00 AM", status: "Pending", isLive: false },
	];

	const getApptDateTime = (a: { date: string; time: string }) => {
		const d = parse(a.date, "MMM dd, yyyy", new Date());
		return parse(a.time, "h:mm a", d);
	};
	const todaysAppointments = upcomingAppointments.filter(a => isToday(parse(a.date, "MMM dd, yyyy", new Date())));
	const startedNow = todaysAppointments.filter(a => Math.abs(differenceInMinutes(getApptDateTime(a), now)) <= 5);

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
			<Header />

			<main className="py-10 sm:py-14">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-6 lg:gap-8">
					{/* Left: Profile summary + side nav */}
					<aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 order-2 lg:order-1">
						<div className="rounded-2xl border bg-white p-2">
							<nav className="grid">
								<a href="#overview" onClick={(e) => { e.preventDefault(); setActiveSection("overview"); }} className={`rounded-lg px-3 py-2 text-sm hover:bg-slate-50 ${activeSection === "overview" ? "text-slate-900 font-medium" : "text-slate-700"}`}>Overview</a>
								<a href="#bookings" onClick={(e) => { e.preventDefault(); setActiveSection("bookings"); }} className={`rounded-lg px-3 py-2 text-sm hover:bg-slate-50 ${activeSection === "bookings" ? "text-slate-900 font-medium" : "text-slate-700"}`}>Bookings</a>
								<a href="#account" onClick={(e) => { e.preventDefault(); setActiveSection("account"); }} className={`rounded-lg px-3 py-2 text-sm hover:bg-slate-50 ${activeSection === "account" ? "text-slate-900 font-medium" : "text-slate-700"}`}>Account</a>
								<a href="#logout" className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">Logout</a>
							</nav>
						</div>
						<div className="rounded-2xl border bg-white p-4 sm:p-6 text-center">
							<img src={profileImageUrl} alt="avatar" className="mx-auto h-24 w-24 rounded-full object-cover" />
							<h1 className="mt-3 text-xl font-semibold text-slate-900">{firstName} {lastName}</h1>
							<div className="text-sm text-slate-600">{email}</div>
							<div className="mt-4 grid grid-cols-3 gap-3 text-center">
								<div>
									<div className="text-base font-semibold text-slate-900">12</div>
									<div className="text-xs text-slate-600">Bookings</div>
								</div>
								<div>
									<div className="text-base font-semibold text-slate-900">5</div>
									<div className="text-xs text-slate-600">Reviews</div>
								</div>
								<div>
									<div className="text-base font-semibold text-slate-900">8</div>
									<div className="text-xs text-slate-600">Saved</div>
								</div>
							</div>
						</div>
					</aside>

					{/* Right: Overview, Bookings tab, Account */}
					<section className="lg:col-span-8 space-y-6 order-1 lg:order-2">
						{activeSection === "overview" && (
						<div id="overview" className="rounded-2xl border bg-white p-4 sm:p-6">
							<h2 className="text-lg font-semibold text-slate-900">Overview</h2>
							<p className="mt-2 text-slate-700">Welcome to your profile. Use the Bookings tab to view sessions you've booked with doctors. Keep your account details up to date.</p>
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
												<div className="grid gap-3 sm:grid-cols-2">
													{todaysAppointments.filter(a => !startedNow.some(s => s.id === a.id)).map(a => (
														<div key={a.id} className="rounded-lg border p-3">
															<div className="flex items-center justify-between">
																<div>
																	<div className="text-sm font-medium text-slate-900">{a.title}</div>
																	<div className="text-xs text-slate-600">Today • {a.time}</div>
																</div>
																{/* Join hidden until doctor starts */}
														</div>
														</div>
													))}
												</div>
											</div>
										)}
									</>
								) : (
									<div className="rounded-xl border p-4 text-sm text-slate-700">No meetings today.</div>
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
											<button onClick={() => setProfileImageUrl(avatar)} className="text-sm text-red-600 hover:underline">Remove</button>
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
									<input type="email" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" value={email} onChange={(e) => setEmail(e.target.value)} />
								</div>
								<div>
									<label className="text-sm font-medium text-slate-700">Phone</label>
									<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="(555) 000-0000" />
								</div>
							</div>
							<div className="mt-4 grid sm:grid-cols-2 gap-4">
								<div className="sm:col-span-2">
									<label className="text-sm font-medium text-slate-700">Address</label>
									<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="Street, City, Zip" />
								</div>
								<div className="sm:col-span-2">
									<label className="text-sm font-medium text-slate-700">Services interested in</label>
									<input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="e.g. Nutrition, Cardiology" />
								</div>
								<div className="sm:col-span-2">
									<label className="text-sm font-medium text-slate-700">Bio</label>
									<textarea rows={4} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="Tell us a little about yourself" />
								</div>
							</div>
							<div className="mt-4 flex gap-2">
								<Button variant="secondary" onClick={() => { setFirstName("John"); setLastName("Doe"); setEmail("john@example.com"); setProfileImageUrl(avatar); }}>Cancel</Button>
								<Button onClick={() => { /* bound to state; add API call here */ }}>Save changes</Button>
							</div>
						</div>
						)}
					</section>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default Profile;


