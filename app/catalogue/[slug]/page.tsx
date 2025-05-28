"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiFillStar, AiOutlineArrowLeft } from "react-icons/ai";
import { StructuredText, renderNodeRule } from "react-datocms";
import { customRules } from "@/lib/structured-text-rules";
import { performRequest } from "@/lib/datocms";
import NewsletterForm from "@/components/NewsletterForm";
import ReviewCard from "@/components/ReviewCard";
import { toast } from "react-toastify";

interface Product {
  id: string;
  productName: string;
  price: number;
  rating: number;
  description: {
    value: any;
  };
  color: {
    colorName: string;
    color: {
      hex: string;
    };
  }[];
  size: string;
  slug: string;
  productImage: {
    image: {
      url: string;
    };
  }[];
}

interface Review {
  id: string;
  title: string;
  stars: number;
  review: string;
  author: string;
}

interface Feature {
  id: string;
  image: {
    url: string;
  };
  text: string;
}

interface ProductPageData {
  productPage: {
    feature: Feature[];
    emailTitle: string;
    emailSubtitle: string;
    emailButton: string;
  };
}

const formatPrice = (price: number) => {
  return `IDR ${price.toLocaleString("id-ID")}.00`;
};

const ColorOption = ({
  color,
  isSelected,
  onClick,
}: {
  color: { colorName: string; color: { hex: string } };
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-8 h-8 rounded-full p-[2px] ${
      isSelected ? "border-gray-800 border-1" : "border-0"
    } hover:border-gray-500 transition-colors flex items-center justify-center`}
    title={color.colorName}
  >
    <div
      className="flex w-full h-full rounded-full"
      style={{ backgroundColor: color.color.hex }}
    ></div>
  </button>
);

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productPageData, setProductPageData] =
    useState<ProductPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [pageDataLoading, setPageDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [showDescription, setShowDescription] = useState(true);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // const handleBuyProduct = () => {
  //   toast.success("Thank you for purchasing this product!", {
  //     position: "top-center",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //   });
  // };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const PRODUCT_QUERY = `
          query Product($slug: String!) {
            product(filter: { slug: { eq: $slug } }) {
              id
              productName
              price
              rating
              description {
                value
              }
              color {
                colorName
                color {
                  hex
                }
              }
              size
              slug
              productImage {
                image {
                  url
                }
              }
            }
          }
        `;

        const data = (await performRequest(PRODUCT_QUERY, {
          variables: { slug },
        })) as { product: Product };

        console.log("Fetched product:", data);
        if (data && data.product) {
          setProduct(data.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const REVIEWS_QUERY = `
          query Reviews {
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
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    const fetchProductPageData = async () => {
      try {
        const PRODUCT_PAGE_QUERY = `
          query ProductPage {
            productPage {
              feature {
                id
                image {
                  url
                }
                text
              }
              emailTitle
              emailSubtitle
              emailButton
            }
          }
        `;

        const data = await performRequest(PRODUCT_PAGE_QUERY);
        console.log("Fetched product page data:", data);
        if (data && typeof data === "object" && "productPage" in data) {
          setProductPageData(data as ProductPageData);
        } else {
          console.error("Unexpected product page data structure:", data);
        }
      } catch (error) {
        console.error("Error fetching product page data:", error);
      } finally {
        setPageDataLoading(false);
      }
    };

    fetchProductPageData();
  }, []);

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) =>
        prev === product.productImage.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.productImage.length - 1 : prev - 1
      );
    }
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-xl text-red-600">{error || "Product not found"}</p>
        <Link
          href="/catalogue"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <AiOutlineArrowLeft /> Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 flex w-[100vw] min-h-screen bg-white font-futura">
      <div className="flex w-full md:px-20">
        <div className="flex w-full flex-col gap-12">
          <section className="flex w-full flex-col md:flex-row gap-8 md:gap-16">
            {/* Image Gallery */}
            <div className="px-12 md:px-0 flex w-full flex-col gap-4 border-b border-[#D9D9D9] md:border-0 pb-6 md:pb-0">
              {/* Main Image */}
              <div className="relative aspect-square flex w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={
                    product.productImage[currentImageIndex]?.image?.url ||
                    "/placeholder-image.jpg"
                  }
                  alt={product.productName}
                  fill
                  className="object-cover"
                />

                {/* Navigation Arrows */}
                {product.productImage.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 transition-all"
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        <Image
                          src="/assets/previousArrow.svg"
                          alt="Previous"
                          width={24}
                          height={24}
                        />
                      </div>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 transition-all"
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        <Image
                          src="/assets/nextArrow.svg"
                          alt="Next"
                          width={24}
                          height={24}
                        />
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.productImage.length > 1 && (
                <div className="flex gap-6 w-full justify-center">
                  {product.productImage.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-square w-20 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? "border-gray-800"
                          : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={image.image.url}
                        alt={`${product.productName} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col w-full px-6 md:px-0">
              {/* Product Name and Price */}
              <div>
                <h1 className="text-16px md:text-[36px] font-normal text-black mb-2">
                  {product.productName}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[18px] md:text-3xl font-futura font-extrabold">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center border-1 pl-1 pr-2 rounded-full border-gray-200 gap-1">
                    <AiFillStar className="w-3 h-3 md:w-5 md:h-5 text-yellow-400" />
                    <span className="text-[12px] md:text-lg">
                      {product.rating}
                    </span>
                  </div>
                </div>
              </div>

              {/* Size and Fit Checker */}
              <div className="flex items-center text-[14px] md:text-base gap-4 font-light">
                <span className="">Cek Ukuranmu:</span>
                <Link href={`/checkyourfit?product=${product.slug}`}>
                  <button className="bg-[#800000] hover:cursor-pointer text-white px-4 py-2 text-sm  transition-colors">
                    Check Your Fit
                  </button>
                </Link>
              </div>

              {/* Color Selection */}
              {product.color.length > 0 && (
                <div className="my-4 font-light">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[14px] md:text-base">Warna:</span>
                    <span className="">
                      {product.color[selectedColor]?.colorName}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {product.color.map((color, index) => (
                      <ColorOption
                        key={color.colorName}
                        color={color}
                        isSelected={index === selectedColor}
                        onClick={() => setSelectedColor(index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <span className="font-extralight text-[14px] md:text-base">
                Size: {product.size === "all_size" ? "All Size" : product.size}
              </span>

              {/* Buy Button */}
              <button
                className="mt-4 w-full px-6 py-2 hover:cursor-pointer bg-[#800000] text-white text-[14px] md:text-xl font-futura font-extralight hover:bg-red-900 transition-colors"
              >
                Buy It Now
              </button>

              {/* Description Section */}
              <div className="pt-6">
                {showDescription && (
                  <div className="py-4 border-1 px-4 border-[#d9d9d9] rounded-[8px] leading-relaxed prose prose-gray">
                    <StructuredText
                      data={product.description.value}
                      customNodeRules={customRules}
                    />
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6">
                {pageDataLoading ? (
                  <p className="text-gray-500 text-sm">Loading features...</p>
                ) : productPageData?.productPage?.feature ? (
                  productPageData.productPage.feature.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center text-[14px] md:text-base gap-3 text-[#757575]"
                    >
                      <Image
                        src={feature.image.url}
                        alt={feature.text}
                        width={20}
                        height={20}
                      />
                      <span>{feature.text}</span>
                    </div>
                  ))
                ) : (
                  // Fallback to default features if no data from CMS
                  <>
                    <div className="flex items-center text-[14px] md:text-base gap-3 text-[#757575]">
                      <Image
                        src="/assets/check.svg"
                        alt="Check"
                        width={20}
                        height={20}
                      />
                      <span>Fast worldwide shipping</span>
                    </div>
                    <div className="flex items-center text-[14px] md:text-base gap-3 text-[#757575]">
                      <Image
                        src="/assets/car.svg"
                        alt="Check"
                        width={20}
                        height={20}
                      />
                      <span>Free returns</span>
                    </div>
                    <div className="flex items-center text-[14px] md:text-base gap-3 text-[#757575]">
                      <Image
                        src="/assets/leaf.svg"
                        alt="Check"
                        width={20}
                        height={20}
                      />
                      <span>Sustainably made</span>
                    </div>
                    <div className="flex items-center text-[14px] md:text-base gap-3 text-[#757575]">
                      <Image
                        src="/assets/lock.svg"
                        alt="Check"
                        width={15}
                        height={15}
                      />
                      <span>Secure Payments</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* reviews */}
          <section className="flex flex-col w-full px-6 md:px-0">
            <h1 className="text-[20px] md:text-[30px] font-bold mb-6">
              Latest Review
            </h1>

            {reviewsLoading ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">No reviews yet.</p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:flex w-full flex-row justify-between gap-16">
                  {reviews.slice(0, 3).map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>

                {/* Mobile View - Carousel */}
                <div className="block md:hidden">
                  <div className="relative flex flex-row gap-2 items-center">
                    {/* Left Arrow */}
                    <button
                      onClick={handleReviewPrev}
                      className="z-10 p-2 hover:cursor-pointer text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
                      aria-label="Previous reviews"
                    >
                      <Image
                        src="/assets/previousArrow1.svg"
                        alt="previous"
                        width={20}
                        height={20}
                        className="object-cover object-bottom"
                      />
                    </button>

                    {/* Review Container */}
                    <div className="flex justify-center flex-1">
                      <div className="w-full max-w-sm">
                        <ReviewCard review={reviews[currentReviewIndex]} />
                      </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                      onClick={handleReviewNext}
                      className="z-10 p-2 hover:cursor-pointer text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
                      aria-label="Next reviews"
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

                  {/* Review indicators for mobile */}
                  <div className="flex justify-center mt-4 gap-2">
                    {reviews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentReviewIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentReviewIndex
                            ? "bg-gray-800"
                            : "bg-gray-300"
                        }`}
                        aria-label={`Go to review ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* View All Reviews Button */}
                {reviews.length > 3 && (
                  <button className="w-full py-3 mt-6 text-center text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    View All Reviews ({reviews.length})
                  </button>
                )}
              </>
            )}
          </section>

          {/* Email/Newsletter Section */}
          <section className="flex w-full flex-col items-center mb-12">
            {pageDataLoading ? (
              <p className="text-gray-500">Loading newsletter section...</p>
            ) : productPageData?.productPage ? (
              <NewsletterForm
                title={productPageData.productPage.emailTitle}
                subtitle={productPageData.productPage.emailSubtitle}
                buttonText={productPageData.productPage.emailButton}
              />
            ) : (
              <NewsletterForm />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
