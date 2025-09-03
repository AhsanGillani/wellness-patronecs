export function formatTime12h(raw: string): string {
  try {
    if (!raw) return raw;
    const parts = raw.split(":");
    const hour = parseInt(parts[0] || "", 10);
    const minute = parseInt(parts[1] || "0", 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return raw;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour % 12) || 12);
    const mm = String(minute).padStart(2, "0");
    return `${displayHour}:${mm} ${ampm}`;
  } catch {
    return raw;
  }
}


