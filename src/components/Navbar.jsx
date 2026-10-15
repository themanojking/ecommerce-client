import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiShoppingCart,
  FiMenu,
  FiX,
  FiShoppingBag,
  FiHome,
  FiInfo,
  FiMail,
  FiPackage,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { logout } from "../redux/slices/authSlice";

// Single source of truth for the main links (used by desktop and mobile)
const mainLinks = [
  { to: "/", label: "Home", icon: FiHome, end: true },
  { to: "/products", label: "Products", icon: FiShoppingBag },
  { to: "/about", label: "About", icon: FiInfo },
  { to: "/contact", label: "Contact", icon: FiMail },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const desktopProfileRef = useRef(null);
  const mobileProfileRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart?.items || []);
  const { user } = useSelector((state) => state.auth || {});

  // Display total quantity, not just the number of product types.
  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
    });
  }, []);

  // Add a shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close profile dropdown on outside click or Escape
  useEffect(() => {
    if (!profileOpen) return;

    const onPointerDown = (event) => {
      const inside =
        desktopProfileRef.current?.contains(event.target) ||
        mobileProfileRef.current?.contains(event.target);
      if (!inside) setProfileOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  // Close mobile menu with Escape
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const navClass = ({ isActive }) =>
    `group relative flex items-center gap-2 px-3 py-2 text-sm transition ${
      isActive
        ? "font-semibold text-black"
        : "text-neutral-500 hover:text-black"
    }`;

  const desktopLinkClass = ({ isActive }) =>
    `${navClass({ isActive })} nav-underline ${
      isActive ? "nav-underline-active" : ""
    }`;

  const handleLogout = () => {
    closeMenus();
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  const initials = (user?.name || user?.useremail || "User")
    .trim()
    .charAt(0)
    .toUpperCase();

  // Rendered via functions (not inner components) so they don't remount on every render
  const renderCartLink = (mobile = false) => (
    <Link
      to="/cart"
      onClick={closeMenus}
      aria-label={`Shopping cart, ${cartCount} items`}
      className={`relative inline-flex items-center justify-center transition hover:text-neutral-500 active:scale-95 ${
        mobile ? "p-2" : "gap-2 px-3 py-2 text-sm"
      }`}
    >
      <FiShoppingCart size={mobile ? 22 : 18} />
      {!mobile && <span className="hidden lg:inline">Bag</span>}

      {cartCount > 0 && (
        <span
          key={cartCount}
          className="nav-badge-bump absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-black px-1 text-[9px] font-semibold text-white"
        >
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  );

  const renderProfileDropdown = (mobile = false) => (
    <div
      ref={mobile ? mobileProfileRef : desktopProfileRef}
      className={`relative ${mobile ? "" : "ml-1 lg:ml-2"}`}
    >
      <button
        type="button"
        onClick={() => setProfileOpen((open) => !open)}
        aria-label="Toggle profile menu"
        aria-expanded={profileOpen}
        className={`flex items-center gap-2 transition active:scale-95 ${
          mobile
            ? "h-9 w-9 justify-center rounded-full bg-black text-sm font-semibold text-white hover:bg-neutral-700"
            : "border border-neutral-200 px-2.5 py-2 hover:border-black lg:px-3"
        }`}
      >
        {mobile ? (
          initials
        ) : (
          <>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-black">
              {initials}
            </span>
            <span className="hidden max-w-28 truncate text-sm lg:inline">
              {user.name || user.useremail}
            </span>
            <FiChevronDown
              className={`transition-transform duration-300 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {profileOpen && (
        <div className="nav-dropdown-in absolute right-0 top-full z-[60] mt-3 w-60 border border-neutral-200 bg-white p-2 shadow-xl">
          <div className="border-b border-neutral-100 px-3 py-3">
            <p className="truncate text-sm font-semibold text-black">
              {user.name || "My Account"}
            </p>
            <p className="mt-1 truncate text-xs text-neutral-500">
              {user.useremail}
            </p>
          </div>

          <Link
            to="/orders"
            onClick={closeMenus}
            className="flex items-center gap-3 px-3 py-3 text-sm text-neutral-700 transition hover:bg-neutral-50 hover:text-black"
          >
            <FiPackage size={17} />
            My Orders
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <FiLogOut size={17} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );

  // Stagger index for mobile menu items
  const baseDelay = 60;
  const cartDelay = mainLinks.length * baseDelay;
  const accountDelay = cartDelay + baseDelay;

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
        scrolled
          ? "border-neutral-200 shadow-[0_6px_24px_-12px_rgba(0,0,0,0.18)]"
          : "border-neutral-200/70"
      }`}
    >
      {/* Local keyframes + link underline */}
      <style>{`
        @keyframes nav-dropdown-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nav-badge-bump {
          0% { transform: scale(0.4); }
          60% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        @keyframes nav-item-in {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .nav-dropdown-in { animation: nav-dropdown-in 0.2s ease-out; transform-origin: top right; }
        .nav-badge-bump { animation: nav-badge-bump 0.35s ease-out; }
        .nav-item-in { opacity: 0; animation: nav-item-in 0.35s ease-out forwards; }
        .nav-underline::after {
          content: "";
          position: absolute;
          left: 0.75rem;
          right: 0.75rem;
          bottom: 2px;
          height: 1px;
          background: #000;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .nav-underline:hover::after,
        .nav-underline-active::after { transform: scaleX(1); }
        @media (prefers-reduced-motion: reduce) {
          .nav-dropdown-in, .nav-badge-bump, .nav-item-in { animation: none; opacity: 1; }
          .nav-underline::after { transition: none; }
        }
      `}</style>

      <nav
        data-aos="fade-down"
        className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-2 px-5 sm:h-[68px] sm:px-8 lg:px-12"
      >
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenus}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center bg-black text-white transition duration-300 group-hover:-rotate-6 group-hover:bg-neutral-700">
            <FiShoppingBag size={19} />
          </span>

          <span className="text-lg font-bold tracking-tight text-black sm:text-xl">
            Shop<span className="font-normal">Zone</span>
            <span className="ml-1 text-black">.</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0 md:flex lg:gap-4 xl:gap-6">
          {mainLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop account actions */}
        <div className="hidden shrink-0 items-center gap-1 md:flex lg:gap-3">
          {renderCartLink()}

          <span className="mx-1 h-6 w-px bg-neutral-200" />

          {user ? (
            renderProfileDropdown()
          ) : (
            <>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 px-2 py-2 text-sm text-neutral-700 transition hover:text-black lg:px-3"
              >
                <FiLogIn size={16} />
                Sign In
              </Link>

              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 bg-black px-3 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-95 lg:px-4"
              >
                <FiUserPlus
                  size={16}
                  className="transition-transform group-hover:scale-110"
                />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 sm:gap-3 md:hidden">
          {renderCartLink(true)}

          {user && renderProfileDropdown(true)}

          <button
            type="button"
            onClick={() => {
              setMenuOpen((open) => !open);
              setProfileOpen(false);
            }}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            className="p-2 text-black transition hover:text-neutral-500 active:scale-90"
          >
            {menuOpen ? <FiX size={23} /> : <FiMenu size={23} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu (slides open smoothly) */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out md:hidden ${
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="overflow-hidden">
          <div className="border-t border-neutral-200 bg-white px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-7xl flex-col">
              {menuOpen && (
                <>
                  {mainLinks.map(({ to, label, icon: Icon, end }, index) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={navClass}
                      onClick={closeMenus}
                    >
                      <span
                        className="nav-item-in flex items-center gap-2"
                        style={{ animationDelay: `${index * baseDelay}ms` }}
                      >
                        <Icon size={17} />
                        {label}
                      </span>
                    </NavLink>
                  ))}

                  <NavLink to="/cart" className={navClass} onClick={closeMenus}>
                    <span
                      className="nav-item-in flex items-center gap-2"
                      style={{ animationDelay: `${cartDelay}ms` }}
                    >
                      <FiShoppingCart size={17} />
                      Shopping Bag ({cartCount})
                    </span>
                  </NavLink>

                  {user ? (
                    <>
                      <div
                        className="nav-item-in my-3 border-t border-neutral-200 pt-4"
                        style={{ animationDelay: `${accountDelay}ms` }}
                      >
                        <p className="text-sm font-semibold text-black">
                          {user.name || "My Account"}
                        </p>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {user.useremail}
                        </p>
                      </div>

                      <NavLink
                        to="/orders"
                        className={navClass}
                        onClick={closeMenus}
                      >
                        <span
                          className="nav-item-in flex items-center gap-2"
                          style={{
                            animationDelay: `${accountDelay + baseDelay}ms`,
                          }}
                        >
                          <FiPackage size={17} />
                          My Orders
                        </span>
                      </NavLink>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="nav-item-in flex items-center gap-2 px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                        style={{
                          animationDelay: `${accountDelay + baseDelay * 2}ms`,
                        }}
                      >
                        <FiLogOut size={17} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div
                      className="nav-item-in mt-3 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4"
                      style={{ animationDelay: `${accountDelay}ms` }}
                    >
                      <Link
                        to="/signin"
                        onClick={closeMenus}
                        className="flex items-center justify-center gap-2 border border-neutral-300 px-3 py-3 text-sm transition hover:border-black active:scale-95"
                      >
                        <FiLogIn size={16} />
                        Sign In
                      </Link>

                      <Link
                        to="/signup"
                        onClick={closeMenus}
                        className="flex items-center justify-center gap-2 bg-black px-3 py-3 text-sm text-white transition hover:bg-neutral-700 active:scale-95"
                      >
                        <FiUserPlus size={16} />
                        Sign Up
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}