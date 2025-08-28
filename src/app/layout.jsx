"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RootLayout;
const react_1 = __importDefault(require("react"));
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const CartContext_1 = require("./context/CartContext");
require("../app/globals.css");
// Botão Voltar que usa router.back()
function BackButton() {
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    if (pathname === "/")
        return null;
    return (<button onClick={() => router.back()} aria-label="Voltar para a página anterior" className="menu-icon cursor-pointer" style={{ border: "none", background: "transparent" }}>
      <lucide_react_1.ArrowLeft size={30}/>
    </button>);
}
// Ícone de carrinho fixo no canto direito com quantidade
function CartIcon() {
    const { cart } = (0, CartContext_1.useCart)();
    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
    return (<link_1.default href="/Carrinho" aria-label="Ver carrinho" className="fixed right-6 top-6 z-50 bg-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <lucide_react_1.ShoppingCart size={28} color="#111"/>

      {totalQuantity > 0 && (<span className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs select-none" style={{ backgroundColor: "#20e219ff",
                boxShadow: "0 0 7px #c3ffa7ff", /* verde suave */ }}>
          
          {totalQuantity}
        </span>)}
    </link_1.default>);
}
function RootLayout({ children, }) {
    return (<html lang="pt-BR">
      <body className="bg-gray-50">
        <CartContext_1.CartProvider>
          <header className="flex justify-between items-center p-4 relative z-10 bg-white shadow-sm">
            <div className="flex items-center gap-4 px-6 py-4 lg:px-44 md:px-12 w-full">
              <link_1.default href={"/"}>
                <p className="hidden md:block text-black hover:text-red-600 text-3xl font-bold cursor-pointer transition-colors">
                  ProTap
                </p>
              </link_1.default>

              <BackButton />

              <nav className="md:flex md:gap-14 ml-auto">
                {/* Se quiser adicionar mais links, coloque aqui */}
              </nav>
            </div>
          </header>

          <CartIcon />

          <main className="relative z-0">{children}</main>
        </CartContext_1.CartProvider>
      </body>
    </html>);
}
