import React from 'react';
import { Link } from 'react-router-dom';
import { Map, ShoppingBag, User, Home, Package, Heart } from 'lucide-react';
import './Sitemap.css';

const siteLinks = [
  {
    section: 'Main Pages',
    icon: <Home size={16} />,
    links: [
      { label: 'Homepage', path: '/' },
      { label: 'Dresses Collection', path: '/collections/dresses' },
      { label: 'Login / Register', path: '/login' },
      { label: 'My Account / Profile', path: '/profile' },
    ]
  },
  {
    section: 'Shopping',
    icon: <ShoppingBag size={16} />,
    links: [
      { label: 'Shopping Bag', path: '/cart' },
      { label: 'Checkout', path: '/checkout' },
    ]
  },
  {
    section: 'Products',
    icon: <Package size={16} />,
    links: [
      { label: 'Sela – Embellished Skirt Chiffon Mini Dress', path: '/products/sela-embellished-skirt-chiffon-mini-dress-in-aqua' },
      { label: 'Livia – Modal Lace-Trim Midaxi Dress', path: '/products/livia-modal-lace-trim-midaxi-dress-in-pastel-yellow' },
      { label: 'Vana – Fringed Mini Dress', path: '/products/vana-fringed-mini-dress-in-aqua' },
      { label: 'Analia – Embellished Skirt Corset Mini Dress', path: '/products/analia-embellished-skirt-corset-mini-dress' },
      { label: 'Valencia – Off-Shoulder Satin Bodycon Mini Dress', path: '/products/valencia-off-shoulder-satin-bodycon-mini-dress' },
      { label: 'Sorrento – Cutout Knit Midi Dress', path: '/products/sorrento-cutout-knit-midi-dress' },
      { label: 'Amalfi – Backless Silk Maxi Dress', path: '/products/amalfi-backless-silk-maxi-dress' },
      { label: 'Milan – Structured Corset Mini Dress', path: '/products/milan-structured-corset-mini-dress' },
    ]
  },
  {
    section: 'Site Utilities',
    icon: <Map size={16} />,
    links: [
      { label: 'Sitemap', path: '/sitemap' },
    ]
  }
];

export default function Sitemap() {
  return (
    <div className="sitemap-page main-content container animate-fade">
      <div className="sitemap-header">
        <Map size={32} className="sitemap-icon" />
        <h1 className="sitemap-title">SITEMAP</h1>
        <p className="sitemap-desc">
          A complete overview of all pages available on Oh Polly.
        </p>
      </div>

      <div className="sitemap-grid">
        {siteLinks.map((section) => (
          <div key={section.section} className="sitemap-section-card">
            <div className="sitemap-section-header">
              {section.icon}
              <h3 className="sitemap-section-title">{section.section}</h3>
            </div>
            <ul className="sitemap-links-list">
              {section.links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="sitemap-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
