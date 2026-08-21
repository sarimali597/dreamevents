import { Router } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/database.js';
import { Category } from '../models/Category.js';
import { City } from '../models/City.js';
import { User } from '../models/User.js';
import { SellerProfile } from '../models/SellerProfile.js';
import { Service } from '../models/Service.js';
import bcrypt from 'bcryptjs';

const CATEGORIES = [
  {
    name: 'Venues',
    slug: 'venues',
    description: 'Marriage halls, banquet halls, farmhouses, and event spaces in Sukkur.',
    icon: 'Building',
    sortOrder: 1,
    image: 'https://images.unsplash.com/photo-1519168352803-424f79758be6?w=800&q=80',
    subcategories: [
      { name: 'Marriage Hall', slug: 'marriage-hall' },
      { name: 'Banquet Hall', slug: 'banquet-hall' },
      { name: 'Farmhouse', slug: 'farmhouse' },
      { name: 'Restaurant Event Space', slug: 'restaurant-event-space' },
    ],
    filters: [
      { key: 'indoor', label: 'Indoor', type: 'boolean' },
      { key: 'outdoor', label: 'Outdoor', type: 'boolean' },
      { key: 'parking', label: 'Parking', type: 'boolean' },
      { key: 'ac', label: 'Air Conditioning', type: 'boolean' },
    ],
  },
  {
    name: 'Catering',
    slug: 'catering',
    description: 'Full-service caterers, home chefs, and buffet providers for your events.',
    icon: 'ChefHat',
    sortOrder: 2,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb562c6b?w=800&q=80',
    subcategories: [
      { name: 'Full-Service', slug: 'full-service' },
      { name: 'Home-Chef Scale', slug: 'home-chef-scale' },
      { name: 'Buffet', slug: 'buffet' },
      { name: 'Plated', slug: 'plated' },
    ],
    filters: [
      { key: 'cuisineType', label: 'Cuisine Type', type: 'multiselect', options: ['Desi', 'Chinese', 'Continental', 'BBQ'] },
      { key: 'vegOnly', label: 'Vegetarian Only', type: 'boolean' },
      { key: 'liveCooking', label: 'Live Cooking Station', type: 'boolean' },
    ],
  },
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Wedding photographers, videographers, and drone operators across Sukkur.',
    icon: 'Camera',
    sortOrder: 3,
    image: 'https://images.unsplash.com/photo-1452780212940-6f56833f6975?w=800&q=80',
    subcategories: [
      { name: 'Wedding Photographer', slug: 'wedding-photographer' },
      { name: 'Videographer', slug: 'videographer' },
      { name: 'Drone Operator', slug: 'drone-operator' },
    ],
    filters: [
      { key: 'drone', label: 'Drone Coverage', type: 'boolean' },
      { key: 'album', label: 'Photo Album Included', type: 'boolean' },
      { key: 'sameDayEdit', label: 'Same-Day Edit', type: 'boolean' },
    ],
  },
  {
    name: 'Decoration',
    slug: 'decoration',
    description: 'Floral decoration, stage design, lighting, and theme-based decor for your event.',
    icon: 'Sparkles',
    sortOrder: 4,
    image: 'https://images.unsplash.com/photo-1532129428107-1b9a32757a90?w=800&q=80',
    subcategories: [
      { name: 'Floral', slug: 'floral' },
      { name: 'Stage', slug: 'stage' },
      { name: 'Lighting', slug: 'lighting' },
      { name: 'Entrance', slug: 'entrance' },
      { name: 'Theme-Based', slug: 'theme-based' },
    ],
    filters: [
      { key: 'floral', label: 'Floral Decoration', type: 'boolean' },
      { key: 'stage', label: 'Stage Decoration', type: 'boolean' },
      { key: 'lighting', label: 'Lighting Setup', type: 'boolean' },
    ],
  },
];

const CITIES = [
  {
    name: 'Sukkur',
    slug: 'sukkur',
    displayName: 'Sukkur, Sindh',
    sortOrder: 1,
    areas: [
      { name: 'Saddar', slug: 'saddar' },
      { name: 'Military Road', slug: 'military-road' },
      { name: 'Barrage Colony', slug: 'barrage-colony' },
      { name: 'Shalimar', slug: 'shalimar' },
      { name: 'Minara Road', slug: 'minara-road' },
      { name: 'New Sukkur', slug: 'new-sukkur' },
      { name: 'Rohri Road', slug: 'rohri-road' },
    ],
  },
];

const SELLERS = [
  {
    businessName: 'Al-Noor Marriage Hall',
    category: 'venues',
    city: 'sukkur',
    area: 'saddar',
    address: '98, Civil Lines, near District Courts, Sukkur',
    description: 'Spacious air-conditioned marriage hall with capacity for 300+ guests. Features a grand stage, separate bridal room, and full generator backup.',
    coverImage: 'https://images.unsplash.com/photo-1519168352803-424f79758be6?w=1200&q=80',
    contactPhone: '+92 333 1234567',
    startingPrice: 85000,
    rating: 4.7,
    reviewCount: 28,
    verificationStatus: 'verified',
    status: 'approved',
    isFeatured: true,
    socialLinks: { facebook: 'https://facebook.com/alnoor', whatsapp: '+92 333 1234567' },
    subcategories: ['marriage-hall', 'banquet-hall'],
  },
  {
    businessName: 'Shaadi Catering Co.',
    category: 'catering',
    city: 'sukkur',
    area: 'military-road',
    address: '12-A, Military Road, Sukkur',
    description: 'Professional wedding catering with 12 years of experience. We handle everything from menu planning to on-site service for up to 500 guests.',
    coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb562c6b?w=1200&q=80',
    contactPhone: '+92 300 9876543',
    startingPrice: 1200,
    rating: 4.9,
    reviewCount: 42,
    verificationStatus: 'verified',
    status: 'approved',
    isFeatured: true,
    socialLinks: { instagram: 'https://instagram.com/shadificatering', whatsapp: '+92 300 9876543' },
    subcategories: ['full-service', 'buffet'],
  },
  {
    businessName: 'Lens & Light Studio',
    category: 'photography',
    city: 'sukkur',
    area: 'minara-road',
    address: '45, Minara Road, Sukkur',
    description: 'Award-winning wedding photography and videography studio. Drone coverage available for grand venues.',
    coverImage: 'https://images.unsplash.com/photo-1452780212940-6f56833f6975?w=1200&q=80',
    contactPhone: '+92 321 5556666',
    startingPrice: 35000,
    rating: 4.8,
    reviewCount: 19,
    verificationStatus: 'verified',
    status: 'approved',
    isFeatured: true,
    socialLinks: {
      instagram: 'https://instagram.com/lensandlight',
      facebook: 'https://facebook.com/lensandlight',
      whatsapp: '+92 321 5556666',
    },
    subcategories: ['wedding-photographer', 'videographer', 'drone-operator'],
  },
  {
    businessName: 'Mehndi Magic',
    category: 'decoration',
    city: 'sukkur',
    area: 'barrage-colony',
    address: '78-B, Barrage Colony, Sukkur',
    description: 'Specialized in mehndi and bridal decoration. Floral arches, jaali work, fairy lights, and theme-based decor.',
    coverImage: 'https://images.unsplash.com/photo-1532129428107-1b9a32757a90?w=1200&q=80',
    contactPhone: '+92 331 4447777',
    startingPrice: 25000,
    rating: 4.5,
    reviewCount: 14,
    verificationStatus: 'verified',
    status: 'approved',
    isFeatured: false,
    socialLinks: { instagram: 'https://instagram.com/mehndimagic', whatsapp: '+92 331 4447777' },
    subcategories: ['floral', 'stage', 'lighting', 'entrance', 'theme-based'],
  },
  {
    businessName: 'Grand Palace Banquet',
    category: 'venues',
    city: 'sukkur',
    area: 'new-sukkur',
    address: '200, New Sukkur Bypass, Sukkur',
    description: 'Ultra-modern banquet hall with panoramic views of the Indus River. Capacity 500 guests. Premium finishes and state-of-the-art sound and lighting.',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    contactPhone: '+92 345 1112222',
    startingPrice: 150000,
    rating: 4.9,
    reviewCount: 35,
    verificationStatus: 'verified',
    status: 'approved',
    isFeatured: true,
    socialLinks: { facebook: 'https://facebook.com/grandpalace', whatsapp: '+92 345 1112222' },
    subcategories: ['banquet-hall', 'marriage-hall'],
  },
  {
    businessName: 'Apna Kitchen Catering',
    category: 'catering',
    city: 'sukkur',
    area: 'rohri-road',
    address: '55, Rohri Road, Sukkur',
    description: 'Home-style catering with a professional touch. Perfect for intimate weddings, mehndis, and family gatherings.',
    coverImage: 'https://images.unsplash.com/photo-1543362906-ac4b1cdeb653?w=1200&q=80',
    contactPhone: '+92 300 3334444',
    startingPrice: 800,
    rating: 4.4,
    reviewCount: 22,
    verificationStatus: 'verified',
    status: 'approved',
    isFeatured: false,
    socialLinks: { whatsapp: '+92 300 3334444' },
    subcategories: ['full-service', 'home-chef-scale'],
  },
  {
    businessName: 'Royal Rides Entertainment',
    category: 'photography',
    city: 'sukkur',
    area: 'shalimar',
    address: '12, Shalimar Housing Scheme, Sukkur',
    description: 'Complete event photography and videography package with professional equipment and experienced team.',
    coverImage: 'https://images.unsplash.com/photo-1510703923078-e80f67454322?w=1200&q=80',
    contactPhone: '+92 333 7778888',
    startingPrice: 28000,
    rating: 4.3,
    reviewCount: 11,
    verificationStatus: 'verified',
    status: 'approved',
    isFeatured: false,
    socialLinks: { instagram: 'https://instagram.com/royalarives', whatsapp: '+92 333 7778888' },
    subcategories: ['wedding-photographer', 'videographer'],
  },
];

export async function runSeed() {
  // Categories
  for (const cat of CATEGORIES) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) continue;
    await Category.create(cat);
  }

  // Cities
  for (const city of CITIES) {
    const existing = await City.findOne({ slug: city.slug });
    if (existing) continue;
    await City.create(city);
  }

  // Sellers
  for (const s of SELLERS) {
    const slug = s.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await SellerProfile.findOne({ slug });
    if (existing) continue;

    const email = `seller-${slug}@dreamevents.local`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: await bcrypt.hash('Seller@123456', 12),
        name: s.businessName,
        role: 'seller',
        city: 'Sukkur',
        notificationPreferences: { email: true, inApp: true },
      });
    }

    await SellerProfile.create({
      ...s,
      userId: user._id,
      slug,
    });

    const profile = await SellerProfile.findOne({ slug });
    const services = [
      { name: 'Standard Package', price: s.startingPrice, inclusions: ['Professional service', 'Quality materials'] },
      { name: 'Premium Package', price: s.startingPrice + 20000, inclusions: ['Premium service', 'Quality materials', 'Extended coverage'] },
    ];
    for (const svc of services) {
      await Service.create({
        sellerId: profile._id,
        name: svc.name,
        price: svc.price,
        priceType: 'fixed',
        inclusions: svc.inclusions,
        category: s.category,
        isActive: true,
        sortOrder: 1,
      });
    }
  }

  return {
    categories: CATEGORIES.length,
    cities: CITIES.length,
    sellers: SELLERS.length,
  };
}
