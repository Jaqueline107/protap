import React from "react";
import Image from "next/image";
import logo from "../../../public/logo.png";

export default function Banner() {
  return (
    <div className="w-5/6">
      <div className="flex bg-black p-2 rounded-lg w-full h-80 mt-10 justify-center sm:justify-between relative">
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
        <div className="flex justify-center items-center w-full">
          <Image
            src={logo}
            width={200}
            height={200}
            alt="protap"
            className="opacity-90 sm:w-[400px] sm:h-[200px]"
          />
        </div>
      </div>
    </div>
  );
}
