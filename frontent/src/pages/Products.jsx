import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaShoppingCart, FaHeart, FaFilter, FaSearch } from "react-icons/fa";
import Footer from "../compenent/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishListcontext";

function Products() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search") || "";
    setSearchTerm(searchQuery);
    fetchProducts();
  }, [location.search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3002/products");
      const data = await res.json();

      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
      
      // Find min and max price
      const prices = data.map(p => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setPriceRange({ min: minPrice, max: maxPrice });
      
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      filterAndSortProducts();
    }
  }, [products, searchTerm, sortBy, selectedCategory]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order (by id)
        filtered.sort((a, b) => a.id - b.id);
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    
    addToCart(item);
  };

  const handleAddToWishlist = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }
    
    addToWishlist(item);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("default");
  };

  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-56 bg-gray-300"></div>
      <div className="p-5">
        <div className="h-5 bg-gray-300 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-10 bg-gray-300 rounded mt-4"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Delicious Collection</h1>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(n => <ProductSkeleton key={n} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-rose-600 to-purple-600 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Delicious Collection
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Discover handcrafted cakes made with love and premium ingredients
          </p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="container mx-auto max-w-6xl px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* SEARCH BAR */}
          <div className="relative mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search cakes by name, flavor, or category..."
                className="w-full px-5 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-lg focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaSearch />
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* FILTER ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* CATEGORY FILTERS */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-rose-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-rose-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* SORT DROPDOWN */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={sortBy}
                onChange={handleSort}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-400 bg-white"
              >
                <option value="default">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUCT COUNT & FILTERS */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span> 
            {filteredProducts.length === 1 ? " product" : " products"}
          </p>
          {(searchTerm || selectedCategory !== "all" || sortBy !== "default") && (
            <button
              onClick={clearFilters}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="text-6xl mb-4">🍰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No products found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No cakes found matching "${searchTerm}"`
                : "Try adjusting your filters or check back later"
              }
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {filteredProducts.map((item) => {
              const inWishlist = isInWishlist(item.id);
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                >
                  {/* PRODUCT IMAGE */}
                  <div 
                    className="relative h-56 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=Cake";
                      }}
                    />
                    
                    {/* CATEGORY BADGE */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium shadow-sm">
                      {item.category}
                    </div>
                    
                    {/* WISHLIST BUTTON */}
                    <button
                      onClick={(e) => handleAddToWishlist(item, e)}
                      className={`absolute top-3 right-3 p-2.5 rounded-full transition-all ${
                        inWishlist
                          ? "bg-rose-500 text-white"
                          : "bg-white/90 text-gray-700 hover:bg-rose-500 hover:text-white"
                      }`}
                      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <FaHeart size={14} fill={inWishlist ? "currentColor" : "none"} />
                    </button>
                    
                    {/* PRICE BADGE */}
                    <div className="absolute bottom-3 right-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold shadow-md">
                      ₹{item.price}
                    </div>
                  </div>

                  {/* PRODUCT INFO */}
                  <div className="p-4">
                    <h3 
                      className="text-lg font-bold text-gray-800 mb-2 cursor-pointer hover:text-rose-600 line-clamp-1"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description || "Delicious cake made with premium ingredients"}
                    </p>

                    {/* RATING */}
                    {item.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.floor(item.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-gray-500 text-sm ml-2">
                          ({item.rating})
                        </span>
                      </div>
                    )}

                    {/* ACTION BUTTON */}
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-medium hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart size={14} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM CTA */}
      <div className="container mx-auto max-w-6xl px-4 pb-12">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-8 text-center border border-rose-100">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We add new cakes to our collection every week. Check back soon or contact us for custom orders!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 border border-rose-300 text-rose-600 rounded-lg font-medium hover:bg-rose-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Products;