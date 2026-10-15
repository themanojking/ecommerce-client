import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiArrowRight,
  FiHeart,
  FiShield,
  FiTruck,
  FiUsers,
  FiSearch,
  FiShoppingCart,
  FiPackage,
} from "react-icons/fi";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1000&auto=format&fit=crop&q=80";

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

const gallery = [
  {
    alt: "Elegant watch on display",
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
  },
  {
    alt: "Everyday sneakers",
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
  },
  {
    alt: "Leather bag",
    src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
  },
];

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  const values = [
    {
      icon: <FiHeart size={22} />,
      title: "Customer First",
      description:
        "We focus on making every shopping experience simple, comfortable, and enjoyable.",
    },
    {
      icon: <FiShield size={22} />,
      title: "Quality & Trust",
      description:
        "We aim to provide quality products, transparent information, and dependable service.",
    },
    {
      icon: <FiTruck size={22} />,
      title: "Reliable Delivery",
      description:
        "We work to make order processing and delivery as smooth as possible.",
    },
    {
      icon: <FiUsers size={22} />,
      title: "Built for You",
      description:
        "Your feedback and satisfaction help us improve our store every day.",
    },
  ];

  const steps = [
    {
      icon: <FiSearch size={20} />,
      title: "Browse",
      description: "Explore the collection and find pieces you like.",
    },
    {
      icon: <FiShoppingCart size={20} />,
      title: "Order",
      description: "Add to your bag and check out in a few simple steps.",
    },
    {
      icon: <FiPackage size={20} />,
      title: "Receive",
      description: "Track your order and get it delivered to your door.",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-neutral-900">
      <style>{`
        @keyframes about-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes about-zoom {
          from { transform: scale(1.1); }
          to { transform: scale(1); }
        }
        .about-float { animation: about-float 4s ease-in-out infinite; }
        .about-zoom { animation: about-zoom 2s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .about-float, .about-zoom { animation: none; }
        }
      `}</style>

      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-12 lg:py-28">
          <div>
            <p
              data-aos="fade-up"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
            >
              Our Story
            </p>

            <h1
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-5 text-4xl font-medium leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Shopping made
              <span className="block text-neutral-400">
                simple and meaningful.
              </span>
            </h1>

            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="mt-6 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base"
            >
              Welcome to our store. We believe online shopping should be
              convenient, enjoyable, and built around your needs. Our goal is
              to bring you a thoughtful shopping experience from browsing
              products to receiving your order.
            </p>

            <div data-aos="fade-up" data-aos-delay="300">
              <Link
                to="/products"
                className="group mt-8 inline-flex items-center gap-3 bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-[0.99]"
              >
                Explore our collection
                <FiArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          <div data-aos="fade-left" data-aos-duration="1000" className="relative">
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=85"
                alt="A thoughtfully arranged retail store"
                onError={handleImgError}
                className="about-zoom h-[300px] w-full object-cover sm:h-[420px] lg:h-[500px]"
              />
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="500"
              className="absolute bottom-0 left-0"
            >
              <div className="about-float bg-white p-5 sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
                  Our philosophy
                </p>
                <p className="mt-2 text-lg font-medium">
                  Quality. Simplicity. Trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p
            data-aos="fade-up"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
          >
            Who We Are
          </p>

          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl"
          >
            More than just a store
          </h2>

          <p
            data-aos="fade-up"
            data-aos-delay="150"
            className="mt-6 text-sm leading-8 text-neutral-600 sm:text-base"
          >
            Our store was created to make discovering and purchasing products
            easier. We bring our collection together in one convenient place,
            with a focus on a clean shopping experience, helpful service, and
            reliable order updates.
          </p>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-4 text-sm leading-8 text-neutral-600 sm:text-base"
          >
            Whether you are shopping for yourself or finding something for
            someone special, we want you to feel confident throughout your
            journey with us.
          </p>
        </div>
      </section>

      {/* Image strip */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24 lg:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {gallery.map((item, i) => (
            <div
              key={item.alt}
              data-aos="zoom-in-up"
              data-aos-delay={i * 120}
              className="group overflow-hidden bg-neutral-100"
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                onError={handleImgError}
                className="h-56 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-72"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div data-aos="fade-up" className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              What Matters to Us
            </p>

            <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
              The values behind every order
            </h2>
          </div>

          <div className="mt-10 grid gap-px border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, i) => (
              <div
                key={value.title}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="group bg-white p-6 transition duration-300 hover:bg-neutral-50 sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center border border-neutral-200 transition duration-300 group-hover:border-black group-hover:bg-black group-hover:text-white">
                  {value.icon}
                </div>

                <h3 className="mt-6 text-base font-semibold">{value.title}</h3>

                <p className="mt-3 text-sm leading-7 text-neutral-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <div data-aos="fade-up" className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            How It Works
          </p>

          <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
            Three simple steps
          </h2>
        </div>

        <div className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {/* Connecting line on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-7 hidden h-px bg-neutral-200 md:block"
          />

          {steps.map((step, i) => (
            <div
              key={step.title}
              data-aos="fade-up"
              data-aos-delay={i * 150}
              className="relative text-center"
            >
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-neutral-300 bg-white">
                {step.icon}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                  {i + 1}
                </span>
              </div>

              <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-neutral-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        data-aos="zoom-in"
        className="mx-5 mb-16 bg-neutral-100 px-6 py-14 text-center sm:mx-8 sm:mb-24 sm:px-12 sm:py-20 lg:mx-auto lg:max-w-5xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
          Start Exploring
        </p>

        <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
          Find something you love.
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-500">
          Discover our collection and enjoy a convenient online shopping
          experience.
        </p>

        <Link
          to="/products"
          className="group mt-7 inline-flex items-center gap-3 bg-black px-7 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-[0.99]"
        >
          Shop Now
          <FiArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </section>
    </main>
  );
};

export default About;