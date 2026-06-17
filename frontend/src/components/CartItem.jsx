import React from 'react';
import { formatINR } from '../utils/format';

const PLACEHOLDER = 'https://placehold.co/100x100?text=No+Image';

/**
 * A single line in the shopping cart with quantity stepper and remove action.
 */
const CartItem = ({ item, onRemove, onUpdateQuantity }) => {
  const subtotal = (Number(item.price) || 0) * (item.quantity || 0);
  const imageSrc = item.imageUrl || item.image || PLACEHOLDER;

  const setQty = (q) => {
    if (q >= 1 && onUpdateQuantity) onUpdateQuantity(item.id, q);
  };

  return (
    <div className="flex gap-4 border-b border-gray-100 p-4 last:border-b-0">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 p-2">
        <img
          src={imageSrc}
          alt={item.name}
          className="h-full w-full object-contain"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
      </div>

      <div className="flex flex-grow flex-col">
        <h3 className="text-sm font-semibold text-gray-800 sm:text-base">{item.name || 'Product'}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{formatINR(item.price)} each</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
            <button
              onClick={() => setQty((item.quantity || 1) - 1)}
              className="grid h-9 w-9 place-items-center text-lg text-gray-600 hover:bg-gray-100"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={item.quantity || 1}
              onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
              className="no-spinner h-9 w-12 border-x border-gray-300 text-center text-sm outline-none"
            />
            <button
              onClick={() => setQty((item.quantity || 1) + 1)}
              className="grid h-9 w-9 place-items-center text-lg text-gray-600 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <span className="text-base font-bold text-gray-900">{formatINR(subtotal)}</span>

          <button
            onClick={() => onRemove && onRemove(item.id)}
            className="text-sm font-semibold text-gray-500 transition-colors hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
