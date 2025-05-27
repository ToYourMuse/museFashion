"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { performRequest } from "@/lib/datocms";
import { MdOutlineStar, MdOutlineStarOutline } from "react-icons/md";

// Define the product type
interface Product {
  id: string;
  name: string;
  imageUrl: string;
  href: string;
}

interface Review {
  id: string;
  stars: number;
  title: string;
  review: string;
  author: string;
}

// Sample product data
const fashionProducts: Product[] = [
  {
    id: "1",
    name: "Ivory Knit Ensemble",
    imageUrl: "/models/model1.png",
    href: "/products/ivory-knit-ensemble",
  },
  {
    id: "2",
    name: "Taupe Oversized Coat",
    imageUrl: "/models/model2.png",
    href: "/products/taupe-oversized-coat",
  },
  {
    id: "3",
    name: "White Linen Suit",
    imageUrl: "/models/model3.png",
    href: "/products/white-linen-suit",
  },
  {
    id: "4",
    name: "Beige Summer Dress",
    imageUrl: "/models/model1.png",
    href: "/products/beige-summer-dress",
  },
  {
    id: "5",
    name: "Camel Wool Jacket",
    imageUrl: "/models/model2.png",
    href: "/products/camel-wool-jacket",
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-2xl text-[#FFCC00]">
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
  const [loading, setLoading] = useState(true);
  const [productsPerPage, setProductsPerPage] = useState(3);
  const [reviewsPerPage, setReviewsPerPage] = useState(3);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
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

        const data = await performRequest(REVIEWS_QUERY);
        console.log("Fetched reviews:", data);
        if (data && typeof data === "object" && "allReviews" in data) {
          setReviews(data.allReviews as Review[]);
        } else {
          console.error("Unexpected data structure:", data);
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
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

  // Calculate the visible products
  const visibleProducts = [];
  for (let i = 0; i < productsPerPage; i++) {
    const index = (currentIndex + i) % fashionProducts.length;
    visibleProducts.push(fashionProducts[index]);
  }

  // Functions to handle navigation
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? fashionProducts.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % fashionProducts.length);
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

  return (
    <main className="items-center justify-items-center min-h-screen font-futura">
      {/* Hero Section */}
      <section
        className="relative flex w-full h-[60vh] md:h-screen bg-cover bg-right md:bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      >
        <div className="absolute bottom-6 left-6  md:bottom-20 md:left-20 flex flex-col text-white">
          <h1 className="text-[30px] -ml-4 md:-ml-10 font-meie-script md:text-6xl md:mb-4">
            Where Beauty Meet Comfort
          </h1>
          <p className="text-base md:text-xl max-w-1/2 font-extralight">
            Lorem ipsum dolor sit amet consectetur. Interdum quam sodales mollis
            aliquam.
          </p>
          <button className="mt-4 w-fit px-2 md:px-6 py-2 bg-[#800000] text-white text-base md:text-xl font-futura font-extralight">
            Start The Experience
          </button>
        </div>
      </section>

      {/* Explore section */}
      <section className="py-6 md:py-20 px-8 flex flex-col w-full h-full bg-white">
        <div className="max-w-7xl mx-auto text-center">
          {/* Heading and subtitle */}
          <h2 className="text-[24px] md:text-[46px] font-futura font-normal mb-4">
            Droppin Like It&apos;s Hot
          </h2>
          <p className="text-base md:text-lg mb-6 md:mb-10 max-w-3xl mx-auto font-extralight">
            Lorem ipsum dolor sit amet consectetur. Etiam molestie augue cras
            donec morbi ac. Gravida lectus dictum enim elit at dictum tempus
            feugiat.
          </p>

          {/* CTA Button */}
          <div className="mb-16">
            <Link
              href="/collections"
              className="inline-block px-2 md:px-6 py-2 bg-[#800000] text-white font-extralight hover:bg-[#600000] transition-colors"
            >
              Explore Your Signature Style
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
                <Link href={product.href}>
                  <div className="aspect-[3/4] mb-4 overflow-hidden relative">
                    <div className="relative w-full h-full object-center">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="text-lg font-extralight text-center">
                    {product.name}
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
          style={{ backgroundImage: "url('/Gift.png')" }}
        >
          <div className="flex flex-col items-start md:items-center">
            <h1 className="font-futura font-bold text-[24px] md:text-5xl">
              HOLIDAY SPECIAL
            </h1>
            <h2 className="font-futura font-normal text-base md:text-4xl">
              GET YOU 30% OFF SITEWIDE
            </h2>
          </div>
          <button className="mt-4 w-fit px-2 md:px-6 py-2 bg-[#800000] text-white text-base md:text-xl font-futura font-extralight">
            Get Voucher
          </button>
        </div>
      </section>

      {/* size reommendation section */}
      <section className="flex px-6 md:px-20 flex-row w-full bg-white relative gap-6 items-stretch">
        <div className="flex flex-1 flex-col gap-6 my-12 justify-center items-center md:items-start text-center md:text-left">
          <h1 className="font-futura font-normal text-[24px] md:text-[46px]">
            Muse Knows You Best
          </h1>
          <div className="-mt-8 flex md:hidden w-full h-[200px] relative">
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
            Every body tells a different story, and Muse is here to listen.Enter
            your height and weight, and we'll recommend the size that fits you
            best. Designed for comfort, crafted for confidence—so you can look
            and feel your best, effortlessly.
          </p>
          <p className="hidden md:flex font-futura font-bold text-[24px]">
            -We Recommend You Size
          </p>
          <button className="mt-4 w-fit px-2 md:px-6 py-2 bg-[#800000] text-white text-base md:text-xl font-futura font-extralight">
            Try Our Feature!
          </button>
        </div>
        <div className="hidden md:flex flex-1 h-auto relative">
          <div className="absolute inset-x-0 bottom-0 h-full">
            <Image
              src="/person1.png"
              alt="Size Recommendation"
              fill
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </section>

      {/* review section */}
      <section className="py-20 px-8 w-full flex flex-col bg-[#800000] text-white">
        <div className="flex w-full flex-col">
          <h2 className="text-[24px] md:text-[46px] font-futura mb-4 text-center">
            What Our Customers Say
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
              <div className="mt-12 block md:hidden">
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
                    <div className="bg-white text-black p-5 rounded-[20px] shadow-sm border border-gray-100 flex flex-col w-full max-w-xs">
                      <div className="mb-2">
                        <StarRating rating={visibleReviews[0]?.stars || 0} />
                      </div>
                      <h3 className="text-[24px] mb-2">
                        {visibleReviews[0]?.title}
                      </h3>
                      <p className="font-light mb-4 flex-grow">
                        {visibleReviews[0]?.review}
                      </p>
                      <p className="font-bold">- {visibleReviews[0]?.author}</p>
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
