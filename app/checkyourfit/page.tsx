"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { performRequest } from "@/lib/datocms";

interface ProductFit {
  id: string;
  image: {
    url: string;
  };
  desc: string;
}

interface Product {
  id: string;
  productName: string;
  price: number;
  slug: string;
  productFit: ProductFit[];
}

interface DefaultFit {
  defaultProduct: string;
  image1: {
    url: string;
  };
  text1: string;
  image2: {
    url: string;
  };
  text2: string;
  image3: {
    url: string;
  };
  text3: string;
  image4: {
    url: string;
  };
  text4: string;
  image5: {
    url: string;
  };
  text5: string;
}

interface CheckFitPageData {
  checkFitPage: {
    title: string;
    button: string;
    whatsappTop: string;
    whatsappBottom: string;
    phoneNumber: number;
  };
}

interface SizeModel {
  weight: string;
  height: string;
  image: string;
  desc: string;
}

const SizeChecker: React.FC = () => {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");

  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [showRecommendation, setShowRecommendation] = useState<boolean>(false);
  const [showNoMatch, setShowNoMatch] = useState<boolean>(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [defaultFit, setDefaultFit] = useState<DefaultFit | null>(null);
  const [checkFitPageData, setCheckFitPageData] =
    useState<CheckFitPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);

  // Function to check if inputs are valid for enabling button
  const isFormValid = () => {
    return (
      height.trim() !== "" &&
      weight.trim() !== "" &&
      !isNaN(Number(height)) &&
      !isNaN(Number(weight)) &&
      Number(height) > 0 &&
      Number(weight) > 0
    );
  };

  // Function to generate WhatsApp message
  const generateWhatsAppMessage = () => {
    const productName = product?.productName || defaultFit?.defaultProduct;
    const heightValue = height || "[tidak diisi]";
    const weightValue = weight || "[tidak diisi]";

    // Use content from DatoCMS with hardcoded product name and measurements
    const whatsappTop = checkFitPageData?.checkFitPage?.whatsappTop || "";
    const whatsappBottom = checkFitPageData?.checkFitPage?.whatsappBottom || "";
    
    const message = `${whatsappTop}
    
- Nama Produk: ${productName}
- Tinggi badan: ${heightValue} cm  
- Berat badan: ${weightValue} kg  

${whatsappBottom}`;

    return encodeURIComponent(message);
  };

  // Function to handle WhatsApp redirect
  const handleWhatsAppRedirect = () => {
    // Use phone number from DatoCMS
    const phoneNumber = checkFitPageData?.checkFitPage?.phoneNumber || "6289602446618";
    const message = generateWhatsAppMessage();
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappURL, "_blank");
  };

  // Convert default fit data to SizeModel format
  const convertDefaultFitToModels = (defaultFit: DefaultFit): SizeModel[] => {
    return [
      {
        weight: "40kg",
        height: "160cm",
        image: defaultFit.image1.url,
        desc: defaultFit.text1,
      },
      {
        weight: "50kg",
        height: "165cm",
        image: defaultFit.image2.url,
        desc: defaultFit.text2,
      },
      {
        weight: "55kg",
        height: "170cm",
        image: defaultFit.image3.url,
        desc: defaultFit.text3,
      },
      {
        weight: "60kg",
        height: "170cm",
        image: defaultFit.image4.url,
        desc: defaultFit.text4,
      },
      {
        weight: "65kg",
        height: "175cm",
        image: defaultFit.image5.url,
        desc: defaultFit.text5,
      },
    ];
  };

  // Convert product fit data to SizeModel format
  const convertProductFitToModels = (productFit: ProductFit[]): SizeModel[] => {
    const weights = ["40kg", "50kg", "55kg", "60kg", "65kg"];
    const heights = ["160cm", "165cm", "170cm", "170cm", "175cm"];

    return productFit.slice(0, 5).map((fit, index) => ({
      weight: weights[index] || "50kg",
      height: heights[index] || "165cm",
      image: fit.image.url,
      desc: fit.desc,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch check fit page data first
        const CHECK_FIT_PAGE_QUERY = `
          query CheckFitPage {
            checkFitPage {
              title
              button
              whatsappTop
              whatsappBottom
              phoneNumber
            }
          }
        `;

        const checkFitPageResponse = await performRequest(CHECK_FIT_PAGE_QUERY);
        console.log("Fetched check fit page data:", checkFitPageResponse);

        if (
          checkFitPageResponse &&
          typeof checkFitPageResponse === "object" &&
          "checkFitPage" in checkFitPageResponse
        ) {
          setCheckFitPageData(checkFitPageResponse as CheckFitPageData);
        }

        if (productSlug) {
          // Fetch specific product data
          const PRODUCT_QUERY = `
            query Product($slug: String!) {
              product(filter: { slug: { eq: $slug } }) {
                id
                productName
                price
                slug
                productFit {
                  id
                  image {
                    url
                  }
                  desc
                }
              }
            }
          `;

          const data = (await performRequest(PRODUCT_QUERY, {
            variables: { slug: productSlug },
          })) as { product: Product };

          if (data && data.product) {
            setProduct(data.product);
          } else {
            setError("Product not found");
          }
        } else {
          // Fetch default fit data
          const DEFAULT_FIT_QUERY = `
            query DefaultFit {
              defaultfit {
                defaultProduct
                image1 {
                  url
                }
                text1
                image2 {
                  url
                }
                text2
                image3 {
                  url
                }
                text3
                image4 {
                  url
                }
                text4
                image5 {
                  url
                }
                text5
              }
            }
          `;

          const data = (await performRequest(DEFAULT_FIT_QUERY)) as {
            defaultfit: DefaultFit;
          };

          if (data && data.defaultfit) {
            setDefaultFit(data.defaultfit);
          } else {
            setError("Default fit data not found");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productSlug]);

  const checkSize = () => {
    const heightNum = parseInt(height);
    const weightNum = parseInt(weight);

    // Check if height and weight fit any of the 4 conditions
    const isAllSize =
      (heightNum >= 150 &&
        heightNum <= 155 &&
        weightNum >= 40 &&
        weightNum <= 50) ||
      (heightNum >= 156 &&
        heightNum <= 165 &&
        weightNum >= 45 &&
        weightNum <= 60) ||
      (heightNum >= 166 &&
        heightNum <= 175 &&
        weightNum >= 48 &&
        weightNum <= 63) ||
      (heightNum >= 176 &&
        heightNum <= 180 &&
        weightNum >= 50 &&
        weightNum <= 65);

    if (isAllSize) {
      setShowRecommendation(true);
      setShowNoMatch(false);
    } else {
      setShowRecommendation(false);
      setShowNoMatch(true);
    }
  };

  // Functions to handle model navigation
  const handleModelPrev = () => {
    setCurrentModelIndex((prevIndex) =>
      prevIndex === 0 ? sizeModels.length - 1 : prevIndex - 1
    );
  };

  const handleModelNext = () => {
    setCurrentModelIndex((prevIndex) => (prevIndex + 1) % sizeModels.length);
  };

  if (loading) {
    return (
      <div className="px-6 md:px-20 pt-24 flex w-full flex-col mx-auto p-6 min-h-screen font-futura">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 md:px-20 pt-24 flex w-full flex-col mx-auto p-6 min-h-screen font-futura">
        <div className="flex justify-center items-center h-64 flex-col gap-4">
          <p className="text-lg text-red-600">{error}</p>
          <Link href="/catalogue" className="text-blue-600 hover:text-blue-800">
            Back to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  // Get size models based on data source
  const sizeModels: SizeModel[] = product
    ? convertProductFitToModels(product.productFit)
    : defaultFit
    ? convertDefaultFitToModels(defaultFit)
    : [];

  const sizeText = "Seluruh Model Menggunakan Size: All Size";

  return (
    <div className="px-6 md:px-20 pt-24 flex w-full flex-col mx-auto p-6 min-h-screen font-futura">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-[24px] md:text-3xl font-bold text-black">
          {checkFitPageData?.checkFitPage?.title || "Check Your Fit"}
        </h1>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Measurement Form Section */}
        <div className="w-full lg:w-1/4">
          <div className="space-y-4">
            <div>
              <label className="block text-black font-normal text-[18px] md:text-[24px] mb-2">
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="165"
                className="w-full px-4 py-3 border text-base md:text-[20px] border-[#757575]/45 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-black font-normal text-[18px] md:text-[24px] mb-2">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="45"
                className="w-full px-4 py-3 border text-base md:text-[20px] border-[#757575]/45 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
              />
            </div>

            <button
              onClick={checkSize}
              disabled={!isFormValid()}
              className={`w-fit py-3 px-6 font-light text-base transition-colors ${
                isFormValid()
                  ? "bg-[#800000] text-white hover:bg-red-900 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {checkFitPageData?.checkFitPage?.button || "Check It Out!"}
            </button>
          </div>
        </div>

        {/* Result Card Section */}
        <div className="w-full lg:w-3/4 flex items-center justify-center">
          {/* Perfect Fit Card */}
          {showRecommendation && (
            <div className="bg-white w-full max-w-[584px] p-6 text-center border-3 rounded-[20px] border-black animate-fade-in">
              <div className="flex flex-col md:flex-row gap-2 items-center justify-center mb-4">
                <div className="flex w-[60px] h-[60px] flex-shrink-0">
                  <Image
                    src="/assets/check1.svg"
                    alt="Check"
                    width={60}
                    height={60}
                    className="w-full h-auto object-cover rounded-[8px]"
                  />
                </div>
                <h3 className="text-[20px] md:text-[30px] font-normal text-black text-center md:text-left">
                  Effortless elegance, perfectly yours.
                </h3>
              </div>
              <p className="text-black text-base font-light mb-2">
                Designed to complement and enhance your natural form seamlessly.
              </p>
              {product ? (
                <Link
                  href={`/catalogue/${product.slug}`}
                  className="block w-full bg-[#800000] text-white py-3 px-6 font-light hover:bg-red-900 transition-colors"
                >
                  Shop This Look!
                </Link>
              ) : (
                <Link
                  href="/catalogue"
                  className="block w-full bg-[#800000] text-white py-3 px-6 font-light hover:bg-red-900 transition-colors"
                >
                  Shop This Look!
                </Link>
              )}
            </div>
          )}

          {/* No Match Card */}
          {showNoMatch && (
            <div className="w-full max-w-[532px] bg-white p-6 text-center border-3 rounded-[20px] border-black animate-fade-in">
              <div className="flex flex-col md:flex-row gap-2 items-center justify-center mb-4">
                <div className="flex w-[60px] h-[60px] flex-shrink-0">
                  <Image
                    src="/assets/sad.svg"
                    alt="No Match"
                    width={60}
                    height={60}
                    className="w-full h-auto object-cover rounded-[8px]"
                  />
                </div>
                <h3 className="text-[20px] md:text-[30px] font-normal text-black text-center md:text-left leading-tight">
                  We're sorry, This piece may not suit your proportions.
                </h3>
              </div>
              <p className="text-black text-base font-light mb-2">
                Let our Muse Fit Specialist help you explore better-fitting
                options.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleWhatsAppRedirect}
                  className="block w-full bg-[#800000] text-white py-3 px-6 font-light hover:bg-red-900 transition-colors"
                >
                  Get Personalized Help
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Models Section */}
      <div className="mt-12 flex flex-col items-center md:items-start">
        <h2 className="text-center md:text-start text-base font-normal text-black mb-2">
          {sizeText}
        </h2>

        {sizeModels.length > 0 ? (
          <>
            {/* Desktop View - Grid */}
            <div className="hidden lg:grid grid-cols-3 lg:grid-cols-5 gap-4">
              {sizeModels.map((model, index) => (
                <div key={index} className="text-center">
                  <div className="w-full h-[328px] bg-gray-200 overflow-hidden mb-2">
                    <Image
                      src={model.image}
                      alt={`Model ${model.weight}/${model.height}`}
                      width={150}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-black font-light text-base">
                    {model.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile View - Carousel */}
            <div className="flex flex-col w-fit lg:hidden">
              <div>
                <div className="relative flex flex-row gap-2 items-center">
                  {/* Left Arrow */}
                  <button
                    onClick={handleModelPrev}
                    className="z-10 p-2 hover:cursor-pointer text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
                    aria-label="Previous model"
                  >
                    <Image
                      src="/assets/previousArrow1.svg"
                      alt="previous"
                      width={20}
                      height={20}
                      className="object-cover object-bottom"
                    />
                  </button>

                  {/* Model Container */}
                  <div className="flex justify-center flex-1">
                    <div className="w-fit max-w-sm text-center">
                      <div className="w-full h-[380px] md:h-[328px] bg-gray-200 overflow-hidden mb-2">
                        <Image
                          src={sizeModels[currentModelIndex].image}
                          alt={`Model ${sizeModels[currentModelIndex].weight}/${sizeModels[currentModelIndex].height}`}
                          width={200}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-black font-light text-base">
                        {sizeModels[currentModelIndex].desc}
                      </p>
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={handleModelNext}
                    className="z-10 p-2 hover:cursor-pointer text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
                  >
                    <Image
                      src="/assets/nextArrow1.svg"
                      alt="next"
                      width={20}
                      height={20}
                      className="object-cover object-bottom"
                    />
                  </button>
                </div>
              </div>

              {/* Model indicators for mobile */}
              <div className="flex justify-center mt-4 gap-2">
                {sizeModels.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentModelIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentModelIndex
                        ? "bg-gray-800"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Go to model ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-black font-normal">No fit data available</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Loading component for Suspense fallback
const SizeCheckerLoading = () => (
  <div className="px-6 md:px-20 pt-24 flex w-full flex-col mx-auto p-6 min-h-screen font-futura">
    <div className="flex justify-center items-center h-64">
      <p className="text-lg">Loading...</p>
    </div>
  </div>
);

// Main component wrapped with Suspense
const SizeCheckerPage = () => {
  return (
    <Suspense fallback={<SizeCheckerLoading />}>
      <SizeChecker />
    </Suspense>
  );
};

export default SizeCheckerPage;