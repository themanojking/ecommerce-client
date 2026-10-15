import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiArrowRight,
  FiTruck,
  FiShield,
  FiShoppingBag,
  FiRefreshCw,
  FiHeadphones,
} from "react-icons/fi";
import api from "../services/api";


/* ---------- Static content (safe, product / store images only) ---------- */

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=85";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

const showcase = [
  {
    title: "Timeless Watches",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Everyday Sneakers",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Carry Essentials",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
  },
];

const marqueeItems = [
  "Free shipping on select orders",
  "Secure checkout",
  "Easy ordering",
  "New arrivals weekly",
  "Friendly support",
];

const benefits = [
  { icon: FiTruck, title: "Reliable Delivery", description: "Your order, delivered to your doorstep" },
  { icon: FiShield, title: "Secure Shopping", description: "A smooth and secure checkout" },
  { icon: FiRefreshCw, title: "Easy Ordering", description: "Simple and convenient shopping" },
  { icon: FiHeadphones, title: "Customer Support", description: "We're here to help" },
];

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString("en-IN")}`;

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

/* ---------- Component ---------- */

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
    });
  }, []);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/products");

        if (active) {
          setProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load products right now."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  // Re-calculate AOS positions after dynamic content renders
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => AOS.refresh(), 100);
      return () => clearTimeout(t);
    }
  }, [loading, products]);

  const availableProducts = products.filter(
    (product) => product.isAvailable && Number(product.stock) > 0
  );

  const featuredProducts = availableProducts.slice(0, 4);

  const categories = [
    ...new Set(availableProducts.map((p) => p.category).filter(Boolean)),
  ].slice(0, 3);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-neutral-900">
      {/* Local keyframes for marquee + floating badge */}
      <style>{`
        @keyframes home-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes home-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .home-marquee { animation: home-marquee 28s linear infinite; }
        .home-float { animation: home-float 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .home-marquee, .home-float { animation: none; }
        }
      `}</style>

      {/* Scrolling announcement bar */}
      <div className="overflow-hidden bg-neutral-950 py-2.5 text-white">
        <div className="home-marquee flex w-max whitespace-nowrap text-[10px] uppercase tracking-[0.2em] sm:text-xs">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-6">
              {item}
              <span className="ml-12 text-neutral-600">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 sm:py-16 md:grid-cols-2 md:gap-12 lg:px-12 lg:py-20">
        <div className="order-2 md:order-1">
          <p
            data-aos="fade-up"
            className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500"
          >
            The collection you will love
          </p>

          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-5 text-4xl font-medium leading-tight tracking-tight sm:text-5xl lg:text-7xl"
          >
            Everyday style.
            <br />
            <span className="font-serif italic text-neutral-500">Elevated.</span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mt-5 max-w-md text-sm leading-7 text-neutral-600 sm:text-base"
          >
            Discover your next favourite. Explore our collection of carefully
            selected products made for your everyday life.
          </p>

          <div data-aos="fade-up" data-aos-delay="300">
            <Link
              to="/products"
              className="group mt-8 inline-flex items-center gap-3 bg-neutral-950 px-7 py-4 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              Explore products
              <FiArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <p
            data-aos="fade-up"
            data-aos-delay="400"
            className="mt-5 text-xs text-neutral-500"
          >
            Discover something special, just for you.
          </p>
        </div>

        <div
          data-aos="fade-left"
          data-aos-duration="1000"
          className="order-1 md:order-2"
        >
          <div className="relative">
            <img
              src={HERO_IMAGE}
              alt="Browse our latest collection"
              onError={handleImgError}
              className="h-[340px] w-full object-cover sm:h-[460px] lg:h-[540px]"
            />

            <Link
              to="/products"
              className="home-float absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/95 p-4 backdrop-blur transition hover:bg-white sm:bottom-6 sm:left-6 sm:right-6 sm:p-5"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Discover more
                </p>
                <p className="mt-1 text-sm font-medium">Find your favourites</p>
              </div>
              <FiArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4 lg:px-12">
          {benefits.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="flex items-start gap-3"
            >
              <Icon size={21} className="mt-1 shrink-0 text-neutral-700" />
              <div>
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase strip (static, product images) */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
        <div data-aos="fade-up" className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Inspired by everyday
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            Pieces worth discovering
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {showcase.map((item, i) => (
            <Link
              key={item.title}
              to="/products"
              data-aos="zoom-in-up"
              data-aos-delay={i * 120}
              className="group relative block overflow-hidden bg-neutral-100"
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                onError={handleImgError}
                className="h-64 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-5 text-white">
                <h3 className="text-lg font-medium">{item.title}</h3>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950 transition group-hover:bg-neutral-950 group-hover:text-white">
                  <FiArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories based on available products */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20 lg:px-12">
          <div
            data-aos="fade-up"
            className="mb-8 flex items-end justify-between"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Find your favourites
              </p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
                Shop by category
              </h2>
            </div>

            <Link
              to="/products"
              className="hidden items-center gap-2 text-sm underline underline-offset-4 sm:flex"
            >
              View all <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
            {categories.map((category, index) => {
              const categoryProduct = availableProducts.find(
                (product) => product.category === category
              );
              const image = categoryProduct?.images?.[0];

              return (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  data-aos="fade-up"
                  data-aos-delay={index * 120}
                  className="group relative overflow-hidden bg-neutral-100"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={category}
                      loading="lazy"
                      onError={handleImgError}
                      className="h-64 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-80"
                    />
                  ) : (
                    <div className="h-64 bg-neutral-100 sm:h-80" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5 text-white">
                    <div>
                      <p className="text-[10px] tracking-widest text-white/75">
                        COLLECTION 0{index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-medium sm:text-xl">
                        {category}
                      </h3>
                    </div>
                    <FiArrowRight
                      size={20}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="bg-neutral-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div
            data-aos="fade-up"
            className="mb-8 flex items-end justify-between gap-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Handpicked for you
              </p>
              <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
                Featured products
              </h2>
            </div>

            <Link
              to="/products"
              className="flex shrink-0 items-center gap-2 text-xs font-medium underline underline-offset-4 sm:text-sm"
            >
              View all <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[4/5] bg-neutral-200" />
                  <div className="mt-3 h-3 w-2/3 bg-neutral-200" />
                  <div className="mt-3 h-3 w-1/3 bg-neutral-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border border-neutral-200 bg-white p-8 text-center">
              <p className="text-sm text-neutral-600">{error}</p>
              <Link
                to="/products"
                className="mt-4 inline-block text-sm underline underline-offset-4"
              >
                Visit products page
              </Link>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
              <FiShoppingBag size={28} className="mx-auto text-neutral-400" />
              <h3 className="mt-4 font-medium">Coming soon</h3>
              <p className="mt-2 text-sm text-neutral-500">
                New products will appear here when available.
              </p>
              <Link
                to="/products"
                className="mt-4 inline-block text-sm underline underline-offset-4"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {featuredProducts.map((product, i) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                  className="group min-w-0"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.productName}
                        loading="lazy"
                        onError={handleImgError}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FiShoppingBag size={30} className="text-neutral-400" />
                      </div>
                    )}

                    <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[9px] uppercase tracking-widest sm:left-3 sm:top-3 sm:text-[10px]">
                      Available
                    </span>
                  </div>

                  <div className="pt-3">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                      {product.category}
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-5 sm:text-base">
                      {product.productName}
                    </h3>

                    <p className="mt-2 text-sm font-semibold">
                      {formatPrice(product.price)}
                    </p>

                    <span className="mt-3 inline-flex items-center gap-2 text-xs text-neutral-600 transition group-hover:text-black">
                      View product
                      <FiArrowRight
                        size={13}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final call to action */}
      <section
        data-aos="zoom-in"
        className="mx-5 my-12 bg-neutral-100 px-6 py-12 text-center sm:mx-8 sm:my-16 sm:px-12 sm:py-16 lg:mx-auto lg:max-w-7xl"
      >
        <FiShoppingBag size={26} className="mx-auto text-neutral-700" />

        <p className="mt-5 text-xs uppercase tracking-[0.25em] text-neutral-500">
          Your next favourite awaits
        </p>

        <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-5xl">
          Find something you love.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-600">
          Explore our products and discover pieces that fit your style and
          everyday needs.
        </p>

        <Link
          to="/products"
          className="group mt-7 inline-flex items-center gap-3 bg-neutral-950 px-7 py-4 text-sm text-white transition hover:bg-neutral-700"
        >
          Shop now
          <FiArrowRight
            size={17}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </section>
      
    </main>
  );
}