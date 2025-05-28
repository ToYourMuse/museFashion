"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Image as DatoImage, StructuredText } from "react-datocms";
import { customRules } from "../../lib/structured-text-rules";
import { performRequest } from "@/lib/datocms";
import { useContact } from "@/app/hooks/useContact";

interface AboutData {
  about: {
    image: {
      responsiveImage: {
        sizes: string;
        src: string;
        title: string;
        width: number;
        height: number;
        alt: string;
        base64: string;
      };
    };
    aboutTitle: string;
    aboutSubtitle: string;
    aboutDesc: {
      value: any;
    };
    contactTitle: string;
  };
}

export default function Page() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const { sendMessage, loading: submitting, success, error, reset } = useContact();

  // Clear form when submission is successful
  useEffect(() => {
    if (success) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
    }
  }, [success]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ABOUT_QUERY = `
          query {
            about {
              image {
                responsiveImage {
                  sizes
                  src
                  title
                  width
                  height
                  alt
                  base64
                }
              }
              aboutTitle
              aboutSubtitle
              aboutDesc {
                value
              }
              contactTitle
            }
          }
        `;

        const data = await performRequest(ABOUT_QUERY);
        console.log("Fetched about data:", data);
        if (data && typeof data === "object" && "about" in data) {
          setAboutData(data as AboutData);
        } else {
          console.error("Unexpected data structure:", data);
          setAboutData(null);
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(formData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-futura flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen bg-white font-futura flex items-center justify-center">
        <div className="text-gray-600">Unable to load content</div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-20 pt-10 md:pt-18 min-h-screen text-black bg-white font-futura">
      <div className="py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left Column - Content */}
          <div className="space-y-12 flex-1">
            {/* About Us Section */}
            <section className="flex flex-col w-full items-center md:items-start">
              {/* About Title from DatoCMS */}
              <h1 className="text-[24px] md:text-[46px] font-bold mb-2 md:mb-4">
                {aboutData.about.aboutTitle}
              </h1>

              <h2 className="text-[16px] md:text-[20px] font-bold mb-2 md:mb-4">
                {aboutData.about.aboutSubtitle}
              </h2>
              <div className="w-full flex lg:hidden relative mb-4 h-[161px] rounded-[3px] object-center items-center object-cover bg-gray-100 overflow-hidden">
                <Image
                  src={aboutData.about.image.responsiveImage.src}
                  alt="About Us Image"
                  fill
                  className="w-full rounded-[3px] h-auto object-cover object-center items-center"
                />
              </div>
              {/* About Description from DatoCMS with Structured Text */}
              <div className="space-y-6 leading-relaxed">
                <StructuredText
                  data={aboutData.about.aboutDesc}
                  customNodeRules={customRules}
                />
              </div>
            </section>

            {/* Contact Us Section */}
            <section>
              {/* Contact Title from DatoCMS */}
              <h2 className="text-[24px] md:text-[46px] font-bold mb-8">
                {aboutData.about.contactTitle}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-2 md:space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="text-[16px] md:text-[20px] block font-light mb-2"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Jane"
                      required
                      disabled={submitting}
                      className="w-full text-[14px] md:text-[20px] px-4 py-[6px] md:py-3 border border-[#E0E0E0] rounded-[8px] focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition-colors bg-white placeholder-[#828282] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-[16px] md:text-[20px] font-light mb-2"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Smitherton"
                      required
                      disabled={submitting}
                      className="w-full text-[14px] md:text-[20px] px-4 py-[6px] md:py-3 border border-[#E0E0E0] rounded-[8px] focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition-colors bg-white placeholder-[#828282] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-[16px] md:text-[20px] font-light mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@janesfakedomain.net"
                    required
                    disabled={submitting}
                    className="w-full text-[14px] md:text-[20px] px-4 py-[6px] md:py-3 border border-[#E0E0E0] rounded-[8px] focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition-colors bg-white placeholder-[#828282] disabled:opacity-50"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="message" className="block text-[16px] md:text-[20px] font-light mb-2">
                    Your message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your question or message"
                    required
                    disabled={submitting}
                    className="w-full text-[14px] md:text-[20px] px-4 py-[6px] md:py-3 border border-[#E0E0E0] rounded-[8px] focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition-colors bg-white placeholder-[#828282] resize-y disabled:opacity-50"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#800000] hover:cursor-pointer text-base md:text-[20px] text-white py-2 font-light px-6 transition-colors duration-200 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-900"
                >
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </section>
          </div>

          {/* Right Column - Responsive Image from DatoCMS */}
          <div className="hidden lg:flex flex-1 lg:self-stretch lg:min-h-0">
            <div className="w-full h-full min-h-[600px] lg:min-h-full bg-gray-100 overflow-hidden">
              <DatoImage
                data={aboutData.about.image.responsiveImage}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}