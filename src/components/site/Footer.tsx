const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-violet-600" />
              <span className="font-semibold text-slate-900">Wellness</span>
            </div>
            <p className="mt-3 text-sm text-slate-600 max-w-xs">
              Connecting you with trusted professionals, curated content, and community support for better health.
            </p>
            <div className="mt-4 flex items-center gap-3 text-slate-500">
              <a aria-label="Twitter" href="#" className="hover:text-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.162 5.656c-.793.352-1.644.59-2.54.697a4.418 4.418 0 0 0 1.938-2.437 8.83 8.83 0 0 1-2.8 1.07 4.41 4.41 0 0 0-7.513 4.022 12.511 12.511 0 0 1-9.08-4.604 4.409 4.409 0 0 0 1.366 5.882 4.39 4.39 0 0 1-1.998-.552v.056a4.41 4.41 0 0 0 3.538 4.323 4.43 4.43 0 0 1-1.992.076 4.412 4.412 0 0 0 4.118 3.061A8.842 8.842 0 0 1 2 19.54a12.473 12.473 0 0 0 6.756 1.98c8.107 0 12.543-6.717 12.543-12.543 0-.191-.004-.382-.013-.571a8.963 8.963 0 0 0 2.204-2.287z"/></svg>
              </a>
              <a aria-label="LinkedIn" href="#" className="hover:text-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zm7.5 0h3.8v2.1h.1c.5-1 1.8-2.1 3.7-2.1 4 0 4.8 2.6 4.8 6v9h-4v-8c0-1.9 0-4.3-2.6-4.3s-3 2-3 4.2V24h-4V8.5z"/></svg>
              </a>
              <a aria-label="Instagram" href="#" className="hover:text-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.3-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.3 2.3-.4C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7 0 5.7 0 5.1 0 4.6.1 3.5.2 2.7.4 2 .7c-.8.3-1.4.7-2 1.3S-.7 3.3-.9 4c-.3.7-.5 1.5-.6 2.6C-.1 7.1 0 7.7 0 9v6c0 1.3-.1 1.9-.2 2.4-.1 1.1-.3 1.9-.6 2.6-.3.7-.7 1.3-1.3 2-.6.6-1.2 1-2 1.3-.7.3-1.5.5-2.6.6C5.1 24 4.5 24 3.2 24H9c1.3 0 1.9.1 2.4.2 1.1.1 1.9.3 2.6.6.7.3 1.3.7 2 1.3.6.6 1 .9 1.3 2 .3.7.5 1.5.6 2.6.1.5.2 1.1.2 2.4V9c0-1.3.1-1.9.2-2.4.1-1.1.3-1.9.6-2.6.3-.7.7-1.3 1.3-2 .6-.6 1.2-1 2-1.3.7-.3 1.5-.5 2.6-.6C18.9.1 19.5 0 20.8 0H15c-1.3 0-1.9.1-2.4.2-1.1.1-1.9.3-2.6.6-.7.3-1.3.7-2 1.3-.6.6-1 .9-1.3 2-.3.7-.5 1.5-.6 2.6C4.1 7.1 4 7.7 4 9v6c0 1.3.1 1.9.2 2.4.1 1.1.3 1.9.6 2.6.3.7.7 1.3 1.3 2 .6.6 1.2 1 2 1.3.7.3 1.5.5 2.6.6.5.1 1.1.2 2.4.2H15c1.3 0 1.9-.1 2.4-.2 1.1-.1 1.9-.3 2.6-.6.7-.3 1.3-.7 2-1.3.6-.6 1.2-1 2-1.3.7-.3 1.5-.5 2.6-.6.5-.1 1.1-.2 2.4-.2z"/></svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-8">
            <div>
              <div className="text-sm font-semibold text-slate-900">Explore</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a className="hover:text-slate-900" href="/services">Services</a></li>
                <li><a className="hover:text-slate-900" href="/professionals">Professionals</a></li>
                <li><a className="hover:text-slate-900" href="/events">Events</a></li>
                <li><a className="hover:text-slate-900" href="/blogs">Blogs</a></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Community</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a className="hover:text-slate-900" href="/community">Q&A</a></li>
                <li><a className="hover:text-slate-900" href="#">Guidelines</a></li>
                <li><a className="hover:text-slate-900" href="#">Report an issue</a></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Company</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><a className="hover:text-slate-900" href="#">About</a></li>
                <li><a className="hover:text-slate-900" href="#">Careers</a></li>
                <li><a className="hover:text-slate-900" href="#">Contact</a></li>
                <li><a className="hover:text-slate-900" href="#">Press</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-slate-500 sm:flex-row">
          <div>© {new Date().getFullYear()} Wellness. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-slate-700">Privacy</a>
            <a href="/terms" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


