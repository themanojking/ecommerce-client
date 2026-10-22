
import { useEffect, useState } from "react";
import { FiPackage, FiMapPin, FiEdit2 } from "react-icons/fi";
import api from "../services/api";

const STORAGE_KEY = "deliveryPincode";

export default function DeliveryChecker() {
  const [pincode, setPincode] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    const savedPincode = localStorage.getItem(STORAGE_KEY);

    if (savedPincode) {
      checkPincode(savedPincode);
    }
    // Run once on mount to restore the saved pincode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkPincode(value = pincode) {
    const pin = String(value).trim();

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      setError("Enter a valid 6-digit pincode.");
      setDelivery(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        `/delivery/check/${pin}`
      );

      if (!data.success) {
        throw new Error(data.message || "Unable to check delivery.");
      }

      localStorage.setItem(STORAGE_KEY, pin);
      setPincode(pin);
      setDelivery(data);
      setEditing(false);
    } catch (err) {
      setDelivery(null);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to check delivery. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-5 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-800">
      <div className="flex items-center gap-2 px-4 py-3">
        <FiPackage size={20} />
        <h3 className="text-sm font-medium">
          Estimated Delivery Date
        </h3>
      </div>

      {(!delivery || editing) && (
        <form
          className="flex gap-2 px-4 pb-4"
          onSubmit={(event) => {
            event.preventDefault();
            checkPincode();
          }}
        >
          <input
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={pincode}
            onChange={(event) => {
              setPincode(
                event.target.value.replace(/\D/g, "").slice(0, 6)
              );
              setError("");
            }}
            placeholder="Enter 6-digit pincode"
            aria-label="Delivery pincode"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-lime-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-lime-600 px-5 py-2 text-sm font-semibold text-white hover:bg-lime-700 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="px-4 pb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {delivery && !editing && (
        <div className="border-t border-gray-100 px-4 py-4">
          <p className="text-xs text-gray-500">Arrives By (estimated)</p>

          <p className="mt-1 text-lg font-bold text-lime-700">
            {delivery.estimatedDateText}
          </p>

          <div className="mt-3 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-xs text-orange-800">
            <FiPackage className="mt-0.5 shrink-0" />
            Approximate delivery: {delivery.dispatchDays} dispatch
            business day(s) + {delivery.transitDays} transit
            business day(s).
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-dashed border-gray-200 pt-3 text-sm">
            <FiMapPin className="shrink-0" />

            <span className="min-w-0 flex-1">
              Deliver to {delivery.city} – {delivery.pincode}
              <span className="block text-xs text-gray-500">
                {delivery.state}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Change delivery pincode"
              className="rounded p-2 text-gray-500 hover:bg-gray-100"
            >
              <FiEdit2 size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-right text-xs text-gray-500">
        Estimated delivery
      </div>
    </section>
  );
}
