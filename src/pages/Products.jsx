
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiSearch,
  FiShoppingBag,
  FiArrowRight,
  FiSliders,
  FiX,
  FiHeart,
  FiEye,
  FiStar,
  FiGrid,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../services/api";

const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&auto=format&fit=crop&q=80";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => new Set());

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/products");
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Keep category selection in sync with Home page category links.
  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const name = product.productName || "";
      const productCategory = product.category || "";

      const matchesSearch = name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCategory =
        category === "All" || productCategory === category;

      return (
        matchesSearch &&
        matchesCategory &&
        product.isAvailable &&
        Number(product.stock) > 0
      );
    });

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "price-high":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "name":
        result.sort((a, b) =>
          (a.productName || "").localeCompare(b.productName || "")
        );
        break;

      case "newest":
        result.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;

      default:
        break;
    }

    return result;
  }, [products, search, category, sortBy]);

  // Recalculate AOS positions whenever the visible list changes.
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => AOS.refreshHard(), 100);
      return () => clearTimeout(t);
    }
  }, [loading, filteredProducts]);

  const selectCategory = (value) => {
    setCategory(value);

    if (value === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSortBy("featured");
    setSearchParams({});
  };

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    setWishlist((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-neutral-50 via-white to-white text-neutral-900">
      {/* Local keyframes */}
      <style>{`
        @keyframes prod-banner-zoom {
          from { transform: scale(1.12); }
          to { transform: scale(1); }
        }

        @keyframes prod-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes prod-heart {
          0% { transform: scale(1); }
          35% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }

        .prod-banner-zoom {
          animation: prod-banner-zoom 2.4s ease-out forwards;
        }

        .prod-float {
          animation: prod-float 4s ease-in-out infinite;
        }

        .prod-heart {
          animation: prod-heart 0.4s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .prod-banner-zoom,
          .prod-float,
          .prod-heart {
            animation: none;
          }
        }
      `}</style>

      {/* Banner */}
      <section className="relative isolate overflow-hidden">
        <img
          src={BANNER_IMAGE}
          alt=""
          aria-hidden="true"
          onError={handleImgError}
          className="prod-banner-zoom absolute inset-0 -z-20 h-full w-full object-cover"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-950/85 via-neutral-950/60 to-neutral-950/30" />

        <div className="mx-auto max-w-7xl px-5 py-16 text-white sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <p
            data-aos="fade-up"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur sm:text-xs"
          >
            <FiStar size={13} className="fill-amber-300 text-amber-300" />
            Discover your favourites
          </p>

          <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h1
                data-aos="fade-up"
                data-aos-delay="100"
                className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              >
                The Collection
              </h1>

              <p
                data-aos="fade-up"
                data-aos-delay="200"
                className="mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base"
              >
                Thoughtfully selected products for your everyday style and
                needs.
              </p>
            </div>

            {!loading && (
              <div
                data-aos="fade-left"
                data-aos-delay="300"
                className="prod-float flex items-center gap-3 self-start rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur sm:self-auto"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-950">
                  <FiGrid size={18} />
                </span>

                <div>
                  <p className="text-2xl font-semibold leading-none">
                    {filteredProducts.length}
                  </p>

                  <p className="mt-1 text-xs text-white/70">
                    {filteredProducts.length === 1 ? "product" : "products"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        {/* Search and sort */}
        <div
          data-aos="fade-up"
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative w-full sm:max-w-md">
            <FiSearch
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search the collection..."
              aria-label="Search products"
              className="w-full rounded-full border border-neutral-300 bg-white py-3.5 pl-11 pr-10 text-sm shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.06)]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-500 transition hover:rotate-90 hover:text-black"
              >
                <FiX size={17} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-neutral-950 sm:hidden"
            >
              <FiSliders size={16} />
              Categories
            </button>

            <label className="flex flex-1 items-center gap-2 sm:flex-none">
              <span className="hidden whitespace-nowrap text-xs text-neutral-500 sm:inline">
                Sort by
              </span>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort products"
                className="w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-neutral-950 sm:w-auto sm:min-w-48"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
        </div>

        {/* Category filters */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className={`mt-5 ${filtersOpen ? "block" : "hidden"} sm:block`}
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectCategory(item)}
                className={`rounded-full border px-5 py-2.5 text-xs transition duration-300 active:scale-95 sm:text-sm ${
                  category === item
                    ? "border-neutral-950 bg-neutral-950 text-white shadow-md shadow-neutral-900/20"
                    : "border-neutral-200 bg-white text-neutral-600 hover:-translate-y-0.5 hover:border-neutral-950 hover:text-neutral-950"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] rounded-2xl bg-neutral-200" />
                <div className="mt-4 h-3 w-3/4 rounded-full bg-neutral-200" />
                <div className="mt-3 h-3 w-1/3 rounded-full bg-neutral-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            data-aos="zoom-in"
            className="mt-10 rounded-3xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm"
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <FiAlertCircle size={28} />
            </span>

            <h2 className="mt-5 text-lg font-semibold">Something went wrong</h2>

            <p className="mt-2 text-sm text-neutral-500">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm text-white transition hover:bg-neutral-700"
            >
              <FiRefreshCw
                size={15}
                className="transition-transform duration-500 group-hover:rotate-180"
              />
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            data-aos="zoom-in"
            className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center"
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <FiShoppingBag size={28} />
            </span>

            <h2 className="mt-5 text-xl font-semibold">No products found</h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try a different search or category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full border border-neutral-950 px-6 py-3 text-sm transition hover:bg-neutral-950 hover:text-white"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 mt-8 flex items-center justify-between border-b border-neutral-200 pb-4">
              <p className="text-xs text-neutral-500 sm:text-sm">
                Showing{" "}
                <span className="font-semibold text-neutral-900">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "item" : "items"}
              </p>

              {(search || category !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs underline underline-offset-4 hover:text-neutral-500 sm:text-sm"
                >
                  <FiX size={14} />
                  Clear filters
                </button>
              )}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4">
              {filteredProducts.map((product, i) => {
                const wished = wishlist.has(product._id);
                const lowStock = Number(product.stock) <= 5;

                return (
                  <div
                    key={product._id}
                    data-aos="fade-up"
                    data-aos-delay={(i % 4) * 100}
                    className="min-w-0"
                  >
                    <Link
                      to={`/products/${product._id}`}
                      className="group block"
                    >
                      {/* Product image */}
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 shadow-sm ring-1 ring-neutral-200/70 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-neutral-900/10">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.productName}
                            loading="lazy"
                            onError={handleImgError}
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <FiShoppingBag
                              size={32}
                              className="text-neutral-400"
                            />
                          </div>
                        )}

                        {/* Hover gradient */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        {/* Stock badge */}
                        <span
                          className={`absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-medium uppercase tracking-widest shadow-sm backdrop-blur sm:left-3 sm:top-3 sm:text-[10px] ${
                            lowStock ? "text-amber-600" : "text-neutral-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              lowStock ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          {lowStock ? `Only ${product.stock} left` : "In stock"}
                        </span>

                        {/* Heart and eye icons: always visible */}
                        <div className="absolute right-2 top-2 flex flex-col gap-2 sm:right-3 sm:top-3">
                          <button
                            type="button"
                            aria-label={
                              wished
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                            aria-pressed={wished}
                            onClick={(e) => toggleWishlist(e, product._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-neutral-950 hover:text-white sm:h-9 sm:w-9"
                          >
                            <FiHeart
                              key={String(wished)}
                              size={15}
                              className={`prod-heart ${
                                wished ? "fill-rose-500 text-rose-500" : ""
                              }`}
                            />
                          </button>

                          <span
                            aria-hidden="true"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md sm:h-9 sm:w-9"
                          >
                            <FiEye size={15} />
                          </span>
                        </div>

                        {/* View product bar */}
                        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full items-center justify-center gap-2 bg-white/95 p-3 text-xs font-medium backdrop-blur transition-transform duration-300 group-hover:translate-y-0 sm:flex">
                          View product
                          <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>

                      {/* Product details */}
                      <div className="pt-3 sm:pt-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[10px] uppercase tracking-[0.15em] text-neutral-500 sm:text-xs">
                            {product.category || "Collection"}
                          </p>

                          <span className="flex shrink-0 items-center gap-1 text-[10px] text-neutral-600 sm:text-xs">
                            <FiStar
                              size={12}
                              className="fill-amber-400 text-amber-400"
                            />
                            {product.rating ?? "4.5"}
                          </span>
                        </div>

                        <h2 className="mt-1.5 line-clamp-2 text-sm font-medium leading-5 text-neutral-900 transition-colors group-hover:text-neutral-600 sm:text-base">
                          {product.productName}
                        </h2>

                        {/* Price only; free delivery removed */}
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-neutral-950 sm:text-base">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Animated underline */}
                        <div className="mt-3 h-px w-full bg-neutral-200">
                          <div className="h-px w-0 bg-neutral-900 transition-all duration-500 group-hover:w-full" />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
