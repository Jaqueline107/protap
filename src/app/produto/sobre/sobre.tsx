import { FaHome, FaWhatsapp, FaInstagram } from "react-icons/fa";

export const sobre = () => {
  return (
    <div className="flex flex-col justify-center m-10 mt-52 gap-36">
      <div className="flex flex-col items-center">
        <p className="text-black font-semibold text-5xl mb-5">Sobre Nós</p>
        <p className="text-gray-400 font-semibold text-xl">
          Somos uma Empresa de Tapetes Automotiv
        </p>
      </div>
      <div className="flex justify-center gap-12 lg:gap-48">
        <div className="flex flex-col items-center">
          <div className="bg-[#C1DCDC] w-32 h-32 rounded-full flex justify-center items-center">
            <FaHome size={85} />
          </div>
          <p className="text-black font-semibold text-lg mt-4">
            Produtos Diversos
          </p>
          <p className="text-gray-400 text-center mt-2">
            Temos diferentes tipos de produtos, tudo para atender você e sua
            casa.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#C1DCDC] w-32 h-32 rounded-full flex justify-center items-center">
            <FaWhatsapp size={85} />
          </div>
          <p className="text-black font-semibold text-lg mt-4">Contato</p>
          <p className="text-gray-400 text-center mt-2">
            Entre em contato conosco e faça sua encomenda já!
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#C1DCDC] w-32 h-32 rounded-full flex justify-center items-center">
            <FaInstagram size={85} />
          </div>
          <p className="text-black font-semibold text-lg mt-4">Siga-nos</p>
          <p className="text-gray-400 text-center mt-2">
            Siga-nos no Instagram para ficar por dentro das novidades.
          </p>
        </div>
      </div>
    </div>
  );
};
export default sobre;
