import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function AppContent() {
  const { message, showMessage } = useCart();
  const [toastMessage, setToastMessage] = useState(null);

  React.useEffect(() => {
    if (message) setToastMessage(message);
  }, [message]);

  const handleCloseToast = () => {
    setToastMessage(null);
    showMessage(null);
  };

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-[#f6f5fb]">
        <Navbar />
        <Toast message={toastMessage} onClose={handleCloseToast} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
