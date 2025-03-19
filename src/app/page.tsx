import Image from "next/image";
import product1 from "../../public/opala.png";
import product2 from "../../public/kombimala.png";
import product3 from "../../public/unostreet.png";
import Link from "next/link";

import Banner from "./Components/banner";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <Banner />

      {/* Conteúdo Principal */}
      <main className="w-5/6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <p className="text-black font-semibold text-2xl mb-5">
              Acesse nossa galeria de produtos para visualizar o seu tapete!
            </p>
            <p className="text-gray-400 text-2xl font-light mb-5">
              Melhores Ofertas
            </p>
            <button className="rounded-md bg-red-600 hover:bg-opacity-85 p-3 text-white font-semibold text-xl">
              Ver benefícios
            </button>
          </div>
          {/* Card do Produto Opala */}
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <Link href="/Produtos?produto=Opala">
              <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
                <Image
                  src={product1}
                  width={450}
                  height={200}
                  alt="Tapete Opala"
                />
                <p className="mt-5 text-2xl">Tapete Opala</p>
                <p className="text-green-500 text-2xl font-semibold">R$39,00</p>
              </button>
            </Link>
          </div>

          {/* Card do Produto Kombi Mala */}
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <Link href="/Produtos?produto=KombiMala">
              <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
                <Image
                  src={product2}
                  width={450}
                  height={200}
                  alt="Tapete Kombi Mala"
                />
                <p className="mt-5 text-2xl">Tapete Kombi Mala</p>
                <p className="text-green-500 text-2xl font-semibold">R$45,00</p>
              </button>
            </Link>
          </div>

          {/* Card do Produto Uno Street */}
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <Link href="/Produtos?produto=UnoStreet">
              <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
                <Image
                  src={product3}
                  width={450}
                  height={200}
                  alt="Tapete Uno Street"
                />
                <p className="mt-5 text-2xl">Tapete Uno Street</p>
                <p className="text-green-500 text-2xl font-semibold">R$35,00</p>
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
