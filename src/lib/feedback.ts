export type SessionQuality = {
	videoQuality: number;
	audioQuality: number;
	connectionStability: number;
	doctorProfessionalism: number;
	overallExperience: number;
};

export type FeedbackEntry = {
	id: string; // unique id
	appointmentId?: number;
	patientName?: string;
	createdAt: string; // ISO timestamp
	rating: number; // 1-5
	feedbackText?: string;
	additionalComments?: string;
	wouldRecommend?: boolean;
	sessionQuality?: SessionQuality;
};

const keyFor = (profId: number) => `wp_feedback_prof_${profId}`;

export const addFeedback = (profId: number, entry: FeedbackEntry) => {
	try {
		const raw = localStorage.getItem(keyFor(profId));
		const list: FeedbackEntry[] = raw ? JSON.parse(raw) : [];
		list.unshift(entry);
		localStorage.setItem(keyFor(profId), JSON.stringify(list));
	} catch {
		// ignore
	}
};

export const getFeedback = (profId: number): FeedbackEntry[] => {
	try {
		const raw = localStorage.getItem(keyFor(profId));
		return raw ? (JSON.parse(raw) as FeedbackEntry[]) : [];
	} catch {
		return [];
	}
};


