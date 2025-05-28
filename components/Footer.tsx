"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AiFillInstagram, AiFillTikTok, AiFillLinkedin } from "react-icons/ai";
import { performRequest } from "@/lib/datocms";

interface FooterData {
  footer: {
    socmedSection: {
      instagram?: string;
      linkedin?: string;
      tiktok?: string;
    };
  };
}

const Footer = () => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const FOOTER_QUERY = `
          query Footer {
            footer {
              socmedSection {
                instagram
                linkedin
                tiktok
              }
            }
          }
        `;

        const data = await performRequest(FOOTER_QUERY);
        console.log("Fetched footer data:", data);
        
        if (data && typeof data === "object" && "footer" in data) {
          setFooterData(data as FooterData);
        } else {
          console.error("Unexpected footer data structure:", data);
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  const socmedLinks = footerData?.footer?.socmedSection;

  return (
    <div className="border-t-[1px] border-[#DADADA]/50 flex px-6 md:px-20 flex-row items-center justify-between w-full py-6 text-[#800000] bg-white">
      <div className="font-futura font-bold">
        <p>toyourMUSE.id</p>
      </div>
      <div className="flex gap-1 md:gap-4 font-futura font-extralight">
        {loading ? (
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ) : (
          <>
            {socmedLinks?.linkedin && (
              <Link href={socmedLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <AiFillLinkedin className="text-2xl hover:opacity-70 transition-opacity" />
              </Link>
            )}
            {socmedLinks?.tiktok && (
              <Link href={socmedLinks.tiktok} target="_blank" rel="noopener noreferrer">
                <AiFillTikTok className="text-2xl hover:opacity-70 transition-opacity" />
              </Link>
            )}
            {socmedLinks?.instagram && (
              <Link href={socmedLinks.instagram} target="_blank" rel="noopener noreferrer">
                <AiFillInstagram className="text-2xl hover:opacity-70 transition-opacity" />
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Footer;