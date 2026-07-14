const rawProducts = [
  {
    id: 5,
    name: "Sela",
    slug: "sela-embellished-skirt-chiffon-mini-dress-in-aqua",
    tagline: "Embellished Skirt Chiffon Mini Dress in Aqua",
    price: 110.00,
    rating: 4.8,
    reviewCount: 17,
    images: ["/images/products/product_dress3.png"],
    colors: ["Sky Blue", "Blush Pink", "White"],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    description: "Make an entrance in Sela. Featuring a plunge cowl neck bodice in lightweight semi-sheer chiffon and a structured mini skirt adorned with hand-sewn shimmering sequins.",
    details: [
      "Sequinned structured mini skirt",
      "Halter cowl neck styling",
      "Semi-sheer chiffon bodice",
      "Style code: OP-SLA-AQ"
    ]
  },
  {
    id: 6,
    name: "Livia",
    slug: "livia-modal-lace-trim-midaxi-dress-in-pastel-yellow",
    tagline: "Modal Lace-Trim Midaxi Dress in Pastel Yellow",
    price: 55.00,
    rating: 4.9,
    reviewCount: 17,
    images: ["/images/products/product_dress2.png"],
    colors: ["Pastel Yellow", "Cream", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Romantic and effortless. Livia is crafted from our ultra-soft modal fabric with delicate lace-trimming around the bust cup. Flowing midaxi skirt with subtle pleat details.",
    details: [
      "Lace-trimmed underwire cups",
      "Adjustable shoulder straps",
      "Super soft stretch modal",
      "Style code: OP-LVA-YL"
    ]
  },
  {
    id: 7,
    name: "Vana",
    slug: "vana-fringed-mini-dress-in-aqua",
    tagline: "Fringed Mini Dress in Aqua",
    price: 75.00,
    rating: 4.7,
    reviewCount: 9,
    images: ["/images/products/product_dress1.png"],
    colors: ["Aqua Blue", "Blush Pink"],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    description: "Designed to dance in. Vana is covered in fluid tier fringing that catches the light and moves with you. Underwired cups and adjustable cross back straps.",
    details: [
      "Allover fluid fringing tiers",
      "Underwired structured cups",
      "Satin cross back straps",
      "Style code: OP-VNA-AQ"
    ]
  },
  {
    id: 8,
    name: "Analia",
    slug: "analia-embellished-skirt-corset-mini-dress",
    tagline: "Embellished Skirt Corset Mini Dress in Sky Blue",
    price: 95.00,
    rating: 4.6,
    reviewCount: 8,
    images: ["/images/products/product_dress4.png"],
    colors: ["Sky Blue", "White", "Lavender"],
    sizes: ["XS", "S", "M", "L"],
    description: "Combine structure and sparkles. Analia features a classic boned corset bodice with underwired support and a mini skirt completely covered in hand-embellished sequins.",
    details: [
      "Sequinned structured mini skirt",
      "Fully boned underwire corset",
      "Rear concealed zip",
      "Style code: OP-ANL-SB"
    ]
  },
  {
    id: 1,
    name: "Valencia",
    slug: "valencia-off-shoulder-satin-bodycon-mini-dress",
    tagline: "Off-Shoulder Satin Bodycon Mini Dress",
    price: 68.00,
    rating: 4.8,
    reviewCount: 124,
    images: ["/images/products/product_dress1.png"],
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
    name: "Sorrento",
    slug: "sorrento-cutout-knit-midi-dress",
    tagline: "Cutout Knit Midi Dress",
    price: 74.00,
    rating: 4.6,
    reviewCount: 89,
    images: ["/images/products/product_dress2.png"],
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
    name: "Amalfi",
    slug: "amalfi-backless-silk-maxi-dress",
    tagline: "Backless Silk Maxi Dress",
    price: 92.00,
    rating: 4.9,
    reviewCount: 210,
    images: ["/images/products/product_dress3.png"],
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
    name: "Milan",
    slug: "milan-structured-corset-mini-dress",
    tagline: "Structured Corset Mini Dress",
    price: 82.00,
    rating: 4.7,
    reviewCount: 152,
    images: ["/images/products/product_dress4.png"],
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
