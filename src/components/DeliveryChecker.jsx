import { useEffect, useState } from "react";
import {
  FiPackage,
  FiClock,
  FiMapPin,
  FiEdit2,
} from "react-icons/fi";
import api from "../services/api";

const DELIVERY_PINCODE_KEY = "deliveryPincode";
const DELIVERY_DETAILS_KEY = "deliveryDetails";
const DELIVERY_EVENT = "deliveryPincodeChanged";
const DELIVERY_CUTOFF_HOUR = 16; // 4 PM IST

// Safely read the saved pincode.
function getStoredPincode() {
  try {
    return localStorage.getItem(DELIVERY_PINCODE_KEY) || "";
  } catch {
    return "";
  }
}

// Safely read the complete saved delivery details.
function getStoredDelivery() {
  try {
    const saved = localStorage.getItem(DELIVERY_DETAILS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Get the current date and time in India.
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

// Format an arrival date without changing the calendar day.
function formatArrivalDate(value) {
  if (!value) return "";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    String(value)
  );

  let date;

  if (match) {
    const [, year, month, day] = match;

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
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Free Indian Postal Pincode API.
// The district is preferred for the displayed destination.
async function getIndianPincodeDetails(pincode) {
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${encodeURIComponent(
        pincode
      )}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (
      !Array.isArray(data) ||
      data[0]?.Status !== "Success" ||
      !Array.isArray(data[0]?.PostOffice) ||
      data[0].PostOffice.length === 0
    ) {
      return null;
    }

    const offices = data[0].PostOffice;

    // Prefer a useful district/city and state from the postal records.
    const office =
      offices.find(
        (item) =>
          item?.District &&
          item?.State &&
          item?.District.trim()
      ) || offices[0];

    return {
      city:
        office?.District?.trim() ||
        office?.Name?.trim() ||
        "",
      state: office?.State?.trim() || "",
      areaName: office?.Name?.trim() || "",
    };
  } catch (error) {
    // A postal API failure must not break the demo delivery checker.
    console.error("Indian pincode lookup failed:", error);
    return null;
  }
}

// Fetch demo delivery estimate and postal location together.
async function fetchDeliveryDetails(pincode) {
  const [deliveryResponse, postalDetails] = await Promise.all([
    api.get(`/delivery/check/${pincode}`),
    getIndianPincodeDetails(pincode),
  ]);

  const data = deliveryResponse.data;

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

  // Postal API district is preferred because it reliably identifies
  // the district associated with the entered Indian pincode.
  const city =
    postalDetails?.city ||
    result?.city ||
    result?.district ||
    result?.cityName ||
    result?.destinationCity ||
    result?.location?.city ||
    result?.address?.city ||
    "";

  const state =
    postalDetails?.state ||
    result?.state ||
    result?.stateName ||
    "";

  return {
    ...result,
    pincode,
    city,
    state,
    areaName:
      postalDetails?.areaName ||
      result?.areaName ||
      "",
  };
}

// Save all details so they survive page refreshes.
function saveDeliveryDetails(pincode, details) {
  try {
    localStorage.setItem(DELIVERY_PINCODE_KEY, pincode);
    localStorage.setItem(
      DELIVERY_DETAILS_KEY,
      JSON.stringify(details)
    );
  } catch (error) {
    console.error("Unable to save delivery details:", error);
  }
}

function DeliveryChecker() {
  const [pincode, setPincode] = useState(getStoredPincode);
  const [inputPincode, setInputPincode] = useState(
    getStoredPincode
  );

  const [delivery, setDelivery] = useState(getStoredDelivery);

  const [isEditing, setIsEditing] = useState(
    () => !getStoredPincode()
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  // Update the countdown every second.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Restore cached city/state immediately, then refresh the estimate.
  // This prevents the location disappearing when the page is refreshed.
  useEffect(() => {
    const savedPincode = getStoredPincode();
    const savedDelivery = getStoredDelivery();

    if (!savedPincode) return;

    if (savedDelivery) {
      setPincode(savedPincode);
      setInputPincode(savedPincode);
      setDelivery(savedDelivery);
      setIsEditing(false);
    }

    let cancelled = false;

    async function refreshSavedDelivery() {
      try {
        const details = await fetchDeliveryDetails(savedPincode);

        if (cancelled) return;

        saveDeliveryDetails(savedPincode, details);
        setPincode(savedPincode);
        setInputPincode(savedPincode);
        setDelivery(details);
        setIsEditing(false);
        setError("");
      } catch (err) {
        if (cancelled) return;

        // Keep the previously saved location if the API is temporarily
        // unavailable. Only show the form when there is no cached data.
        if (!savedDelivery) {
          setDelivery(null);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load delivery details."
          );
          setIsEditing(true);
        }
      }
    }

    refreshSavedDelivery();

    return () => {
      cancelled = true;
    };
  }, []);

  // Check a newly entered pincode.
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

      const details = await fetchDeliveryDetails(value);

      saveDeliveryDetails(value, details);

      setPincode(value);
      setInputPincode(value);
      setDelivery(details);
      setIsEditing(false);

      window.dispatchEvent(
        new CustomEvent(DELIVERY_EVENT, {
          detail: {
            pincode: value,
            city: details.city,
            state: details.state,
          },
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

  // Prefer the backend's earliest estimated delivery date.
  // Use a three-day demo estimate only when the backend has no date.
  const arrivalLabel = (() => {
    const dateValue =
      delivery?.estimatedDeliveryDate ||
      delivery?.estimatedDate;

    if (dateValue) {
      const formatted = formatArrivalDate(dateValue);

      if (formatted) return formatted;
    }

    if (delivery?.estimatedDateText) {
      return delivery.estimatedDateText;
    }

    const india = getIndiaParts(now);

    const fallback = new Date(
      Date.UTC(
        Number(india.year),
        Number(india.month) - 1,
        Number(india.day) + 3,
        12
      )
    );

    return formatArrivalDate(
      `${fallback.getUTCFullYear()}-${String(
        fallback.getUTCMonth() + 1
      ).padStart(2, "0")}-${String(
        fallback.getUTCDate()
      ).padStart(2, "0")}`
    );
  })();

  // Expected format: "Deliver to Thanjavur – 612001".
  const city = delivery?.city?.trim() || "";
  const state = delivery?.state?.trim() || "";

  const location = [
    city,
    pincode,
  ]
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
            <p
              role="alert"
              className="mt-2 text-xs text-red-600"
            >
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="px-3 pb-3 pt-2">
          {/* Estimated date and countdown */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <p
              className="text-sm font-semibold text-[#8ba43e]"
              aria-live="polite"
            >
              Arrives by {arrivalLabel}
            </p>

            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-1.5 text-[10px] text-orange-700 sm:text-[11px]">
              <FiClock size={12} />
              <span>Order within:</span>
              <strong>
                {countdown.hours}h {countdown.minutes}m{" "}
                {countdown.seconds}s
              </strong>
            </span>
          </div>

          {/* Destination: city and pincode */}
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
            <p
              role="alert"
              className="mt-2 text-xs text-red-600"
            >
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