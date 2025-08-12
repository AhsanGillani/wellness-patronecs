import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const links = [
  { label: "Services", href: "#services" },
  { label: "Q&A", href: "#community-qa" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Articles", href: "#tips-articles" },
];

const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur glass">
      <nav className="container mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main">
        <a href="#" aria-label="Home" className="font-semibold text-lg">Wellness Platform</a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <a className="text-muted-foreground hover:text-foreground transition-colors" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Button asChild size="sm" className="hover-scale">
            <a href="#booking">Book Now</a>
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-6 space-y-4">
                <a href="#" className="block font-semibold">Wellness Platform</a>
                <nav className="grid gap-3" aria-label="Mobile">
                  {links.map((l) => (
                    <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {l.label}
                    </a>
                  ))}
                </nav>
                <Button asChild className="w-full mt-4">
                  <a href="#booking">Book Now</a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
