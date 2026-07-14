import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the backend directory regardless of cwd
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// High-quality mock dataset of Oh Polly styled Instagram posts
const MOCK_INSTAGRAM_FEED = [
  {
    id: "1",
    media_type: "VIDEO",
    media_url: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0542d87e17c07ba913c9edc2380a786&profile_id=139&oauth2_token_id=57447761",
    thumbnail_url: "/images/products/product_dress3.png",
    caption: "Sela dress in action ✨ designed to snatch curves. Shop link in bio. #ohpolly #irl #fashion",
    likes: 1420,
    username: "sarah_style",
    permalink: "https://instagram.com",
    timestamp: "2026-07-14T09:00:00+0000"
  },
  {
    id: "2",
    media_type: "IMAGE",
    media_url: "/images/products/product_dress2.png",
    thumbnail_url: "/images/products/product_dress2.png",
    caption: "Elegance is effortless in Livia 💛 The perfect lace details. #ootd #summerdresses #ohpolly",
    likes: 980,
    username: "mya_rose",
    permalink: "https://instagram.com",
    timestamp: "2026-07-14T08:30:00+0000"
  },
  {
    id: "3",
    media_type: "VIDEO",
    media_url: "https://player.vimeo.com/external/435674703.sd.mp4?s=7f77f1396a802779fa7ec5d4be108605c48b26f5&profile_id=165&oauth2_token_id=57447761",
    thumbnail_url: "/images/products/product_dress1.png",
    caption: "Valencia drape mini in chocolate 🍫 date night ready. #ohpolly #satindress #luxury",
    likes: 2150,
    username: "elizabeth_gray",
    permalink: "https://instagram.com",
    timestamp: "2026-07-14T08:00:00+0000"
  },
  {
    id: "4",
    media_type: "IMAGE",
    media_url: "/images/products/product_dress4.png",
    thumbnail_url: "/images/products/product_dress4.png",
    caption: "Obsessed with the Analia corset mini dress 🌸 Pink perfection. #corsetdress #ohpolly #irl",
    likes: 1105,
    username: "chloe_luxe",
    permalink: "https://instagram.com",
    timestamp: "2026-07-14T07:15:00+0000"
  },
  {
    id: "5",
    media_type: "VIDEO",
    media_url: "https://player.vimeo.com/external/482898951.sd.mp4?s=d009088ffc32ef8508e6c71c4c114f09d846ff9b&profile_id=165&oauth2_token_id=57447761",
    thumbnail_url: "/images/ui/hero_model.png",
    caption: "Resort drop is here 🌴 Sorrento backless knit dress. #resortwear #ohpolly #summerfit",
    likes: 1845,
    username: "sophia_travels",
    permalink: "https://instagram.com",
    timestamp: "2026-07-14T06:00:00+0000"
  }
];

// Instagram API proxy endpoint
app.get('/api/instagram/feed', async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token || token === 'YOUR_INSTAGRAM_ACCESS_TOKEN_HERE') {
    // If token is missing, fall back to high-fidelity mock feed
    return res.json({
      data: MOCK_INSTAGRAM_FEED,
      source: "mock-backend-fallback"
    });
  }

  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username';
    const instagramUrl = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}`;

    const response = await fetch(instagramUrl);
    
    if (!response.ok) {
      throw new Error(`Instagram API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.json({
      data: data.data || [],
      source: "instagram-graph-api"
    });
  } catch (error) {
    console.error("Failed to fetch Instagram feed from Graph API, falling back to mock:", error.message);
    // Return mock fallback on error
    return res.json({
      data: MOCK_INSTAGRAM_FEED,
      source: "mock-backend-fallback",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Express backend server running on http://localhost:${PORT}`);
});
