// API configuration
const API_URL = 'http://localhost:8001/api/products/';

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

// DOM Elements
const productDetailContainer = document.getElementById('product-detail-container');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Get the product slug from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productSlug = urlParams.get('slug');
    
    if (!productSlug) {
        showError('Product not found. Please return to the catalog.');
        return;
    }
    
    // Fetch the product details
    fetchProductDetails(productSlug);
});

async function fetchProductDetails(slug) {
    try {
        // Fetch the specific product
        const response = await fetch(`${API_URL}${slug}/`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showError('Product not found. It may have been removed.');
            } else {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return;
        }
        
        const product = await response.json();
        renderProductDetail(product);
        
        // Update the page title with the product name
        document.title = `${product.name} | Product Detail`;
        
    } catch (error) {
        console.error('Error fetching product details:', error);
        showError('Failed to load product details. Please try again later.');
    }
}

function renderProductDetail(product) {
    // Get image URL from Cloudinary or use placeholder
    const imageUrl = getProductImage(product.slug);
    
    // Generate stock badge
    const stockInfo = getStockInfo(product);
    const stockClass = getStockClass(product);
    
    // Generate tags HTML if product has tags
    let tagsHtml = '';
    if (product.tags && product.tags.length > 0) {
        tagsHtml = `
            <div class="meta-item meta-full-width">
                <div class="meta-label">Tags</div>
                <div class="meta-value tags-list">
                    ${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Generate featured badge
    const featuredBadge = product.featured ? '<div class="featured-badge">Featured</div>' : '';
    
    // Create dimensions string if available
    const dimensions = product.dimensions ? product.dimensions : 'Not specified';
    
    // Create weight string if available
    const weight = product.weight ? `${product.weight} kg` : 'Not specified';
    
    // Format created/updated dates if available
    const createdAt = formatDate(product.created_at);
    const updatedAt = formatDate(product.updated_at);
    
    // Create the HTML for product detail
    const detailHtml = `
        <div class="product-detail">
            <div class="product-image-container">
                ${featuredBadge}
                <img src="${imageUrl}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info-container">
                <div class="product-category">${product.category}</div>
                <h1 class="product-title">${product.name}</h1>
                <div class="product-price">
                    <span class="currency-symbol">$</span>${parseFloat(product.price || 0).toFixed(2)}
                    ${product.discount_price ? `<span class="discount-price">$${product.discount_price}</span>` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                
                <div class="product-meta">
                    <div class="meta-item">
                        <div class="meta-label">Brand</div>
                        <div class="meta-value">${product.brand || 'Not specified'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">SKU</div>
                        <div class="meta-value">${product.sku || 'Not available'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Status</div>
                        <div class="meta-value">
                            <span class="stock-badge ${stockClass}">${stockInfo}</span>
                        </div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Quantity</div>
                        <div class="meta-value">${product.quantity !== undefined ? product.quantity : 'Not available'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Weight</div>
                        <div class="meta-value">${weight}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Dimensions</div>
                        <div class="meta-value">${dimensions}</div>
                    </div>
                    
                    ${tagsHtml}
                    
                    <div class="meta-dates">
                        <div class="date-item">
                            <i class="fas fa-calendar-plus"></i> Added: ${createdAt}
                        </div>
                        <div class="date-item">
                            <i class="fas fa-calendar-check"></i> Updated: ${updatedAt}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    productDetailContainer.innerHTML = detailHtml;
    
    // Set the image to fill the left side completely
    const productImage = document.querySelector('.product-image');
    productImage.onload = function() {
        const imageContainer = document.querySelector('.product-image-container');
        const imageRatio = this.naturalWidth / this.naturalHeight;
        const containerRatio = imageContainer.clientWidth / imageContainer.clientHeight;
        
        if (imageRatio > containerRatio) {
            // If image is wider than container
            this.style.width = '100%';
            this.style.height = 'auto';
            this.style.objectFit = 'cover';
        } else {
            // If image is taller than container
            this.style.height = '100%';
            this.style.width = 'auto';
            this.style.objectFit = 'cover';
        }
    };
}

// Get product image from Cloudinary or fallback to placeholder
function getProductImage(slug) {
    if (CLOUDINARY_IMAGES[slug]) {
        return CLOUDINARY_IMAGES[slug];
    }
    return `https://via.placeholder.com/600x600?text=${encodeURIComponent(slug)}`;
}

// Helper functions for stock status
function getStockInfo(product) {
    if (product.is_in_stock === false) {
        return 'Out of Stock';
    } else if (product.is_low_stock === true) {
        return 'Low Stock';
    } else if (product.is_in_stock === true) {
        return 'In Stock';
    }
    return 'Unknown';
}

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

// Format dates nicely
function formatDate(dateString) {
    if (!dateString) return 'Not available';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show error message
function showError(message) {
    productDetailContainer.innerHTML = `<div class="error-message">${message}</div>`;
} 