"use client";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/catalogue") {
      return pathname === "/catalogue" || pathname.startsWith("/catalogue/");
    }
    if (path === "/checkyourfit") {
      return (
        pathname === "/checkyourfit" || pathname.startsWith("/checkyourfit")
      );
    }
    if (path === "/about") {
      return pathname === "/about" || pathname.startsWith("/about");
    }
    return pathname === path;
  };

  return (
    <>
      {/* Desktop Navbar */}
      <div className="fixed z-20 w-full px-20 justify-between items-center p-4 bg-[#800000] text-white md:flex hidden">
        <div className="font-futura font-bold">
          <Link href={"/"}>
            <p>toyourMUSE.id</p>
          </Link>
        </div>
        <div className="flex gap-4 font-futura font-extralight">
          <Link href={"/catalogue"}>
            <p
              className={`${
                isActive("/catalogue") ? "border-b border-[#E6AF2D] pb-1" : ""
              } hover:opacity-80 transition-opacity`}
            >
              Catalogue
            </p>
          </Link>
          <Link href={"/checkyourfit"}>
            <p
              className={`${
                isActive("/checkyourfit")
                  ? "border-b border-[#E6AF2D] pb-1"
                  : ""
              } hover:opacity-80 transition-opacity`}
            >
              Check Your Fit
            </p>
          </Link>
          <Link href={"/about"}>
            <p
              className={`${
                isActive("/about") ? "border-b border-[#E6AF2D] pb-1" : ""
              } hover:opacity-80 transition-opacity`}
            >
              About Us
            </p>
          </Link>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="fixed z-20 flex w-full justify-between items-center p-4 px-6 bg-[#800000] text-white md:hidden">
        <div className="font-futura font-bold">
          <Link href={"/"}>
            <p>toyourMUSE.id</p>
          </Link>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          {/* Hamburger Menu Icon */}
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                isSidebarOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
              }`}
            ></span>
            <span
              className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                isSidebarOpen ? "opacity-0" : "opacity-100"
              }`}
            ></span>
            <span
              className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                isSidebarOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
              }`}
            ></span>
          </div>
        </button>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-xs bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-60 bg-[#800000] text-white transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 md:hidden`}
      >
        <div className="p-6">
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-8">
            <div className="font-futura font-bold text-lg">
              <Link href={"/"} onClick={closeSidebar}>
                <p>toyourMUSE.id</p>
              </Link>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 focus:outline-none"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-8 flex flex-col w-fit">
            <div
              className={`w-full pb-2 ${
                isActive("/catalogue") ? "border-b border-[#E6AF2D]" : ""
              }`}
            >
              <Link href={"/catalogue"} onClick={closeSidebar}>
                <p className="font-futura font-light text-lg hover:opacity-80 transition-opacity">
                  Catalogue
                </p>
              </Link>
            </div>
            <div
              className={`w-fit pb-2 ${
                isActive("/checkyourfit") ? "border-b border-[#E6AF2D]" : ""
              }`}
            >
              <Link href={"/checkyourfit"} onClick={closeSidebar}>
                <p className="font-futura font-light text-lg hover:opacity-80 transition-opacity">
                  Check Your Fit
                </p>
              </Link>
            </div>
            <div
              className={`w-full pb-2 ${
                isActive("/about") ? "border-b border-[#E6AF2D]" : ""
              }`}
            >
              <Link href={"/about"} onClick={closeSidebar}>
                <p className="font-futura font-light text-lg hover:opacity-80 transition-opacity">
                  About Us
                </p>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;
