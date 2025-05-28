"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { performRequest } from "@/lib/datocms";
import { MdOutlineStar, MdOutlineStarOutline } from "react-icons/md";
import { toast } from "react-toastify";

// Define the product type
interface ExploreModel {
  id: string;
  image: {
    url: string;
  };
  productName: string;
}

interface HomePageData {
  homePage: {
    heroSection: {
      title: string;
      desc: string;
      button: string;
      image: {
        url: string;
      };
    };
    exploreSection: {
      title: string;
      description: string;
      button: string;
      exploreModel: ExploreModel[];
    };
    voucher: {
      title: string;
      subtitle: string;
      button: string;
      image: {
        url: string;
      };
    };
    fitSection: {
      title: string;
      description: string;
      subdesc: string;
      button: string;
    };
    reviewTitle: string;
  };
}

interface Review {
  id: string;
  stars: number;
  title: string;
  review: string;
  author: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-lg md:text-2xl text-[#FFCC00]">
          {i < rating ? (
            <MdOutlineStar className="" />
          ) : (
            <MdOutlineStarOutline className="" />
          )}
        </span>
      ))}
    </div>
  );
};

export default function Home() {
  // Add state to track current position in carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsPerPage, setProductsPerPage] = useState(3);
  const [reviewsPerPage, setReviewsPerPage] = useState(3);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const handleGetVoucher = () => {
    toast.success("Congrats, Voucher Claimed!", {
      position: "top-center",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const HOME_QUERY = `
          query Home {
            homePage {
              heroSection {
                title
                desc
                button
                image {
                  url
                }
              }
              exploreSection {
                title
                description
                button
                exploreModel {
                  id
                  image {
                    url
                  }
                  productName
                }
              }
              voucher {
                title
                subtitle
                button
                image {
                  url
                }
              }
              fitSection {
                title
                description
                subdesc
                button
              }
              reviewTitle
            }
          }
        `;

        const REVIEWS_QUERY = `
          query Review {
            allReviews {
              id
              title
              stars
              review
              author
            }
          }
        `;

        const [homeResponse, reviewsResponse] = await Promise.all([
          performRequest(HOME_QUERY),
          performRequest(REVIEWS_QUERY),
        ]);

        console.log("Fetched home data:", homeResponse);
        console.log("Fetched reviews:", reviewsResponse);

        if (
          homeResponse &&
          typeof homeResponse === "object" &&
          "homePage" in homeResponse
        ) {
          setHomeData(homeResponse as HomePageData);
        } else {
          console.error("Unexpected home data structure:", homeResponse);
        }

        if (
          reviewsResponse &&
          typeof reviewsResponse === "object" &&
          "allReviews" in reviewsResponse
        ) {
          setReviews(reviewsResponse.allReviews as Review[]);
        } else {
          console.error("Unexpected reviews data structure:", reviewsResponse);
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setProductsPerPage(window.innerWidth < 768 ? 1 : 3);
      setReviewsPerPage(window.innerWidth < 768 ? 1 : reviews.length);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const exploreModels = homeData?.homePage?.exploreSection?.exploreModel || [];

  // Calculate the visible products
  const visibleProducts = [];
  if (exploreModels.length > 0) {
    for (let i = 0; i < productsPerPage; i++) {
      const index = (currentIndex + i) % exploreModels.length;
      visibleProducts.push(exploreModels[index]);
    }
  }

  // Functions to handle navigation
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? exploreModels.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % exploreModels.length);
  };

  // Calculate the visible reviews
  const visibleReviews = [];
  if (reviews.length > 0) {
    for (let i = 0; i < reviewsPerPage; i++) {
      const index = (currentReviewIndex + i) % reviews.length;
      visibleReviews.push(reviews[index]);
    }
  }

  // Functions to handle review navigation
  const handleReviewPrev = () => {
    setCurrentReviewIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const handleReviewNext = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-futura flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="min-h-screen bg-white font-futura flex items-center justify-center">
        <div className="text-black">Unable to load content</div>
      </div>
    );
  }

  return (
    <main className="items-center justify-items-center min-h-screen font-futura">
      {/* Hero Section */}
      <section
        className="relative flex w-full h-[60vh] md:h-screen bg-cover bg-right md:bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${homeData.homePage.heroSection.image.url}')` }}
      >
        <div className="absolute bottom-6 left-6  md:bottom-20 md:left-20 flex flex-col text-white">
          <h1 className="text-[30px] -ml-4 md:-ml-10 font-meie-script md:text-6xl md:mb-4">
            {homeData.homePage.heroSection.title}
          </h1>
          <p className="text-base md:text-xl max-w-1/2 font-extralight">
            {homeData.homePage.heroSection.desc}
          </p>
          <button className="mt-4 w-fit px-2 md:px-6 py-2 bg-[#800000] text-white text-base md:text-xl font-futura font-extralight">
            {homeData.homePage.heroSection.button}
          </button>
        </div>
      </section>

      {/* Explore section */}
      <section className="py-6 md:py-20 px-8 flex flex-col w-full h-full bg-white">
        <div className="max-w-7xl mx-auto text-center">
          {/* Heading and subtitle */}
          <h2 className="text-[24px] md:text-[46px] font-futura font-normal mb-4">
            {homeData.homePage.exploreSection.title}
          </h2>
          <p className="text-base md:text-lg mb-6 md:mb-10 max-w-3xl mx-auto font-extralight">
            {homeData.homePage.exploreSection.description}
          </p>

          {/* CTA Button */}
          <div className="mb-16">
            <Link
              href="/catalogue"
              className="inline-block px-2 md:px-6 py-2 bg-[#800000] text-white font-extralight hover:bg-[#600000] transition-colors"
            >
              {homeData.homePage.exploreSection.button}
            </Link>
          </div>
        </div>

        {/* Product Carousel */}
        <div className="relative px-8">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-0  top-3/7 md:top-1/2 -translate-y-1/2 z-10 p-2 text-[#800000] hover:text-[#600000] transition-colors"
            aria-label="Previous products"
          >
            <Image
              src="/assets/previousArrow1.svg"
              alt="next"
              width={20}
              height={20}
              className="object-cover object-bottom"
            />
          </button>

          {/* Products Container */}
          <div className="flex justify-center gap-8">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="w-full max-w-xs transition-all duration-300"
              >
                <Link href="/catalogue">
                  <div className="aspect-[3/4] mb-4 overflow-hidden relative">
                    <div className="relative w-full h-full object-center">
                      <Image
                        src={product.image.url}
                        alt={product.productName}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-extralight text-center">
                    {product.productName}
                  </h3>
                </Link>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-3/7 md:top-1/2 -translate-y-1/2 z-10 p-2 text-[#800000] hover:text-[#600000] transition-colors"
            aria-label="Next products"
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
      </section>

      {/* discout section */}
      <section className="h-fit pt-10 w-full bg-[#800000] text-white flex items-center justify-center">
        <div
          className="py-12 px-6 flex gap-4 md:gap-0 flex-row md:flex-col w-full items-center justify-between md:justify-center h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${homeData.homePage.voucher.image.url}')` }}
        >
          <div className="flex flex-col items-start md:items-center">
            <h1 className="font-futura font-bold text-[24px] md:text-5xl">
              {homeData.homePage.voucher.title}
            </h1>
            <h2 className="font-futura font-normal text-base md:text-4xl">
              {homeData.homePage.voucher.subtitle}
            </h2>
          </div>
          <button
            onClick={handleGetVoucher}
            className="mt-4 w-fit px-2 md:px-6 py-2 bg-[#800000] text-white text-base md:text-xl font-futura font-extralight"
          >
            {homeData.homePage.voucher.button}
          </button>
        </div>
      </section>

      {/* size reommendation section */}
      <section className="flex px-6 md:px-20 flex-row w-full bg-white relative gap-6 items-stretch">
        <div className="flex w-full lg:w-2/3 flex-col gap-6 my-12 justify-center items-center md:items-start text-center md:text-left">
          <h1 className="font-futura font-normal text-[24px] md:text-[46px]">
            {homeData.homePage.fitSection.title}
          </h1>
          <div className="-mt-8 flex lg:hidden w-full h-[200px] relative">
            <div className="absolute inset-x-0 bottom-0 h-full">
              <Image
                src="/person1.png"
                alt="Size Recommendation"
                fill
                className="object-contain object-bottom"
              />
            </div>
          </div>
          <p className="font-futura font-extralight text-base md:text-xl">
            {homeData.homePage.fitSection.description}
          </p>
          <p className="hidden lg:flex font-futura font-bold text-[24px]">
            {homeData.homePage.fitSection.subdesc}
          </p>
          <Link href="/checkyourfit">
            <button className="mt-4 w-fit px-2 md:px-6 py-2 bg-[#800000] text-white text-base md:text-xl font-futura font-extralight">
              {homeData.homePage.fitSection.button}
            </button>
          </Link>
        </div>
        <div className="hidden lg:flex w-1/3 h-auto relative">
          <div className="absolute inset-x-0 bottom-0 h-full">
            <Image
              src="/person1.png"
              alt="Size Recommendation"
              fill
              className="object-contain object-bottom-right"
            />
          </div>
        </div>
      </section>

      {/* review section */}
      <section className="py-20 px-8 w-full flex flex-col bg-[#800000] text-white">
        <div className="flex w-full flex-col">
          <h2 className="text-[24px] md:text-[46px] font-futura mb-4 text-center">
            {homeData.homePage.reviewTitle}
          </h2>

          {loading ? (
            <div className="flex justify-center">
              <p className="text-xl">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center">
              <p className="text-xl">No reviews available at the moment.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <div className="flex w-full justify-between gap-12">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white mt-6 text-black p-5 rounded-[20px] shadow-sm border border-gray-100 flex flex-col w-full transition-all duration-300"
                    >
                      <div className="mb-2">
                        <StarRating rating={review.stars} />
                      </div>
                      <h3 className="text-[24px] mb-2">{review.title}</h3>
                      <p className="font-light mb-4 flex-grow">
                        {review.review}
                      </p>
                      <p className="font-bold">- {review.author}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile */}
              <div className="mt-4 md:mt-12 block md:hidden">
                <div className="relative flex flex-row gap-2">
                  {/* Left Arrow */}
                  <button
                    onClick={handleReviewPrev}
                    className="z-10 p-2 text-white hover:text-gray-300 transition-colors"
                    aria-label="Previous reviews"
                  >
                    <Image
                      src="/assets/previousArrow.svg"
                      alt="previous"
                      width={20}
                      height={20}
                      className="object-cover object-bottom filter brightness-0 invert"
                    />
                  </button>

                  {/* Review Container */}
                  <div className="flex justify-center">
                    <div className="bg-white text-black p-2 md:p-5 rounded-[9px] md:rounded-[20px] shadow-sm border border-gray-100 flex flex-col w-full max-w-xs">
                      <div className="mb-2">
                        <StarRating rating={visibleReviews[0]?.stars || 0} />
                      </div>
                      <h3 className="text-[16px] md:text-[24px] mb-2">
                        {visibleReviews[0]?.title}
                      </h3>
                      <p className="text-[12px] md:text-base font-light mb-2 md:mb-4 flex-grow">
                        {visibleReviews[0]?.review}
                      </p>
                      <p className="md:text-base text-[12px] font-bold">
                        - {visibleReviews[0]?.author}
                      </p>
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={handleReviewNext}
                    className="z-10 p-2 text-white hover:text-gray-300 transition-colors"
                    aria-label="Next reviews"
                  >
                    <Image
                      src="/assets/nextArrow.svg"
                      alt="next"
                      width={20}
                      height={20}
                      className="object-cover object-bottom filter brightness-0 invert"
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
