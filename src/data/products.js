const rawProducts = [
  {
    id: 1,
    name: "VALENCIA",
    slug: "valencia-off-shoulder-satin-bodycon-mini-dress",
    tagline: "Off-Shoulder Satin Bodycon Mini Dress",
    price: 68.00,
    rating: 4.8,
    reviewCount: 124,
    images: ["/images/product_dress1.png"],
    colors: ["Chocolate", "Champagne", "Noir"],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    description: "Designed in our signature premium ultra-luxe satin, Valencia features a sculpted off-shoulder neckline and asymmetric draping to frame your curves. Double-lined for a smooth, snatched fit, it's the ultimate showstopper.",
    details: [
      "Double-layered stretch satin",
      "Concealed zipper at back",
      "Length: Approx 82cm",
      "Style code: OP-VLC-BR"
    ]
  },
  {
    id: 2,
    name: "SORRENTO",
    slug: "sorrento-cutout-knit-midi-dress",
    tagline: "Cutout Knit Midi Dress",
    price: 74.00,
    rating: 4.6,
    reviewCount: 89,
    images: ["/images/product_dress2.png"],
    colors: ["Olive", "Cream", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Effortlessly elegant, Sorrento is crafted from a soft, fine-knit fabric that contours the body. Designed with strategic waist cutouts, a high neck, and an open back, this midi dress is perfect for warm summer evenings.",
    details: [
      "Premium ribbed knit fabric",
      "Elasticated cutouts",
      "Midaxi length",
      "Style code: OP-SRT-OL"
    ]
  },
  {
    id: 3,
    name: "AMALFI",
    slug: "amalfi-backless-silk-maxi-dress",
    tagline: "Backless Silk Maxi Dress",
    price: 92.00,
    rating: 4.9,
    reviewCount: 210,
    images: ["/images/product_dress3.png"],
    colors: ["Cream", "Blush", "Sage"],
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
    description: "Amalfi is the definition of luxury. Made from lightweight fluid silk-satin, this maxi dress features a low cowl back, adjustable cross-over straps, and a sweeping cowl neckline. Perfect for bridesmaids, formals, or resort dinners.",
    details: [
      "100% premium silk-satin",
      "Adjustable spaghetti straps",
      "Low back styling",
      "Style code: OP-AMF-CR"
    ]
  },
  {
    id: 4,
    name: "MILAN",
    slug: "milan-structured-corset-mini-dress",
    tagline: "Structured Corset Mini Dress",
    price: 82.00,
    rating: 4.7,
    reviewCount: 152,
    images: ["/images/product_dress4.png"],
    colors: ["Blush Pink", "Sage Green", "White"],
    sizes: ["XS", "S", "M", "L"],
    description: "A timeless corset dress that snatch-fits like a dream. Milan is designed with structured boning through the bodice, underwired cups, and a structured mini skirt. Made in our signature heavy double-lined stretch crepe.",
    details: [
      "Heavy structural crepe fabric",
      "Fully boned bodice with underwire",
      "Thick shoulder straps",
      "Style code: OP-MLN-PK"
    ]
  }
];

// Deeply freeze all products and inner arrays to prevent any runtime modifications (Console hacks)
export const products = Object.freeze(
  rawProducts.map((p) =>
    Object.freeze({
      ...p,
      images: Object.freeze([...p.images]),
      colors: Object.freeze([...p.colors]),
      sizes: Object.freeze([...p.sizes]),
      details: Object.freeze([...p.details])
    })
  )
);
