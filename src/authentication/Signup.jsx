
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import AOS from "aos";
import "aos/dist/aos.css";

import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiShield,
  FiTruck,
} from "react-icons/fi";

import { setCredentials } from "../redux/slices/authSlice";
import api from "../services/api";

const SIDE_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80";

const inputClass =
  "block w-full min-w-0 border border-neutral-300 bg-white py-3 pl-11 pr-12 text-sm text-neutral-900 outline-none transition duration-200 placeholder:text-neutral-400 hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-neutral-200";

const getStrength = (password) => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
};

const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"];

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    useremail: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const { name, useremail, password } = formData;

      const { data } = await api.post("/auth/register", {
        name: name.trim(),
        useremail: useremail.trim(),
        password,
      });

      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        })
      );

      toast.success("Account created successfully!");

      // Preserve your existing flow: go to the sign-in page.
      navigate("/signin");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(formData.password);

  const strengthIndex = formData.password
    ? formData.password.length < 8
      ? 0
      : Math.max(strength, 1)
    : 0;

  return (
    <main className="min-h-[calc(100dvh-64px)] w-full min-w-0 overflow-x-clip bg-white text-neutral-900">
      <style>{`
        @keyframes signup-image-zoom {
          from { transform: scale(1.08); }
          to { transform: scale(1); }
        }

        .signup-image-zoom {
          animation: signup-image-zoom 1.8s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .signup-image-zoom {
            animation: none;
          }
        }
      `}</style>

      <div className="grid min-h-[calc(100dvh-64px)] w-full min-w-0 grid-cols-1 lg:grid-cols-2">
        {/* Image panel: laptop and desktop only */}
        <aside className="relative hidden min-h-[620px] overflow-hidden bg-neutral-900 lg:block xl:min-h-[680px]">
          <img
            src={SIDE_IMAGE}
            alt="Clothing store interior"
            className="signup-image-zoom absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

          <div className="relative flex h-full min-h-[620px] flex-col justify-end p-8 text-white xl:min-h-[680px] xl:p-12 2xl:p-16">
            <p
              data-aos="fade-up"
              className="text-xs font-semibold uppercase tracking-[0.25em] text-white/75"
            >
              Join us today
            </p>

            <h2
              data-aos="fade-up"
              data-aos-delay="100"
              className="mt-4 max-w-lg text-3xl font-medium leading-tight tracking-tight xl:text-5xl"
            >
              Start your{" "}
              <span className="font-serif italic">everyday</span>{" "}
              style journey.
            </h2>

            <p
              data-aos="fade-up"
              data-aos-delay="150"
              className="mt-4 max-w-md text-sm leading-6 text-white/80 xl:text-base"
            >
              Create your account for a smooth and convenient shopping
              experience.
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row xl:gap-6">
              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="flex items-center gap-2.5 text-sm text-white/90"
              >
                <FiShield size={18} className="shrink-0" />
                Secure account
              </div>

              <div
                data-aos="fade-up"
                data-aos-delay="300"
                className="flex items-center gap-2.5 text-sm text-white/90"
              >
                <FiTruck size={18} className="shrink-0" />
                Easy order tracking
              </div>
            </div>
          </div>
        </aside>

        {/* Signup form */}
        <section className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:px-8 lg:py-8 xl:px-12 2xl:px-16">
          <div className="w-full max-w-md min-w-0">
            {/* No brand/logo here: your navbar already displays it. */}

            <div data-aos="fade-up" className="mb-5 sm:mb-7">
              <div className="flex h-12 w-12 items-center justify-center bg-black text-white sm:h-14 sm:w-14">
                <FiUser size={24} />
              </div>
            </div>

            <header
              data-aos="fade-up"
              data-aos-delay="80"
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl lg:text-3xl xl:text-4xl">
                Create Account
              </h1>

              <p className="mt-2 text-sm leading-6 text-neutral-600 sm:text-base">
                Join us today and start shopping!
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Full name */}
              <div data-aos="fade-up" data-aos-delay="100">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Full Name
                </label>

                <div className="relative">
                  <FiUser
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={100}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div data-aos="fade-up" data-aos-delay="150">
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
              <div data-aos="fade-up" data-aos-delay="200">
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
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    minLength={8}
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

                {/* Password strength */}
                <div className="mt-3" aria-live="polite">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <span
                        key={bar}
                        className={`h-1 transition-colors duration-300 ${
                          strengthIndex >= bar
                            ? "bg-black"
                            : "bg-neutral-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-neutral-500">
                    {formData.password
                      ? `Strength: ${strengthLabels[strengthIndex]}`
                      : "Use at least 8 characters for your password."}
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div data-aos="fade-up" data-aos-delay="250" className="pt-1">
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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <FiArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sign in */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="mt-6 border-t border-neutral-200 pt-5 text-center sm:mt-7 sm:pt-6"
            >
              <p className="text-sm text-neutral-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="font-semibold text-black underline-offset-4 transition hover:text-neutral-600 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
              Your account details are submitted securely.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Signup;
