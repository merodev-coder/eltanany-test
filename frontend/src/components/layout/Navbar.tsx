import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close user menu on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setUserMenuOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const navLinks = [
    { label: 'الرئيسية', href: '/' },
    { label: 'لابتوبات', href: '/laptops' },
    { label: 'إكسسوارات', href: '/accessories' },
    { label: 'تواصل معنا', href: '/contact' },
    { label: 'قائمة الأسعار', href: '/pricelist' },
  ];

  // Truncate name for display
  const displayName = user?.name
    ? user.name.length > 15
      ? user.name.slice(0, 15) + '...'
      : user.name
    : '';

  return (
    <>
      <nav className="fixed top-0 right-0 z-[100] w-full bg-white shadow-sm">
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/images/logo.jpeg" alt="ELTANANY 2" className="h-10 w-10 object-contain rounded" />
            <span className="font-heading font-bold text-lg text-ink">ELTANANY 2</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-body text-sm font-medium transition-colors duration-200 hover:text-ignition-start ${
                  location.pathname === link.href ? 'text-ignition-start' : 'text-ink/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-steel-light transition-colors duration-200"
              aria-label="بحث"
            >
              <Search className="w-5 h-5 text-ink" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-steel-light transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5 text-ink" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white gradient-brand rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {isLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : isAuthenticated && user ? (
              /* ── Profile Menu Trigger ─────────────────── */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-steel-light transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-zinc-950 font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:block text-sm text-ink font-medium">
                    مرحباً، {displayName}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* ── Profile Dropdown Menu ──────────────── */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="
                        absolute left-0 top-full mt-2 w-56
                        z-[9999]
                        rounded-xl
                        border border-zinc-800
                        bg-[#121214]
                        shadow-2xl shadow-black/60
                        overflow-hidden
                        origin-top-left
                      "
                    >
                      {/* Subtle top accent line */}
                      <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-ignition-start" />

                      <div className="py-1.5">
                        {/* Profile Link */}
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="
                            flex items-center gap-3 px-4 py-2.5
                            text-sm text-zinc-300
                            hover:bg-[#1c1c21] hover:text-white
                            transition-colors duration-150
                          "
                        >
                          <User className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                          <span className="font-body">حسابي</span>
                        </Link>

                        {/* Orders Link */}
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="
                            flex items-center gap-3 px-4 py-2.5
                            text-sm text-zinc-300
                            hover:bg-[#1c1c21] hover:text-white
                            transition-colors duration-150
                          "
                        >
                          <ShoppingCart className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                          <span className="font-body">طلباتي</span>
                        </Link>

                        {/* Admin Dashboard */}
                        {isAdmin && (
                          <Link
                            to="/AhmedEltanany/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="
                              flex items-center gap-3 px-4 py-2.5
                              text-sm text-amber-500
                              hover:bg-amber-500/10 hover:text-amber-400
                              transition-colors duration-150
                            "
                          >
                            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                            <span className="font-body">لوحة التحكم</span>
                          </Link>
                        )}

                        {/* Divider */}
                        <div className="my-1.5 mx-3 h-px bg-zinc-800" />

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="
                            flex items-center gap-3 px-4 py-2.5 w-full
                            text-sm text-red-400
                            hover:bg-red-500/10 hover:text-red-300
                            transition-colors duration-150
                          "
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          <span className="font-body">تسجيل الخروج</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg border border-ignition-start text-ignition-start hover:bg-ignition-start hover:text-white transition-colors text-sm font-medium"
              >
                تسجيل الدخول
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full hover:bg-steel-light transition-colors duration-200"
              aria-label="القائمة"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 right-0 left-0 z-[99] bg-white border-b border-steel-light md:hidden overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 px-4 rounded-lg font-body text-sm font-medium transition-colors duration-200 ${
                    location.pathname === link.href
                      ? 'bg-ignition-start/10 text-ignition-start'
                      : 'text-ink/70 hover:bg-steel-light'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 rounded-lg font-body text-sm font-medium text-ignition-start hover:bg-ignition-start/10 transition-colors"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}
