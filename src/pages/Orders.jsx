
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import confetti from "canvas-confetti";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiPackage,
  FiShoppingBag,
  FiCalendar,
  FiArrowRight,
  FiRefreshCw,
  FiXCircle,
  FiAlertCircle,
  FiTruck,
  FiCheckCircle,
  FiShield,
  FiDownload,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80";

const handleImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

const progressSteps = ["Placed", "Processing", "Shipped", "Delivered"];

const progressIndex = (status) => {
  switch ((status || "Pending").toLowerCase()) {
    case "delivered":
      return 3;
    case "shipped":
      return 2;
    case "processing":
    case "confirmed":
      return 1;
    default:
      return 0;
  }
};

const Orders = () => {
  const { user } = useSelector((state) => state.auth || {});

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const previousStatuses = useRef({});
  const hasLoadedOrders = useRef(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 30,
    });
  }, []);

  const celebrateDelivery = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      startVelocity: 40,
      origin: { y: 0.6 },
    });

    window.setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 120,
        origin: { x: 0.1, y: 0.7 },
      });

      confetti({
        particleCount: 70,
        spread: 120,
        origin: { x: 0.9, y: 0.7 },
      });
    }, 300);

    toast.success("🎉 Your order has been delivered!");
  }, []);

  const fetchOrders = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError("");

        const { data } = await api.get("/orders/myorders");
        const result = Array.isArray(data) ? data : data.orders || [];

        if (hasLoadedOrders.current) {
          const newlyDelivered = result.some((order) => {
            const previousStatus = previousStatuses.current[order._id];

            return (
              previousStatus &&
              previousStatus !== "delivered" &&
              (order.status || "").toLowerCase() === "delivered"
            );
          });

          if (newlyDelivered) celebrateDelivery();
        }

        previousStatuses.current = Object.fromEntries(
          result.map((order) => [
            order._id,
            (order.status || "Pending").toLowerCase(),
          ])
        );

        hasLoadedOrders.current = true;
        setOrders(result);
      } catch (err) {
        const message =
          err.response?.data?.message || "Unable to load your orders.";

        setError(message);

        if (showLoading) toast.error(message);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [celebrateDelivery]
  );

  useEffect(() => {
    fetchOrders();

    const intervalId = window.setInterval(() => {
      fetchOrders(false);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [fetchOrders]);

  useEffect(() => {
    if (!loading) {
      const timer = window.setTimeout(() => AOS.refresh(), 100);
      return () => window.clearTimeout(timer);
    }
  }, [loading, orders.length]);

  const cancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(orderId);

      const { data } = await api.put(`/orders/${orderId}/cancel`);

      toast.success(data.message || "Order cancelled successfully.");
      await fetchOrders();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to cancel this order."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getOrderSubtotal = (order) => {
    if (order.itemsPrice != null) {
      return Number(order.itemsPrice) || 0;
    }

    return (order.orderItems || []).reduce((sum, item) => {
      return (
        sum +
        Number(item.price || 0) * Number(item.quantity || 0)
      );
    }, 0);
  };

  const getShippingPrice = (order) => {
    if (order.shippingPrice != null) {
      return Number(order.shippingPrice) || 0;
    }

    return Math.max(
      0,
      (Number(order.totalPrice) || 0) - getOrderSubtotal(order)
    );
  };

  const getFinalTotal = (order) => {
    if (order.totalPrice != null) {
      return Number(order.totalPrice) || 0;
    }

    return getOrderSubtotal(order) + getShippingPrice(order);
  };

  const statusClass = (status) => {
    switch ((status || "Pending").toLowerCase()) {
      case "delivered":
        return "border-neutral-300 bg-neutral-100 text-black";
      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";
      case "shipped":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "processing":
      case "confirmed":
        return "border-neutral-400 bg-neutral-100 text-neutral-800";
      default:
        return "border-amber-200 bg-amber-50 text-amber-800";
    }
  };

  const statusIcon = (status) => {
    switch ((status || "Pending").toLowerCase()) {
      case "delivered":
        return <FiCheckCircle size={13} />;
      case "shipped":
        return <FiTruck size={13} />;
      case "cancelled":
        return <FiXCircle size={13} />;
      default:
        return <FiPackage size={13} />;
    }
  };

  const getProductName = (item) => {
    if (item.product && typeof item.product === "object") {
      return item.product.productName || item.product.name || "Product";
    }

    return item.productName || "Product";
  };

  // Generate and download a PDF invoice.
  const downloadInvoice = (order) => {
    try {
      const doc = new jsPDF();

      const orderId = order._id || "N/A";
      const orderDate = formatDate(order.createdAt);
      const status = order.status || "Pending";
      const items = order.orderItems || [];

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("INVOICE / ORDER RECEIPT", 14, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Order payment and product details", 14, 29);

      // Divider
      doc.setDrawColor(210);
      doc.line(14, 34, 196, 34);

      // Order information
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("ORDER DETAILS", 14, 44);

      doc.setFont("helvetica", "normal");
      doc.text(`Order ID: ${orderId}`, 14, 52);
      doc.text(`Order Date: ${orderDate}`, 14, 59);
      doc.text(`Order Status: ${status}`, 14, 66);
      doc.text(
        `Payment Method: ${order.paymentMethod || "COD"}`,
        14,
        73
      );

      // Customer information
      doc.setFont("helvetica", "bold");
      doc.text("CUSTOMER DETAILS", 115, 44);

      doc.setFont("helvetica", "normal");

      const customerName =
        order.user?.name ||
        order.shippingAddress?.fullName ||
        user?.name ||
        "Customer";

      const customerEmail =
        order.user?.useremail ||
        order.user?.email ||
        user?.useremail ||
        user?.email ||
        "Not provided";

      doc.text(
        doc.splitTextToSize(`Name: ${customerName}`, 80),
        115,
        52
      );

      doc.text(
        doc.splitTextToSize(`Email: ${customerEmail}`, 80),
        115,
        60
      );

      // Shipping address (if stored on the order)
      const address = order.shippingAddress;

      if (address) {
        const addressText = [
          address.address,
          address.addressLine,
          address.city,
          address.state,
          address.postalCode || address.zipCode || address.pincode,
          address.country,
        ]
          .filter(Boolean)
          .join(", ");

        if (addressText) {
          doc.text(
            doc.splitTextToSize(`Address: ${addressText}`, 80),
            115,
            68
          );
        }
      }

      // Products table
      const tableRows = items.map((item, index) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.price) || 0;

        return [
          index + 1,
          getProductName(item),
          quantity,
          formatPrice(unitPrice),
          formatPrice(unitPrice * quantity),
        ];
      });

      autoTable(doc, {
        startY: 88,
        head: [["#", "Product", "Qty", "Unit Price", "Amount"]],
        body:
          tableRows.length > 0
            ? tableRows
            : [["-", "Product details unavailable", "-", "-", "-"]],
        theme: "grid",
        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 3,
          overflow: "linebreak",
          textColor: [35, 35, 35],
        },
        headStyles: {
          fillColor: [25, 25, 25],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: "auto" },
          2: { cellWidth: 15 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
        },
        margin: { left: 14, right: 14 },
      });

      // Totals
      let finalY = doc.lastAutoTable.finalY + 12;

      if (finalY > 255) {
        doc.addPage();
        finalY = 25;
      }

      const subtotal = getOrderSubtotal(order);
      const shipping = getShippingPrice(order);
      const total = getFinalTotal(order);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text("Product Subtotal:", 125, finalY);
      doc.text(formatPrice(subtotal), 196, finalY, {
        align: "right",
      });

      finalY += 8;

      doc.text("Shipping Fee:", 125, finalY);
      doc.text(formatPrice(shipping), 196, finalY, {
        align: "right",
      });

      finalY += 5;
      doc.setDrawColor(180);
      doc.line(125, finalY, 196, finalY);

      finalY += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text("Final Total:", 125, finalY);
      doc.text(formatPrice(total), 196, finalY, {
        align: "right",
      });

      // Footer on each page
      const pageCount = doc.internal.getNumberOfPages();

      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);

        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100);

        doc.text(
          "Thank you for your purchase!",
          105,
          pageHeight - 12,
          { align: "center" }
        );
      }

      doc.save(`Invoice-${orderId}.pdf`);
      toast.success("Invoice downloaded successfully!");
    } catch (err) {
      console.error("Invoice download error:", err);
      toast.error("Unable to generate the invoice. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-5xl lg:px-4">
          <div className="animate-pulse">
            <div className="h-3 w-24 bg-neutral-100" />
            <div className="mt-4 h-9 w-48 bg-neutral-100" />

            <div className="mt-8 space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-neutral-200 p-5"
                >
                  <div className="h-3 w-1/3 bg-neutral-100" />
                  <div className="mt-4 h-3 w-1/4 bg-neutral-100" />

                  <div className="mt-6 flex gap-4">
                    <div className="h-20 w-[72px] bg-neutral-100" />

                    <div className="flex-1 space-y-3">
                      <div className="h-3 w-2/3 bg-neutral-100" />
                      <div className="h-3 w-1/3 bg-neutral-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-neutral-500">
            <FiRefreshCw size={15} className="animate-spin" />
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-neutral-900">
      <style>{`
        @keyframes ord-grow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .ord-grow {
          transform-origin: left;
          animation: ord-grow 0.9s 0.3s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .ord-grow { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        {/* Header */}
        <div
          data-aos="fade-up"
          className="flex flex-col justify-between gap-5 border-b border-neutral-200 pb-7 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
              Your account
            </p>

            <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {user?.name ? `Hello, ${user.name}. ` : ""}
              View your purchases and track their progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchOrders()}
            className="group inline-flex min-h-10 items-center justify-center gap-2 self-start border border-neutral-300 px-4 py-2 text-xs font-medium transition hover:border-black hover:bg-black hover:text-white active:scale-95 sm:self-auto"
          >
            <FiRefreshCw
              size={14}
              className="transition-transform duration-500 group-hover:rotate-180"
            />
            Refresh orders
          </button>
        </div>

        {/* Order count */}
        {!error && orders.length > 0 && (
          <div
            data-aos="fade-up"
            className="flex items-center justify-between border-b border-neutral-100 py-5"
          >
            <p className="text-sm text-neutral-500">Your order history</p>

            <span className="border border-neutral-200 px-3 py-1 text-xs font-medium">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            data-aos="zoom-in"
            className="mt-7 flex flex-wrap items-center gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <FiAlertCircle size={18} className="shrink-0" />
            <span className="flex-1">{error}</span>

            <button
              type="button"
              onClick={() => fetchOrders()}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!error && orders.length === 0 && (
          <div className="py-20 text-center">
            <div
              data-aos="zoom-in"
              className="mx-auto flex h-16 w-16 items-center justify-center bg-neutral-100"
            >
              <FiShoppingBag size={27} />
            </div>

            <h2
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-6 text-2xl font-medium"
            >
              No orders yet
            </h2>

            <p
              data-aos="fade-up"
              data-aos-delay="150"
              className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-500"
            >
              Your purchases will appear here after you place your first order.
            </p>

            <div data-aos="fade-up" data-aos-delay="200">
              <Link
                to="/products"
                className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                Explore products
                <FiArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        )}

        {/* Orders list */}
        {!error && orders.length > 0 && (
          <div className="space-y-6 pt-6">
            {orders.map((order, orderIndex) => {
              const orderId = order._id;
              const status = order.status || "Pending";
              const items = order.orderItems || [];
              const isCancelled = status.toLowerCase() === "cancelled";
              const step = progressIndex(status);

              const canCancel = [
                "Pending",
                "Confirmed",
                "Processing",
              ].includes(status);

              const isCancelling = cancellingId === orderId;

              return (
                <article
                  key={orderId}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(orderIndex, 3) * 80}
                  className="border border-neutral-200 bg-white transition duration-300 hover:border-neutral-400 hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)]"
                >
                  {/* Order header */}
                  <div className="flex flex-col justify-between gap-4 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:p-6">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        Order reference
                      </p>

                      <p className="mt-2 break-all text-sm font-medium">
                        #{orderId}
                      </p>

                      <p className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
                        <FiCalendar size={14} />
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-xs font-medium ${statusClass(status)}`}
                    >
                      {statusIcon(status)}
                      {status}
                    </span>
                  </div>

                  {/* Progress tracker */}
                  {!isCancelled && (
                    <div className="border-b border-neutral-200 px-4 py-4 sm:px-6">
                      <div className="relative">
                        <div className="h-0.5 w-full bg-neutral-200" />

                        <div
                          className="ord-grow absolute left-0 top-0 h-0.5 bg-black"
                          style={{
                            width: `${
                              (step / (progressSteps.length - 1)) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <ol className="mt-3 grid grid-cols-4 text-[10px] sm:text-[11px]">
                        {progressSteps.map((label, i) => (
                          <li
                            key={label}
                            className={`${
                              i === 0
                                ? "text-left"
                                : i === progressSteps.length - 1
                                  ? "text-right"
                                  : "text-center"
                            } ${
                              i <= step
                                ? "font-medium text-neutral-900"
                                : "text-neutral-400"
                            }`}
                          >
                            {label}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Products */}
                  <div className="space-y-5 p-4 sm:p-6">
                    {items.length === 0 ? (
                      <p className="text-sm text-neutral-500">
                        Product details are unavailable.
                      </p>
                    ) : (
                      items.map((item, index) => {
                        const product =
                          item.product && typeof item.product === "object"
                            ? item.product
                            : null;

                        const productName = getProductName(item);

                        return (
                          <div
                            key={item._id || `${orderId}-${index}`}
                            className="group flex min-w-0 items-center gap-3 sm:gap-4"
                          >
                            <div className="flex h-[68px] w-[60px] shrink-0 items-center justify-center overflow-hidden bg-neutral-100 sm:h-20 sm:w-[72px]">
                              {product?.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={productName}
                                  loading="lazy"
                                  onError={handleImgError}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <FiPackage
                                  size={22}
                                  className="text-neutral-400"
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="break-words text-sm font-medium">
                                {productName}
                              </p>

                              <p className="mt-1 text-xs text-neutral-500">
                                Quantity: {item.quantity}
                              </p>

                              {item.price != null && (
                                <p className="mt-1 text-xs text-neutral-500">
                                  Unit price: {formatPrice(item.price)}
                                </p>
                              )}
                            </div>

                            <p className="shrink-0 text-right text-sm font-medium">
                              {formatPrice(
                                Number(item.price || 0) *
                                  Number(item.quantity || 0)
                              )}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Totals and actions */}
                  <div className="border-t border-neutral-200 bg-neutral-50 p-4 sm:p-6">
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                      <div className="w-full space-y-2 sm:max-w-sm">
                        <p className="text-xs text-neutral-500">
                          Payment method:{" "}
                          <span className="font-medium text-neutral-800">
                            {order.paymentMethod || "COD"}
                          </span>
                        </p>

                        <p className="text-xs text-neutral-500">
                          {items.length}{" "}
                          {items.length === 1 ? "product" : "products"} in this
                          order
                        </p>

                        <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
                          <div className="flex items-center justify-between gap-4 text-xs">
                            <span className="text-neutral-500">
                              Product subtotal
                            </span>
                            <span className="font-medium text-neutral-800">
                              {formatPrice(getOrderSubtotal(order))}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 text-xs">
                            <span className="text-neutral-500">
                              Shipping fee
                            </span>
                            <span className="font-medium text-neutral-800">
                              {formatPrice(getShippingPrice(order))}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-3">
                            <span className="text-sm font-semibold">
                              Final total
                            </span>
                            <span className="text-xl font-semibold">
                              {formatPrice(getFinalTotal(order))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order action buttons */}
                      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => cancelOrder(orderId)}
                            disabled={Boolean(cancellingId)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-red-500 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCancelling ? (
                              <FiRefreshCw
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <FiXCircle size={14} />
                            )}

                            {isCancelling
                              ? "Cancelling..."
                              : "Cancel order"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => downloadInvoice(order)}
                          className="inline-flex min-h-10 items-center justify-center gap-2 border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 transition hover:border-black hover:bg-neutral-100 active:scale-95"
                        >
                          <FiDownload size={14} />
                          Download Invoice
                        </button>

                        <Link
                          to={`/order-success/${orderId}`}
                          className="group/btn inline-flex min-h-10 items-center justify-center gap-2 bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-700 active:scale-95"
                        >
                          View order
                          <FiArrowRight
                            size={14}
                            className="transition-transform group-hover/btn:translate-x-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        {!error && orders.length > 0 && (
          <div
            data-aos="fade-up"
            className="mt-8 flex items-start gap-3 border-t border-neutral-200 pt-5"
          >
            <FiShield
              size={16}
              className="mt-0.5 shrink-0 text-neutral-500"
            />

            <p className="text-xs leading-5 text-neutral-500">
              Need help with an order? Keep your order reference handy when
              contacting customer support.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Orders;
