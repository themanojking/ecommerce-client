
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiArrowLeft,
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiPackage,
  FiTruck,
  FiShield,
  FiCheck,
  FiHeart,
  FiShare2,
  FiRefreshCw,
  FiLock,
  FiChevronRight,
  FiChevronDown,
  FiChevronLeft,
  FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";
import { addToCart } from "../redux/slices/cartSlice";
import DeliveryChecker from "../components/DeliveryChecker";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

const TRUST = [
  { icon: FiTruck, title: "Fast delivery", text: "Confirmed at checkout" },
  { icon: FiRefreshCw, title: "Easy returns", text: "Hassle-free policy" },
  { icon: FiShield, title: "Quality assured", text: "Carefully checked" },
  { icon: FiLock, title: "Secure payment", text: "Protected ordering" },
];

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [openPanel, setOpenPanel] = useState("details");
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 30,
    });
  }, []);

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`/products/${id}`);
        const fetchedProduct = data.product || data;

        if (active) {
          setProduct(fetchedProduct);
          setQuantity(1);
          setSelectedImage(0);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load this product."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => AOS.refreshHard(), 100);
      return () => clearTimeout(t);
    }
  }, [loading, product]);

  const handleAddToCart = () => {
    if (!product || Number(product.stock) < 1 || !product.isAvailable) {
      toast.error("This product is currently unavailable.");
      return;
    }

    if (quantity > Number(product.stock)) {
      toast.error("Requested quantity exceeds available stock.");
      return;
    }

    dispatch(addToCart({ ...product, quantity }));
    toast.success("Product added to cart!");

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.productName,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled share */
    }
  };

  const handleZoomMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setZoom({
      active: true,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-4 w-40 rounded-full bg-neutral-200" />

          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="aspect-[4/5] rounded-3xl bg-neutral-200" />

            <div className="space-y-6 py-5">
              <div className="h-10 w-4/5 rounded-xl bg-neutral-200" />
              <div className="h-6 w-1/3 rounded-xl bg-neutral-200" />
              <div className="h-24 rounded-2xl bg-neutral-200" />
              <div className="h-14 rounded-full bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ---------- Error ---------- */
  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-neutral-50 to-white px-5 text-center">
        <div data-aos="zoom-in" className="flex flex-col items-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 ring-8 ring-neutral-50">
            <FiPackage size={34} className="text-neutral-400" />
          </span>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Product not found
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
            {error || "This product may have been removed."}
          </p>

          <Link
            to="/products"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm text-white shadow-lg shadow-neutral-900/10 transition hover:bg-neutral-700"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const images = product.images?.filter(Boolean) || [];
  const outOfStock =
    Number(product.stock) < 1 || !product.isAvailable;
  const lowStock =
    !outOfStock && Number(product.stock) <= 5;
  const stockPercent = Math.min(
    100,
    (Number(product.stock) / 20) * 100
  );

  const goPrev = () =>
    setSelectedImage(
      (i) => (i - 1 + images.length) % images.length
    );

  const goNext = () =>
    setSelectedImage((i) => (i + 1) % images.length);

  const panels = [
    {
      key: "details",
      icon: FiPackage,
      title: "Product details",
      body: product.description || "Details coming soon.",
    },
    {
      key: "delivery",
      icon: FiTruck,
      title: "Delivery & returns",
      body: "Delivery dates are estimates. Actual availability and timing depend on the shipping service and destination. Review the return policy before placing your order.",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-neutral-50 via-white to-white pb-28 text-neutral-900 md:pb-0">
      <style>{`
        @keyframes pd-img-in {
          from { opacity: 0; transform: scale(1.04); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pd-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        @keyframes pd-heart {
          0% { transform: scale(1); }
          35% { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
        @keyframes pd-shine {
          from { transform: translateX(-120%) skewX(-20deg); }
          to { transform: translateX(260%) skewX(-20deg); }
        }
        .pd-img-in { animation: pd-img-in 0.5s ease-out; }
        .pd-pop { animation: pd-pop 0.35s ease-out; }
        .pd-heart { animation: pd-heart 0.4s ease-out; }
        .pd-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
          transform: translateX(-120%) skewX(-20deg);
        }
        .pd-shine:hover::after { animation: pd-shine 0.9s ease; }
        @media (prefers-reduced-motion: reduce) {
          .pd-img-in, .pd-pop, .pd-heart { animation: none; }
          .pd-shine:hover::after { animation: none; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div
        data-aos="fade-down"
        className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-9 lg:px-12"
      >
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500"
        >
          <Link to="/" className="transition hover:text-black">
            Home
          </Link>

          <FiChevronRight size={12} />

          <Link to="/products" className="transition hover:text-black">
            Products
          </Link>

          <FiChevronRight size={12} />

          <span className="max-w-48 truncate font-medium text-neutral-900">
            {product.productName}
          </span>
        </nav>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
          {/* ---------- Gallery ---------- */}
          <div data-aos="fade-right" className="min-w-0">
            <div
              className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-3xl bg-neutral-100 shadow-xl shadow-neutral-900/5 ring-1 ring-neutral-200/70"
              onMouseMove={handleZoomMove}
              onMouseLeave={() =>
                setZoom((z) => ({ ...z, active: false }))
              }
            >
              {images.length > 0 ? (
                <img
                  key={selectedImage}
                  src={images[selectedImage] || images[0]}
                  alt={product.productName}
                  onError={handleImgError}
                  style={{
                    transformOrigin: `${zoom.x}% ${zoom.y}%`,
                    transform: zoom.active ? "scale(1.8)" : "scale(1)",
                  }}
                  className="pd-img-in h-full w-full object-cover transition-transform duration-300 ease-out"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FiPackage size={48} className="text-neutral-300" />
                </div>
              )}

              {/* Stock badge */}
              <span
                className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur sm:left-5 sm:top-5 ${
                  outOfStock
                    ? "bg-red-50/95 text-red-600"
                    : "bg-white/95 text-green-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    outOfStock ? "bg-red-500" : "bg-green-600"
                  }`}
                />
                {outOfStock ? "Out of Stock" : "In Stock"}
              </span>

              {/* Floating actions */}
              <div className="absolute right-3 top-3 flex flex-col gap-2 sm:right-5 sm:top-5">
                <button
                  type="button"
                  onClick={() => setWished((w) => !w)}
                  aria-label="Add to wishlist"
                  aria-pressed={wished}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:scale-105 active:scale-95"
                >
                  <FiHeart
                    key={String(wished)}
                    size={17}
                    className={`pd-heart ${
                      wished
                        ? "fill-rose-500 text-rose-500"
                        : "text-neutral-800"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:scale-105 active:scale-95"
                >
                  <FiShare2 size={17} className="text-neutral-800" />
                </button>
              </div>

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-md transition hover:bg-neutral-950 hover:text-white group-hover:opacity-100"
                  >
                    <FiChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 opacity-0 shadow-md transition hover:bg-neutral-950 hover:text-white group-hover:opacity-100"
                  >
                    <FiChevronRight size={18} />
                  </button>

                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white backdrop-blur">
                    {selectedImage + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:mt-4 sm:gap-4">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    data-aos="zoom-in"
                    data-aos-delay={index * 80}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                      selectedImage === index
                        ? "border-neutral-950 shadow-md"
                        : "border-transparent opacity-70 hover:border-neutral-300 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.productName}, view ${index + 1}`}
                      loading="lazy"
                      onError={handleImgError}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Product Info ---------- */}
          <div className="flex min-w-0 flex-col md:sticky md:top-24">
            <h1
              data-aos="fade-up"
              className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              {product.productName}
            </h1>

            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-5 flex flex-wrap items-center gap-3"
            >
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {formatPrice(product.price)}
              </p>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-600">
                Inclusive of applicable taxes
              </span>
            </div>

            {/* Stock card */}
            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  {!outOfStock && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                  )}

                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                      outOfStock ? "bg-red-500" : "bg-green-600"
                    }`}
                  />
                </span>

                <p
                  className={`text-sm font-medium ${
                    outOfStock
                      ? "text-red-600"
                      : lowStock
                        ? "text-amber-600"
                        : "text-neutral-700"
                  }`}
                >
                  {outOfStock
                    ? "Currently out of stock"
                    : lowStock
                      ? `Hurry! Only ${product.stock} left in stock`
                      : "Available and ready to order"}
                </p>
              </div>

              {!outOfStock && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      lowStock ? "bg-amber-500" : "bg-green-600"
                    }`}
                    style={{ width: `${Math.max(stockPercent, 8)}%` }}
                  />
                </div>
              )}
            </div>

            {/* ---------- Estimated Delivery Checker ---------- */}
            <div
              data-aos="fade-up"
              data-aos-delay="180"
              className="mt-6 w-full min-w-0"
            >
              <DeliveryChecker />
            </div>

            {/* ---------- Quantity ---------- */}
            {!outOfStock && (
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="mt-7"
              >
                <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  Quantity
                </label>

                <div className="inline-flex items-center rounded-full border border-neutral-300 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((c) => Math.max(1, c - 1))
                    }
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiMinus size={15} />
                  </button>

                  <span
                    key={quantity}
                    className="pd-pop min-w-12 text-center text-sm font-medium"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((c) =>
                        Math.min(Number(product.stock), c + 1)
                      )
                    }
                    disabled={quantity >= Number(product.stock)}
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-neutral-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiPlus size={15} />
                  </button>
                </div>

                <p className="mt-2 text-xs text-neutral-500">
                  Maximum available: {product.stock}
                </p>
              </div>
            )}

            {/* ---------- Add to Cart ---------- */}
            <div
              data-aos="fade-up"
              data-aos-delay="250"
            >
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`pd-shine group relative mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full px-6 py-4 text-sm font-medium text-white shadow-lg transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none ${
                  added
                    ? "bg-green-700 shadow-green-700/20"
                    : "bg-neutral-950 shadow-neutral-900/20 hover:bg-neutral-800"
                }`}
              >
                {added ? (
                  <>
                    <FiCheck size={18} />
                    Added to cart
                  </>
                ) : (
                  <>
                    {outOfStock ? (
                      <FiPackage size={18} />
                    ) : (
                      <FiShoppingCart
                        size={18}
                        className="transition-transform group-hover:-translate-y-0.5"
                      />
                    )}

                    {outOfStock
                      ? "Currently unavailable"
                      : "Add to cart"}
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="group mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-medium transition hover:border-neutral-950"
              >
                <FiZap size={15} />
                View shopping bag
                <FiChevronRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* ---------- Trust Badges ---------- */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="mt-8 grid grid-cols-2 gap-3"
            >
              {TRUST.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 transition group-hover:bg-neutral-950 group-hover:text-white">
                    <Icon size={16} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{title}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-neutral-500">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- Accordion ---------- */}
            <div
              data-aos="fade-up"
              data-aos-delay="350"
              className="mt-8 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
              {panels.map(({ key, icon: Icon, title, body }) => {
                const open = openPanel === key;

                return (
                  <div key={key}>
                    <button
                      type="button"
                      onClick={() => setOpenPanel(open ? "" : key)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-neutral-50"
                    >
                      <span className="flex items-center gap-3 text-sm font-semibold">
                        <Icon size={16} className="text-neutral-500" />
                        {title}
                      </span>

                      <FiChevronDown
                        size={16}
                        className={`text-neutral-500 transition-transform duration-300 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        open
                          ? "grid-rows-[1fr]"
                          : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="whitespace-pre-line px-4 pb-4 text-sm leading-7 text-neutral-600">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              to="/products"
              className="group mt-8 inline-flex items-center gap-2 self-start text-xs font-medium text-neutral-600 transition hover:text-black"
            >
              <FiArrowLeft
                size={15}
                className="transition-transform group-hover:-translate-x-1"
              />
              Continue shopping
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Mobile Sticky Cart Bar ---------- */}
      {!outOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white/95 px-5 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
          <div className="min-w-0">
            <p className="truncate text-xs text-neutral-500">
              {product.productName}
            </p>

            <p className="text-base font-semibold">
              {formatPrice(Number(product.price) * quantity)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white transition active:scale-95 ${
              added ? "bg-green-700" : "bg-neutral-950"
            }`}
          >
            {added ? (
              <FiCheck size={16} />
            ) : (
              <FiShoppingCart size={16} />
            )}

            {added ? "Added" : "Add"}
          </button>
        </div>
      )}
    </main>
  );
}
