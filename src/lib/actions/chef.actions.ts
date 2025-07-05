'use server';

import { User, StatusObject } from '@/lib/types';
import { getUsers, getDishes } from '@/lib/db';

/* Mock data for chefs (legacy - kept for reference) 
// NOTE: Removed mocked chefs. We'll fetch real chefs from the local JSON DB via getUsers.
// If no chefs are found, the caller should handle displaying an appropriate message. 
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
]; */

export async function getChefs() {
  // Fetch users and dishes from the JSON "database"
  const users = await getUsers();
  const dishes = await getDishes();

  // Select only users with role 'chef'
  const chefs = users.filter(u => u.role === 'chef');

  // Map each chef to include stats (dishCount, averageRating)
  const chefsWithStats = chefs.map((chef) => {
    const chefDishes = dishes.filter(d => d.chefId === chef.id);
    const dishCount = chefDishes.length;

    // Calculate average rating across all dishes
    let ratingSum = 0;
    let ratingCount = 0;
    chefDishes.forEach(d => {
      d.ratings?.forEach(r => {
        ratingSum += r.rating;
        ratingCount += 1;
      });
    });
    const averageRating = ratingCount ? ratingSum / ratingCount : 0;

    return {
      ...chef,
      dishCount,
      averageRating,
    } as User & { dishCount: number; averageRating: number; };
  });

  return chefsWithStats;
}

