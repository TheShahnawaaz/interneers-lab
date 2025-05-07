// API configuration
const API_URL = 'http://localhost:8001/api/products/';
const CATEGORIES_URL = 'http://localhost:8001/api/categories/';

// Cloudinary image URLs (hardcoding for direct access)
const CLOUDINARY_IMAGES = {
  "coffee-maker": "https://res.cloudinary.com/dfdly8tdm/image/upload/v1746640108/products/coffee-maker.png",
  "laptop-pro": "https://res.cloudinary.com/dfdly8tdm/image/upload/v1746640115/products/laptop-pro.png",
  "mens-t-shirt": "https://res.cloudinary.com/dfdly8tdm/image/upload/v1746640116/products/mens-t-shirt.png",
  "smartphone-xyz": "https://res.cloudinary.com/dfdly8tdm/image/upload/v1746640108/products/smartphone-xyz.png",
  "sofa-set": "https://res.cloudinary.com/dfdly8tdm/image/upload/v1746640114/products/sofa-set.png",
  "wireless-headphones": "https://res.cloudinary.com/dfdly8tdm/image/upload/v1746640110/products/wireless-headphones.png",
  "womens-dress": "https://res.cloudinary.com/dfdly8tdm/image/upload/v1746640111/products/womens-dress.png"
};

// Global state
let allProducts = [];
let categories = [];
let filteredProducts = [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const productContainer = document.getElementById('product-container');
const searchInput = document.getElementById('search-input');
const filtersContainer = document.querySelector('.filters');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    showLoading();
    
    try {
        // Fetch categories and products in parallel
        const [categoriesData, productsData] = await Promise.all([
            fetchCategories(),
            fetchProducts()
        ]);
        
        categories = categoriesData;
        allProducts = productsData;
        filteredProducts = [...allProducts];
        
        renderCategoryFilters();
        renderProducts(filteredProducts);
        setupEventListeners();
    } catch (error) {
        showError('Failed to load data. Please try again later.');
        console.error('Error initializing app:', error);
    }
}

// API Calls
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Fetched products:', data);
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function fetchCategories() {
    try {
        const response = await fetch(CATEGORIES_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Fetched categories:', data);
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return []; // Return empty array to allow app to continue
    }
}

// Rendering Functions
function renderProducts(products) {
    clearContainer();
    
    if (products.length === 0) {
        showNoResults();
        return;
    }
    
    products.forEach(product => {
        const tile = createProductTile(product);
        productContainer.appendChild(tile);
    });
}

function createProductTile(product) {
    const tile = document.createElement('div');
    tile.className = 'product-tile';
    
    // Find category name from product (API already includes category name)
    const categoryName = product.category || 'Uncategorized';
    
    // Get image from Cloudinary or use placeholder
    const imageUrl = getProductImage(product.slug);
    
    // Generate appropriate stock message
    const stockInfo = getStockInfo(product);
    
    // Handle price formatting safely
    const price = formatPrice(product.price);
    
    // Add a featured badge if applicable
    const featuredBadge = product.featured ? '<div class="featured-badge">Featured</div>' : '';
    
    // Get stock indicator class
    const stockClass = getStockClass(product);
    
    tile.innerHTML = `
        ${stockInfo ? `<div class="stock-info ${stockClass}">${stockInfo}</div>` : ''}
        ${featuredBadge}
        <div class="image-container">
            <img src="${imageUrl}" alt="${product.name}" class="product-image">
        </div>
        <div class="product-info">
            <div class="product-category">${categoryName}</div>
            <div class="product-title">${product.name || 'No Name'}</div>
            <div class="product-price"><span class="currency-symbol">$</span>${parseFloat(product.price || 0).toFixed(2)}</div>
            <div class="product-description">${product.description || 'No description available'}</div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="viewProductDetails('${product.slug}')">View Details</button>
            </div>
        </div>
    `;
    
    return tile;
}

// Get product image from Cloudinary or fallback to placeholder
function getProductImage(slug) {
    if (CLOUDINARY_IMAGES[slug]) {
        return CLOUDINARY_IMAGES[slug];
    }
    return `https://via.placeholder.com/600x600?text=${encodeURIComponent(slug)}`;
}

// Get the appropriate stock indicator class
function getStockClass(product) {
    if (product.is_in_stock === false) {
        return 'out-of-stock';
    } else if (product.is_low_stock === true) {
        return 'low-stock';
    } else if (product.is_in_stock === true) {
        return 'in-stock';
    }
    return '';
}

// Format price safely handling different data types
function formatPrice(price) {
    if (price === undefined || price === null) {
        return '<span class="currency-symbol">$</span>0.00';
    }
    
    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Check if conversion resulted in a valid number
    if (isNaN(numPrice)) {
        return 'Price unavailable';
    }
    
    // Return just the number (the currency symbol is added in the HTML)
    return parseFloat(numPrice).toFixed(2);
}

function renderCategoryFilters() {
    // Keep the "All Products" button and add category filters
    if (categories.length === 0) return;
    
    categories.forEach(category => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-button';
        filterBtn.setAttribute('data-category', category.name);
        filterBtn.textContent = category.name;
        filtersContainer.appendChild(filterBtn);
    });
}

// Helper Functions
function getStockInfo(product) {
    if (product.is_in_stock === false) {
        return 'Out of Stock';
    } else if (product.is_low_stock === true) {
        return 'Low Stock';
    } else if (product.is_in_stock === true) {
        return 'In Stock';
    }
    return null;
}

function clearContainer() {
    productContainer.innerHTML = '';
}

function showLoading() {
    productContainer.innerHTML = '<div class="loading">Loading products</div>';
}

function showNoResults() {
    productContainer.innerHTML = '<div class="loading">No products found matching your criteria</div>';
}

function showError(message) {
    productContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

// Event handlers
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    
    // Category filter functionality
    document.querySelectorAll('.filter-button').forEach(button => {
        button.addEventListener('click', handleCategoryFilter);
    });
}

function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase().trim();
    applyFilters();
}

function handleCategoryFilter(event) {
    // Update active filter styling
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Set current filter
    currentFilter = event.target.getAttribute('data-category');
    applyFilters();
}

function applyFilters() {
    let results = [...allProducts];
    
    // Apply category filter
    if (currentFilter !== 'all') {
        results = results.filter(product => product.category === currentFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        results = results.filter(product => 
            (product.name && product.name.toLowerCase().includes(searchQuery)) || 
            (product.description && product.description.toLowerCase().includes(searchQuery))
        );
    }
    
    filteredProducts = results;
    renderProducts(filteredProducts);
}

// Product Detail Functionality
function viewProductDetails(productSlug) {
    console.log('Navigating to product details for:', productSlug);
    // Redirect to the product detail page with the slug as a URL parameter
    window.location.href = `product-detail.html?slug=${productSlug}`;
} 