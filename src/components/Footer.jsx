import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiArrowUpRight,
  FiArrowUp,
  FiMail,
  FiMapPin,
  FiArrowRight,
  FiShoppingBag,
} from "react-icons/fi";

// Matches the brand name used in the Navbar. Change it here if needed.
const BRAND_NAME = "ShopZone";

const shopLinks = [
  { label: "All Products", to: "/products" },
  { label: "My Orders", to: "/orders" },
  { label: "Shopping Cart", to: "/cart" },
];

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

const footerLinkClass =
  "group/link relative inline-flex items-center text-sm text-neutral-600 transition-all duration-300 hover:translate-x-1 hover:text-black";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });

    // Recalculate positions after the page has fully laid out,
    // so footer elements don't stay hidden (opacity: 0)
    const refresh = () => AOS.refreshHard();
    const timer = setTimeout(refresh, 300);
    window.addEventListener("load", refresh);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", refresh);
    };
  }, []);

  // Show the back-to-top button after scrolling down
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer className="relative overflow-hidden border-t border-neutral-200 bg-neutral-100 text-neutral-900">
      <style>{`
        @keyframes footer-glow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        .footer-glow { animation: footer-glow 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .footer-glow { animation: none; } }
      `}</style>

      {/* Soft decorative glow */}
      <div
        aria-hidden="true"
        className="footer-glow pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-black/5 blur-3xl sm:h-96 sm:w-96"
      />

      {/* Main footer */}
      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pt-16 lg:px-12">
        <div className="grid gap-12 border-b border-neutral-300 pb-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand */}
          <div data-aos="fade-up" className="lg:col-span-1">
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-neutral-900"
            >
              <span className="flex h-9 w-9 items-center justify-center bg-black text-white transition duration-300 group-hover:-rotate-6">
                <FiShoppingBag size={19} />
              </span>
              <span>
                {BRAND_NAME}
                <span className="text-neutral-500">.</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-neutral-600">
              Discover products you'll love. We aim to make every shopping
              experience simple, convenient, and memorable.
            </p>

            <Link
              to="/products"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 transition hover:text-neutral-600"
            >
              Explore collection
              <FiArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Shop links */}
          <div data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-800">
              Shop
            </h3>

            <ul className="mt-5 space-y-4">
              {shopLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-800">
              Company
            </h3>

            <ul className="mt-5 space-y-4">
              {companyLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div data-aos="fade-up" data-aos-delay="300">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-800">
              Get in Touch
            </h3>

            <div className="mt-5 space-y-4">
              <Link
                to="/contact"
                className="group flex items-start gap-3 text-sm text-neutral-600 transition hover:text-black"
              >
                <FiMail size={17} className="mt-0.5 shrink-0" />
                <span>
                  Have a question?
                  <span className="mt-1 block text-neutral-900">
                    Contact our team
                  </span>
                </span>
                <FiArrowUpRight
                  size={14}
                  className="ml-auto mt-0.5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>

              <div className="flex items-start gap-3 text-sm text-neutral-600">
                <FiMapPin size={17} className="mt-0.5 shrink-0" />
                <span>
                  Customer support
                  <span className="mt-1 block text-neutral-800">
                    We're here to help
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div
          data-aos="fade-up"
          className="flex flex-col justify-between gap-5 border-b border-neutral-300 py-8 sm:flex-row sm:items-center"
        >
          <div>
            <h3 className="text-lg font-medium text-neutral-900">
              Ready to find your next favorite?
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Browse our collection and discover something special.
            </p>
          </div>

          <Link
            to="/products"
            className="group inline-flex min-h-11 items-center justify-center gap-3 self-start border border-black px-5 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white active:scale-95 sm:self-auto"
          >
            Shop Now
            <FiArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Bottom bar */}
        <div
          data-aos="fade-up"
          className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs text-neutral-600">
            © {currentYear} {BRAND_NAME}. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-600">
            <Link to="/about" className="transition hover:text-black">
              About
            </Link>

            <Link to="/contact" className="transition hover:text-black">
              Support
            </Link>

            <Link to="/products" className="transition hover:text-black">
              Shop
            </Link>
          </div>

          <p className="text-xs tracking-wide text-neutral-600">
            Made with care.
          </p>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        className={`fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center border border-black/30 bg-white text-black shadow-lg transition-all duration-300 hover:bg-black hover:text-white active:scale-90 sm:bottom-6 sm:right-6 ${
          showTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <FiArrowUp size={18} />
      </button>
    </footer>
  );
};

export default Footer;