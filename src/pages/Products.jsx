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

  // Recalculate AOS positions once content changes
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => AOS.refresh(), 100);
      return () => clearTimeout(t);
    }
  }, [loading, filteredProducts.length]);

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-neutral-900">
      {/* Local keyframes */}
      <style>{`
        @keyframes prod-card-in {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes prod-banner-zoom {
          from { transform: scale(1.12); }
          to { transform: scale(1); }
        }
        .prod-card-in {
          opacity: 0;
          animation: prod-card-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .prod-banner-zoom { animation: prod-banner-zoom 2.4s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .prod-card-in { animation: none; opacity: 1; }
          .prod-banner-zoom { animation: none; }
        }
      `}</style>

      {/* Banner */}
      <section className="relative isolate overflow-hidden border-b border-neutral-200">
        <img
          src={BANNER_IMAGE}
          alt=""
          aria-hidden="true"
          onError={handleImgError}
          className="prod-banner-zoom absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-neutral-950/65" />

        <div className="mx-auto max-w-7xl px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <p
            data-aos="fade-up"
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 sm:text-xs"
          >
            Discover your favourites
          </p>

          <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1
                data-aos="fade-up"
                data-aos-delay="100"
                className="text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl"
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

            <div
              data-aos="fade-left"
              data-aos-delay="300"
              className="text-sm text-white/70"
            >
              {!loading && (
                <>
                  <span className="text-2xl font-medium text-white">
                    {filteredProducts.length}
                  </span>{" "}
                  {filteredProducts.length === 1 ? "product" : "products"}
                </>
              )}
            </div>
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
              className="w-full rounded-none border border-neutral-300 bg-white py-3.5 pl-11 pr-10 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 transition hover:rotate-90 hover:text-black"
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
              className="inline-flex flex-1 items-center justify-center gap-2 border border-neutral-300 px-4 py-3 text-sm transition hover:border-neutral-950 sm:hidden"
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
                className="w-full border border-neutral-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-neutral-950 sm:w-auto sm:min-w-44"
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
                className={`border px-4 py-2.5 text-xs transition duration-300 active:scale-95 sm:text-sm ${
                  category === item
                    ? "border-neutral-950 bg-neutral-950 text-white"
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
                <div className="aspect-[4/5] bg-neutral-100" />
                <div className="mt-4 h-3 w-3/4 bg-neutral-100" />
                <div className="mt-3 h-3 w-1/3 bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            data-aos="zoom-in"
            className="mt-10 border border-neutral-200 px-6 py-16 text-center"
          >
            <FiShoppingBag size={28} className="mx-auto text-neutral-400" />
            <h2 className="mt-4 text-lg font-medium">Something went wrong</h2>
            <p className="mt-2 text-sm text-neutral-500">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 bg-neutral-950 px-5 py-3 text-sm text-white transition hover:bg-neutral-700"
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            data-aos="zoom-in"
            className="mt-10 border border-dashed border-neutral-300 px-6 py-16 text-center"
          >
            <FiShoppingBag size={30} className="mx-auto text-neutral-400" />

            <h2 className="mt-5 text-xl font-medium">No products found</h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try a different search or category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 border border-neutral-950 px-5 py-3 text-sm transition hover:bg-neutral-950 hover:text-white"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 mt-8 flex items-center justify-between border-b border-neutral-200 pb-4">
              <p className="text-xs text-neutral-500 sm:text-sm">
                Showing{" "}
                <span className="font-medium text-neutral-900">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "item" : "items"}
              </p>

              {(search || category !== "All") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs underline underline-offset-4 hover:text-neutral-500 sm:text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
              {filteredProducts.map((product, i) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  style={{ animationDelay: `${Math.min(i % 8, 7) * 70}ms` }}
                  className="prod-card-in group min-w-0"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
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
                        <FiShoppingBag size={32} className="text-neutral-400" />
                      </div>
                    )}

                    <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[9px] uppercase tracking-widest sm:left-3 sm:top-3 sm:text-[10px]">
                      In stock
                    </span>

                    <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-white/95 p-3 text-center text-xs font-medium backdrop-blur transition-transform duration-300 group-hover:translate-y-0 sm:block">
                      View product <FiArrowRight className="ml-1 inline" />
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4">
                    <p className="truncate text-[10px] uppercase tracking-[0.15em] text-neutral-500 sm:text-xs">
                      {product.category || "Collection"}
                    </p>

                    <h2 className="mt-1.5 line-clamp-2 text-sm font-medium leading-5 text-neutral-900 transition-colors group-hover:text-neutral-600 sm:text-base">
                      {product.productName}
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-neutral-950 sm:text-base">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}