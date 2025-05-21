import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="fixed z-10 flex w-full px-20 justify-between items-center p-4 bg-[#800000] text-white">
      <div className="font-futura font-bold">
        <p>toyourMUSE.id</p>
      </div>
      <div className="flex gap-4 font-futura font-extralight">
        <Link href={"/catalogue"}>
          <p>Catalogue</p>
        </Link>
        <Link href={"/knowyourfit"}>
          <p>Know Your Fit</p>
        </Link>
        <Link href={"/about"}>
          <p>About</p>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
