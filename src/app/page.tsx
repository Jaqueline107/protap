import Image from "next/image";
import logo from "../../public/logo.png";
import product1 from "../../public/opala.png";
import product2 from "../../public/KombiMala2.png";
import product3 from "../../public/UnoStreet.png";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-5/6">
        <div className="flex bg-black p-2 rounded-lg w-full h-80 mt-10 justify-between  relative">
          <div className="flex w-full justify-between ml-20 mr-20">
            <div>
              <h1 className="text-6xl font-bold m-5 mt-20 font-pop text-white">
                ProTap{" "}
              </h1>
              <h2 className="text-4xl font-light ml-5 -mt-4 text-white">
                Tapetes de carros
              </h2>
            </div>
            <div className="relative">
              {/* Certifique-se de que as imagens estão corretas e referenciadas corretamente */}
              <Image
                src={logo}
                width={450}
                height={250}
                alt="protap"
                className="mt-10 opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
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
              Ver beneficios
            </button>
          </div>
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
              <Image src={product1} width={450} height={200} alt="product1" />
              <p className="mt-5 text-2xl">Tapete Opala</p>
              <p className="text-green-500 text-2xl font-semibold">R$39,00</p>
            </button>
          </div>
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
              <Image src={product3} width={450} height={200} alt="product1" />
              <p className="mt-5 text-2xl">Tapete Uno Street</p>
              <p className="text-green-500 text-2xl font-semibold">R$39,00</p>
            </button>
          </div>
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
              <Image src={product2} width={450} height={200} alt="product2" />
              <p className="mt-5 text-2xl">Tapete Kombi Mala</p>
              <p className="text-green-500 text-2xl font-semibold">R$39,00</p>
            </button>
          </div>
          {/* Adicionando mais cards */}
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
              <Image src={product3} width={450} height={200} alt="product1" />
              <p className="mt-5 text-2xl">Tapete Uno Street</p>
              <p className="text-green-500 text-2xl font-semibold">R$39,00</p>
            </button>
          </div>
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
              <Image src={product1} width={450} height={200} alt="product2" />
              <p className="mt-5 text-2xl">Tapete Opala</p>
              <p className="text-green-500 text-2xl font-semibold">R$39,00</p>
            </button>
          </div>
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
              <Image src={product1} width={450} height={200} alt="product1" />
              <p className="mt-5 text-2xl">Tapete Opala</p>
              <p className="text-green-500 text-2xl font-semibold">R$39,00</p>
            </button>
          </div>
          <div className="w-full md:w-80 p-5 h-auto bg-white rounded-lg">
            <button className="rounded-md p-3 text-black font-semibold text-left w-full h-full">
              <Image src={product2} width={450} height={200} alt="product2" />
              <p className="mt-5 text-2xl">Tapete Kombi Mala</p>
              <p className="text-green-500 text-2xl font-semibold">R$39,00</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
