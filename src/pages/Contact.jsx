import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiChevronDown,
  FiMail,
  FiMessageCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const CONTACT_EMAIL = "support@example.com";

const inputClass =
  "w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none transition duration-300 placeholder:text-neutral-400 hover:border-neutral-500 focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]";

// Answers are based on what the store actually supports (orders page, COD checkout)
const faqs = [
  {
    q: "How can I check my order status?",
    a: "Open My Orders from your account menu to see every order and its current status.",
  },
  {
    q: "Can I cancel an order?",
    a: "Orders that are still pending, confirmed or processing can be cancelled from the My Orders page.",
  },
  {
    q: "Which payment method is available?",
    a: "Cash on Delivery (COD) is available at checkout. You pay when your order arrives.",
  },
];

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.subject.trim() ||
      !form.message.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

    if (!emailIsValid) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    const mailSubject = encodeURIComponent(form.subject.trim());
    const mailBody = encodeURIComponent(
      `Name: ${form.name.trim()}\n` +
        `Customer Email: ${form.email.trim()}\n\n` +
        `Message:\n${form.message.trim()}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

    toast.success("Opening your email application.");

    setSubmitting(false);
  };

  const contactItems = [
    {
      icon: <FiMail size={20} />,
      title: "Email Us",
      description: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
    },
    {
      icon: <FiMessageCircle size={20} />,
      title: "Customer Support",
      description: "Questions about an order or product?",
      href: null,
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-neutral-900">
      <style>{`
        @keyframes contact-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .contact-float { animation: contact-float 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .contact-float { animation: none; } }
      `}</style>

      {/* Header */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50">
        {/* Soft decorative shapes */}
        <div
          aria-hidden="true"
          className="contact-float pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-neutral-200/60 sm:h-72 sm:w-72"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-1/4 h-40 w-40 rounded-full bg-neutral-200/40"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <Link
            to="/"
            data-aos="fade-right"
            className="group inline-flex items-center gap-2 text-xs text-neutral-500 transition hover:text-black"
          >
            <FiArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to home
          </Link>

          <p
            data-aos="fade-up"
            className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
          >
            Get in Touch
          </p>

          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl"
          >
            Contact Us
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base"
          >
            Have a question about a product, your order, or our services? Send
            us a message and we will be happy to help.
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-12">
        {/* Contact details */}
        <div>
          <div data-aos="fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
              Contact Information
            </p>

            <h2 className="mt-4 text-2xl font-medium sm:text-3xl">
              We are here to help.
            </h2>

            <p className="mt-4 text-sm leading-7 text-neutral-500">
              For order-related questions, keep your order reference ready so we
              can assist you more efficiently.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {contactItems.map((item, i) => (
              <div
                key={item.title}
                data-aos="fade-right"
                data-aos-delay={i * 100}
                className="group flex gap-4 border border-neutral-200 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-neutral-100 transition duration-300 group-hover:bg-black group-hover:text-white">
                  {item.icon}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">{item.title}</h3>

                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-2 block break-words text-sm text-neutral-500 underline-offset-4 hover:text-black hover:underline"
                    >
                      {item.description}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="mt-6 border border-neutral-200 bg-neutral-50 p-5"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle size={17} />
              <h3 className="text-sm font-semibold">Need order assistance?</h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Check your order status and keep your order ID ready when
              contacting support.
            </p>

            <Link
              to="/orders"
              className="group mt-4 inline-flex items-center gap-2 text-sm font-medium transition hover:text-neutral-500"
            >
              View My Orders
              <FiArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Contact form */}
        <div
          data-aos="fade-left"
          className="h-fit border border-neutral-200 p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)] sm:p-8"
        >
          <h2 className="text-xl font-medium sm:text-2xl">Send us a message</h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Fill in the details below to prepare an email to our support team.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div data-aos="fade-up" data-aos-delay="50">
                <label htmlFor="name" className="mb-2 block text-xs font-medium">
                  Full Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className={inputClass}
                />
              </div>

              <div data-aos="fade-up" data-aos-delay="100">
                <label htmlFor="email" className="mb-2 block text-xs font-medium">
                  Email Address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div data-aos="fade-up" data-aos-delay="150">
              <label htmlFor="subject" className="mb-2 block text-xs font-medium">
                Subject *
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                required
                className={inputClass}
              />
            </div>

            <div data-aos="fade-up" data-aos-delay="200">
              <label htmlFor="message" className="mb-2 block text-xs font-medium">
                Message *
              </label>

              <textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                required
                className={`${inputClass} resize-y`}
              />
            </div>

            <div data-aos="fade-up" data-aos-delay="250">
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex min-h-12 w-full items-center justify-center gap-3 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send Message
                <FiArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <p className="mt-5 text-xs leading-5 text-neutral-400">
                Your default email application must be configured to send the
                prepared message.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <div data-aos="fade-up" className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Quick Answers
            </p>

            <h2 className="mt-4 text-2xl font-medium tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-8 divide-y divide-neutral-200 border border-neutral-200 bg-white">
            {faqs.map((faq, i) => {
              const open = openFaq === i;

              return (
                <div key={faq.q} data-aos="fade-up" data-aos-delay={i * 80}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition hover:bg-neutral-50 sm:px-6 sm:py-5"
                  >
                    {faq.q}
                    <FiChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-7 text-neutral-500 sm:px-6">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;