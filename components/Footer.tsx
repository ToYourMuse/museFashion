import React from "react";
import { AiFillInstagram, AiFillTikTok, AiFillLinkedin } from "react-icons/ai";


const Footer = () => {
  return (
    <div className="flex px-20 flex-row items-center justify-between w-full py-6 text-[#800000] bg-white">
      <div className="font-futura font-bold">
        <p>toyourMUSE.id</p>
      </div>
      <div className="flex gap-4 font-futura font-extralight">
        <AiFillLinkedin className="text-2xl" />
        <AiFillTikTok className="text-2xl" />
        <AiFillInstagram className="text-2xl" />
      </div>
    </div>
  );
};

export default Footer;