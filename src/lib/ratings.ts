// Simple localStorage-backed ratings aggregator

export type RatingsStore = Record<number, { sum: number; count: number }>;

const STORAGE_KEY = "wp_ratings_overrides_v1";

const readStore = (): RatingsStore => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? (parsed as RatingsStore) : {};
	} catch {
		return {};
	}
};

const writeStore = (store: RatingsStore) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	} catch {
		// ignore write errors
	}
};

export const addRating = (professionalId: number, value: number) => {
	if (!Number.isFinite(professionalId) || !Number.isFinite(value)) return;
	const store = readStore();
	const entry = store[professionalId] || { sum: 0, count: 0 };
	store[professionalId] = { sum: entry.sum + value, count: entry.count + 1 };
	writeStore(store);
};

export const getAggregated = (professionalId: number, baseRating: number, baseReviews: number) => {
	const store = readStore();
	const entry = store[professionalId];
	if (!entry) {
		return { rating: baseRating, reviews: baseReviews };
	}
	const newReviews = baseReviews + entry.count;
	const newRating = newReviews > 0 ? (baseRating * baseReviews + entry.sum) / newReviews : baseRating;
	return { rating: Math.round(newRating * 10) / 10, reviews: newReviews };
};

export const getUserRatings = () => readStore();


