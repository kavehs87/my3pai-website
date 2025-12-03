

import { Creator, Course, Destination, Podcast, BlogPost, DigitalAsset, SocialPost, CalendarDay, TimeSlot, Currency } from './types';

export const CREATOR: Creator = {
  name: "Alex Walker",
  handle: "@alexwanders",
  tagline: "Exploring the unseen corners of the world through AI & Lens.",
  location: "Bali, Indonesia",
  bio: "I'm a travel filmmaker and AI enthusiast dedicated to helping you plan the perfect trip. After visiting 40+ countries, I now build data-driven travel maps and teach creators how to capture the world.",
  stats: {
    rating: 4.9,
    locationsVisited: 42,
    mapsBuilt: 156,
    travelersGuided: 12500
  },
  socials: {
    instagram: "#",
    youtube: "#",
    tiktok: "#",
    twitter: "#"
  }
};

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'JPY', symbol: '¥', rate: 150 },
];

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: "Cinematic Travel Videography Masterclass",
    description: "Learn to shoot edit and color grade travel films like a pro.",
    image: "https://picsum.photos/seed/camera/800/600",
    price: 199,
    isPremium: true,
    students: 1204
  },
  {
    id: 'c2',
    title: "AI Travel Planning Blueprint",
    description: "Master Gemini & Maps to build perfect itineraries in minutes.",
    image: "https://picsum.photos/seed/ai/800/600",
    price: 89,
    isPremium: false,
    students: 3500
  },
  {
    id: 'c3',
    title: "Smartphone Content Creation",
    description: "Shoot viral reels and shorts with just your phone. No expensive gear needed.",
    image: "https://picsum.photos/seed/phone/800/600",
    price: 49,
    isPremium: false,
    students: 850
  },
  {
    id: 'c4',
    title: "Travel Vlogging 101: Zero to Hero",
    description: "Start your YouTube channel from scratch. Storytelling, audio, and editing basics.",
    image: "https://picsum.photos/seed/vlog/800/600",
    price: 149,
    isPremium: true,
    students: 2100
  }
];

export const DESTINATIONS: Destination[] = [
  {
    id: 'd1',
    country: "Japan",
    flag: "🇯🇵",
    image: "https://picsum.photos/seed/japan/600/800",
    description: "The ultimate 3-week itinerary for Tokyo, Kyoto & Osaka.",
    poiCount: 145,
    price: 29
  },
  {
    id: 'd2',
    country: "Iceland",
    flag: "🇮🇸",
    image: "https://picsum.photos/seed/iceland/600/800",
    description: "Ring Road adventure guide with hidden waterfalls.",
    poiCount: 82,
    price: 24
  },
  {
    id: 'd3',
    country: "Morocco",
    flag: "🇲🇦",
    image: "https://picsum.photos/seed/morocco/600/800",
    description: "From the Atlas Mountains to the Sahara Desert.",
    poiCount: 65,
    price: 19
  },
  {
    id: 'd4',
    country: "Italy",
    flag: "🇮🇹",
    image: "https://picsum.photos/seed/italy/600/800",
    description: "Dolce Vita: Amalfi Coast, Rome, and Tuscan Vineyards.",
    poiCount: 112,
    price: 29
  },
  {
    id: 'd5',
    country: "New Zealand",
    flag: "🇳🇿",
    image: "https://picsum.photos/seed/nz/600/800",
    description: "South Island road trip guide for nature lovers.",
    poiCount: 95,
    price: 25
  },
  {
    id: 'd6',
    country: "Peru",
    flag: "🇵🇪",
    image: "https://picsum.photos/seed/peru/600/800",
    description: "Machu Picchu trekking and Cusco culinary guide.",
    poiCount: 78,
    price: 22
  }
];

export const PODCASTS: Podcast[] = [
  {
    id: 'p1',
    title: "Ep 42: Solo Travel Safety in South America",
    duration: "45:20",
    date: "Oct 12, 2023",
    isPremium: false,
    image: "https://picsum.photos/seed/mic/300/300"
  },
  {
    id: 'p2',
    title: "Ep 43: Monetizing Your Travel Blog (Premium)",
    duration: "1:12:05",
    date: "Oct 19, 2023",
    isPremium: true,
    image: "https://picsum.photos/seed/money/300/300"
  },
  {
    id: 'p3',
    title: "Ep 44: The Truth About Van Life",
    duration: "52:15",
    date: "Oct 26, 2023",
    isPremium: false,
    image: "https://picsum.photos/seed/van/300/300"
  },
  {
    id: 'p4',
    title: "Ep 45: How AI is Changing Travel Planning",
    duration: "38:40",
    date: "Nov 02, 2023",
    isPremium: false,
    image: "https://picsum.photos/seed/robot/300/300"
  },
  {
    id: 'p5',
    title: "Ep 46: Advanced Photography Techniques (Premium)",
    duration: "58:30",
    date: "Nov 09, 2023",
    isPremium: true,
    image: "https://picsum.photos/seed/lens/300/300"
  },
  {
    id: 'p6',
    title: "Ep 47: Interview with National Geographic Photographer",
    duration: "1:05:00",
    date: "Nov 16, 2023",
    isPremium: false,
    image: "https://picsum.photos/seed/natgeo/300/300"
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: "10 Hidden Gems in Kyoto No One Tells You About",
    preview: "Avoid the crowds at Fushimi Inari and head to these secret spots instead...",
    date: "Nov 01, 2023",
    readTime: "5 min",
    image: "https://picsum.photos/seed/temple/800/400",
    isPremium: false,
    category: "Guides",
    tags: ["Japan", "Kyoto", "Hidden Gems", "Photography"],
    content: `
      <p class="lead">Kyoto is magical, but the crowds at the main temples can be overwhelming. After spending a month exploring the city, I discovered these quiet sanctuaries that capture the true spirit of old Japan.</p>
      
      <h3>1. Otagi Nenbutsu-ji</h3>
      <p>Located in the Arashiyama hills, this temple is famous for its 1,200 whimsical stone statues of Rakan, the disciples of Buddha. Unlike the serious expressions found in most temples, these statues are laughing, drinking sake, or holding cats. It's a bit of a trek, which keeps the tour buses away.</p>
      
      <h3>2. Gio-ji Temple</h3>
      <p>Just a short walk from the bamboo grove but often overlooked. This small nunnery has the most incredible moss garden I've ever seen. The light filtering through the maple leaves creates a vibrant green atmosphere that feels like a fairy tale.</p>
      
      <p><em>Pro Tip: Visit right after it opens at 9:00 AM for the best light and total silence.</em></p>

      <h3>3. The Philosopher's Path (North End)</h3>
      <p>While the path itself is famous, most tourists stick to the southern section near Ginkaku-ji. If you head north towards Nanzen-ji, you'll find smaller shrines and cafes tucked away from the main walkway.</p>
      
      <h3>4. Honen-in</h3>
      <p>This temple is known for its thatched-roof gate and raked sand mounds that are redesigned every few days. It's free to enter and offers a peaceful respite from the busy Higashiyama district.</p>
      
      <h3>Summary</h3>
      <p>Kyoto rewards those who wander off the beaten path. Grab a bike, get lost in the side streets, and you'll find your own hidden gems.</p>
    `
  },
  {
    id: 'b2',
    title: "My Exact Camera Gear Packing List for 2024",
    preview: "From drone batteries to lens filters, here is everything I carry.",
    date: "Oct 28, 2023",
    readTime: "8 min",
    image: "https://picsum.photos/seed/gear/800/400",
    isPremium: true,
    category: "Gear",
    tags: ["Photography", "Gear", "Travel Tips", "Tech"],
    content: `
      <p class="lead">One of the most common questions I get is, "What's in your camera bag?" As a solo creator, I need gear that is powerful but lightweight enough to carry up a mountain.</p>

      <h3>The Main Camera: Sony A7IV</h3>
      <p>This is the workhorse. The hybrid capabilities for photo and video make it unbeatable. I pair it mostly with the 24-70mm GM II lens which covers 90% of my shots.</p>

      <h3>The Drone: DJI Mini 3 Pro</h3>
      <p>For travel, size is everything. The Mini 3 Pro is under 249g, meaning fewer regulations in many countries, and it shoots true vertical video for Reels/TikTok.</p>

      <h3>Audio Gear</h3>
      <ul>
        <li><strong>DJI Mic:</strong> Wireless and reliable.</li>
        <li><strong>Rode VideoMic NTG:</strong> For run-and-gun vlogging.</li>
      </ul>

      <h3>Accessories You Forget</h3>
      <p>It's the small things that save a shoot:</p>
      <ul>
        <li><strong>ND Filters:</strong> Essential for keeping that 180-degree shutter rule in bright sunlight.</li>
        <li><strong>SSD Drive:</strong> I use the SanDisk Extreme Pro 2TB to back up footage every single night. Never skip this step!</li>
        <li><strong>Power Bank:</strong> Anker 737 (PowerCore 24K) can charge my laptop and camera simultaneously.</li>
      </ul>

      <h3>The Bag</h3>
      <p>I pack everything into the Peak Design Travel Backpack 45L. It fits in the overhead bin and opens from the back for security.</p>
    `
  },
  {
    id: 'b3',
    title: "How to Afford Travel as a Digital Nomad",
    preview: "Budgeting tips, remote work platforms, and finding cheap flights.",
    date: "Oct 15, 2023",
    readTime: "6 min",
    image: "https://picsum.photos/seed/nomad/800/400",
    isPremium: false,
    category: "Lifestyle",
    tags: ["Digital Nomad", "Budget Travel", "Remote Work"],
    content: `
      <p class="lead">Traveling full-time seems expensive, but it can actually be cheaper than living in a major US or European city. Here is how I make the math work.</p>
      <h3>Geo-Arbitrage</h3>
      <p>The secret is earning in a strong currency (USD/EUR) and spending in a weaker one. Places like Bali, Vietnam, and Portugal offer incredible quality of life for a fraction of the cost.</p>
      <h3>Accommodation Hacks</h3>
      <p>I rarely stay in hotels. I book Airbnbs for a month at a time (often getting a 40-50% discount) or use TrustedHousesitters to stay for free in exchange for pet sitting.</p>
    `
  },
  {
    id: 'b4',
    title: "Ultimate Street Food Guide to Bangkok",
    preview: "From Michelin-starred crab omelets to the best mango sticky rice.",
    date: "Sep 22, 2023",
    readTime: "4 min",
    image: "https://picsum.photos/seed/food/800/400",
    isPremium: false,
    category: "Food",
    tags: ["Thailand", "Bangkok", "Foodie", "Street Food"],
    content: `
      <p class="lead">Bangkok is the street food capital of the world. Forget white tablecloths; the best meals are served on plastic stools.</p>
      <h3>Jay Fai</h3>
      <p>The queen of street food. Her crab omelet costs $30 (expensive for street food), but it is worth every penny. Be prepared to wait 3-4 hours.</p>
      <h3>Chinatown (Yaowarat)</h3>
      <p>Head here at night. The neon signs light up, and the street fills with vendors selling grilled squid, bird's nest soup, and dim sum.</p>
    `
  },
  {
    id: 'b5',
    title: "Solo Travel: Beating Loneliness on the Road",
    preview: "Practical strategies for meeting people and staying mentally healthy.",
    date: "Sep 05, 2023",
    readTime: "7 min",
    image: "https://picsum.photos/seed/solo/800/400",
    isPremium: true,
    category: "Wellness",
    tags: ["Solo Travel", "Mental Health", "Community"],
    content: `
      <p class="lead">Instagram shows the sunsets, but it doesn't show the lonely dinners. Solo travel is rewarding, but it comes with challenges.</p>
      <h3>Stay in Social Hostels</h3>
      <p>Even if you book a private room, stay in a hostel with a good common area. It's the easiest way to find dinner companions.</p>
      <h3>Join "Free Walking Tours"</h3>
      <p>Every major city has them. It's a low-pressure way to meet other travelers who just arrived.</p>
    `
  }
];

export const ASSETS: DigitalAsset[] = [
  {
    id: 'a1',
    title: "Teal & Orange Cinematic LUT Pack",
    type: "LUT",
    price: 25,
    image: "https://picsum.photos/seed/lut/400/400"
  },
  {
    id: 'a2',
    title: "Iceland Raw Photo Collection (50+)",
    type: "RAW Photo",
    price: 45,
    image: "https://picsum.photos/seed/raw/400/400"
  },
  {
    id: 'a3',
    title: "Bali 4K Drone Footage - Ubud",
    type: "Drone Footage",
    price: 99,
    image: "https://picsum.photos/seed/drone/400/400"
  },
  {
    id: 'a4',
    title: "Moody Lightroom Mobile Presets",
    type: "Preset",
    price: 15,
    image: "https://picsum.photos/seed/preset/400/400"
  },
  {
    id: 'a5',
    title: "Cyberpunk Tokyo Night LUTs",
    type: "LUT",
    price: 30,
    image: "https://picsum.photos/seed/cyber/400/400"
  },
  {
    id: 'a6',
    title: "Patagonia Drone B-Roll Pack",
    type: "Drone Footage",
    price: 120,
    image: "https://picsum.photos/seed/patagonia/400/400"
  },
  {
    id: 'a7',
    title: "Film Grain Overlays (4K)",
    type: "Preset",
    price: 20,
    image: "https://picsum.photos/seed/grain/400/400"
  },
  {
    id: 'a8',
    title: "Desert Vibes RAW Pack",
    type: "RAW Photo",
    price: 40,
    image: "https://picsum.photos/seed/desert/400/400"
  }
];

export const SOCIALS: SocialPost[] = [
  { id: 's1', type: 'youtube', thumbnail: 'https://picsum.photos/seed/yt1/600/340', views: '254K', title: 'Why I left my job to travel' },
  { id: 's2', type: 'short', thumbnail: 'https://picsum.photos/seed/reel1/340/600', views: '1.2M', title: 'POV: Waking up in Swiss Alps' },
  { id: 's3', type: 'short', thumbnail: 'https://picsum.photos/seed/reel2/340/600', views: '890K', title: 'Street food in Bangkok' },
  { id: 's4', type: 'youtube', thumbnail: 'https://picsum.photos/seed/yt2/600/340', views: '105K', title: 'Sony A7IV Full Review' },
  { id: 's5', type: 'short', thumbnail: 'https://picsum.photos/seed/reel3/340/600', views: '500K', title: 'How to pack light' },
  { id: 's6', type: 'reel', thumbnail: 'https://picsum.photos/seed/reel4/340/600', views: '2.1M', title: 'My morning routine in Bali' },
  { id: 's7', type: 'youtube', thumbnail: 'https://picsum.photos/seed/yt3/600/340', views: '75K', title: 'Editing tutorial for beginners' },
  { id: 's8', type: 'reel', thumbnail: 'https://picsum.photos/seed/reel5/340/600', views: '330K', title: 'Cinematic B-Roll tips' },
];

// Helper to generate current month's availability
const today = new Date();
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
export const CALENDAR_DAYS: CalendarDay[] = Array.from({ length: daysInMonth }, (_, i) => {
  const day = i + 1;
  const date = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
  
  // Deterministic "random" logic for mock data
  const seed = (day * 7) % 10;
  let status: 'available' | 'limited' | 'full' = 'available';
  let slotsAvailable = 5;

  if (seed < 3) {
    status = 'full';
    slotsAvailable = 0;
  } else if (seed < 6) {
    status = 'limited';
    slotsAvailable = 1 + (day % 2); // 1 or 2 slots
  }

  return { date, slotsAvailable, status };
});

export const TIME_SLOTS: TimeSlot[] = [
  { id: 't1', time: '09:00 AM', available: true },
  { id: 't2', time: '10:00 AM', available: true },
  { id: 't3', time: '11:00 AM', available: false }, // Booked
  { id: 't4', time: '01:00 PM', available: true },
  { id: 't5', time: '02:00 PM', available: true },
  { id: 't6', time: '03:00 PM', available: false }, // Booked
  { id: 't7', time: '04:00 PM', available: true },
];