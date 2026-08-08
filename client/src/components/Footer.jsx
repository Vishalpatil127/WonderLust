import { Link } from "react-router-dom";
import {
  Globe, Twitter, Instagram, Facebook, Youtube,
  Mail, Phone, MapPin, Heart,
} from "lucide-react";

const LINKS = {
  Explore: [
    { label: "All listings",    to: "/" },
    { label: "Beach stays",     to: "/?search=beach" },
    { label: "Mountain cabins", to: "/?search=mountain" },
    { label: "City apartments", to: "/?search=city" },
    { label: "Luxury villas",   to: "/?search=luxury" },
  ],
  Hosting: [
    { label: "Become a host",   to: "/register" },
    { label: "Add your listing",to: "/listings/new" },
    { label: "Host dashboard",  to: "/host/dashboard" },
    { label: "Hosting tips",    to: "#" },
  ],
  Company: [
    { label: "About us",        to: "#" },
    { label: "Careers",         to: "#" },
    { label: "Press",           to: "#" },
    { label: "Blog",            to: "#" },
  ],
  Support: [
    { label: "Help centre",     to: "#" },
    { label: "Safety info",     to: "#" },
    { label: "Cancellation",    to: "#" },
    { label: "Contact us",      to: "#" },
  ],
};

const SOCIALS = [
  { icon: Twitter,   href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook,  href: "#", label: "Facebook" },
  { icon: Youtube,   href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">

      {/* ── Top section ── */}
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Wonder<span className="text-brand">lust</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-xs">
              Discover unique stays, mountain escapes, beach retreats, and city apartments.
              Book with confidence and travel with joy.
            </p>

            {/* Contact */}
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand shrink-0" />
                <span>hello@wonderlust.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                <span>Mumbai, India</span>
              </li>
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center
                             hover:bg-brand transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading} className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Newsletter strip ── */}
      <div className="border-t border-gray-800">
        <div className="page-container py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h4 className="text-white font-bold text-base mb-1">Get travel inspiration</h4>
              <p className="text-sm text-gray-500">Subscribe for exclusive deals and hidden gems.</p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-64 px-4 py-2.5 text-sm bg-gray-800 border border-gray-700
                           rounded-full text-white placeholder:text-gray-500
                           outline-none focus:border-brand transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-full
                           hover:bg-brand-dark transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gray-800">
        <div className="page-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Wonderlust. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</a>
            </div>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-brand fill-brand" /> in India
            </p>
          </div>
        </div>
      </div>

    </footer>
  );
}
