
import { useEffect, useState } from "react";
import {
  FiPackage,
  FiClock,
  FiMapPin,
  FiEdit2,
} from "react-icons/fi";
import api from "../services/api";

const DELIVERY_PINCODE_KEY = "deliveryPincode";
const DELIVERY_EVENT = "deliveryPincodeChanged";
const DELIVERY_CUTOFF_HOUR = 16;

// Demo fallback cities.
// Add more pincodes here when needed.
const PINCODE_LOCATIONS = {
  "612001": "Kumbakonam",
  "612002": "Kumbakonam",
  "612101": "Kumbakonam",
  "613001": "Thanjavur",
  "613002": "Thanjavur",
  "620001": "Tiruchirappalli",
  "620002": "Tiruchirappalli",
  "638001": "Erode",
  "638002": "Erode",
  "625001": "Madurai",
  "600001": "Chennai",
  "600002": "Chennai",
  "600028": "Chennai",
  "641001": "Coimbatore",
  "641002": "Coimbatore",
};

function getStoredPincode() {
  try {
    return localStorage.getItem(DELIVERY_PINCODE_KEY) || "";
  } catch {
    return "";
  }
}

// Current date/time in India.
function getIndiaParts(timestamp = Date.now()) {
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

  return Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );
}

// Countdown to the next 4 PM IST cutoff.
function getCountdown(now) {
  const india = getIndiaParts(now);
  const hour = Number(india.hour);

  const todayCutoff =
    Date.UTC(
      Number(india.year),
      Number(india.month) - 1,
      Number(india.day),
      DELIVERY_CUTOFF_HOUR,
      0,
      0
    ) -
    5.5 * 60 * 60 * 1000;

  const nextCutoff =
    hour >= DELIVERY_CUTOFF_HOUR
      ? todayCutoff + 24 * 60 * 60 * 1000
      : todayCutoff;

  const totalSeconds = Math.max(
    0,
    Math.floor((nextCutoff - now) / 1000)
  );

  const pad = (value) => String(value).padStart(2, "0");

  return {
    hours: pad(Math.floor(totalSeconds / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  };
}

// Format YYYY-MM-DD without changing its calendar day.
function formatArrivalDate(value) {
  if (!value) return "";

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    String(value)
  );

  let date;

  if (dateOnly) {
    const [, year, month, day] = dateOnly;

    date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      12
    );
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    ...(dateOnly ? {} : { timeZone: "Asia/Kolkata" }),
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Demo arrival estimate: three calendar days from today.
function getDemoArrivalDate(now) {
  const india = getIndiaParts(now);

  const date = new Date(
    Date.UTC(
      Number(india.year),
      Number(india.month) - 1,
      Number(india.day) + 3,
      12
    )
  );

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return formatArrivalDate(`${year}-${month}-${day}`);
}

// Get city from API first, then use the demo mapping.

function getDeliveryCity(delivery) {
  const candidates = [
    delivery?.city,
    delivery?.district,
    delivery?.cityName,
    delivery?.destinationCity,
    delivery?.location?.city,
    delivery?.address?.city,
  ];

  const city = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim().length > 0
  );

  return city ? city.trim() : "";
}


function DeliveryChecker() {
  const [pincode, setPincode] = useState(getStoredPincode);
  const [inputPincode, setInputPincode] = useState(
    getStoredPincode
  );
  const [isEditing, setIsEditing] = useState(
    () => !getStoredPincode()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Load the saved pincode's delivery estimate.
  useEffect(() => {
    const saved = getStoredPincode();

    if (!saved) return;

    let cancelled = false;

    async function loadSavedPincode() {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(
          `/delivery/check/${saved}`
        );

        if (data?.success === false) {
          throw new Error(
            data.message || "Unable to check delivery."
          );
        }

        const result = data?.delivery || data;

        if (
          result?.serviceable === false ||
          result?.available === false
        ) {
          throw new Error(
            result?.message ||
              "Delivery is unavailable for this pincode."
          );
        }

        if (cancelled) return;

        setDelivery(result);
        setPincode(saved);
        setInputPincode(saved);
        setIsEditing(false);
      } catch (err) {
        if (cancelled) return;

        setDelivery(null);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load delivery estimate."
        );
        setIsEditing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSavedPincode();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCheck = async (event) => {
    event.preventDefault();

    const value = inputPincode.trim();

    if (!/^[1-9]\d{5}$/.test(value)) {
      setError("Enter a valid 6-digit Indian pincode.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await api.get(
        `/delivery/check/${value}`
      );

      if (data?.success === false) {
        throw new Error(
          data.message || "Unable to check delivery."
        );
      }

      const result = data?.delivery || data;

      if (
        result?.serviceable === false ||
        result?.available === false
      ) {
        setDelivery(null);
        setError(
          result?.message ||
            "Delivery is unavailable for this pincode."
        );
        return;
      }

      localStorage.setItem(DELIVERY_PINCODE_KEY, value);

      setPincode(value);
      setInputPincode(value);
      setDelivery(result);
      setIsEditing(false);

      window.dispatchEvent(
        new CustomEvent(DELIVERY_EVENT, {
          detail: { pincode: value },
        })
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to check delivery. Please try again."
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

  const countdown = getCountdown(now);

  const arrivalLabel = delivery
    ? delivery.estimatedDateText ||
      formatArrivalDate(
        delivery.estimatedDeliveryDate ||
          delivery.estimatedDate
      ) ||
      getDemoArrivalDate(now)
    : "";

  const city = getDeliveryCity(delivery);

  // Expected display: Thanjavur – 613001
  const location = [city, pincode]
    .filter(Boolean)
    .join(" – ");

  return (
    <section className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-700">
      {/* Heading */}
      <div className="flex items-center gap-2 px-3 pt-3 text-xs font-medium text-neutral-800">
        <FiPackage size={15} />
        <span>Estimated delivery</span>
      </div>

      {isEditing || !delivery ? (
        <form onSubmit={handleCheck} className="p-3 pt-2">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              value={inputPincode}
              disabled={loading}
              onChange={(event) => {
                setInputPincode(
                  event.target.value.replace(/\D/g, "")
                );
                setError("");
              }}
              placeholder="Enter pincode"
              aria-label="Delivery pincode"
              className="h-9 min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 text-xs outline-none transition focus:border-[#a2b65d] focus:ring-2 focus:ring-[#a2b65d]/30"
            />

            <button
              type="submit"
              disabled={loading}
              className="h-9 min-w-[76px] rounded-lg bg-[#a2b65d] px-4 text-xs font-medium text-white transition hover:bg-[#8fa64c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking..." : "Check"}
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="px-3 pb-3 pt-2">
          {/* Arrival date and live countdown */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p
              className="text-sm font-semibold text-[#8ba43e]"
              aria-live="polite"
            >
              Arrives by {arrivalLabel || getDemoArrivalDate(now)}
            </p>

            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-1.5 text-[10px] text-orange-700 sm:text-[11px]">
              <FiClock size={12} />
              <span>Order within</span>
              <strong>
                {countdown.hours}h {countdown.minutes}m{" "}
                {countdown.seconds}s
              </strong>
            </span>
          </div>

          {/* City and pincode */}
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
            <FiMapPin
              size={14}
              className="shrink-0 text-neutral-500"
            />

            <span className="min-w-0 flex-1">
              Deliver to{" "}
              <strong className="font-medium text-neutral-800">
                {location || pincode}
              </strong>
            </span>

            <button
              type="button"
              onClick={handleEdit}
              aria-label="Edit delivery pincode"
              className="shrink-0 rounded p-1 text-neutral-400 transition hover:text-[#8ba43e]"
            >
              <FiEdit2 size={14} />
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Demo API label */}
      <div className="border-t border-neutral-100 bg-neutral-50 px-3 py-1.5 text-right text-[10px] text-neutral-500">
        Powered by{" "}
        <span className="font-semibold">ST Courier Demo</span>
      </div>
    </section>
  );
}

export default DeliveryChecker;
