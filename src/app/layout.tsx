"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import "../app/globals.css"; // Importação do Tailwind
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setMenuOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <html>
      <body>
        <header className="flex items-center ml-24 mt-10 p-4">
          <div className="flex items-center">
            {typeof window !== "undefined" && window.innerWidth < 767 && (
              <button className="mr-4">
                <p className="text-black text-xl font-bold">Geovana Santana</p>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {typeof window !== "undefined" && window.innerWidth < 767 && (
              <FiMenu className="menu-icon" onClick={toggleMenu} size={30} />
            )}
            <nav className={menuOpen ? "show" : "hidden md:flex"}>
              <ul className="flex gap-14 items-baseline">
                <li>
                  <button className="text-black font-bold hover:text-red-500 text-3xl">
                    ProTap
                  </button>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 text-2xl hover:text-red-500 transition duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <a
                    href="/About"
                    className="text-gray-400 text-2xl hover:text-red-500 transition duration-200"
                  >
                    Sobre
                  </a>
                </li>
                <li>
                  <a
                    href="/Product"
                    className="text-gray-400 text-2xl hover:text-red-500 transition duration-200"
                  >
                    Produtos
                  </a>
                </li>
                <li>
                  <a
                    href="/Contact"
                    className="text-gray-400 text-2xl hover:text-red-500 transition duration-200"
                  >
                    Contato
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
