import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiPackage,
  FiShoppingBag,
  FiClipboard,
  FiCheck,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";

// Decorative confetti pieces (positions / timing are fixed so renders stay stable)
const confetti = [
  { left: "6%", delay: "0s", duration: "5.2s", size: 8, shade: "bg-neutral-900" },
  { left: "14%", delay: "0.6s", duration: "6.1s", size: 6, shade: "bg-neutral-400" },
  { left: "22%", delay: "1.2s", duration: "5.6s", size: 10, shade: "bg-neutral-300" },
  { left: "31%", delay: "0.3s", duration: "6.4s", size: 7, shade: "bg-neutral-700" },
  { left: "42%", delay: "1.6s", duration: "5.4s", size: 9, shade: "bg-neutral-900" },
  { left: "53%", delay: "0.9s", duration: "6.2s", size: 6, shade: "bg-neutral-400" },
  { left: "62%", delay: "0.2s", duration: "5.8s", size: 8, shade: "bg-neutral-300" },
  { left: "71%", delay: "1.4s", duration: "6.0s", size: 10, shade: "bg-neutral-700" },
  { left: "80%", delay: "0.7s", duration: "5.3s", size: 7, shade: "bg-neutral-900" },
  { left: "88%", delay: "1.1s", duration: "6.3s", size: 9, shade: "bg-neutral-400" },
  { left: "95%", delay: "0.4s", duration: "5.7s", size: 6, shade: "bg-neutral-300" },
];

export default function OrderSuccess() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 20,
    });
  }, []);

  const copyOrderId = async () => {
    if (!id) return;

    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Order ID copied!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy. Please copy the order ID manually.");
    }
  };

  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-white px-5 py-12 text-neutral-900 sm:py-16">
      <style>{`
        @keyframes os-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(80vh) rotate(540deg); opacity: 0; }
        }
        @keyframes os-ring {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes os-pop {
          0% { transform: scale(0); }
          60% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes os-draw {
          to { stroke-dashoffset: 0; }
        }
        .os-confetti { animation: os-fall linear infinite; }
        .os-ring { animation: os-ring 2.4s ease-out infinite; }
        .os-pop { animation: os-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .os-check {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: os-draw 0.55s 0.45s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .os-confetti, .os-ring { animation: none; opacity: 0; }
          .os-pop { animation: none; }
          .os-check { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Decorative confetti (hidden from assistive tech) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
      >
        {confetti.map((piece, i) => (
          <span
            key={i}
            className={`os-confetti absolute top-0 ${piece.shade}`}
            style={{
              left: piece.left,
              width: piece.size,
              height: piece.size,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Confirmation */}
        <div className="text-center">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="os-ring absolute inset-0 rounded-full border border-neutral-900" />
            <div className="os-pop flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
              <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path className="os-check" d="M7.5 12.5l3 3 6-6.5" />
              </svg>
            </div>
          </div>

          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="mt-7 text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-500"
          >
            Order confirmation
          </p>

          <h1
            data-aos="fade-up"
            data-aos-delay="400"
            className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl"
          >
            Thank you for your order.
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="500"
            className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500"
          >
            Your order has been placed successfully. We appreciate your
            purchase. You can view your order details and check its status
            from your orders page.
          </p>
        </div>

        {/* Order ID */}
        {id && (
          <section
            data-aos="fade-up"
            data-aos-delay="600"
            className="mt-10 border border-neutral-200 bg-white/90 p-5 backdrop-blur sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-100">
                <FiClipboard size={18} />
              </span>

              <div>
                <h2 className="text-sm font-semibold">Order reference</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Keep this ID for your records.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all text-sm font-medium tracking-wide">
                {id}
              </p>

              <button
                type="button"
                onClick={copyOrderId}
                className={`inline-flex shrink-0 items-center justify-center gap-2 border px-4 py-2.5 text-xs font-medium transition active:scale-95 ${
                  copied
                    ? "border-green-700 bg-green-700 text-white"
                    : "border-neutral-300 hover:border-black hover:bg-black hover:text-white"
                }`}
              >
                {copied ? <FiCheck size={15} /> : <FiClipboard size={15} />}
                {copied ? "Copied" : "Copy order ID"}
              </button>
            </div>
          </section>
        )}

        {/* Next steps */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          <div
            data-aos="fade-right"
            data-aos-delay="700"
            className="flex items-start gap-3 border border-neutral-200 bg-white/90 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-neutral-400"
          >
            <FiPackage size={19} className="mt-0.5 shrink-0" />

            <div>
              <h3 className="text-sm font-medium">Track your order</h3>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                View order details and check delivery status.
              </p>
            </div>
          </div>

          <div
            data-aos="fade-left"
            data-aos-delay="700"
            className="flex items-start gap-3 border border-neutral-200 bg-white/90 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-neutral-400"
          >
            <FiShield size={19} className="mt-0.5 shrink-0" />

            <div>
              <h3 className="text-sm font-medium">Order placed securely</h3>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Your order details are available in your account.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div
          data-aos="fade-up"
          data-aos-delay="800"
          className="mt-8 grid gap-3 sm:grid-cols-2"
        >
          <Link
            to="/orders"
            className="group inline-flex min-h-12 items-center justify-center gap-2 bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-[0.99]"
          >
            <FiPackage size={17} />
            View my orders
            <FiArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            to="/products"
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-black hover:bg-neutral-50 active:scale-[0.99]"
          >
            <FiShoppingBag size={17} />
            Continue shopping
          </Link>
        </div>

        <p
          data-aos="fade-up"
          data-aos-delay="900"
          className="mt-6 text-center text-xs text-neutral-400"
        >
          Thank you for shopping with us.
        </p>
      </div>
    </main>
  );
}