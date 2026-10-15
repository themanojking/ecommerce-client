import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiArrowLeft,
  FiMapPin,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiCheckCircle,
  FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../services/api";
import { clearCart } from "../redux/slices/cartSlice";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80";

const initialAddress = {
  name: "",
  useremail: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

const inputClass =
  "mt-2 w-full rounded-none border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition duration-300 placeholder:text-neutral-400 hover:border-neutral-500 focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] focus:ring-1 focus:ring-black";

const steps = [
  { label: "Bag", state: "done" },
  { label: "Delivery", state: "active" },
  { label: "Confirm", state: "todo" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart?.items || []);
  const { user } = useSelector((state) => state.auth || {});

  const [shippingAddress, setShippingAddress] = useState(() => ({
    ...initialAddress,
    name: user?.name || "",
    useremail: user?.useremail || "",
  }));

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  // Shipping amount managed by the Admin panel.
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

  // Fetch the current shipping amount from the server.
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
            "Unable to load shipping charges. Please refresh and try again."
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

  // Subtotal of products only.
  const total = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // Estimated total includes the Admin-configured shipping amount.
  const estimatedTotal = total + shippingAmount;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setShippingAddress((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (shippingLoading) {
      toast.error("Please wait while shipping charges load.");
      return;
    }

    if (shippingError) {
      toast.error(
        "Unable to verify shipping charges. Please refresh and try again."
      );
      return;
    }

    if (
      cartItems.some(
        (item) =>
          !item._id ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1 ||
          Number(item.quantity) > Number(item.stock)
      )
    ) {
      toast.error("Please check your cart quantities and stock.");
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          quantity: Number(item.quantity),
        })),
        shippingAddress,
        paymentMethod,

        // Informational values only.
        // The backend recalculates all prices before saving the order.
        itemsPrice: total,
        shippingPrice: shippingAmount,
        totalPrice: estimatedTotal,
      };

      const { data } = await api.post("/orders", orderPayload);

      dispatch(clearCart());
      toast.success("Order placed successfully!");

      const orderId = data.order?._id || data._id;

      if (orderId) {
        navigate(`/order-success/${orderId}`);
      } else {
        navigate("/orders");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to place your order. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center overflow-x-hidden bg-white px-5 py-16">
        <div className="max-w-md text-center">
          <div
            data-aos="zoom-in"
            className="mx-auto flex h-16 w-16 items-center justify-center bg-neutral-100"
          >
            <FiShoppingBag size={28} />
          </div>

          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-6 text-3xl font-medium tracking-tight"
          >
            Your cart is empty
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="150"
            className="mt-3 text-sm leading-6 text-neutral-500"
          >
            Add your favorite products before proceeding to checkout.
          </p>

          <div data-aos="fade-up" data-aos-delay="200">
            <Link
              to="/products"
              className="group mt-7 inline-flex items-center gap-2 bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              Explore products
              <FiArrowLeft className="rotate-180 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const Spinner = (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pb-28 text-neutral-900 lg:pb-0">
      <style>{`
        @keyframes co-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .co-pop { animation: co-pop 0.35s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .co-pop { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        <Link
          to="/cart"
          data-aos="fade-right"
          className="group inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-black"
        >
          <FiArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to shopping bag
        </Link>

        <div
          data-aos="fade-up"
          className="mt-8 border-b border-neutral-200 pb-7"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
            Final step
          </p>

          <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Complete your delivery details to place your order.
          </p>

          {/* Progress steps */}
          <ol className="mt-6 flex items-center gap-2 text-[11px] sm:gap-3 sm:text-xs">
            {steps.map((step, i) => (
              <li
                key={step.label}
                className="flex items-center gap-2 sm:gap-3"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                    step.state === "done"
                      ? "bg-black text-white"
                      : step.state === "active"
                        ? "border border-black text-black"
                        : "border border-neutral-300 text-neutral-400"
                  }`}
                >
                  {step.state === "done" ? <FiCheck size={12} /> : i + 1}
                </span>

                <span
                  className={
                    step.state === "todo"
                      ? "text-neutral-400"
                      : "text-neutral-900"
                  }
                >
                  {step.label}
                </span>

                {i < steps.length - 1 && (
                  <span className="h-px w-6 bg-neutral-300 sm:w-12" />
                )}
              </li>
            ))}
          </ol>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16"
        >
          <div className="space-y-8">
            {/* Shipping address */}
            <section data-aos="fade-up">
              <div className="flex items-center gap-4 border-b border-neutral-200 pb-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-neutral-100">
                  <FiMapPin size={19} />
                </span>

                <div>
                  <h2 className="text-lg font-medium">Delivery address</h2>
                  <p className="mt-1 text-xs text-neutral-500">
                    Where should we send your order?
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
                <div data-aos="fade-up" data-aos-delay="50">
                  <label htmlFor="name" className="text-xs font-semibold">
                    Full name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>

                <div data-aos="fade-up" data-aos-delay="100">
                  <label
                    htmlFor="useremail"
                    className="text-xs font-semibold"
                  >
                    Email address *
                  </label>
                  <input
                    id="useremail"
                    name="useremail"
                    type="email"
                    value={shippingAddress.useremail}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                </div>

                <div data-aos="fade-up" data-aos-delay="150">
                  <label htmlFor="phone" className="text-xs font-semibold">
                    Phone number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9+\-\s()]{7,20}"
                    autoComplete="tel"
                    className={inputClass}
                    placeholder="Your contact number"
                  />
                </div>

                <div data-aos="fade-up" data-aos-delay="200">
                  <label
                    htmlFor="postalCode"
                    className="text-xs font-semibold"
                  >
                    Postal code *
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleChange}
                    required
                    autoComplete="postal-code"
                    className={inputClass}
                    placeholder="Postal code"
                  />
                </div>

                <div className="sm:col-span-2" data-aos="fade-up">
                  <label htmlFor="address" className="text-xs font-semibold">
                    Street address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    autoComplete="street-address"
                    className={`${inputClass} resize-y`}
                    placeholder="House number, street, area"
                  />
                </div>

                <div data-aos="fade-up">
                  <label htmlFor="city" className="text-xs font-semibold">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    required
                    autoComplete="address-level2"
                    className={inputClass}
                    placeholder="City"
                  />
                </div>

                <div data-aos="fade-up" data-aos-delay="50">
                  <label htmlFor="state" className="text-xs font-semibold">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    required
                    autoComplete="address-level1"
                    className={inputClass}
                    placeholder="State"
                  />
                </div>

                <div className="sm:col-span-2" data-aos="fade-up">
                  <label htmlFor="country" className="text-xs font-semibold">
                    Country *
                  </label>
                  <input
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleChange}
                    required
                    autoComplete="country-name"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Payment method */}
            <section data-aos="fade-up">
              <div className="flex items-center gap-4 border-b border-neutral-200 pb-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-neutral-100">
                  <FiTruck size={19} />
                </span>

                <div>
                  <h2 className="text-lg font-medium">Payment method</h2>
                  <p className="mt-1 text-xs text-neutral-500">
                    Choose how you would like to pay.
                  </p>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-4 border border-neutral-300 p-4 transition duration-300 hover:border-neutral-500 has-[:checked]:border-black has-[:checked]:bg-neutral-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-1 accent-black"
                />

                <span className="flex-1">
                  <span className="block text-sm font-medium">
                    Cash on Delivery (COD)
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-neutral-500">
                    Pay when your order arrives.
                  </span>
                </span>

                <FiCheckCircle
                  size={18}
                  className="mt-0.5 text-neutral-700"
                />
              </label>
            </section>
          </div>

          {/* Order summary */}
          <aside className="border border-neutral-200 p-5 sm:p-7 lg:sticky lg:top-24">
            <div data-aos="fade-up">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Your purchase
              </p>

              <h2 className="mt-2 text-xl font-medium">Order summary</h2>

              <p className="mt-1 text-xs text-neutral-500">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="mt-6 max-h-80 space-y-5 overflow-y-auto pr-1">
              {cartItems.map((item, i) => (
                <div
                  key={item._id}
                  data-aos="fade-left"
                  data-aos-delay={Math.min(i, 5) * 70}
                  className="flex items-start gap-3"
                >
                  <div className="relative h-[68px] w-[58px] shrink-0 overflow-hidden bg-neutral-100">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.productName}
                        loading="lazy"
                        onError={handleImgError}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FiShoppingBag className="text-neutral-400" />
                      </div>
                    )}

                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[9px] text-white">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xs font-medium leading-5">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium">
                    {formatPrice(
                      Number(item.price) * Number(item.quantity)
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-neutral-200" />

            <div data-aos="fade-up" className="space-y-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="flex justify-between gap-3 text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-right">
                  {shippingLoading
                    ? "Loading..."
                    : shippingError
                      ? "Unavailable"
                      : formatPrice(shippingAmount)}
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-neutral-200" />

            <div data-aos="fade-up">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Order total</span>
                <span
                  key={estimatedTotal}
                  className="co-pop text-xl font-semibold"
                >
                  {shippingLoading || shippingError
                    ? "—"
                    : formatPrice(estimatedTotal)}
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-neutral-500">
                Shipping charges are based on the current store settings.
              </p>

              <button
                type="submit"
                disabled={
                  loading ||
                  shippingLoading ||
                  shippingError ||
                  cartItems.length === 0
                }
                className="group mt-6 flex min-h-14 w-full items-center justify-center gap-2 bg-black px-5 py-4 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                {loading ? (
                  <>
                    {Spinner}
                    Placing order...
                  </>
                ) : (
                  <>
                    Place order
                    <FiArrowLeft
                      className="rotate-180 transition-transform group-hover:translate-x-1"
                      size={15}
                    />
                  </>
                )}
              </button>
            </div>

            <div
              data-aos="fade-up"
              className="mt-5 flex items-start gap-3 border-t border-neutral-200 pt-5"
            >
              <FiShield
                size={17}
                className="mt-0.5 shrink-0 text-neutral-600"
              />
              <p className="text-[11px] leading-5 text-neutral-500">
                Please review your delivery address and order details before
                confirming.
              </p>
            </div>
          </aside>

          {/* Mobile / tablet sticky place-order bar */}
          <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
            <div className="min-w-0">
              <p className="text-[11px] text-neutral-500">Order total</p>
              <p
                key={estimatedTotal}
                className="co-pop text-lg font-semibold"
              >
                {shippingLoading || shippingError
                  ? "—"
                  : formatPrice(estimatedTotal)}
              </p>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                shippingLoading ||
                shippingError ||
                cartItems.length === 0
              }
              className="inline-flex shrink-0 items-center gap-2 bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {loading ? (
                <>
                  {Spinner}
                  Placing...
                </>
              ) : (
                "Place order"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
