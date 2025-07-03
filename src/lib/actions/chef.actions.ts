'use server';

import { User, StatusObject } from '@/lib/types';

// Mock data for chefs
const MOCK_CHEFS: (User & { 
  dishCount: number; 
  averageRating: number; 
  experienceYears: number;
  bio?: string;
  coverImage?: string;
  status?: StatusObject;
})[] = [
  {
    id: '1',
    name: 'Chef Ahmed',
    email: 'ahmed@example.com',
    imageUrl: '/images/chefs/chef1.jpg',
    role: 'chef',
    bio: 'Specializes in Middle Eastern cuisine with over 10 years of experience',
    dishCount: 15,
    averageRating: 4.8,
    experienceYears: 10,
    coverImage: '/images/chefs/cover1.jpg',
    status: {
      id: '1',
      type: 'image',
      imageUrl: '/images/chefs/chef1.jpg',
      caption: 'Available now!',
      createdAt: new Date().toISOString()
    }
  },
  {
    id: '2',
    name: 'Chef Sarah',
    email: 'sarah@example.com',
    imageUrl: '/images/chefs/chef2.jpg',
    role: 'chef',
    bio: 'Expert in Italian cuisine and pastry',
    dishCount: 12,
    averageRating: 4.9,
    experienceYears: 8,
    coverImage: '/images/chefs/cover2.jpg',
    status: {
      id: '2',
      type: 'image',
      imageUrl: '/images/chefs/chef2.jpg',
      caption: 'Busy right now',
      createdAt: new Date().toISOString()
    }
  },
  {
    id: '3',
    name: 'Chef Michael',
    email: 'michael@example.com',
    imageUrl: '/images/chefs/chef3.jpg',
    role: 'chef',
    bio: 'Master of Asian fusion cuisine',
    dishCount: 20,
    averageRating: 4.7,
    experienceYears: 12,
    coverImage: '/images/chefs/cover3.jpg',
    status: {
      id: '3',
      type: 'image',
      imageUrl: '/images/chefs/chef3.jpg',
      caption: 'Available now!',
      createdAt: new Date().toISOString()
    }
  },
  {
    id: '4',
    name: 'Chef Maria',
    email: 'maria@example.com',
    imageUrl: '/images/chefs/chef4.jpg',
    role: 'chef',
    bio: 'Specializes in Mediterranean and healthy dishes',
    dishCount: 18,
    averageRating: 4.9,
    experienceYears: 9,
    coverImage: '/images/chefs/cover4.jpg',
    status: {
      id: '4',
      type: 'image',
      imageUrl: '/images/chefs/chef4.jpg',
      caption: 'Available now!',
      createdAt: new Date().toISOString()
    }
  }
];

export async function getChefs() {
  try {
    // In a real app, you would fetch from your database:
    // const chefs = await prisma.user.findMany({ where: { role: 'CHEF' } });
    
    // For now, return mock data
    return MOCK_CHEFS;
  } catch (error) {
    console.error('Error fetching chefs:', error);
    return [];
  }
}
