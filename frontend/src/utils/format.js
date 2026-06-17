/** Format a number as Indian Rupees, e.g. 7999 -> "₹7,999". */
export const formatINR = (value) => {
  const num = Number(value) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Derive a stable pseudo-rating (3.8 - 4.9) from a product id so the UI shows
 * plausible ratings until real review data is wired up.
 */
export const displayRating = (product) => {
  if (product?.ratingAverage && Number(product.ratingAverage) > 0) {
    return Number(product.ratingAverage).toFixed(1);
  }
  const seed = Number(product?.id) || 0;
  return (3.8 + ((seed * 7) % 12) / 10).toFixed(1);
};

/** A plausible "list price" for showing a strike-through discount. */
export const listPrice = (price) => Math.round((Number(price) || 0) * 1.35);

export const discountPct = (price) => {
  const lp = listPrice(price);
  if (!lp) return 0;
  return Math.round(((lp - Number(price)) / lp) * 100);
};
