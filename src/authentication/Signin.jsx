import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";

import { restoreCart } from "../redux/slices/cartSlice";
import { setCredentials } from "../redux/slices/authSlice";
import api from "../services/api";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiArrowRight,
  FiShield,
  FiTruck,
} from "react-icons/fi";

const SIDE_IMAGE =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=80";

const inputClass =
  "block w-full min-w-0 border border-neutral-300 bg-white py-3 pl-11 pr-12 text-sm text-neutral-900 outline-none transition duration-200 placeholder:text-neutral-400 hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-neutral-200";

const Signin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    useremail: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize animations
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 15,
      disable: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches,
    });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Login
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        useremail: formData.useremail.trim().toLowerCase(),
        password: formData.password,
      });

      const user = data.user;
      const token = data.token;

      if (!user || !token) {
        toast.error("Invalid login response from server.");
        return;
      }

      // Admin accounts go to the separate Admin application.
      if (user.role === "admin") {
        const adminUrl = import.meta.env.VITE_ADMIN_URL;

        if (!adminUrl) {
          toast.error(
            "Admin URL is missing. Please configure VITE_ADMIN_URL."
          );
          return;
        }

        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(user));

        toast.success("Admin login successful!");

        window.location.href =
          `${adminUrl.replace(/\/+$/, "")}/login`;

        return;
      }

      // Only customer accounts can access the shopping site.
      if (user.role !== "customer") {
        toast.error("This account does not have customer access.");
        return;
      }

      dispatch(
        setCredentials({
          user,
          token,
        })
      );

      // Restore the customer's saved cart.
      const userKey = user._id || user.useremail;
      let savedCart = [];

      if (userKey) {
        try {
          savedCart = JSON.parse(
            localStorage.getItem(`cart_${userKey}`) || "[]"
          );

          if (!Array.isArray(savedCart)) {
            savedCart = [];
          }
        } catch {
          savedCart = [];
        }
      }

      dispatch(restoreCart(savedCart));

      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      console.error(
        "Signin error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open the separate Admin application.
  const handleAdminLogin = () => {
    const adminUrl = import.meta.env.VITE_ADMIN_URL;

    if (!adminUrl) {
      toast.error("Admin URL is not configured.");
      return;
    }

    window.location.href =
      `${adminUrl.replace(/\/+$/, "")}/login`;
  };

  return (
    <main className="min-h-[calc(100dvh-64px)] w-full min-w-0 overflow-x-clip bg-white text-neutral-900">
      <style>{`
        @keyframes signin-image-zoom {
          from { transform: scale(1.08); }
          to { transform: scale(1); }
        }

        .signin-image-zoom {
          animation: signin-image-zoom 1.8s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .signin-image-zoom { animation: none; }
        }
      `}</style>

      <div className="grid min-h-[calc(100dvh-64px)] w-full min-w-0 grid-cols-1 lg:grid-cols-2">
        {/* Image panel */}
        <aside className="relative hidden min-h-[600px] overflow-hidden bg-neutral-900 lg:block xl:min-h-[680px]">
          <img
            src={SIDE_IMAGE}
            alt="Clothing store interior"
            className="signin-image-zoom absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

          <div className="relative flex h-full min-h-[600px] flex-col justify-end p-8 text-white xl:min-h-[680px] xl:p-12 2xl:p-16">
            <p
              data-aos="fade-up"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-white/75"
            >
              Welcome back
            </p>

            <h2
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-4 max-w-lg text-3xl font-medium leading-tight tracking-tight xl:text-5xl"
            >
              Your style,{" "}
              <span className="font-serif italic">waiting</span> for you.
            </h2>

            <p
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-4 max-w-md text-sm leading-6 text-white/80 xl:text-base"
            >
              Sign in to discover your favorites and manage your orders
              with ease.
            </p>

            <div className="mt-7 flex flex-col gap-4 xl:flex-row xl:gap-6">
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="flex items-center gap-2.5 text-sm text-white/90"
              >
                <FiShield size={18} />
                Secure sign in
              </div>

              <div
                data-aos="fade-up"
                data-aos-delay="300"
                className="flex items-center gap-2.5 text-sm text-white/90"
              >
                <FiTruck size={18} />
                Track your orders
              </div>
            </div>
          </div>
        </aside>

        {/* Login form */}
        <section className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:px-8 lg:py-8 xl:px-12 2xl:px-16">
          <div className="w-full max-w-md min-w-0">
            <div data-aos="fade-up" className="mb-5 sm:mb-7">
              <div className="flex h-12 w-12 items-center justify-center bg-black text-white sm:h-14 sm:w-14">
                <FiLogIn size={24} />
              </div>
            </div>

            <header
              data-aos="fade-up"
              data-aos-delay="80"
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl xl:text-4xl">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm leading-6 text-neutral-600 sm:text-base">
                Sign in to continue shopping with us.
              </p>
            </header>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5"
            >
              {/* Email */}
              <div data-aos="fade-up" data-aos-delay="100">
                <label
                  htmlFor="useremail"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Email Address
                </label>

                <div className="relative">
                  <FiMail
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />

                  <input
                    id="useremail"
                    type="email"
                    name="useremail"
                    value={formData.useremail}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password */}
              <div data-aos="fade-up" data-aos-delay="150">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Password
                </label>

                <div className="relative">
                  <FiLock
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="pt-1"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex min-h-12 w-full items-center justify-center gap-2 bg-black px-4 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-neutral-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FiArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Account links */}
            <div
              data-aos="fade-up"
              data-aos-delay="250"
              className="mt-6 border-t border-neutral-200 pt-5 text-center sm:mt-7 sm:pt-6"
            >
              <p className="text-sm text-neutral-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-black underline-offset-4 transition hover:text-neutral-600 hover:underline"
                >
                  Create Account
                </Link>
              </p>

              {/* Admin Login: opens the separate Admin website */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleAdminLogin}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 transition hover:text-black hover:underline"
                >
                  <FiShield size={16} />
                  Admin Login
                  <FiArrowRight size={15} />
                </button>
              </div>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
              Welcome back! Sign in to access your account.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Signin;
