"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation"; // Hook para verificar a rota atual
import "../app/globals.css"; // Importação do Tailwind
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // Obtemos a rota atual

  // const toggleMenu = useCallback(() => {
  //   setMenuOpen((prev) => !prev);
  // }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <html>
      <body>
        <header className="flex justify-between items-center p-4 relative z-10">
          <div className="flex items-center gap-4 px-6 py-4 lg:px-44 md:px-12">
            {/* ProTap visível em telas médias e grandes, oculto em telas pequenas */}
            <p className="hidden md:block text-black hover:text-red-500 text-3xl font-bold">
              ProTap
            </p>

            {/* ArrowLeft aparece em páginas diferentes da inicial */}
            {pathname !== "/" && (
              <Link href={"/"}>
                <ArrowLeft className="menu-icon cursor-pointer" size={30} />
              </Link>
            )}

            {/* Navegação horizontal para telas grandes */}
            <nav className="md:flex md:gap-14">
              <ul className="flex gap-14 ml-5 items-baseline">
                {pathname !== "/" && ( // Condição para ocultar o link na página inicial
                  <li>
                    <Link
                      href="/"
                      className="text-gray-400 text-2xl hover:text-red-500 transition duration-200"
                    >
                      Voltar para Galeria
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          {/* Sidebar para telas menores */}
          {/* <nav
            className={`fixed top-0 left-0 h-full bg-gray-100 z-50 transform ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out w-[250px] md:hidden`}
          > */}
          {/* <FiX
              className="absolute top-5 right-5 cursor-pointer"
              onClick={toggleMenu}
              size={30}
            />

            <ul className="mt-10 flex flex-col gap-8 text-left pl-6">
              <li onClick={() => setMenuOpen(false)}>
                <Link
                  href="/"
                  className="text-gray-600 text-xl hover:text-red-500 transition duration-200"
                >
                  Home
                </Link>
              </li>
              <li onClick={() => setMenuOpen(false)}>
                <a
                  href="/About"
                  className="text-gray-600 text-xl hover:text-red-500 transition duration-200"
                >
                  Sobre
                </a>
              </li>
              <li onClick={() => setMenuOpen(false)}>
                <a
                  href="/Product"
                  className="text-gray-600 text-xl hover:text-red-500 transition duration-200"
                >
                  Produtos
                </a>
              </li>
              <li onClick={() => setMenuOpen(false)}>
                <a
                  href="/Contact"
                  className="text-gray-600 text-xl hover:text-red-500 transition duration-200"
                >
                  Contato
                </a>
              </li>
            </ul>
          </nav> */}
        </header>

        {/* Conteúdo principal */}
        <main className="relative z-0">{children}</main>
      </body>
    </html>
  );
}
