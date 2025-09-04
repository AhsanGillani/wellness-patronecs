import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useProfessionals, useServices } from "@/hooks/useMarketplace";

const labelMap: Record<string, string> = {
  community: "Community",
  topic: "Topic",
  question: "Question",
  blogs: "Blogs",
  services: "Services",
  service: "Service",
  professionals: "Professionals",
  professional: "Professional",
  events: "Events",
  event: "Event",
  contact: "Contact",
  auth: "Auth",
  login: "Login",
  signup: "Sign up",
  profile: "Profile",
  notifications: "Notifications",
  admin: "Admin",
  doctor: "Doctor",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const { pathname } = location;
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>(
    {}
  );
  const lastPathnameRef = useRef<string>("");

  // Fetch data for dynamic labels
  const { data: professionals = [] } = useProfessionals();
  const { data: services = [] } = useServices();

  useEffect(() => {
    if (pathname === "/") return;

    // Only update if pathname has changed
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;

    const segments = pathname.split("/").filter(Boolean);
    const newDynamicLabels: Record<string, string> = {};

    segments.forEach((segment, index) => {
      const previousSegment = index > 0 ? segments[index - 1] : null;

      // Handle services
      if (
        previousSegment === "services" &&
        services &&
        !isNaN(Number(segment))
      ) {
        const service = services.find(
          (s: { id: string; name: string }) => String(s.id) === segment
        );
        if (service) {
          newDynamicLabels[segment] = service.name;
        }
      }

      // Handle professionals
      if (
        previousSegment === "professional" &&
        professionals &&
        !isNaN(Number(segment))
      ) {
        const prof = professionals.find(
          (p: { id: string; first_name?: string; last_name?: string }) =>
            String(p.id) === segment
        );
        if (prof) {
          const fullName = `${prof.first_name ?? ""} ${
            prof.last_name ?? ""
          }`.trim();
          newDynamicLabels[segment] = fullName || "Professional";
        }
      }

      // Handle community questions (topic/question structure)
      if (previousSegment === "community" && segments.length > 2) {
        // Potential place to enhance with topic names
      }
    });

    setDynamicLabels(newDynamicLabels);
  }, [pathname, professionals, services]);

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const paths = segments.map((seg, idx) => {
    const url = "/" + segments.slice(0, idx + 1).join("/");

    // Check if we have a dynamic label for this segment
    const dynamicLabel = dynamicLabels[seg];

    // If we have a dynamic label (for slugs or IDs), use it
    if (dynamicLabel) {
      return { label: dynamicLabel, url };
    }

    // Otherwise, use the standard label mapping
    const label = labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    return { label, url };
  });

  return (
    <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-slate-600">
        <li>
          <Link to="/" className="hover:text-violet-700 transition-colors">
            Home
          </Link>
        </li>
        {paths.map((p, i) => (
          <li key={p.url} className="flex items-center">
            <svg
              className="w-4 h-4 mx-2 text-slate-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {i < paths.length - 1 ? (
              <Link
                to={p.url}
                className="hover:text-violet-700 transition-colors"
              >
                {p.label}
              </Link>
            ) : (
              <span
                className="text-slate-900 font-medium line-clamp-1"
                title={p.label}
              >
                {p.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
