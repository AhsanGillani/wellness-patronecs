import { Facebook, Instagram, Twitter } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="mt-20 border-t">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-semibold">Wellness Platform</h3>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Connecting you with trusted health professionals and empowering your wellbeing journey.
          </p>
        </div>
        <nav aria-label="Footer Navigation" className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">Explore</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a className="hover:text-foreground" href="#services">Services</a></li>
              <li><a className="hover:text-foreground" href="#">Q&A</a></li>
              <li><a className="hover:text-foreground" href="#tips-articles">Articles</a></li>
              <li><a className="hover:text-foreground" href="#booking">Booking</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Company</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a className="hover:text-foreground" href="#">About</a></li>
              <li><a className="hover:text-foreground" href="#">Contact</a></li>
              <li><a className="hover:text-foreground" href="#">Privacy</a></li>
              <li><a className="hover:text-foreground" href="#">Terms</a></li>
            </ul>
          </div>
        </nav>
        <div>
          <p className="text-sm font-medium mb-2">Contact</p>
          <p className="text-sm text-muted-foreground">support@wellness.example</p>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter /></a>
            <a href="#" aria-label="Facebook" className="hover:text-foreground"><Facebook /></a>
            <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram /></a>
          </div>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Wellness Platform. All rights reserved.
      </div>
    </footer>
  );
};

export default SiteFooter;
