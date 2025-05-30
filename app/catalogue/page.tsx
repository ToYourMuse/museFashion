"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
          <p className="text-[14px] md:text-base font-semibold">
            {formatPrice(product.price)}
          </p>
          <p className="text-[12px] md:text-base font-extralight">
            {formatSize(product.size)}
          </p>
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
  const [cataloguePageData, setCataloguePageData] =
    useState<CataloguePageData | null>(null);
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

  // Add this new state for the slider
  const [sliderValues, setSliderValues] = useState<[number, number]>([
    0, 0,
  ]);

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

        const cataloguePageResponse = await performRequest(
          CATALOGUE_PAGE_QUERY
        );
        console.log("Fetched catalogue page data:", cataloguePageResponse);

        if (
          cataloguePageResponse &&
          typeof cataloguePageResponse === "object" &&
          "cataloguePage" in cataloguePageResponse
        ) {
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

          // Initialize filters and slider with actual price range
          const initialMin = Math.floor(minPrice);
          const initialMax = Math.ceil(maxPrice);

          setFilters((prev) => ({
            ...prev,
            colors: [],
            sizes: [],
            minPrice: initialMin,
            maxPrice: initialMax,
          }));

          setSliderValues([initialMin, initialMax]);
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

  // Update these functions to work with the slider
  const handleMinPriceChange = useCallback((value: number) => {
    const validValue = Math.max(0, value || 0);
    setFilters((prev) => ({
      ...prev,
      minPrice: validValue,
    }));
    setSliderValues((prev) => [validValue, prev[1]]);
  }, []);

  const handleMaxPriceChange = useCallback((value: number) => {
    const validValue = Math.max(0, value || 999999999);
    setFilters((prev) => ({
      ...prev,
      maxPrice: validValue,
    }));
    setSliderValues((prev) => [prev[0], validValue]);
  }, []);

  // Add this new function to handle slider changes
  const handleSliderChange = useCallback((values: [number, number]) => {
    setSliderValues(values);
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  }, []);

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

  // Replace the DualRangeSlider component with this improved version
  const DualRangeSlider = ({
    min,
    max,
    values,
    onChange,
  }: {
    min: number;
    max: number;
    values: [number, number];
    onChange: (values: [number, number]) => void;
  }) => {
    const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const calculateValueFromPosition = useCallback((clientX: number) => {
      if (!sliderRef.current) return 0;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      return Math.round(min + percentage * (max - min));
    }, [min, max]);

    const handleMouseDown = (type: "min" | "max") => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(type);
    };

    const handleTouchStart = (type: "min" | "max") => (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(type);
    };

    const updateValue = useCallback(
      (clientX: number) => {
        if (!isDragging) return;

        const newValue = calculateValueFromPosition(clientX);

        if (isDragging === "min") {
          const newMin = Math.min(newValue, values[1] - 1000);
          const clampedMin = Math.max(min, newMin);
          if (clampedMin !== values[0]) {
            onChange([clampedMin, values[1]]);
          }
        } else {
          const newMax = Math.max(newValue, values[0] + 1000);
          const clampedMax = Math.min(max, newMax);
          if (clampedMax !== values[1]) {
            onChange([values[0], clampedMax]);
          }
        }
      },
      [isDragging, calculateValueFromPosition, values, onChange, min, max]
    );

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (isDragging) {
          updateValue(e.clientX);
        }
      },
      [isDragging, updateValue]
    );

    const handleTouchMove = useCallback(
      (e: TouchEvent) => {
        if (isDragging && e.touches[0]) {
          e.preventDefault();
          updateValue(e.touches[0].clientX);
        }
      },
      [isDragging, updateValue]
    );

    const handleEnd = useCallback(() => {
      setIsDragging(null);
    }, []);

    const handleSliderClick = useCallback(
      (e: React.MouseEvent) => {
        if (isDragging) return;

        const newValue = calculateValueFromPosition(e.clientX);
        const distanceToMin = Math.abs(newValue - values[0]);
        const distanceToMax = Math.abs(newValue - values[1]);

        if (distanceToMin < distanceToMax) {
          const newMin = Math.min(newValue, values[1] - 1000);
          onChange([Math.max(min, newMin), values[1]]);
        } else {
          const newMax = Math.max(newValue, values[0] + 1000);
          onChange([values[0], Math.min(max, newMax)]);
        }
      },
      [calculateValueFromPosition, values, onChange, min, max, isDragging]
    );

    useEffect(() => {
      if (isDragging) {
        const handleMouseMoveGlobal = (e: MouseEvent) => handleMouseMove(e);
        const handleMouseUpGlobal = () => handleEnd();
        const handleTouchMoveGlobal = (e: TouchEvent) => handleTouchMove(e);
        const handleTouchEndGlobal = () => handleEnd();

        document.addEventListener("mousemove", handleMouseMoveGlobal, {
          passive: false,
        });
        document.addEventListener("mouseup", handleMouseUpGlobal);
        document.addEventListener("touchmove", handleTouchMoveGlobal, {
          passive: false,
        });
        document.addEventListener("touchend", handleTouchEndGlobal);

        return () => {
          document.removeEventListener("mousemove", handleMouseMoveGlobal);
          document.removeEventListener("mouseup", handleMouseUpGlobal);
          document.removeEventListener("touchmove", handleTouchMoveGlobal);
          document.removeEventListener("touchend", handleTouchEndGlobal);
        };
      }
    }, [isDragging, handleMouseMove, handleTouchMove, handleEnd]);

    const getPercentage = (value: number) => {
      if (max === min) return 0;
      return ((value - min) / (max - min)) * 100;
    };

    return (
      <div className="px-2 py-4">
        <div
          ref={sliderRef}
          className="relative h-2 bg-gray-200 rounded-full cursor-pointer select-none"
          onClick={handleSliderClick}
        >
          {/* Track between handles */}
          <div
            className="absolute h-2 bg-black rounded-full pointer-events-none"
            style={{
              left: `${getPercentage(values[0])}%`,
              width: `${Math.max(
                0,
                getPercentage(values[1]) - getPercentage(values[0])
              )}%`,
            }}
          />

          {/* Min handle */}
          <div
            className={`absolute w-4 h-4 bg-white border-2 border-black rounded-full transform -translate-x-1/2 -translate-y-1 z-10 ${
              isDragging === "min"
                ? "cursor-grabbing scale-110 shadow-lg"
                : "cursor-grab hover:scale-105"
            } transition-transform duration-150`}
            style={{ left: `${getPercentage(values[0])}%` }}
            onMouseDown={handleMouseDown("min")}
            onTouchStart={handleTouchStart("min")}
          />

          {/* Max handle */}
          <div
            className={`absolute w-4 h-4 bg-white border-2 border-black rounded-full transform -translate-x-1/2 -translate-y-1 z-10 ${
              isDragging === "max"
                ? "cursor-grabbing scale-110 shadow-lg"
                : "cursor-grab hover:scale-105"
            } transition-transform duration-150`}
            style={{ left: `${getPercentage(values[1])}%` }}
            onMouseDown={handleMouseDown("max")}
            onTouchStart={handleTouchStart("max")}
          />
        </div>

        {/* Price display */}
        <div className="flex justify-between mt-3 text-xs text-gray-600">
          <span>{formatPrice(values[0])}</span>
          <span>{formatPrice(values[1])}</span>
        </div>
      </div>
    );
  };

  // Update the FilterContent component to use the slider
  const FilterContent = () => (
    <>
      {/* Sort by Price */}
      <FilterSection title="Sort By Price">
        <DualRangeSlider
          min={priceRange.min || 0}
          max={priceRange.max || 1000000}
          values={sliderValues}
          onChange={handleSliderChange}
        />
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
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white transform ${
            isFilterSidebarOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-40 md:hidden overflow-y-auto`}
        >
          <div className="p-6">
            {/* Header with close button */}
            <div className="flex items-center mb-6">
              <button
                onClick={closeFilterSidebar}
                className="p-2 focus:outline-none"
                aria-label="Close filter"
              >
                <svg
                  className="w-6 h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                  : cataloguePageData?.cataloguePage?.title ||
                    "Your Daily Muse"}
              </h1>
              <button
                onClick={toggleFilterSidebar}
                className="md:hidden bg-[#800000] px-2 py-1 text-white rounded-[8px] text-[12px] font-light"
              >
                Semua Filter{" "}
                <Image
                  src="/assets/filter.svg"
                  alt="Filter Icon"
                  width={16}
                  height={16}
                  className="inline-block ml-1"
                />
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
