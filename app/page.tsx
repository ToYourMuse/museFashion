"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaStar, FaRegStar } from "react-icons/fa";
import { performRequest } from "@/lib/datocms";

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
        <span key={i}>
          {i < rating ? (
            <FaStar className="text-yellow-500" />
          ) : (
            <FaRegStar className="text-yellow-500" />
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
  const productsPerPage = 3;

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

  return (
    <main className="items-center justify-items-center min-h-screen font-futura">
      {/* Hero Section */}
      <section
        className="relative flex w-full h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero.png')" }}
      >
        <div className="absolute bottom-20 left-20 flex flex-col text-white">
          <h1 className="text-4xl -ml-10 font-meie-script md:text-6xl mb-4">
            Where Beauty Meet Comfort
          </h1>
          <p className="text-xl max-w-1/2 font-extralight">
            Lorem ipsum dolor sit amet consectetur. Interdum quam sodales mollis
            aliquam. Nullam volutpat eu tempor interdum quis suspendisse semper
            libero mattis. Risus orci amet commodo mi amet eu. Leo viverra
            vulputate diam tincidunt gravida in vulputate eros.
          </p>
          <button className="mt-4 w-fit px-6 py-2 bg-[#800000] text-white text-xl font-futura font-extralight">
            Start The Experience
          </button>
        </div>
      </section>

      {/* Explore section */}
      <section className="py-20 px-8 flex flex-col w-full bg-white">
        <div className="max-w-7xl mx-auto text-center">
          {/* Heading and subtitle */}
          <h2 className="text-[46px] font-futura font-normal mb-4">
            Droppin Like It&apos;s Hot
          </h2>
          <p className="text-lg mb-10 max-w-3xl mx-auto font-extralight">
            Lorem ipsum dolor sit amet consectetur. Etiam molestie augue cras
            donec morbi ac. Gravida lectus dictum enim elit at dictum tempus
            feugiat.
          </p>

          {/* CTA Button */}
          <div className="mb-16">
            <Link
              href="/collections"
              className="inline-block px-8 py-3 bg-[#800000] text-white font-extralight hover:bg-[#600000] transition-colors"
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 text-[#800000] hover:text-[#600000] transition-colors"
            aria-label="Previous products"
          >
            <IoIosArrowBack className="text-6xl" />
          </button>

          {/* Products Container */}
          <div className="flex justify-center gap-8">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="w-full max-w-xs transition-all duration-300"
              >
                <Link href={product.href}>
                  <div className="spect-[3/4] mb-4 overflow-hidden">
                    <div className="relative w-full h-[400px]">
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 text-[#800000] hover:text-[#600000] transition-colors"
            aria-label="Next products"
          >
            <IoIosArrowForward className="text-6xl" />
          </button>
        </div>
      </section>

      {/* discout section */}
      <section className="h-fit pt-10 w-full bg-[#800000] text-white flex items-center justify-center">
        <div
          className="py-12 flex flex-col w-full items-center justify-center h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/Gift.png')" }}
        >
          <h1 className="font-futura font-bold text-5xl">HOLIDAY SPECIAL</h1>
          <h2 className="font-futura font-normal text-4xl">
            GET YOU 30% OFF SITEWIDE
          </h2>
          <button className="mt-4 w-fit px-6 py-2 bg-[#800000] text-white text-xl font-futura font-extralight">
            Get Voucher
          </button>
        </div>
      </section>

      {/* size reommendation section */}
      <section className="flex px-20 flex-row w-full bg-white relative gap-6">
        <div className="flex flex-col gap-6 my-12 justify-center">
          <h1 className="font-futura font-normal text-[46px]">
            Muse Knows You Best
          </h1>
          <p className="font-futura font-extralight text-xl">
            Every body tells a different story, and Muse is here to listen.Enter
            your height and weight, and we'll recommend the size that fits you
            best. Designed for comfort, crafted for confidence—so you can look
            and feel your best, effortlessly.
          </p>
          <p className="font-futura font-bold text-[24px]">
            -We Recommend You Size
          </p>
          <button className="mt-4 w-fit px-6 py-2 bg-[#800000] text-white text-xl font-futura font-extralight">
            Try Our Feature!
          </button>
        </div>
        <div className="flex w-[100%] h-[500px] relative">
          <div className="absolute inset-x-0 bottom-0 h-[500px]">
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
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[46px] font-futura font-normal mb-4 text-center">
            Customer Reviews
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white text-black p-6 rounded-md shadow-sm border border-gray-100 flex flex-col"
                >
                  <div className="mb-2">
                    <StarRating rating={review.stars} />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{review.title}</h3>
                  <p className="text-gray-600 font-light mb-4 flex-grow">
                    {review.review}
                  </p>
                  <p className="text-sm font-medium text-[#800000]">
                    - {review.author}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
