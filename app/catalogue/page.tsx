"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiOutlineSearch } from "react-icons/ai";
import { MdOutlineStar } from "react-icons/md";
import { performRequest } from "@/lib/datocms";

interface Product {
  id: string;
  productName: string;
  price: number;
  size: string;
  rating: number;
  color: {
    colorName: string;
    color: {
      hex: string;
    };
  }[];
  slug: string;
  productImage: {
    image: {
      url: string;
    };
  }[];
  soldNumber: number;
  currentImageIndex?: number;
}

interface FilterState {
  priceSort: "low-to-high" | "high-to-low";
  popularitySort: "low-to-high" | "high-to-low";
  colors: string[];
  sizes: string[];
}

const formatPrice = (price: number) => {
  return `IDR ${price.toLocaleString("id-ID")}.00`;
};

const ColorDot = ({ color }: { color: string }) => {
  return (
    <div
      className="flex w-3 h-3 rounded-full"
      style={{
        backgroundColor: color,
      }}
    />
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  // Helper function to format size
  const formatSize = (size: string) => {
    return size === "all_size" ? "All Size" : size;
  };

  return (
    <Link href={`/catalogue/${product.slug}`}>
      <div className="group cursor-pointer font-futura">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[3/4] mb-4">
          <Image
            src={
              product.productImage[0]?.image?.url || "/placeholder-image.jpg"
            }
            alt={product.productName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white rounded-full pl-1 pr-2 border-1 border-[#F4F4F4] py-[1px] flex items-center gap-1 text-sm">
            <MdOutlineStar className="text-[12px] fill-yellow-400 text-yellow-400" />
            <span className="font-extralight text-[10px]">{product.rating}</span>
          </div>
        </div>

        <div className="text-black text-[16px]">
          <div className="flex gap-1 mb-1">
            {product.color.map((colorObj) => (
              <ColorDot key={colorObj.colorName} color={colorObj.color.hex} />
            ))}
          </div>

          <h3 className="font-base">{product.productName}</h3>
          <p className="font-semibold">{formatPrice(product.price)}</p>
          <p className="text-sm font-extralight">{formatSize(product.size)}</p>
          <p className="text-xs font-extralight">
            {product.soldNumber.toLocaleString("id-ID")} Terjual
          </p>
        </div>
      </div>
    </Link>
  );
};

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-6 shadow-sm p-4 rounded-xl">
    <h3 className="font-medium text-gray-900 mb-3">{title}</h3>
    {children}
  </div>
);

const RadioOption = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex items-center gap-2 mb-2 cursor-pointer">
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-black border-gray-300 focus:ring-black"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const CheckboxOption = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex items-center gap-2 mb-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

export default function CataloguePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    priceSort: "low-to-high",
    popularitySort: "low-to-high",
    colors: [],
    sizes: [],
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const PRODUCTS_QUERY = `
          query Products {
            allProducts {
              id
              productImage {
                image {
                  url
                }
              }
              productName
              rating
              size
              price
              color {
                colorName
                color {
                  hex
                }
              }
              slug
              soldNumber
            }
          }
        `;

        const data = await performRequest(PRODUCTS_QUERY);
        console.log("Fetched products:", data);
        if (data && typeof data === "object" && "allProducts" in data) {
          const fetchedProducts = data.allProducts as Product[];
          setProducts(fetchedProducts);

          // Extract all unique colors and sizes
          const colors = new Set<string>();
          const sizes = new Set<string>();

          fetchedProducts.forEach((product) => {
            product.color.forEach((c) => colors.add(c.colorName));
            sizes.add(product.size);
          });

          setAvailableColors(Array.from(colors));
          setAvailableSizes(Array.from(sizes));

          // Initialize filters with all available options
          setFilters((prev) => ({
            ...prev,
            colors: Array.from(colors),
            sizes: Array.from(sizes),
          }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    fetchProducts();
  }, []);

  const handleColorFilter = (color: string) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleSizeFilter = (size: string) => {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const filteredProducts = products
    .filter((product) => {
      if (
        searchQuery &&
        !product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.colors.length > 0 &&
        !product.color.some((c) => filters.colors.includes(c.colorName))
      ) {
        return false;
      }

      if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filters.priceSort === "low-to-high") {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });

  return (
    <div className="pt-20 min-h-screen flex justify-center bg-white font-futura">
      <div className="w-full flex px-20 flex-row gap-12">
        <div>
          <div className="w-64 flex-shrink-0">
            {/* by price */}
            <FilterSection title="Sort By Price">
              <RadioOption
                label="from low to high"
                checked={filters.priceSort === "low-to-high"}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, priceSort: "low-to-high" }))
                }
              />
              <RadioOption
                label="from high to low"
                checked={filters.priceSort === "high-to-low"}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, priceSort: "high-to-low" }))
                }
              />
            </FilterSection>
            {/* by popularity */}
            <FilterSection title="Sort By Popularity">
              <RadioOption
                label="from low to high"
                checked={filters.priceSort === "low-to-high"}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, priceSort: "low-to-high" }))
                }
              />
              <RadioOption
                label="from high to low"
                checked={filters.priceSort === "high-to-low"}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, priceSort: "high-to-low" }))
                }
              />
            </FilterSection>
            {/* by color */}
            <FilterSection title="Color">
              {availableColors.map((color) => (
                <CheckboxOption
                  key={color}
                  label={color}
                  checked={filters.colors.includes(color)}
                  onChange={() => handleColorFilter(color)}
                />
              ))}
            </FilterSection>

            {/* by size */}
            <FilterSection title="Size">
              {availableSizes.map((size) => (
                <CheckboxOption
                  key={size}
                  label={size === "all_size" ? "All Size" : size}
                  checked={filters.sizes.includes(size)}
                  onChange={() => handleSizeFilter(size)}
                />
              ))}
            </FilterSection>
          </div>
        </div>
        {/* Header */}
        <div className="flex w-full flex-col">
          <div className="flex w-full items-center justify-between mb-8">
            <h1 className="text-4xl font-futura font-[900] text-gray-900">
              Your Daily Muse
            </h1>

            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search Bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}

            {/* Product Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-lg">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-lg">
                    No products found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
