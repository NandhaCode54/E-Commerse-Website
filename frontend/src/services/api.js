const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Login user - POST /api/auth/login. Falls back to mock auth when backend is unavailable.
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Invalid email or password');
    }
    return response.json();
  } catch (error) {
    // Backend unavailable - use mock auth (localStorage)
    try {
      const stored = localStorage.getItem('ecommerce_mock_users');
      let users = {};
      if (stored) {
        try {
          users = JSON.parse(stored) || {};
        } catch {
          users = {};
        }
      }
      const user = users[(email || '').toLowerCase()];
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }
      return {
        token: 'mock-' + Date.now(),
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'USER',
      };
    } catch (inner) {
      throw new Error(inner.message || 'Invalid email or password');
    }
  }
};

/**
 * Register user - POST /api/auth/register. Falls back to mock auth when backend is unavailable.
 */
export const register = async (name, email, password, role = 'USER') => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Registration failed');
    }
    return response.json();
  } catch (error) {
    // Backend unavailable - use mock auth (localStorage)
    try {
      const stored = localStorage.getItem('ecommerce_mock_users');
      let users = {};
      if (stored) {
        try {
          users = JSON.parse(stored) || {};
        } catch {
          users = {};
        }
      }
      const key = (email || '').toLowerCase();
      if (users[key]) {
        throw new Error('Email already registered');
      }
      const id = Date.now();
      users[key] = { id, name, email, password, role };
      localStorage.setItem('ecommerce_mock_users', JSON.stringify(users));
      return {
        token: 'mock-' + id,
        id,
        name,
        email,
        role,
      };
    } catch (inner) {
      throw new Error(inner.message || 'Registration failed. Please try again.');
    }
  }
};

/** Mock products for fallback when backend is unavailable */
const MOCK_PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', description: 'Premium noise-canceling wireless headphones with 30hr battery', price: 7999, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
  { id: 2, name: 'Smart Watch', description: 'Fitness tracker with heart rate, GPS, and 7-day battery', price: 5499, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80' },
  { id: 3, name: 'Portable Bluetooth Speaker', description: 'Waterproof speaker with 360° sound and 20hr playback', price: 2999, stock: 42, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80' },
  { id: 4, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with Cherry MX switches', price: 4499, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80' },
  { id: 5, name: 'USB-C Hub', description: '7-in-1 adapter with HDMI, USB 3.0, SD card slot', price: 1999, stock: 67, imageUrl: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600&q=80' },
  { id: 6, name: 'Wireless Mouse', description: 'Ergonomic design with silent clicks and long battery', price: 1299, stock: 89, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80' },
];

/**
 * Fetch products from the backend API. Falls back to mock data if backend is unavailable.
 */
export const fetchProducts = async (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    const response = await fetch(`${API_BASE_URL}/products?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.warn('API unavailable, using mock products:', error.message);
    const start = page * size;
    const paginated = MOCK_PRODUCTS.slice(start, start + size);
    return {
      products: paginated,
      currentPage: page,
      totalItems: MOCK_PRODUCTS.length,
      totalPages: Math.ceil(MOCK_PRODUCTS.length / size),
      pageSize: size,
    };
  }
};

/**
 * Fetch a single product by ID. Falls back to mock data if backend is unavailable.
 */
export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.warn('API unavailable, using mock product:', error.message);
    const product = MOCK_PRODUCTS.find((p) => p.id === Number(id));
    if (!product) throw new Error('Product not found');
    return product;
  }
};

/**
 * Create product (admin) - POST /api/products
 */
export const createProduct = async (product) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create product');
  }
  return response.json();
};

/**
 * Update product (admin) - PUT /api/products/:id
 */
export const updateProduct = async (id, product) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update product');
  }
  return response.json();
};

/**
 * Delete product (admin) - DELETE /api/products/:id
 */
export const deleteProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete product');
  }
  return response.json();
};

/**
 * Add product to cart (backend API call). Requires authentication and userId.
 */
export const addProductToCartAPI = async (userId, productId, quantity = 1) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/carts/${userId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to add product to cart: ${response.statusText}`);
  }
  return response.json();
};
