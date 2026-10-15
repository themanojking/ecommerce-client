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
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";
import { addToCart } from "../redux/slices/cartSlice";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

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

  // Recalculate AOS once the real content renders
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => AOS.refreshHard(), 100);
      return () => clearTimeout(t);
    }
  }, [loading, product]);

  const handleAddToCart = () => {
    if (!product || product.stock < 1 || !product.isAvailable) {
      toast.error("This product is currently unavailable.");
      return;
    }

    if (quantity > product.stock) {
      toast.error("Requested quantity exceeds available stock.");
      return;
    }

    dispatch(
      addToCart({
        ...product,
        quantity,
      })
    );

    toast.success("Product added to cart!");

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-8 h-4 w-32 bg-neutral-100" />

          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="aspect-[4/5] bg-neutral-100" />

            <div className="space-y-6 py-5">
              <div className="h-3 w-28 bg-neutral-100" />
              <div className="h-10 w-4/5 bg-neutral-100" />
              <div className="h-6 w-1/3 bg-neutral-100" />
              <div className="h-24 bg-neutral-100" />
              <div className="h-14 bg-neutral-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-5 text-center">
        <div data-aos="zoom-in" className="flex flex-col items-center">
          <FiPackage size={36} className="text-neutral-400" />

          <h1 className="mt-5 text-2xl font-medium">Product not found</h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
            {error || "This product may have been removed."}
          </p>

          <Link
            to="/products"
            className="group mt-7 inline-flex items-center gap-2 bg-neutral-950 px-6 py-3.5 text-sm text-white transition hover:bg-neutral-700"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const images = product.images?.filter(Boolean) || [];
  const outOfStock = Number(product.stock) < 1 || !product.isAvailable;

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-24 text-neutral-900 md:pb-0">
      {/* Local keyframes */}
      <style>{`
        @keyframes pd-img-in {
          from { opacity: 0; transform: scale(1.04); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pd-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .pd-img-in { animation: pd-img-in 0.5s ease-out; }
        .pd-pop { animation: pd-pop 0.4s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .pd-img-in, .pd-pop { animation: none; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div
        data-aos="fade-down"
        className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-9 lg:px-12"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <Link to="/" className="transition hover:text-black">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="transition hover:text-black">
            Products
          </Link>
          <span>/</span>
          <span className="max-w-48 truncate text-neutral-900">
            {product.productName}
          </span>
        </div>
      </div>

      {/* Product details */}
      <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
          {/* Image gallery */}
          <div data-aos="fade-right" className="min-w-0">
            <div className="group relative aspect-[4/5] overflow-hidden bg-neutral-100">
              {images.length > 0 ? (
                <img
                  key={selectedImage}
                  src={images[selectedImage] || images[0]}
                  alt={product.productName}
                  onError={handleImgError}
                  className="pd-img-in h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FiPackage size={48} className="text-neutral-300" />
                </div>
              )}

              <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[10px] font-medium uppercase tracking-[0.16em] sm:left-5 sm:top-5">
                {outOfStock ? "Unavailable" : "In the collection"}
              </span>
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
                    className={`relative aspect-square overflow-hidden border transition ${
                      selectedImage === index
                        ? "border-neutral-950"
                        : "border-transparent opacity-80 hover:border-neutral-400 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.productName}, view ${index + 1}`}
                      loading="lazy"
                      onError={handleImgError}
                      className="h-full w-full object-cover"
                    />

                    {selectedImage === index && (
                      <span className="absolute bottom-1 right-1 bg-white p-1">
                        <FiCheck size={12} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product information (sticky wrapper has no AOS transform) */}
          <div className="flex min-w-0 flex-col md:sticky md:top-24">
            <p
              data-aos="fade-up"
              className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500 sm:text-xs"
            >
              {product.category || "Our collection"}
            </p>

            <h1
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-3 text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl"
            >
              {product.productName}
            </h1>

            <div
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-5 flex flex-wrap items-center gap-4"
            >
              <p className="text-2xl font-medium tracking-tight sm:text-3xl">
                {formatPrice(product.price)}
              </p>

              <span className="text-xs text-neutral-500">
                Inclusive of applicable taxes
              </span>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="mt-6 border-y border-neutral-200 py-4"
            >
              <div className="flex items-center gap-2">
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

                <p
                  className={`text-sm ${
                    outOfStock ? "text-red-600" : "text-neutral-700"
                  }`}
                >
                  {outOfStock
                    ? "Currently out of stock"
                    : Number(product.stock) <= 5
                      ? `Only ${product.stock} left in stock`
                      : "Available and ready to order"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div data-aos="fade-up" data-aos-delay="250" className="mt-6">
              <h2 className="text-sm font-semibold">Product details</h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
                {product.description || "Details coming soon."}
              </p>
            </div>

            {/* Quantity selector */}
            {!outOfStock && (
              <div data-aos="fade-up" data-aos-delay="300" className="mt-8">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-widest">
                  Quantity
                </label>

                <div className="inline-flex items-center border border-neutral-300">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex h-12 w-12 items-center justify-center transition hover:bg-neutral-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiMinus size={15} />
                  </button>

                  <span
                    key={quantity}
                    className="pd-pop min-w-12 text-center text-sm"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(Number(product.stock), current + 1)
                      )
                    }
                    disabled={quantity >= Number(product.stock)}
                    aria-label="Increase quantity"
                    className="flex h-12 w-12 items-center justify-center transition hover:bg-neutral-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <FiPlus size={15} />
                  </button>
                </div>

                {Number(product.stock) > 0 && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Maximum available: {product.stock}
                  </p>
                )}
              </div>
            )}

            {/* Add to cart */}
            <div data-aos="fade-up" data-aos-delay="350">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock}
                className={`group mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 px-6 py-4 text-sm font-medium text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300 ${
                  added
                    ? "bg-green-700"
                    : "bg-neutral-950 hover:bg-neutral-700"
                }`}
              >
                {added ? (
                  <>
                    <FiCheck size={18} />
                    Added to cart
                  </>
                ) : (
                  <>
                    <FiShoppingCart
                      size={18}
                      className="transition-transform group-hover:-translate-y-0.5"
                    />
                    {outOfStock ? "Currently unavailable" : "Add to cart"}
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center border border-neutral-300 px-6 py-3 text-sm font-medium transition hover:border-neutral-950"
              >
                View shopping bag
              </Link>
            </div>

            {/* Shopping information */}
            <div
              data-aos="fade-up"
              data-aos-delay="400"
              className="mt-8 space-y-4 border-t border-neutral-200 pt-6"
            >
              <div className="flex items-start gap-3">
                <FiTruck
                  size={19}
                  className="mt-0.5 shrink-0 text-neutral-600"
                />
                <div>
                  <p className="text-sm font-medium">Delivery information</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Delivery options and timing are confirmed during checkout.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiShield
                  size={19}
                  className="mt-0.5 shrink-0 text-neutral-600"
                />
                <div>
                  <p className="text-sm font-medium">Secure ordering</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Review your order details before placing your order.
                  </p>
                </div>
              </div>
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

      {/* Mobile sticky add-to-cart bar */}
      {!outOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur md:hidden">
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
            className={`inline-flex shrink-0 items-center gap-2 px-5 py-3 text-sm font-medium text-white transition active:scale-95 ${
              added ? "bg-green-700" : "bg-neutral-950"
            }`}
          >
            {added ? <FiCheck size={16} /> : <FiShoppingCart size={16} />}
            {added ? "Added" : "Add"}
          </button>
        </div>
      )}
    </main>
  );
}