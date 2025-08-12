import heroImage from "@/assets/hero-wellness.jpg";
import { Button } from "@/components/ui/button";

const SiteHero = () => {
  return (
    <header className="relative w-full overflow-hidden">
      <section
        className="relative min-h-[72vh] grid place-items-center bg-hero-gradient"
        aria-label="Wellness Platform Hero"
      >
        <img
          src={heroImage}
          alt="Calming wellness scene with soft pastels"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          loading="eager"
        />
        <div className="absolute inset-0 bg-hero-gradient" aria-hidden="true" />

        <div className="relative z-10 container mx-auto px-6 py-24 text-center animate-enter">
          <h1 className="mx-auto max-w-3xl text-4xl md:text-6xl font-bold tracking-tight">
            Connect with trusted health professionals
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl text-muted-foreground">
            Book doctors, nutritionists, psychologists and fitness experts. Your path to better health starts here.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="hero" size="lg" className="hover-scale">
              Book an Appointment
            </Button>
            <Button variant="outline" size="lg" className="hover-scale">
              Explore Services
            </Button>
          </div>
        </div>

        {/* Signature ambient blob */}
        <div
          className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, hsla(160,60%,55%,0.25), transparent)" }}
          aria-hidden="true"
        />
      </section>
    </header>
  );
};

export default SiteHero;
