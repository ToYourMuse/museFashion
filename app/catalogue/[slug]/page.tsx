"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AiFillStar, AiOutlineArrowLeft } from "react-icons/ai";
import { BsGlobe, BsArrowRepeat, BsShield, BsLock } from "react-icons/bs";
import { StructuredText, renderNodeRule } from "react-datocms";
import {
  isHeading,
  isParagraph,
  isRoot,
  isList,
  isListItem,
  isBlockquote,
} from "datocms-structured-text-utils";
import { performRequest } from "@/lib/datocms";
import ReviewCard from "@/components/ReviewCard";

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

const customRules = [
  // Heading renderer
  renderNodeRule(isHeading, ({ node, children, key }) => {
    const headingClasses = {
      1: "text-[20px] font-[500] mb-1 text-gray-900",
      2: "text-xl font-semibold text-gray-800",
      3: "text-lg font-medium text-gray-700",
      4: "text-md font-medium text-gray-700",
      6: "text-base font-medium text-gray-600",
    };

    const className = headingClasses[node.level as keyof typeof headingClasses];

    switch (node.level) {
      case 1:
        return (
          <h1 key={key} className={className}>
            {children}
          </h1>
        );
      case 2:
        return (
          <h2 key={key} className={className}>
            {children}
          </h2>
        );
      case 3:
        return (
          <h3 key={key} className={className}>
            {children}
          </h3>
        );
      case 4:
        return (
          <h4 key={key} className={className}>
            {children}
          </h4>
        );
      case 5:
        return (
          <h5 key={key} className={className}>
            {children}
          </h5>
        );
      case 6:
        return (
          <h6 key={key} className={className}>
            {children}
          </h6>
        );
      default:
        return (
          <h1 key={key} className={className}>
            {children}
          </h1>
        );
    }
  }),

  // Paragraph renderer
  renderNodeRule(isParagraph, ({ children, key }) => (
    <p key={key} className="text-[#1e1e1e] font-extralight leading-relaxed">
      {children}
    </p>
  )),

  // List renderer
  renderNodeRule(isList, ({ node, children, key }) => {
    if (node.style === "bulleted") {
      return (
        <ul key={key} className="mb-4 ml-6 list-disc space-y-2">
          {children}
        </ul>
      );
    }
    return (
      <ol key={key} className="mb-4 ml-6 list-decimal space-y-2">
        {children}
      </ol>
    );
  }),

  // List item renderer
  renderNodeRule(isListItem, ({ children, key }) => (
    <li key={key} className="text-gray-600">
      {children}
    </li>
  )),

  // Blockquote renderer
  renderNodeRule(isBlockquote, ({ children, key }) => (
    <blockquote
      key={key}
      className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4"
    >
      {children}
    </blockquote>
  )),
];

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
    className={`w-8 h-8 rounded-full border-2 p-[2px] ${
      isSelected ? "border-gray-800 border-2" : "border-gray-300"
    } hover:border-gray-500 transition-colors flex items-center justify-center`}
    title={color.colorName}
  >
    <div
      className="flex w-full h-full rounded-full"
      style={{ backgroundColor: color.color.hex }}
    ></div>
  </button>
);

const mockFeatures = [
  {
    icon: <Image src="/assets/check.svg" alt="Check" width={20} height={20} />,
    text: "Fast worldwide shipping",
  },
  {
    icon: <Image src="/assets/car.svg" alt="Check" width={20} height={20} />,
    text: "Free returns",
  },
  {
    icon: <Image src="/assets/leaf.svg" alt="Check" width={20} height={20} />,
    text: "Sustainably made",
  },
  {
    icon: <Image src="/assets/lock.svg" alt="Check" width={15} height={15} />,
    text: "Secure Payments",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [showDescription, setShowDescription] = useState(true);

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

        // Use your existing performRequest function with variables in options
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
    <div className="pt-28 min-h-screen bg-white font-futura">
      <div className="flex w-full px-20">
        {/* Back Button */}
        {/* <Link 
          href="/catalogue"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8"
        >
          <AiOutlineArrowLeft className="w-5 h-5" />
          Back to Catalogue
        </Link> */}

        <div className="flex flex-col gap-12">
          <section className="flex w-full flex-row gap-16">
            {/* Image Gallery */}
            <div className="flex w-full flex-col gap-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
                          alt="Previous"
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
            <div className="flex flex-col w-full">
              {/* Product Name and Price */}
              <div>
                <h1 className="text-[36px] font-normal text-black mb-2">
                  {product.productName}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-futura font-extrabold">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center border-1 pl-1 pr-2 rounded-full border-gray-200 gap-1">
                    <AiFillStar className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg">{product.rating}</span>
                  </div>
                </div>
              </div>

              {/* Size and Fit Checker */}
              <div className="flex items-center gap-4 font-light">
                <span className="">Cek Ukuranmu:</span>
                <button className="bg-[#800000] text-white px-4 py-1 text-sm  transition-colors">
                  Check Your Fit
                </button>
              </div>

              {/* Color Selection */}
              {product.color.length > 0 && (
                <div className="mb-4 font-light">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="">Warna:</span>
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

              <span className="font-extralight">
                Size: {product.size === "all_size" ? "All Size" : product.size}
              </span>

              {/* Buy Button */}
              <button className="mt-4 w-full px-6 py-2 bg-[#800000] text-white text-xl font-futura font-extralight">
                Buy It Now
              </button>

              {/* Description Section */}
              <div className="pt-6">
                {showDescription && (
                  <div className="py-4 border-1 px-4 border-[#d9d9d9] rounded-[8px] leading-relaxed prose prose-gray max-w-none">
                    <StructuredText
                      data={product.description.value}
                      customNodeRules={customRules}
                    />
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6">
                {mockFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-[#757575]"
                  >
                    {feature.icon}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* reviews */}
          <section className="flex flex-col w-full">
            <h1 className="text-[30px] font-bold mb-6">Latest Review</h1>
            <div className="flex w-full flex-row justify-between gap-16">
              {reviewsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-gray-500">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <p className="text-gray-500">No reviews yet.</p>
                </div>
              ) : (
                reviews
                  .slice(0, 3)
                  .map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
              )}

              {reviews.length > 3 && (
                <button className="w-full py-3 text-center text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  View All Reviews ({reviews.length})
                </button>
              )}
            </div>
          </section>
          {/* email */}
          <section className="flex w-full flex-col items-center mb-12">
            <h1 className="text-[30px] font-bold">Follow the latest trends</h1>
            <p className="text-[20px] font-light">with our daily newsletter</p>
            <form className="flex flex-row gap-4 mt-4">
              <input
                type="email"
                placeholder="your@example.com"
                className="px-4 py-2 border border-[#999999] focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent placeholder:text-center"
              />
              <button className="px-6 py-2 bg-[#800000] text-white">
                Submit
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
