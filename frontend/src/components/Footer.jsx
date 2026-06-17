import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const cols = [
    { title: 'About', links: ['Contact Us', 'About Us', 'Careers', 'Stories'] },
    { title: 'Help', links: ['Payments', 'Shipping', 'Cancellation', 'Returns'] },
    { title: 'Policy', links: ['Privacy', 'Terms', 'Security', 'EPR Compliance'] },
    { title: 'Social', links: ['Facebook', 'Twitter', 'YouTube', 'Instagram'] },
  ];

  return (
    <footer className="mt-12 bg-gray-900 text-gray-300">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <Logo light />
          </Link>
          <p className="mt-3 text-sm text-gray-400">
            Your one-stop shop for electronics and gadgets at unbeatable prices.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">{col.title}</h3>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link}>
                  <span className="cursor-pointer transition-colors hover:text-white">{link}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-5 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ShopNow — Built with Spring Boot &amp; React. For demo purposes only.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
