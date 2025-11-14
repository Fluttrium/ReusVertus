"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

type HeaderNavigationProps = {
  className?: string;
};

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  category: string | null;
}

export default function HeaderNavigation({ className = "" }: HeaderNavigationProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchAbortController = useRef<AbortController | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 800);
      setIsTablet(width >= 800 && width < 1280);
      if (width >= 800) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Поиск товаров
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
      }, 300); // Debounce 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Закрытие поиска при клике вне блока
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Фокус на поле ввода при открытии
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    return () => {
      searchAbortController.current?.abort();
    };
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      searchAbortController.current?.abort();
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    searchAbortController.current?.abort();
    const controller = new AbortController();
    searchAbortController.current = controller;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.products || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      if (searchAbortController.current === controller) {
      setIsSearching(false);
      }
    }
  };

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSearchOpen(true);
  };

  const handleProductClick = (productId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/product/${productId}`);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const isActiveLink = (href: string) => {
    if (!pathname) return false;
    if (href.startsWith("/product")) {
      return pathname.startsWith("/product");
    }
    if (href === "/looks") {
      return pathname.startsWith("/looks");
    }
    if (href === "/about") {
      return pathname.startsWith("/about");
    }
    return pathname === href;
  };

  const logo = (
    <Link href="/" className="flex items-center">
      <svg 
        width="120" 
        height="57" 
        viewBox="0 0 706 338" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-auto"
      >
        <rect width="705.878" height="67.2265" fill="#FFF8F0"/>
        <rect y="270.773" width="705.878" height="67.2265" fill="#FFF8F0"/>
        <path d="M58.9397 222.874H41.0282L26.7908 178.561H17.1461V222.874H0V114.822H27.5562C47.458 114.822 55.4186 124.383 55.4186 146.691C55.4186 160.046 52.663 169.607 42.7122 174.919L58.9397 222.874ZM38.2725 146.691C38.2725 137.738 36.8947 130.15 27.7093 130.15H17.1461V163.233H27.7093C36.8947 163.233 38.2725 155.645 38.2725 146.691Z" fill="#FFF8F0"/>
        <path d="M129.327 196.317C129.327 204.512 126.571 211.341 121.825 216.197C116.62 221.509 109.731 224.088 101.617 224.088C93.5034 224.088 86.4613 221.509 81.2562 216.197C76.5104 211.341 73.7548 204.512 73.7548 196.317V114.822H90.9009V197.227C90.9009 204.967 95.7998 208.761 101.617 208.761C107.435 208.761 112.18 204.967 112.18 197.227V114.822H129.327V196.317Z" fill="#FFF8F0"/>
        <path d="M195.569 222.874H149.795V114.822H195.569V130.15H166.941V160.805H191.589V176.133H166.941V207.547H195.569V222.874Z" fill="#FFF8F0"/>
        <path d="M266.218 192.978C266.218 204.056 264.687 211.492 259.176 216.804C254.736 221.053 247.541 223.937 237.896 223.937C228.405 223.937 221.362 221.357 216.77 216.804C211.565 211.644 209.728 204.967 209.728 193.585H226.874C226.874 199.352 227.486 202.994 229.935 205.726C231.466 207.395 234.069 208.609 237.896 208.609C241.876 208.609 244.479 207.547 246.163 205.574C248.459 202.994 249.072 199.352 249.072 193.585C249.072 182.051 247.235 179.168 238.815 175.829L225.802 170.518C214.78 165.965 210.646 160.046 210.646 143.353C210.646 133.64 213.555 125.749 219.525 120.437C224.271 116.34 230.395 113.912 238.202 113.912C246.928 113.912 253.358 116.188 257.798 120.437C263.462 125.901 265.452 133.64 265.452 143.96H248.306C248.306 139.104 248 135.31 245.704 132.426C244.173 130.453 241.723 129.239 238.049 129.239C234.528 129.239 232.385 130.453 230.701 132.274C228.711 134.551 227.792 138.193 227.792 142.898C227.792 151.7 229.17 154.431 236.824 157.466L249.684 162.626C262.697 167.938 266.218 174.767 266.218 192.978Z" fill="#FFF8F0"/>
        <path d="M377.467 114.822L353.431 222.874H335.673L311.791 114.822H330.621L344.552 196.772L358.636 114.822H377.467Z" fill="#FFF8F0"/>
        <path d="M436.027 222.874H390.253V114.822H436.027V130.15H407.399V160.805H432.047V176.133H407.399V207.547H436.027V222.874Z" fill="#FFF8F0"/>
        <path d="M512.953 222.874H495.041L480.804 178.561H471.159V222.874H454.013V114.822H481.569C501.471 114.822 509.431 124.383 509.431 146.691C509.431 160.046 506.676 169.607 496.725 174.919L512.953 222.874ZM492.285 146.691C492.285 137.738 490.908 130.15 481.722 130.15H471.159V163.233H481.722C490.908 163.233 492.285 155.645 492.285 146.691Z" fill="#FFF8F0"/>
        <path d="M574.058 130.15H555.687V222.874H538.541V130.15H520.324V114.822H574.058V130.15Z" fill="#FFF8F0"/>
        <path d="M635.23 222.874H589.456V114.822H635.23V130.15H606.602V160.805H631.249V176.133H606.602V207.547H635.23V222.874Z" fill="#FFF8F0"/>
        <path d="M705.878 192.978C705.878 204.056 704.348 211.492 698.836 216.804C694.397 221.053 687.201 223.937 677.557 223.937C668.065 223.937 661.023 221.357 656.43 216.804C651.225 211.644 649.388 204.967 649.388 193.585H666.534C666.534 199.352 667.147 202.994 669.596 205.726C671.127 207.395 673.73 208.609 677.557 208.609C681.537 208.609 684.14 207.547 685.824 205.574C688.12 202.994 688.732 199.352 688.732 193.585C688.732 182.051 686.895 179.168 678.475 175.829L665.463 170.518C654.44 165.965 650.307 160.046 650.307 143.353C650.307 133.64 653.215 125.749 659.186 120.437C663.932 116.34 670.055 113.912 677.863 113.912C686.589 113.912 693.019 116.188 697.458 120.437C703.123 125.901 705.113 133.64 705.113 143.96H687.967C687.967 139.104 687.661 135.31 685.364 132.426C683.833 130.453 681.384 129.239 677.71 129.239C674.189 129.239 672.046 130.453 670.362 132.274C668.371 134.551 667.453 138.193 667.453 142.898C667.453 151.7 668.831 154.431 676.485 157.466L689.345 162.626C702.357 167.938 705.878 174.767 705.878 192.978Z" fill="#FFF8F0"/>
      </svg>
    </Link>
  );

  // Иконки
  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.5 22.5L15.5 15.5M18 9C18 13.4183 14.4183 17 10 17C5.58172 17 2 13.4183 2 9C2 4.58172 5.58172 1 10 1C14.4183 1 18 4.58172 18 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 4C20.4696 3.46957 19.8071 3.07291 19.0711 2.84265C18.3351 2.6124 17.553 2.55641 16.7958 2.67915C16.0386 2.80189 15.331 3.0996 14.732 3.54597C14.133 3.99235 13.6614 4.57343 13.357 5.238L12 8L10.643 5.238C10.3386 4.57343 9.86704 3.99235 9.26805 3.54597C8.66906 3.0996 7.96145 2.80189 7.20424 2.67915C6.44704 2.55641 5.66494 2.6124 4.92893 2.84265C4.19292 3.07291 3.53037 3.46957 3 4C2.29992 4.70008 1.77996 5.56031 1.48559 6.51201C1.19121 7.46371 1.13149 8.4791 1.31253 9.46438C1.49357 10.4497 1.90991 11.3746 2.52371 12.1544C3.1375 12.9343 3.9288 13.5456 4.826 13.93L12 20L19.174 13.93C20.0712 13.5456 20.8625 12.9343 21.4763 12.1544C22.0901 11.3746 22.5064 10.4497 22.6875 9.46438C22.8685 8.4791 22.8088 7.46371 22.5144 6.51201C22.22 5.56031 21.7001 4.70008 21 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );

  const ProfileIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
      <path
        d="M12 15C7.58172 15 4 16.7909 4 19V22H20V19C20 16.7909 16.4183 15 12 15Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );

  const CartIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 2H5.12727L7.75868 15H19.4182L22.1818 6H6.65455M9.35455 21C10.207 21 10.9 20.307 10.9 19.4545C10.9 18.602 10.207 17.9091 9.35455 17.9091C8.50205 17.9091 7.80909 18.602 7.80909 19.4545C7.80909 20.307 8.50205 21 9.35455 21ZM18.6455 21C19.498 21 20.1909 20.307 20.1909 19.4545C20.1909 18.602 19.498 17.9091 18.6455 17.9091C17.793 17.9091 17.1 18.602 17.1 19.4545C17.1 20.307 17.793 21 18.6455 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );

  const menuBar = <div className="bg-[#FFF8F0] h-[3.628px] w-full" />;

  // Компонент поиска
  const dropdownPositionClass = isMobile
    ? "fixed inset-0 top-0 left-0 right-0 bottom-0 h-screen"
    : "absolute top-full left-0 right-0";

  const dropdownInnerClass = isMobile
    ? "flex flex-col h-full w-full px-5 py-6 gap-4"
    : "max-w-6xl mx-auto px-6 pt-4 pb-4";

  const resultsWrapperClass = isMobile
    ? "flex-1 mt-4 overflow-y-auto"
    : "mt-4 max-h-96 overflow-y-auto";

  const searchDropdown = (
    <div
      ref={searchRef}
      className={`${dropdownPositionClass} bg-bg-1 border-t border-bg-4 shadow-lg z-50 ${
        isSearchOpen ? "block" : "hidden"
      }`}
    >
      <div className={dropdownInnerClass}>
        {isMobile && (
          <div className="flex items-center justify-between">
            <span className="uppercase text-sm tracking-[0.2em] text-bg-3/70">Поиск по каталогу</span>
            <button
              onClick={handleCloseSearch}
              className="text-sm uppercase tracking-[0.2em] text-bg-4"
              aria-label="Закрыть поиск"
            >
              Закрыть
            </button>
          </div>
        )}
        <div className={`relative ${isMobile ? "mt-2" : ""}`}>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full px-4 py-3 border-2 border-bg-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-bg-4 text-bg-3 uppercase bg-bg-1"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 400 }}
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-bg-4"></div>
            </div>
          )}
        </div>

        {/* Результаты поиска */}
        {searchQuery.trim().length > 0 && !isSearching && (
          <div className={resultsWrapperClass}>
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full text-left px-4 py-3 hover:bg-bg-2 transition-colors rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="uppercase font-medium text-bg-3">{product.name}</p>
                        <p className="text-sm opacity-70 uppercase">{product.code}</p>
                      </div>
                      <p className="text-bg-4 font-medium">
                        {product.price.toLocaleString("ru-RU")} ₽
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-bg-3 opacity-70 uppercase">
                Товары не найдены
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile version
  if (isMobile) {
    return (
      <header
        className={`bg-bg-4 text-[#FFF8F0] pt-4 pb-5 relative sticky top-0 z-50 ${className}`}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
            <Link href="/" className="w-24 flex items-center" aria-label="На главную">
              <Image
                src="/RUES%20VERTES.png"
                alt="Rues Vertes"
                width={96}
                height={32}
                priority
                className="h-auto w-full max-w-[96px]"
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex flex-col justify-between h-[12px] w-8 focus:outline-none"
              aria-label="Открыть меню"
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`block h-[3px] w-full bg-[#FFF8F0] transition-transform duration-200 ${
                  isMobileMenuOpen ? "translate-y-[4px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[3px] w-full bg-[#FFF8F0] transition-transform duration-200 ${
                  isMobileMenuOpen ? "-translate-y-[4px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
          <nav
            className={`absolute left-0 top-full z-40 h-[calc(100vh-4.5rem)] w-full bg-bg-4/95 backdrop-blur-sm flex flex-col gap-6 text-base tracking-[0.1em] px-6 py-8 pr-16 transition-all duration-300 ${
              isMobileMenuOpen
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "-translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <Link
              href="/product/RV-W-001"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-start px-2 py-3 uppercase text-lg tracking-[0.1em] transition-opacity hover:opacity-80 ${
                isActiveLink("/product/RV-W-001")
                  ? "font-black text-white"
                  : "font-light text-[#FFF8F0]/60"
              }`}
            >
              Shop now
            </Link>
            <Link
              href="/looks"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-start px-2 py-3 uppercase text-lg tracking-[0.1em] transition-opacity hover:opacity-80 ${
                isActiveLink("/looks")
                  ? "font-black text-white"
                  : "font-light text-[#FFF8F0]/60"
              }`}
            >
              Lookbook
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-start px-2 py-3 uppercase text-lg tracking-[0.1em] transition-opacity hover:opacity-80 ${
                isActiveLink("/about")
                  ? "font-black text-white"
                  : "font-light text-[#FFF8F0]/60"
              }`}
            >
              About
            </Link>
            <div className="pt-5 mt-4 border-t border-[#FFF8F0]/20 flex flex-col gap-4">
              <button
                onClick={(e) => {
                  handleSearchClick(e);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-4 text-[#FFF8F0]/90 hover:text-white transition-colors text-sm"
                aria-label="Поиск"
              >
                <div className="w-6 h-6">
                  <SearchIcon />
                </div>
                <span className="uppercase tracking-[0.12em] text-sm">Поиск</span>
              </button>
              <div className="flex flex-col items-start gap-4 text-[#FFF8F0]/80 text-sm">
                <Link
                  href="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 hover:text-white transition-colors"
                  aria-label="Избранное (понравившиеся товары)"
                >
                  <div className="w-6 h-6">
                    <HeartIcon filled={pathname === "/favorites"} />
                  </div>
                  <span className="uppercase text-sm tracking-[0.12em]">Избранное</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 hover:text-white transition-colors"
                  aria-label="Аккаунт (профиль)"
                >
                  <div className="w-6 h-6">
                    <ProfileIcon filled={pathname?.startsWith("/profile")} />
                  </div>
                  <span className="uppercase text-sm tracking-[0.12em]">Профиль</span>
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 hover:text-white transition-colors"
                  aria-label="Корзина"
                >
                  <div className="w-6 h-6">
                    <CartIcon filled={pathname === "/cart"} />
                  </div>
                  <span className="uppercase text-sm tracking-[0.12em]">Корзина</span>
                </Link>
              </div>
            </div>
          </nav>
        </div>
        {searchDropdown}
      </header>
    );
  }

  // Tablet version
  if (isTablet) {
    return (
      <header className={`bg-bg-4 text-[#FFF8F0] py-5 relative sticky top-0 z-50 ${className}`}>
        <div className="w-full px-10 flex items-center gap-8">
          <nav className="flex flex-1 items-center justify-start gap-8 uppercase tracking-[0.04em] text-lg">
            <Link
              href="/product/RV-W-001"
              className={`tracking-[0.04em] transition-opacity hover:opacity-80 ${
                isActiveLink("/product/RV-W-001")
                  ? "font-black text-white"
                  : "font-light text-[#FFF8F0]/60"
              }`}
            >
              Shop now
            </Link>
            <Link
              href="/looks"
              className={`tracking-[0.04em] transition-opacity hover:opacity-80 ${
                isActiveLink("/looks")
                  ? "font-black text-white"
                  : "font-light text-[#FFF8F0]/60"
              }`}
            >
              Lookbook
            </Link>
            <Link
              href="/about"
              className={`tracking-[0.04em] transition-opacity hover:opacity-80 ${
                isActiveLink("/about")
                  ? "font-black text-white"
                  : "font-light text-[#FFF8F0]/60"
              }`}
            >
              About
            </Link>
          </nav>
          <div className="flex flex-1 justify-center">
          {logo}
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <button
              onClick={handleSearchClick}
              className="flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
              aria-label="Поиск"
            >
              <SearchIcon />
              <span className="sr-only">Поиск</span>
            </button>
            <Link
              href="/favorites"
              className="flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80"
              aria-label="Избранное (понравившиеся товары)"
            >
              <HeartIcon filled={pathname === "/favorites"} />
              <span className="sr-only">Избранное</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80"
              aria-label="Аккаунт (профиль)"
            >
              <ProfileIcon filled={pathname?.startsWith("/profile")} />
              <span className="sr-only">Аккаунт</span>
            </Link>
            <Link
              href="/cart"
              className="flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80"
              aria-label="Корзина"
            >
              <CartIcon filled={pathname === "/cart"} />
              <span className="sr-only">Корзина</span>
            </Link>
          </div>
        </div>
        {searchDropdown}
      </header>
    );
  }

  // Desktop version
  return (
    <header className={`bg-bg-4 text-[#FFF8F0] py-5 relative sticky top-0 z-50 ${className}`}>
      <div className="w-full px-14 flex items-center gap-10">
        <nav className="flex flex-1 items-center justify-start gap-10 uppercase tracking-[0.04em] text-lg">
          <Link
            href="/product/RV-W-001"
            className={`tracking-[0.04em] transition-opacity hover:opacity-80 ${
              isActiveLink("/product/RV-W-001")
                ? "font-black text-white"
                : "font-light text-[#FFF8F0]/60"
            }`}
          >
            Shop now
          </Link>
          <Link
            href="/looks"
            className={`tracking-[0.04em] transition-opacity hover:opacity-80 ${
              isActiveLink("/looks")
                ? "font-black text-white"
                : "font-light text-[#FFF8F0]/60"
            }`}
          >
            Lookbook
          </Link>
          <Link
            href="/about"
            className={`tracking-[0.04em] transition-opacity hover:opacity-80 ${
              isActiveLink("/about")
                ? "font-black text-white"
                : "font-light text-[#FFF8F0]/60"
            }`}
          >
            About
          </Link>
        </nav>
        <div className="flex flex-1 justify-center">
        {logo}
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <button
            onClick={handleSearchClick}
            className="flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
            aria-label="Поиск"
          >
            <SearchIcon />
            <span className="sr-only">Поиск</span>
          </button>
          <Link
            href="/favorites"
            className="flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80"
            aria-label="Избранное (понравившиеся товары)"
          >
            <HeartIcon filled={pathname === "/favorites"} />
            <span className="sr-only">Избранное</span>
          </Link>
          <Link
            href="/profile"
            className="flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80"
            aria-label="Аккаунт (профиль)"
          >
            <ProfileIcon filled={pathname?.startsWith("/profile")} />
            <span className="sr-only">Аккаунт</span>
          </Link>
          <Link
            href="/cart"
            className="flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80"
            aria-label="Корзина"
          >
            <CartIcon filled={pathname === "/cart"} />
            <span className="sr-only">Корзина</span>
          </Link>
        </div>
      </div>
      {searchDropdown}
    </header>
  );
}