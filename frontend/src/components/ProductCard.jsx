import React from 'react';
import { formatINR, displayRating, listPrice, discountPct } from '../utils/format';

const PLACEHOLDER = 'https://placehold.co/400x400?text=No+Image';

/**
 * Product card: image, rating, price with discount, and add-to-cart.
 */
const ProductCard = ({ product, onAddToCart }) => {
  const imageSrc = product.imageUrl || product.image;
  const inStock = product.stock === undefined || product.stock > 0;
  const rating = displayRating(product);
  const pct = discountPct(product.price);

  const handleAddToCart = () => {
    if (product && onAddToCart && inStock) onAddToCart(product);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      {/* Image */}
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gray-50 p-4">
        <img
          src={imageSrc || PLACEHOLDER}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        {pct > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-accent-600 px-2 py-0.5 text-xs font-bold text-white">
            {pct}% OFF
          </span>
        )}
        {!inStock && (
          <span className="absolute right-3 top-3 rounded-md bg-gray-800/80 px-2 py-0.5 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-grow flex-col p-4">
        <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-800">
          {product.name || 'Product Name'}
        </h3>

        <div className="mb-2 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">
            {rating}
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.363 1.118l1.287 3.956c.3.922-.755 1.688-1.54 1.118l-3.37-2.447a1 1 0 00-1.175 0l-3.37 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.956a1 1 0 00-.363-1.118L2.075 9.39c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
            </svg>
          </span>
          <span className="text-xs text-gray-400">In-house assured</span>
        </div>

        {product.description && (
          <p className="mb-3 line-clamp-2 text-xs text-gray-500">{product.description}</p>
        )}

        <div className="mt-auto">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">{formatINR(product.price)}</span>
            {pct > 0 && (
              <span className="text-sm text-gray-400 line-through">{formatINR(listPrice(product.price))}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              inStock
                ? 'bg-accent-500 text-white hover:brightness-95 active:brightness-90'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            }`}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
