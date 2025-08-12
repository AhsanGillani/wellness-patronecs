import { useEffect } from "react";
import SiteHero from "@/components/site/SiteHero";
import ServiceCategories from "@/components/site/ServiceCategories";
import CommunityQA from "@/components/site/CommunityQA";
import Testimonials from "@/components/site/Testimonials";
import BookingSection from "@/components/site/BookingSection";
import ArticlesGrid from "@/components/site/ArticlesGrid";
import SiteFooter from "@/components/site/SiteFooter";

const Index = () => {
  useEffect(() => {
    document.title = "Wellness Platform | Connect with Health Professionals";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Book trusted doctors, nutritionists, psychologists and more. Wellness services, Q&A, articles, and tips.");

    // JSON-LD structured data (WebSite)
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Wellness Platform",
      url: window.location.origin,
      potentialAction: {
        "@type": "SearchAction",
        target: `${window.location.origin}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <main>
      <SiteHero />
      <ServiceCategories />
      <CommunityQA />
      <Testimonials />
      <BookingSection />
      <ArticlesGrid />
      <SiteFooter />
    </main>
  );
};

export default Index;
