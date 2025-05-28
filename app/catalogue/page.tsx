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
  priceSort: "low-to-high" | "high-to-low" | "";
  popularitySort: "low-to-high" | "high-to-low" | "";
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
}

interface CataloguePageData {
  cataloguePage: {
    title: string;
  };
}

const formatPrice = (price: number) => {
  return `IDR ${price.toLocaleString("id-ID")}.00`;
};

const ColorDot = ({ color }: { color: string }) => {
  return (
    <div
      className="flex w-3 h-3 rounded-full border border-gray-200"
      style={{
        backgroundColor: color,
      }}
    />
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const formatSize = (size: string) => {
    return size === "all_size" ? "All Size" : size;
  };

  return (
    <Link href={`/catalogue/${product.slug}`}>
      <div className="group cursor-pointer font-futura">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[3/4] mb-2 md:mb-4">
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
            <span className="font-extralight text-[10px]">
              {product.rating}
            </span>
          </div>
        </div>

        <div className="text-black text-base">
          <div className="flex gap-1 mb-1">
            {product.color.map((colorObj) => (
              <ColorDot key={colorObj.colorName} color={colorObj.color.hex} />
            ))}
          </div>

          <h3 className="text-[12px] md:text-base">{product.productName}</h3>
          <p className="text-[14px] md:text-base font-semibold">{formatPrice(product.price)}</p>
          <p className="text-[12px] md:text-base font-extralight">{formatSize(product.size)}</p>
          <p className="text-[12px] md:text-base font-extralight">
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
  <div className="mb-6 shadow-[0px_0px_2px_0px_rgba(0,0,0,0.25)] p-4 px-6 rounded-xl bg-white">
    <h3 className="text-[14px] font-medium text-black mb-3">{title}</h3>
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
      className="flex-shrink-0"
    />
    <span className="text-[12px] text-black">{label}</span>
  </label>
);

const CheckboxOption = ({
  label,
  checked,
  onChange,
  colorHex,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  colorHex?: string;
}) => (
  <label className="flex items-center gap-2 mb-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="flex-shrink-0 accent-black"
    />
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-black">{label}</span>
    </div>
  </label>
);

export default function CataloguePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cataloguePageData, setCataloguePageData] = useState<CataloguePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageDataLoading, setPageDataLoading] = useState(true);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [availableColors, setAvailableColors] = useState<
    { name: string; hex: string }[]
  >([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 0,
  });
  const [filters, setFilters] = useState<FilterState>({
    priceSort: "",
    popularitySort: "",
    colors: [],
    sizes: [],
    minPrice: 0,
    maxPrice: 0,
  });

  const toggleFilterSidebar = () => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen);
  };

  const closeFilterSidebar = () => {
    setIsFilterSidebarOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch catalogue page data
        const CATALOGUE_PAGE_QUERY = `
          query CataloguePage {
            cataloguePage {
              title
            }
          }
        `;

        const cataloguePageResponse = await performRequest(CATALOGUE_PAGE_QUERY);
        console.log("Fetched catalogue page data:", cataloguePageResponse);
        
        if (cataloguePageResponse && typeof cataloguePageResponse === "object" && "cataloguePage" in cataloguePageResponse) {
          setCataloguePageData(cataloguePageResponse as CataloguePageData);
        }
      } catch (error) {
        console.error("Error fetching catalogue page data:", error);
      } finally {
        setPageDataLoading(false);
      }
    };

    fetchData();
  }, []);

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
          const colorsMap = new Map<string, string>();
          const sizes = new Set<string>();
          let minPrice = Infinity;
          let maxPrice = 0;

          fetchedProducts.forEach((product) => {
            product.color.forEach((c) =>
              colorsMap.set(c.colorName, c.color.hex)
            );
            sizes.add(product.size);
            minPrice = Math.min(minPrice, product.price);
            maxPrice = Math.max(maxPrice, product.price);
          });

          const colors = Array.from(colorsMap.entries()).map(([name, hex]) => ({
            name,
            hex,
          }));

          setAvailableColors(colors);
          setAvailableSizes(Array.from(sizes));
          setPriceRange({ min: minPrice, max: maxPrice });

          // Initialize filters with empty arrays (unchecked by default)
          setFilters((prev) => ({
            ...prev,
            colors: [], // Start with no colors selected
            sizes: [], // Start with no sizes selected
            minPrice: 0, // Allow user to set any minimum
            maxPrice: 999999999, // Allow user to set any maximum
          }));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handlePriceSort = (sortType: "low-to-high" | "high-to-low") => {
    setFilters((prev) => ({
      ...prev,
      priceSort: prev.priceSort === sortType ? "" : sortType,
      popularitySort: "", // Clear popularity sort when price sort is selected
    }));
  };

  const handlePopularitySort = (sortType: "low-to-high" | "high-to-low") => {
    setFilters((prev) => ({
      ...prev,
      popularitySort: prev.popularitySort === sortType ? "" : sortType,
      priceSort: "", // Clear price sort when popularity sort is selected
    }));
  };

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

  const handleMinPriceChange = (value: number) => {
    // Allow any positive number, don't clamp to existing product range
    const validValue = Math.max(0, value || 0);
    setFilters((prev) => ({
      ...prev,
      minPrice: validValue,
    }));
  };

  const handleMaxPriceChange = (value: number) => {
    // Allow any positive number, don't clamp to existing product range
    const validValue = Math.max(0, value || 999999999);
    setFilters((prev) => ({
      ...prev,
      maxPrice: validValue,
    }));
  };

  const filteredProducts = products
    .filter((product) => {
      // Search filter
      if (
        searchQuery &&
        !product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Color filter - only apply if colors are selected
      if (
        filters.colors.length > 0 &&
        !product.color.some((c) => filters.colors.includes(c.colorName))
      ) {
        return false;
      }

      // Size filter - only apply if sizes are selected
      if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
        return false;
      }

      // Price range filter
      if (
        product.price < filters.minPrice ||
        product.price > filters.maxPrice
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Price sorting
      if (filters.priceSort === "low-to-high") {
        return a.price - b.price;
      } else if (filters.priceSort === "high-to-low") {
        return b.price - a.price;
      }

      // Popularity sorting (based on soldNumber)
      if (filters.popularitySort === "low-to-high") {
        return a.soldNumber - b.soldNumber;
      } else if (filters.popularitySort === "high-to-low") {
        return b.soldNumber - a.soldNumber;
      }

      return 0; // No sorting if neither is selected
    });

  const FilterContent = () => (
    <>
      {/* Sort by Price */}
      <FilterSection title="Sort By Price">
        <div className="flex my-2 gap-2 items-center justify-center">
          <div>
            <input
              type="number"
              value={filters.minPrice || ""}
              onChange={(e) =>
                handleMinPriceChange(Number(e.target.value))
              }
              placeholder="Harga"
              min="0"
              className="w-full px-2 py-[6px] border placeholder:text-center border-[#D7D7D7] rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>
          <div className="text-center text-gray-400 text-xs w-[11px] border border-[#999999]"></div>
          <div>
            <input
              type="number"
              value={
                filters.maxPrice === 999999999 ? "" : filters.maxPrice
              }
              onChange={(e) =>
                handleMaxPriceChange(Number(e.target.value))
              }
              placeholder="Harga"
              min="0"
              className="w-full px-2 py-[6px] border placeholder:text-center border-[#D7D7D7] rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />
          </div>
        </div>
        <RadioOption
          label="from low to high"
          checked={filters.priceSort === "low-to-high"}
          onChange={() => handlePriceSort("low-to-high")}
        />
        <RadioOption
          label="from high to low"
          checked={filters.priceSort === "high-to-low"}
          onChange={() => handlePriceSort("high-to-low")}
        />
      </FilterSection>

      {/* Sort by Popularity */}
      <FilterSection title="Sort By Popularity">
        <RadioOption
          label="from low to high"
          checked={filters.popularitySort === "low-to-high"}
          onChange={() => handlePopularitySort("low-to-high")}
        />
        <RadioOption
          label="from high to low"
          checked={filters.popularitySort === "high-to-low"}
          onChange={() => handlePopularitySort("high-to-low")}
        />
      </FilterSection>

      {/* Color Filter */}
      <FilterSection title="Color">
        {availableColors.map((color) => (
          <CheckboxOption
            key={color.name}
            label={color.name}
            checked={filters.colors.includes(color.name)}
            onChange={() => handleColorFilter(color.name)}
            colorHex={color.hex}
          />
        ))}
      </FilterSection>

      {/* Size Filter */}
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
    </>
  );

  return (
    <div className="pt-24 min-h-screen flex justify-center bg-gray-50 font-futura">
      <div className="w-full flex px-6 md:px-20 flex-row gap-12">
        {/* Desktop Filter Sidebar */}
        <div className="md:block hidden">
          <div className="w-64 flex-shrink-0">
            <FilterContent />
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {isFilterSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 bg-opacity-50 z-30 md:hidden"
            onClick={closeFilterSidebar}
          ></div>
        )}

        {/* Mobile Filter Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-80 bg-white transform ${isFilterSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-40 md:hidden overflow-y-auto`}>
          <div className="p-6">
            {/* Header with close button */}
            <div className="flex items-center mb-6">
              <button
                onClick={closeFilterSidebar}
                className="p-2 focus:outline-none"
                aria-label="Close filter"
              >
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="font-futura font-bold text-lg text-black">
                All Filters
              </h2>
            </div>

            {/* Filter Content */}
            <div className="space-y-4">
              <FilterContent />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex w-full flex-col">
          <div className="flex flex-col md:flex-row w-full items-center justify-between mb-4 md:mb-8">
            <div className="flex flex-row w-full justify-between items-center">
              <h1 className="text-[24px] md:text-4xl font-futura font-bold text-black">
                {pageDataLoading 
                  ? "Loading..." 
                  : cataloguePageData?.cataloguePage?.title || "Your Daily Muse"
                }
              </h1>
              <button 
                onClick={toggleFilterSidebar}
                className="md:hidden bg-[#800000] px-2 py-1 text-white rounded-[8px] text-[12px] font-light"
              >
                Semua Filter <Image src="/assets/filter.svg" alt="Filter Icon" width={16} height={16} className="inline-block ml-1" />
              </button>
            </div>

            <div className="relative w-full mt-3 md:mt-0">
              <input
                type="text"
                placeholder="Search Bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-1 md:py-2 pr-10 border border-[#757575] rounded-lg md:rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#757575]" />
            </div>
          </div>

          <div className="flex gap-8">
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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