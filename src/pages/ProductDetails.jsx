import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

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
  FiChevronLeft,
  FiClock,
  FiMapPin,
  FiEdit2,
} from "react-icons/fi";

import toast from "react-hot-toast";
import api from "../services/api";
import { addToCart } from "../redux/slices/cartSlice";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

const STORAGE_KEY = "deliveryPincode";
const DELIVERY_EVENT = "deliveryPincodeChanged";
const INDIA_OFFSET_MS = 330 * 60 * 1000;
const CUTOFF_HOUR = 16; // 4 PM India time

/*
 * Height of your site navbar/header. The page fills the remaining
 * viewport so the document itself never scrolls.
 * Change this (or set --nav-h in your CSS) to match your header.
 */
const NAV_HEIGHT = "var(--nav-h, 4rem)";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

const TRUST = [
  { icon: FiTruck, title: "Fast delivery" },
  { icon: FiRefreshCw, title: "Easy returns" },
  { icon: FiShield, title: "Quality assured" },
  { icon: FiLock, title: "Secure payment" },
];

/* =========================================================
   DELIVERY CHECKER (compact)
   ========================================================= */

function DeliveryChecker() {
  const [pincode, setPincode] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );
  const [inputPincode, setInputPincode] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );
  const [isEditing, setIsEditing] = useState(
    () => !localStorage.getItem(STORAGE_KEY)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const getIndiaParts = (timestamp) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(timestamp));

    return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  };

  const getCountdown = () => {
    const india = getIndiaParts(now);
    let cutoff =
      Date.UTC(
        Number(india.year),
        Number(india.month) - 1,
        Number(india.day),
        CUTOFF_HOUR,
        0,
        0
      ) - INDIA_OFFSET_MS;

    if (Number(india.hour) >= CUTOFF_HOUR) cutoff += 24 * 60 * 60 * 1000;

    return Math.max(0, cutoff - now);
  };

  const formatCountdown = (ms) => {
    const total = Math.floor(ms / 1000);
    const pad = (v) => String(v).padStart(2, "0");
    return `${pad(Math.floor(total / 3600))}h ${pad(
      Math.floor((total % 3600) / 60)
    )}m ${pad(total % 60)}s`;
  };

  const handleCheck = async (event) => {
    event.preventDefault();
    const value = inputPincode.trim();

    if (!/^[1-9]\d{5}$/.test(value)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(`/delivery/check/${value}`);

      if (data?.success === false) {
        throw new Error(
          data.message || "Delivery is not available for this pincode."
        );
      }

      localStorage.setItem(STORAGE_KEY, value);
      setPincode(value);
      setInputPincode(value);
      setDelivery(data?.delivery || data);
      setIsEditing(false);

      window.dispatchEvent(
        new CustomEvent(DELIVERY_EVENT, { detail: { pincode: value } })
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to check delivery."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setInputPincode(pincode);
    setError("");
    setIsEditing(true);
  };

  const getArrivalDate = () => {
    const dateValue =
      delivery?.estimatedDeliveryDate || delivery?.estimatedDate;

    if (dateValue) {
      const parsed = new Date(dateValue);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    const india = getIndiaParts(now);
    return new Date(
      Date.UTC(
        Number(india.year),
        Number(india.month) - 1,
        Number(india.day) + 3,
        12,
        0,
        0
      )
    );
  };

  const arrivalLabel =
    delivery?.estimatedDateText ||
    getArrivalDate().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const location = [delivery?.city, delivery?.state, pincode]
    .filter(Boolean)
    .join(" – ");

  return (
    <section className="rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center gap-2 px-3 pt-2.5 text-xs font-medium text-neutral-700">
        <FiPackage size={14} />
        Estimated delivery
      </div>

      {isEditing || !pincode ? (
        <form onSubmit={handleCheck} className="p-3 pt-2">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={inputPincode}
              disabled={loading}
              onChange={(e) => {
                setInputPincode(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              placeholder="Enter pincode"
              aria-label="Enter delivery pincode"
              className="h-9 min-w-0 flex-1 rounded-lg border border-[#a2b65d] px-3 text-xs outline-none transition focus:ring-2 focus:ring-[#a2b65d]/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-9 rounded-lg bg-[#a2b65d] px-4 text-xs font-medium text-white transition hover:bg-[#8fa64d] disabled:opacity-60"
            >
              {loading ? "Checking…" : "Check"}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-1.5 text-[11px] text-red-600">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="space-y-1.5 p-3 pt-1.5">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-sm font-semibold text-[#8ba43e]">
              Arrives by {arrivalLabel}
            </p>
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-[11px] text-orange-700">
              <FiClock size={11} />
              Order within <strong>{formatCountdown(getCountdown())}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <FiMapPin size={13} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              Deliver to {location || pincode}
            </span>
            <button
              type="button"
              onClick={handleEdit}
              aria-label="Edit delivery pincode"
              className="rounded p-1 text-neutral-400 transition hover:text-[#8ba43e]"
            >
              <FiEdit2 size={14} />
            </button>
          </div>

          {error && (
            <p role="alert" className="text-[11px] text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   PRODUCT DETAILS PAGE – fits the viewport, no page scroll
   ========================================================= */

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
  const [tab, setTab] = useState("details");
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`/products/${id}`);
        const fetched = data.product || data;

        if (active) {
          setProduct(fetched);
          setQuantity(1);
          setSelectedImage(0);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load this product."
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
        await navigator.share({ title: product?.productName, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // User cancelled sharing.
    }
  };

  const handleZoomMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom({
      active: true,
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const shell = { height: `calc(100dvh - ${NAV_HEIGHT})` };

  /* Loading */
  if (loading) {
    return (
      <main
        style={shell}
        className="overflow-hidden bg-white px-4 py-4 sm:px-8"
      >
        <div className="mx-auto grid h-full max-w-7xl animate-pulse grid-rows-[38%_1fr] gap-4 md:grid-cols-2 md:grid-rows-1 md:gap-10">
          <div className="rounded-2xl bg-neutral-200" />
          <div className="space-y-4 py-2">
            <div className="h-8 w-4/5 rounded-xl bg-neutral-200" />
            <div className="h-6 w-1/3 rounded-xl bg-neutral-200" />
            <div className="h-20 rounded-xl bg-neutral-200" />
            <div className="h-12 rounded-full bg-neutral-200" />
          </div>
        </div>
      </main>
    );
  }

  /* Error */
  if (error || !product) {
    return (
      <main
        style={shell}
        className="flex flex-col items-center justify-center overflow-hidden bg-white px-5 text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <FiPackage size={28} className="text-neutral-400" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Product not found</h1>
        <p className="mt-2 max-w-md text-sm text-neutral-500">
          {error || "This product may have been removed."}
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm text-white transition hover:bg-neutral-700"
        >
          <FiArrowLeft />
          Back to products
        </Link>
      </main>
    );
  }

  const images = product.images?.filter(Boolean) || [];
  const outOfStock = Number(product.stock) < 1 || !product.isAvailable;
  const lowStock = !outOfStock && Number(product.stock) <= 5;

  const goPrev = () =>
    setSelectedImage((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setSelectedImage((i) => (i + 1) % images.length);

  const tabs = [
    {
      key: "details",
      title: "Details",
      body: product.description || "Details coming soon.",
    },
    {
      key: "delivery",
      title: "Delivery & returns",
      body: "Delivery options and timing are confirmed during checkout. Review the return policy before placing your order.",
    },
  ];
  const activeTab = tabs.find((t) => t.key === tab) || tabs[0];

  return (
    <main
      style={shell}
      className="flex flex-col overflow-hidden bg-white text-neutral-900"
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex h-9 w-full max-w-7xl shrink-0 items-center gap-1.5 px-4 text-xs text-neutral-500 sm:px-8"
      >
        <Link to="/" className="transition hover:text-black">
          Home
        </Link>
        <FiChevronRight size={12} />
        <Link to="/products" className="transition hover:text-black">
          Products
        </Link>
        <FiChevronRight size={12} />
        <span className="min-w-0 truncate font-medium text-neutral-900">
          {product.productName}
        </span>
      </nav>

      {/* Content: image on top (mobile) / left (desktop) */}
      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-rows-[minmax(0,36%)_minmax(0,1fr)] gap-3 px-4 pb-3 sm:px-8 md:grid-cols-2 md:grid-rows-1 md:gap-8 lg:gap-12">
        {/* ============ Gallery ============ */}
        <div className="flex min-h-0 min-w-0 gap-3 md:flex-row">
          {/* Vertical thumbnails (md+) */}
          {images.length > 1 && (
            <div className="hidden min-h-0 w-16 shrink-0 flex-col gap-2 overflow-y-auto pr-0.5 md:flex lg:w-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  className={`aspect-square w-full shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selectedImage === index
                      ? "border-neutral-950"
                      : "border-transparent opacity-70 hover:opacity-100"
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

          {/* Main image */}
          <div
            className="group relative min-h-0 min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-200/70"
            onMouseMove={handleZoomMove}
            onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
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
                className="h-full w-full object-cover transition-transform duration-300 ease-out"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <FiPackage size={44} className="text-neutral-300" />
              </div>
            )}

            <span
              className={`absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur ${
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

            <div className="absolute right-2.5 top-2.5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setWished((v) => !v)}
                aria-label="Add to wishlist"
                aria-pressed={wished}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-105 active:scale-95"
              >
                <FiHeart
                  size={16}
                  className={
                    wished ? "fill-rose-500 text-rose-500" : "text-neutral-800"
                  }
                />
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-105 active:scale-95"
              >
                <FiShare2 size={16} className="text-neutral-800" />
              </button>
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous image"
                  className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:bg-neutral-950 hover:text-white md:opacity-0 md:group-hover:opacity-100"
                >
                  <FiChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next image"
                  className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:bg-neutral-950 hover:text-white md:opacity-0 md:group-hover:opacity-100"
                >
                  <FiChevronRight size={17} />
                </button>

                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white backdrop-blur">
                  {selectedImage + 1} / {images.length}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ============ Info panel ============ */}
        <div className="flex min-h-0 min-w-0 flex-col">
          {/* Scrollable inner area (only scrolls on very short screens) */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
            <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl lg:text-3xl">
              {product.productName}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                {formatPrice(product.price)}
              </p>
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] text-neutral-600">
                Inclusive of taxes
              </span>

              <span className="ml-auto flex items-center gap-2 text-xs">
                <span className="relative flex h-2 w-2">
                  {!outOfStock && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                  )}
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      outOfStock ? "bg-red-500" : "bg-green-600"
                    }`}
                  />
                </span>
                <span
                  className={`font-medium ${
                    outOfStock
                      ? "text-red-600"
                      : lowStock
                        ? "text-amber-600"
                        : "text-neutral-600"
                  }`}
                >
                  {outOfStock
                    ? "Out of stock"
                    : lowStock
                      ? `Only ${product.stock} left`
                      : "Ready to order"}
                </span>
              </span>
            </div>

            <DeliveryChecker />

            {/* Trust badges – compact single row */}
            <div className="grid grid-cols-4 gap-2">
              {TRUST.map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white px-1 py-2 text-center"
                >
                  <Icon size={15} className="text-neutral-600" />
                  <p className="text-[10px] font-medium leading-3 sm:text-[11px]">
                    {title}
                  </p>
                </div>
              ))}
            </div>

            {/* Tabs replace the tall accordion */}
            <div className="rounded-xl border border-neutral-200 bg-white">
              <div className="flex border-b border-neutral-200">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    aria-pressed={tab === t.key}
                    className={`flex-1 px-3 py-2 text-xs font-semibold transition ${
                      tab === t.key
                        ? "border-b-2 border-neutral-950 text-neutral-950"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>

              <p className="max-h-28 overflow-y-auto whitespace-pre-line p-3 text-xs leading-6 text-neutral-600 sm:text-sm">
                {activeTab.body}
              </p>
            </div>
          </div>

          {/* Pinned action bar – always visible, never scrolls away */}
          <div className="shrink-0 border-t border-neutral-200 bg-white pt-3">
            <div className="flex items-center gap-2.5">
              {!outOfStock && (
                <div className="inline-flex shrink-0 items-center rounded-full border border-neutral-300 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiMinus size={14} />
                  </button>

                  <span
                    className="min-w-8 text-center text-sm font-medium"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(Number(product.stock), q + 1))
                    }
                    disabled={quantity >= Number(product.stock)}
                    aria-label="Increase quantity"
                    className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-white shadow-md transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none ${
                  added
                    ? "bg-green-700"
                    : "bg-neutral-950 hover:bg-neutral-800"
                }`}
              >
                {added ? (
                  <>
                    <FiCheck size={17} />
                    Added
                  </>
                ) : (
                  <>
                    {outOfStock ? (
                      <FiPackage size={17} />
                    ) : (
                      <FiShoppingCart size={17} />
                    )}
                    <span className="truncate">
                      {outOfStock
                        ? "Currently unavailable"
                        : `Add to cart · ${formatPrice(
                            Number(product.price) * quantity
                          )}`}
                    </span>
                  </>
                )}
              </button>

              <Link
                to="/cart"
                aria-label="View shopping bag"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white transition hover:border-neutral-950"
              >
                <FiShoppingCart size={17} />
              </Link>
            </div>

            <Link
              to="/products"
              className="group mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-black"
            >
              <FiArrowLeft
                size={13}
                className="transition-transform group-hover:-translate-x-1"
              />
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}