import Image from "next/image";
import logo from "../../public/logo.png";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-5/6">
        <div className="flex bg-black p-2 rounded-lg w-full h-80 mt-10 justify-between relative">
          {/* Conteúdo ocultado em dispositivos móveis */}
          <div className="hidden sm:flex w-full justify-between ml-20 mr-20">
            <div>
              <h1 className="text-6xl font-bold m-5 mt-20 font-pop text-white">
                ProTap
              </h1>
              <h2 className="text-4xl font-light ml-5 -mt-4 text-white">
                Tapetes de carros
              </h2>
            </div>
          </div>
          {/* Logo exibida em todas as telas */}
          <div className="flex w-full justify-center sm:justify-end relative">
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
  );
}
