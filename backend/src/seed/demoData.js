import { User } from '../models/User.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { Service } from '../models/Service.js';
import { Package } from '../models/Package.js';
import { GalleryImage } from '../models/GalleryImage.js';
import { MenuCategory } from '../models/MenuCategory.js';
import { MenuItem } from '../models/MenuItem.js';

const DEMO_PASSWORD = 'Demo@1234';

const BUSINESS_HOURS = [
  { day: 'monday', open: '09:00', close: '22:00', isOpen: true },
  { day: 'tuesday', open: '09:00', close: '22:00', isOpen: true },
  { day: 'wednesday', open: '09:00', close: '22:00', isOpen: true },
  { day: 'thursday', open: '09:00', close: '22:00', isOpen: true },
  { day: 'friday', open: '09:00', close: '22:00', isOpen: true },
  { day: 'saturday', open: '09:00', close: '23:00', isOpen: true },
  { day: 'sunday', open: '09:00', close: '23:00', isOpen: true },
];

export const demoSellers = [
  {
  user: { name: 'Ahmed Ali Shah', email: 'alnoor@seller.demo', phone: '03001234501' },
  profile: {
  businessName: 'Al-Noor Banquet Hall',
  slug: 'al-noor-banquet-hall',
  category: 'venues-halls',
  subcategories: ['Banquet Halls', 'Marquee / Lawn'],
  city: 'Sukkur',
  area: 'Airport Road',
  address: 'Airport Road, near Police Lines, Sukkur',
  description:
  'A premium AC banquet hall in the heart of Sukkur. Spacious 1,000-guest capacity with elegant interiors, dedicated parking, and in-house sound system. Our marquee lawn is perfect for Mehndi and outdoor events with lush landscaping and ambient lighting.',
  coverImage:
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop',
  logo: '',
  contactPhone: '03001234501',
  contactEmail: '',
  whatsappNumber: '03001234501',
  socialLinks: {
  instagram: 'https://instagram.com/alnoorbanquet',
  facebook: 'https://facebook.com/alnoorbanquet',
  },
  startingPrice: 150000,
  businessHours: BUSINESS_HOURS,
  policies: {
  cancellation: '50% refund if cancelled 7+ days before the event date.',
  advancePayment: '30% advance to confirm the booking.',
  extraCharges: 'Electricity surcharge applies for events after midnight.',
  },
  location: { type: 'Point', coordinates: [0, 0] },
  },
  services: [
  {
  name: 'Grand Banquet Hall (Full Day)',
  description: 'AC hall with capacity of 1,000 guests, bridal entrance setup and sound system.',
  price: 350000,
  priceType: 'fixed',
  capacity: 1000,
  duration: 12,
  inclusions: ['AC Hall', 'Sound System', 'Tables & Chairs', 'Parking', 'Generator Backup'],
  category: 'venues-halls',
  },
  {
  name: 'Marquee Lawn (Evening)',
  description: 'Open-air marquee with lighting, seating for 800 guests.',
  price: 200000,
  priceType: 'fixed',
  capacity: 800,
  duration: 8,
  inclusions: ['Marquee Setup', 'Decorative Lighting', 'Tables & Chairs', 'Parking'],
  category: 'venues-halls',
  },
  {
  name: 'Small Function Hall (Half Day)',
  description: 'Compact hall for Walima, Aqeeqah and small gatherings up to 200 guests.',
  price: 90000,
  priceType: 'fixed',
  capacity: 200,
  duration: 6,
  inclusions: ['AC Hall', 'Sound System', 'Tables & Chairs'],
  category: 'venues-halls',
  },
  ],
  packages: [
  {
  name: 'Shaadi Package (Hall + Catering + Decor)',
  description: 'Complete Shaadi night package with our partner caterers and decorators.',
  price: 1200000,
  priceType: 'fixed',
  inclusions: ['Grand Hall (1,000 guests)', 'Desi Buffet (20 dishes)', 'Stage & Floral Decor', 'Sound & Lighting'],
  servicesIncluded: ['Grand Banquet Hall (Full Day)'],
  },
  {
  name: 'Mehndi Evening Package',
  description: 'Vibrant Mehndi night with marquee, color theme decor and DJ setup.',
  price: 450000,
  priceType: 'fixed',
  inclusions: ['Marquee Lawn', 'Mehndi Themed Decor', 'DJ & Lighting'],
  servicesIncluded: ['Marquee Lawn (Evening)'],
  },
  ],
  gallery: [
  {
  url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
  category: 'venue',
  caption: 'Grand banquet hall interior',
  isCover: true,
  },
  {
  url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
  category: 'venue',
  caption: 'Event setup with lighting',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
  category: 'decoration',
  caption: 'Stage decoration at our hall',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=800&auto=format&fit=crop',
  category: 'venue',
  caption: 'Outdoor lawn event',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'Shaadi reception',
  isCover: false,
  },
  ],
  menu: [],
  },
  {
  user: { name: 'Imran Qureshi', email: 'royalflavours@seller.demo', phone: '03001234502' },
  profile: {
  businessName: 'Royal Flavours Catering',
  slug: 'royal-flavours-catering',
  category: 'catering-food',
  subcategories: ['Desi Food', 'BBQ', 'Live Food Stations'],
  city: 'Sukkur',
  area: 'Band Road',
  address: 'Band Road, near Clock Tower, Sukkur',
  description:
  "Sukkur's most loved catering service. From authentic Sindhi and Punjabi desi dishes to smoky BBQ live stations, we cater weddings of 50 to 2,000 guests with premium quality and on-time service. Our chefs have served at 500+ events across Upper Sindh.",
  coverImage:
  'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1600&auto=format&fit=crop',
  logo: '',
  contactPhone: '03001234502',
  contactEmail: '',
  whatsappNumber: '03001234502',
  socialLinks: {
  instagram: 'https://instagram.com/royalflavoursskk',
  facebook: 'https://facebook.com/royalflavoursskk',
  },
  startingPrice: 700,
  businessHours: [],
  policies: {
  cancellation: 'Full refund if cancelled 15+ days before event.',
  advancePayment: '25% advance; balance on event day.',
  extraCharges: 'Travel charges apply for venues outside Sukkur.',
  },
  location: { type: 'Point', coordinates: [0, 0] },
  },
  services: [
  {
  name: 'Desi Menu (Per Person)',
  description: 'Classic desi menu — Biryani, Karahi, BBQ platter, salads, desserts.',
  price: 850,
  priceType: 'per_person',
  capacity: null,
  duration: null,
  inclusions: ['4 Main Dishes', 'BBQ Platter', 'Rice & Naan', 'Salads', 'Dessert', 'Soft Drinks'],
  category: 'catering-food',
  },
  {
  name: 'Premium Buffet (Per Person)',
  description: 'Luxury buffet with 20+ dishes, live BBQ and sweet table.',
  price: 1500,
  priceType: 'per_person',
  capacity: null,
  duration: null,
  inclusions: ['20+ Dishes', 'Live BBQ Station', 'Live Pulao Station', 'Sweet Table', 'Serving Staff'],
  category: 'catering-food',
  },
  {
  name: 'BBQ Live Station',
  description: 'Live tikka, seekh kebab and fish BBQ station with chef.',
  price: 25000,
  priceType: 'fixed',
  capacity: null,
  duration: 4,
  inclusions: ['3 BBQ Varieties', 'Chef & Equipment', 'Serving Staff'],
  category: 'catering-food',
  },
  ],
  packages: [
  {
  name: 'Shaadi Buffet Package',
  description: 'Complete wedding buffet for 500 guests with premium menu.',
  price: 750000,
  priceType: 'fixed',
  inclusions: ['Premium Buffet x500', 'Live BBQ Station', 'Decorated Food Counter', 'Full Serving Staff'],
  servicesIncluded: ['Premium Buffet (Per Person)'],
  },
  {
  name: 'Mehndi Dinner Package',
  description: 'Colorful Mehndi menu with traditional Sindhi dishes.',
  price: 400000,
  priceType: 'fixed',
  inclusions: ['Desi Menu x400', 'Sweet Table', 'Drinks Counter'],
  servicesIncluded: ['Desi Menu (Per Person)'],
  },
  ],
  gallery: [
  {
  url: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop',
  category: 'food',
  caption: 'Wedding buffet setup',
  isCover: true,
  },
  {
  url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop',
  category: 'food',
  caption: 'Fine dining presentation',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
  category: 'food',
  caption: 'Charcoal BBQ platter',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
  category: 'food',
  caption: 'Smoky BBQ live station',
  isCover: false,
  },
  ],
  menu: [
  {
  name: 'Main Course',
  items: [
  { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spicy chicken', unitPrice: 350, minQuantity: 50 },
  { name: 'Chicken Karahi', description: 'Classic desi karahi with fresh tomatoes', unitPrice: 400, minQuantity: 50 },
  { name: 'Mutton Pulao', description: 'Sindhi style mutton pulao', unitPrice: 550, minQuantity: 50 },
  ],
  },
  {
  name: 'BBQ & Kebabs',
  items: [
  { name: 'Chicken Tikka', description: 'Charcoal grilled chicken tikka', unitPrice: 300, minQuantity: 50 },
  { name: 'Seekh Kebab', description: 'Spiced minced beef seekh kebabs', unitPrice: 250, minQuantity: 50 },
  { name: 'Fish Tikka', description: 'River fish tikka, Sukkur special', unitPrice: 450, minQuantity: 50 },
  ],
  },
  {
  name: 'Desserts & Drinks',
  items: [
  { name: 'Gulab Jamun', description: 'Warm gulab jamun with rabri', unitPrice: 100, minQuantity: 50 },
  { name: 'Sindhi Halwa', description: 'Traditional Sindhi halwa with desi ghee', unitPrice: 150, minQuantity: 50 },
  { name: 'Lassi', description: 'Sweet and salty desi lassi', unitPrice: 120, minQuantity: 50 },
  ],
  },
  ],
  },
  {
  user: { name: 'Fatima Zaidi', email: 'lenscraft@seller.demo', phone: '03001234503' },
  profile: {
  businessName: 'LensCraft Studios',
  slug: 'lenscraft-studios',
  category: 'photography-videography',
  subcategories: ['Wedding Photography', 'Candid Photography', 'Cinematic Videography'],
  city: 'Sukkur',
  area: 'Sukkur City',
  address: 'Main Minara Road, Sukkur',
  description:
  'Award-winning candid wedding photographers and cinematic filmmakers. We capture real emotions, not just poses. Full-day coverage with professional gear, drone shots and same-week photo delivery.',
  coverImage:
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop',
  logo: '',
  contactPhone: '03001234503',
  contactEmail: '',
  whatsappNumber: '03001234503',
  socialLinks: {
  instagram: 'https://instagram.com/lenscraftskk',
  youtube: 'https://youtube.com/@lenscraft',
  },
  startingPrice: 25000,
  businessHours: [],
  policies: {
  cancellation: 'Deposit non-refundable within 30 days of event.',
  advancePayment: '40% advance to reserve the date.',
  extraCharges: 'Overnight coverage charged separately.',
  },
  location: { type: 'Point', coordinates: [0, 0] },
  },
  services: [
  {
  name: 'Candid Wedding Photography (Full Day)',
  description: '12-hour candid coverage, 2 photographers, edited album of 500+ photos.',
  price: 85000,
  priceType: 'fixed',
  capacity: null,
  duration: 12,
  inclusions: ['2 Photographers', '500+ Edited Photos', 'Online Gallery', 'Pre-Wedding Session'],
  category: 'photography-videography',
  },
  {
  name: 'Cinematic Wedding Film',
  description: '4K cinematic highlight film (5-7 mins) plus full-day raw coverage.',
  price: 120000,
  priceType: 'fixed',
  capacity: null,
  duration: 12,
  inclusions: ['4K Cinematic Film', 'Drone Coverage', 'Teaser Reel', 'Full Ceremony Coverage'],
  category: 'photography-videography',
  },
  {
  name: 'Pre-Wedding Shoot',
  description: 'Location shoot with outfit changes and professional editing.',
  price: 40000,
  priceType: 'fixed',
  capacity: null,
  duration: 6,
  inclusions: ['2 Outfits', '20 Edited Photos', 'BTS Reel'],
  category: 'photography-videography',
  },
  ],
  packages: [
  {
  name: 'Complete Wedding Package',
  description: 'Photography + cinematography for Shaadi and Barat nights.',
  price: 220000,
  priceType: 'fixed',
  inclusions: ['Full Day Candid Photography', 'Cinematic Film', 'Drone Coverage', 'Teaser Reel', 'Online Gallery'],
  servicesIncluded: ['Candid Wedding Photography (Full Day)', 'Cinematic Wedding Film'],
  },
  ],
  gallery: [
  {
  url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop',
  category: 'photos',
  caption: 'Candid wedding moment',
  isCover: true,
  },
  {
  url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
  category: 'photos',
  caption: 'Bride and groom portrait',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
  category: 'photos',
  caption: 'Shaadi night coverage',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=800&auto=format&fit=crop',
  category: 'photos',
  caption: 'Bridal candid',
  isCover: false,
  },
  ],
  menu: [],
  },
  {
  user: { name: 'Sana Memon', email: 'gulrana@seller.demo', phone: '03001234504' },
  profile: {
  businessName: 'Gul-e-Rana Décor',
  slug: 'gul-e-rana-decor',
  category: 'decoration-styling',
  subcategories: ['Stage Decoration', 'Floral Decor', 'Theme Styling'],
  city: 'Sukkur',
  area: 'Sukkur City',
  address: 'Shahbaz Plaza, Minara Road, Sukkur',
  description:
  'Turning venues into dreamscapes. From pastel Mehndi stages to grand Shaadi entrance gates, our team designs every corner with fresh flowers, premium fabric and elegant lighting.',
  coverImage:
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600&auto=format&fit=crop',
  logo: '',
  contactPhone: '03001234504',
  contactEmail: '',
  whatsappNumber: '03001234504',
  socialLinks: {
  instagram: 'https://instagram.com/gulranadecor',
  },
  startingPrice: 35000,
  businessHours: [],
  policies: {
  cancellation: '30% refund after decor work begins.',
  advancePayment: '50% advance for materials.',
  extraCharges: 'Extra charges for imported flowers on request.',
  },
  location: { type: 'Point', coordinates: [0, 0] },
  },
  services: [
  {
  name: 'Mehndi Stage Decoration',
  description: 'Colorful themed stage with fabric draping, floral accents and swing setup.',
  price: 80000,
  priceType: 'fixed',
  capacity: null,
  duration: null,
  inclusions: ['Stage Setup', 'Fresh Flowers', 'Fabric Draping', 'Swing', 'Lighting'],
  category: 'decoration-styling',
  },
  {
  name: 'Shaadi Stage Decoration',
  description: 'Elegant royal theme stage with luxury backdrop and floral wall.',
  price: 150000,
  priceType: 'fixed',
  capacity: null,
  duration: null,
  inclusions: ['Luxury Stage', 'Floral Wall', 'Backdrop Design', 'LED Lighting'],
  category: 'decoration-styling',
  },
  {
  name: 'Entrance Gate & Walkway',
  description: 'Grand floral entrance gate with LED walkway for the barat.',
  price: 95000,
  priceType: 'fixed',
  capacity: null,
  duration: null,
  inclusions: ['Entrance Gate', 'Floral Arch', 'LED Walkway', 'Side Decor'],
  category: 'decoration-styling',
  },
  ],
  packages: [
  {
  name: 'Complete Decor Package (Shaadi)',
  description: 'Stage, entrance, walkway and venue-wide styling for the Shaadi night.',
  price: 350000,
  priceType: 'fixed',
  inclusions: ['Shaadi Stage', 'Entrance Gate', 'Walkway', 'Venue-Wide Styling', 'Lighting'],
  servicesIncluded: ['Shaadi Stage Decoration', 'Entrance Gate & Walkway'],
  },
  {
  name: 'Mehndi Combo (Stage + Entry)',
  description: 'Complete Mehndi night styling with swing and entry decor.',
  price: 140000,
  priceType: 'fixed',
  inclusions: ['Mehndi Stage', 'Entry Decor', 'Fresh Flowers', 'Lighting'],
  servicesIncluded: ['Mehndi Stage Decoration'],
  },
  ],
  gallery: [
  {
  url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=800&auto=format&fit=crop',
  category: 'decoration',
  caption: 'Mehndi stage design',
  isCover: true,
  },
  {
  url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
  category: 'decoration',
  caption: 'Elegant wedding decor',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
  category: 'decoration',
  caption: 'Reception styling',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=800&auto=format&fit=crop',
  category: 'decoration',
  caption: 'Floral arrangements',
  isCover: false,
  },
  ],
  menu: [],
  },
  {
  user: { name: 'Mehak Soomro', email: 'mehakbeauty@seller.demo', phone: '03001234505' },
  profile: {
  businessName: 'Mehak Beauty Lounge',
  slug: 'mehak-beauty-lounge',
  category: 'beauty-makeup',
  subcategories: ['Bridal Makeup', 'Hair Styling', 'Mehndi Artist'],
  city: 'Sukkur',
  area: 'Airport Road',
  address: 'Airport Road, near Gul Plaza, Sukkur',
  description:
  'Professional bridal makeup and styling by certified artists. HD makeup, saree draping, hair styling and on-location bridal services across Sukkur. Home service available.',
  coverImage:
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1600&auto=format&fit=crop',
  logo: '',
  contactPhone: '03001234505',
  contactEmail: '',
  whatsappNumber: '03001234505',
  socialLinks: {
  instagram: 'https://instagram.com/mehakbeauty',
  },
  startingPrice: 15000,
  businessHours: [],
  policies: {
  cancellation: 'Deposit non-refundable within 48 hours of booking.',
  advancePayment: '50% advance to confirm.',
  extraCharges: 'Home service charges extra (transport).',
  },
  location: { type: 'Point', coordinates: [0, 0] },
  },
  services: [
  {
  name: 'Bridal Makeup (HD)',
  description: 'Premium HD bridal makeup with trial session and touch-up kit.',
  price: 35000,
  priceType: 'fixed',
  capacity: null,
  duration: 4,
  inclusions: ['HD Makeup', 'Trial Session', 'Lashes', 'Touch-Up Kit'],
  category: 'beauty-makeup',
  },
  {
  name: 'Mehndi Night Makeup',
  description: 'Colorful mehndi night look with sparkle accents.',
  price: 15000,
  priceType: 'fixed',
  capacity: null,
  duration: 3,
  inclusions: ['Makeup', 'Hairstyling', 'Mehndi Touches'],
  category: 'beauty-makeup',
  },
  {
  name: 'Hair Styling & Draping',
  description: 'Professional hairstyle, dupatta draping and jewelry setting.',
  price: 8000,
  priceType: 'fixed',
  capacity: null,
  duration: 2,
  inclusions: ['Hairstyle', 'Draping', 'Jewelry Setting'],
  category: 'beauty-makeup',
  },
  ],
  packages: [
  {
  name: 'Bridal Complete (Makeup + Styling)',
  description: 'Full bridal look for Shaadi night — makeup, hair, draping.',
  price: 50000,
  priceType: 'fixed',
  inclusions: ['HD Bridal Makeup', 'Hair Styling', 'Draping', 'Touch-Up Kit'],
  servicesIncluded: ['Bridal Makeup (HD)', 'Hair Styling & Draping'],
  },
  ],
  gallery: [
  {
  url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'Bridal makeup look',
  isCover: true,
  },
  {
  url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'Makeup session',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'Mehndi design detail',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'Bridal styling',
  isCover: false,
  },
  ],
  menu: [],
  },
  {
  user: { name: 'Bilal Chandio', email: 'shaamebarat@seller.demo', phone: '03001234506' },
  profile: {
  businessName: 'Shaam-e-Barat Entertainment',
  slug: 'shaam-e-barat-entertainment',
  category: 'music-entertainment',
  subcategories: ['Live Bands', 'DJ Services', 'Dhol Players'],
  city: 'Sukkur',
  area: 'Band Road',
  address: 'Band Road, Sukkur',
  description:
  'Full entertainment setup for your events — live wedding bands, professional DJs with light shows, and traditional dhol players who keep the baraat alive.',
  coverImage:
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop',
  logo: '',
  contactPhone: '03001234506',
  contactEmail: '',
  whatsappNumber: '03001234506',
  socialLinks: {
  instagram: 'https://instagram.com/shaamebarat',
  },
  startingPrice: 20000,
  businessHours: [],
  policies: {
  cancellation: 'Deposit non-refundable within 7 days of event.',
  advancePayment: '30% advance to book the date.',
  extraCharges: 'Extra hour charges apply after contracted time.',
  },
  location: { type: 'Point', coordinates: [0, 0] },
  },
  services: [
  {
  name: 'Live Wedding Band (4 Hours)',
  description: '5-member live band — classical, modern and dhol beats.',
  price: 80000,
  priceType: 'fixed',
  capacity: null,
  duration: 4,
  inclusions: ['5 Musicians', 'Sound System', 'Vocalist'],
  category: 'music-entertainment',
  },
  {
  name: 'DJ + Light Show (Night)',
  description: 'Professional DJ with LED light show and smoke effects.',
  price: 45000,
  priceType: 'fixed',
  capacity: null,
  duration: 6,
  inclusions: ['DJ Setup', 'LED Lights', 'Smoke Machine', 'Sound System'],
  category: 'music-entertainment',
  },
  {
  name: 'Dhol Players (Barat)',
  description: 'Traditional dhol players to lead the barat procession.',
  price: 15000,
  priceType: 'fixed',
  capacity: null,
  duration: 3,
  inclusions: ['2 Dhol Players', 'Traditional Attire'],
  category: 'music-entertainment',
  },
  ],
  packages: [
  {
  name: 'Barat Entertainment Package',
  description: 'Dhol at home, band at venue, DJ for the night.',
  price: 130000,
  priceType: 'fixed',
  inclusions: ['Dhol Players', 'Live Band (4h)', 'DJ + Light Show', 'Sound System'],
  servicesIncluded: ['Live Wedding Band (4 Hours)', 'DJ + Light Show (Night)', 'Dhol Players (Barat)'],
  },
  ],
  gallery: [
  {
  url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'Live wedding band',
  isCover: true,
  },
  {
  url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'DJ night show',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'Concert lighting',
  isCover: false,
  },
  {
  url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1600&auto=format&fit=crop',
  thumbnailUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop',
  category: 'other',
  caption: 'Stage performance',
  isCover: false,
  },
  ],
  menu: [],
  },
];

export const seedDemoSellers = async () => {
  for (const demo of demoSellers) {
  let user = await User.findOne({ email: demo.user.email });

  if (user) {
  const existingProfile = user.sellerProfileId
  ? await SellerProfile.findById(user.sellerProfileId)
  : null;

  if (existingProfile) {
  await MenuItem.deleteMany({ sellerId: existingProfile._id });
  await MenuCategory.deleteMany({ sellerId: existingProfile._id });
  await GalleryImage.deleteMany({ sellerId: existingProfile._id });
  await Package.deleteMany({ sellerId: existingProfile._id });
  await Service.deleteMany({ sellerId: existingProfile._id });
  await existingProfile.deleteOne();
  }
  await User.deleteOne({ _id: user._id });
  }

  user = await User.create({
  name: demo.user.name,
  email: demo.user.email,
  phone: demo.user.phone,
  password: DEMO_PASSWORD,
  role: 'seller',
  city: 'Sukkur',
  isEmailVerified: true,
  });

  const profile = await SellerProfile.create({
  userId: user._id,
  ...demo.profile,
  onboardingStep: 6,
  onboardingCompleted: true,
  verificationStatus: 'verified',
  status: 'approved',
  });

  await User.findByIdAndUpdate(user._id, { sellerProfileId: profile._id });

  for (const svc of demo.services) {
  await Service.create({ sellerId: profile._id, ...svc });
  }

  const serviceDocs = await Service.find({ sellerId: profile._id }).lean();

  for (const pkg of demo.packages) {
  const servicesIncluded = pkg.servicesIncluded
  .map((name) => serviceDocs.find((s) => s.name === name)?._id)
  .filter(Boolean);
  await Package.create({ sellerId: profile._id, ...pkg, servicesIncluded });
  }

  for (const img of demo.gallery) {
  await GalleryImage.create({ sellerId: profile._id, ...img });
  }

  if (demo.menu) {
  for (const mc of demo.menu) {
  const category = await MenuCategory.create({
  sellerId: profile._id,
  name: mc.name,
  });
  for (const item of mc.items) {
  await MenuItem.create({
  sellerId: profile._id,
  menuCategoryId: category._id,
  ...item,
  });
  }
  }
  }

  console.log(`[seed] Seller created: ${demo.profile.businessName}`);
  }

  console.log(`[seed] Demo seller password for all demo accounts: ${DEMO_PASSWORD}`);
};