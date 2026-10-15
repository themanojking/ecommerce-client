import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiShield,
  FiTruck,
} from "react-icons/fi";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../redux/slices/cartSlice";
import toast from "react-hot-toast";
import api from "../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.items || []);

  const [shippingAmount, setShippingAmount] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingError, setShippingError] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 30,
    });
  }, []);

  // Fetch the shipping fee configured in the Admin panel.
  useEffect(() => {
    let active = true;

    const fetchShippingAmount = async () => {
      try {
        const { data } = await api.get("/admin/shipping");
        const amount = Number(data?.shippingAmount);

        if (
          !data?.success ||
          !Number.isFinite(amount) ||
          amount < 0
        ) {
          throw new Error("Invalid shipping settings");
        }

        if (active) {
          setShippingAmount(amount);
          setShippingError(false);
        }
      } catch (error) {
        console.error("Failed to fetch shipping amount:", error);

        if (active) {
          setShippingError(true);
          toast.error(
            "Unable to load shipping charges. Please refresh the page."
          );
        }
      } finally {
        if (active) {
          setShippingLoading(false);
        }
      }
    };

    fetchShippingAmount();

    return () => {
      active = false;
    };
  }, []);

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // Product subtotal.
  const total = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // Subtotal plus the shipping fee configured by Admin.
  const estimatedTotal = total + shippingAmount;

  // Recalculate AOS positions when the list length changes.
  useEffect(() => {
    const t = setTimeout(() => AOS.refresh(), 100);
    return () => clearTimeout(t);
  }, [cartItems.length]);

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
    toast.success("Product removed from cart");
  };

  const handleQuantity = (item, quantity) => {
    if (quantity < 1) return;

    if (quantity > Number(item.stock)) {
      toast.error("You cannot add more than the available stock");
      return;
    }

    dispatch(updateQuantity({ id: item._id, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success("Cart cleared");
  };

  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center overflow-x-hidden bg-white px-5 py-16">
        <style>{`
          @keyframes cart-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .cart-float { animation: cart-float 3.5s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .cart-float { animation: none; }
          }
        `}</style>

        <div className="mx-auto w-full max-w-md text-center">
          <div
            data-aos="zoom-in"
            className="cart-float mx-auto flex h-20 w-20 items-center justify-center bg-neutral-100"
          >
            <FiShoppingBag size={32} className="text-neutral-800" />
          </div>

          <p
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-7 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500"
          >
            Your shopping bag
          </p>

          <h1
            data-aos="fade-up"
            data-aos-delay="150"
            className="mt-3 text-3xl font-medium tracking-tight text-black sm:text-4xl"
          >
            Your cart is empty
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mx-auto mt-4 max-w-sm text-sm leading-6 text-neutral-500"
          >
            Your next favorite find is waiting. Explore our collection and
            discover something you love.
          </p>

          <div data-aos="fade-up" data-aos-delay="250">
            <Link
              to="/products"
              className="group mt-8 inline-flex min-h-12 items-center justify-center gap-3 bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              Explore products
              <FiArrowLeft className="rotate-180 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-28 text-neutral-900 lg:pb-0">
      <style>{`
        @keyframes cart-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .cart-pop { animation: cart-pop 0.35s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .cart-pop { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        {/* Page heading */}
        <Link
          to="/products"
          data-aos="fade-right"
          className="group inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-black"
        >
          <FiArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-1"
          />
          Continue shopping
        </Link>

        <div
          data-aos="fade-up"
          className="mt-7 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6 sm:mt-9 sm:pb-8"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
              Almost yours
            </p>

            <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              Shopping bag
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              <span
                key={totalQuantity}
                className="cart-pop inline-block font-medium text-neutral-900"
              >
                {totalQuantity}
              </span>{" "}
              {totalQuantity === 1 ? "item" : "items"} in your bag
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            className="inline-flex items-center gap-2 pb-1 text-xs font-medium text-neutral-500 transition hover:text-red-600 active:scale-95"
          >
            <FiTrash2 size={14} />
            Clear bag
          </button>
        </div>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-14">
          {/* Cart items */}
          <section>
            <div className="hidden grid-cols-[minmax(0,1fr)_100px_110px] gap-4 border-b border-neutral-200 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 sm:grid">
              <span>Product</span>
              <span className="text-center">Quantity</span>
              <span className="text-right">Subtotal</span>
            </div>

            <div className="divide-y divide-neutral-200">
              {cartItems.map((item, index) => {
                const quantity = Number(item.quantity || 1);
                const subtotal = Number(item.price || 0) * quantity;

                return (
                  <article
                    key={item._id}
                    data-aos="fade-up"
                    data-aos-delay={Math.min(index, 5) * 70}
                    className="grid grid-cols-[100px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-5 sm:py-7"
                  >
                    {/* Product image */}
                    <Link
                      to={`/products/${item._id}`}
                      className="group flex aspect-[4/5] items-center justify-center overflow-hidden bg-neutral-100"
                    >
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.productName}
                          loading="lazy"
                          onError={handleImgError}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <FiShoppingBag
                          size={28}
                          className="text-neutral-300"
                        />
                      )}
                    </Link>

                    {/* Product information */}
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                            {item.category || "Collection"}
                          </p>

                          <Link
                            to={`/products/${item._id}`}
                            className="mt-1 block break-words text-sm font-medium leading-5 transition hover:text-neutral-500 sm:text-base"
                          >
                            {item.productName}
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item._id)}
                          aria-label={`Remove ${item.productName}`}
                          className="shrink-0 p-1 text-neutral-400 transition hover:text-red-600 active:scale-90 sm:hidden"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      <p className="mt-2 text-sm font-medium">
                        {formatPrice(item.price)}
                      </p>

                      <p className="mt-1 text-[11px] text-neutral-500">
                        {Number(item.stock) > 0
                          ? `${item.stock} available`
                          : "Stock availability needs checking"}
                      </p>

                      {/* Quantity and remove */}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                        <div className="inline-flex h-9 items-center border border-neutral-300">
                          <button
                            type="button"
                            onClick={() => handleQuantity(item, quantity - 1)}
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            className="flex h-full w-8 items-center justify-center transition hover:bg-neutral-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <FiMinus size={12} />
                          </button>

                          <span
                            key={quantity}
                            className="cart-pop min-w-8 text-center text-xs"
                            aria-live="polite"
                          >
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleQuantity(item, quantity + 1)}
                            disabled={quantity >= Number(item.stock)}
                            aria-label="Increase quantity"
                            className="flex h-full w-8 items-center justify-center transition hover:bg-neutral-100 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item._id)}
                          className="hidden items-center gap-1.5 text-xs text-neutral-500 transition hover:text-red-600 sm:inline-flex"
                        >
                          <FiTrash2 size={14} />
                          Remove
                        </button>

                        <p
                          key={subtotal}
                          className="cart-pop text-sm font-semibold sm:hidden"
                        >
                          {formatPrice(subtotal)}
                        </p>
                      </div>
                    </div>

                    {/* Desktop subtotal */}
                    <div className="hidden pt-1 text-right sm:block">
                      <p
                        key={subtotal}
                        className="cart-pop text-sm font-semibold"
                      >
                        {formatPrice(subtotal)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link
              to="/products"
              data-aos="fade-up"
              className="group mt-5 inline-flex items-center gap-2 text-xs font-medium text-neutral-600 transition hover:text-black"
            >
              <FiArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-1"
              />
              Add more products
            </Link>
          </section>

          {/* Order summary */}
          <aside className="border border-neutral-200 p-5 sm:p-7 lg:sticky lg:top-24">
            <div data-aos="fade-up">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Your order
              </p>

              <h2 className="mt-2 text-xl font-medium">Order summary</h2>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-6 space-y-4"
            >
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-neutral-500">
                  Subtotal ({totalQuantity} items)
                </span>
                <span key={total} className="cart-pop font-medium">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-right text-sm font-medium">
                  {shippingLoading
                    ? "Loading..."
                    : shippingError
                      ? "Unavailable"
                      : formatPrice(shippingAmount)}
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-neutral-200" />

            <div data-aos="fade-up" data-aos-delay="150">
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold">
                  Estimated total
                </span>
                <span
                  key={estimatedTotal}
                  className="cart-pop text-xl font-semibold"
                >
                  {shippingLoading || shippingError
                    ? "—"
                    : formatPrice(estimatedTotal)}
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-neutral-500">
                Shipping charges are based on the current store settings.
              </p>

              <Link
                to="/checkout"
                aria-disabled={shippingLoading || shippingError}
                onClick={(event) => {
                  if (shippingLoading || shippingError) {
                    event.preventDefault();
                    toast.error(
                      "Please wait until shipping charges are available."
                    );
                  }
                }}
                className={`group mt-6 flex min-h-14 w-full items-center justify-center gap-2 px-5 py-4 text-sm font-medium text-white transition active:scale-[0.99] ${
                  shippingLoading || shippingError
                    ? "cursor-not-allowed bg-neutral-400"
                    : "bg-black hover:bg-neutral-700"
                }`}
              >
                Proceed to checkout
                <FiArrowLeft
                  className="rotate-180 transition-transform group-hover:translate-x-1"
                  size={16}
                />
              </Link>
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="mt-6 space-y-4 border-t border-neutral-200 pt-5"
            >
              <div className="flex items-start gap-3">
                <FiTruck
                  size={18}
                  className="mt-0.5 shrink-0 text-neutral-600"
                />
                <div>
                  <p className="text-xs font-medium">
                    Delivery information
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                    Delivery details are confirmed during checkout.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiShield
                  size={18}
                  className="mt-0.5 shrink-0 text-neutral-600"
                />
                <div>
                  <p className="text-xs font-medium">Secure checkout</p>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-500">
                    Review your items and shipping details before placing your
                    order.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile / tablet sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="text-[11px] text-neutral-500">Estimated total</p>
          <p
            key={estimatedTotal}
            className="cart-pop text-lg font-semibold"
          >
            {shippingLoading || shippingError
              ? "—"
              : formatPrice(estimatedTotal)}
          </p>
        </div>

        <Link
          to="/checkout"
          onClick={(event) => {
            if (shippingLoading || shippingError) {
              event.preventDefault();
              toast.error(
                "Please wait until shipping charges are available."
              );
            }
          }}
          className={`inline-flex shrink-0 items-center gap-2 px-6 py-3.5 text-sm font-medium text-white transition active:scale-95 ${
            shippingLoading || shippingError
              ? "cursor-not-allowed bg-neutral-400"
              : "bg-black hover:bg-neutral-700"
          }`}
        >
          Checkout
          <FiArrowLeft className="rotate-180" size={16} />
        </Link>
      </div>
    </main>
  );
}
