import mongoose from 'mongoose';
// FIXED — removed bcrypt import; pre-save hook in User model handles hashing
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import User from '../models/User.js';
import Event from '../models/Event.js';
import Listing from '../models/Listing.js';
import Notification from '../models/Notification.js';
import SquadPost from '../models/SquadPost.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Listing.deleteMany({});
    await Notification.deleteMany({});
    await SquadPost.deleteMany({});
    console.log('Cleared existing data');

    // FIXED — pass plain-text password; User model pre-save hook will hash it
    // Previous code used bcrypt.hash() here which caused DOUBLE hashing
    const passwordHash = 'password123';

    const usersData = [
      { name: 'Arjun Mehta', email: 'arjun@sharemate.com', role: 'organizer', bio: 'Community organizer passionate about sustainability.', stats: { eventsOrganized: 12, eventsJoined: 25, resourcesShared: 8, hoursVolunteered: 120, rating: 4.8, impactScore: 95 }, badges: [{ id: 'first_event', name: 'First Event' }, { id: 'super_volunteer', name: 'Super Volunteer' }, { id: 'community_champion', name: 'Community Champion' }] },
      { name: 'Priya Sharma', email: 'priya@sharemate.com', role: 'organizer', bio: 'Teacher and volunteer. Loves helping communities grow.', stats: { eventsOrganized: 8, eventsJoined: 30, resourcesShared: 15, hoursVolunteered: 95, rating: 4.9, impactScore: 88 }, badges: [{ id: 'first_event', name: 'First Event' }, { id: 'resource_hero', name: 'Resource Hero' }] },
      { name: 'Rahul Verma', email: 'rahul@sharemate.com', role: 'user', bio: 'Software dev who volunteers on weekends.', stats: { eventsJoined: 15, hoursVolunteered: 60, impactScore: 55 }, badges: [{ id: 'first_event', name: 'First Event' }] },
      { name: 'Ananya Patel', email: 'ananya@sharemate.com', role: 'organizer', bio: 'Environmental activist and tree planting enthusiast.', stats: { eventsOrganized: 6, eventsJoined: 20, resourcesShared: 10, hoursVolunteered: 85, impactScore: 72 }, badges: [{ id: 'first_event', name: 'First Event' }, { id: 'connector', name: 'Connector' }] },
      { name: 'Vikram Singh', email: 'vikram@sharemate.com', role: 'user', bio: 'Fitness trainer offering free coaching to youth.', stats: { eventsJoined: 18, hoursVolunteered: 70, impactScore: 62 } },
      { name: 'Sneha Gupta', email: 'sneha@sharemate.com', role: 'user', bio: 'Art teacher sharing creative workshops.', stats: { eventsJoined: 12, resourcesShared: 5, hoursVolunteered: 45, impactScore: 40 } },
      { name: 'Karan Joshi', email: 'karan@sharemate.com', role: 'user', bio: 'College student passionate about education.', stats: { eventsJoined: 8, hoursVolunteered: 30, impactScore: 28 } },
      { name: 'Meera Reddy', email: 'meera@sharemate.com', role: 'admin', bio: 'ShareMate community admin.', stats: { eventsOrganized: 4, eventsJoined: 22, hoursVolunteered: 100, impactScore: 85 }, badges: [{ id: 'community_champion', name: 'Community Champion' }] },
      { name: 'Aditya Kumar', email: 'aditya@sharemate.com', role: 'user', bio: 'Chef sharing meals with those in need.', stats: { eventsJoined: 10, resourcesShared: 20, hoursVolunteered: 55, impactScore: 48 } },
      { name: 'Riya Nair', email: 'riya@sharemate.com', role: 'user', bio: 'Healthcare worker promoting wellness in communities.', stats: { eventsJoined: 14, hoursVolunteered: 65, impactScore: 58 } },
    ];

    const users = [];
    for (const userData of usersData) {
      const user = new User({
        ...userData,
        passwordHash,
        isVerified: true,
        location: { type: 'Point', coordinates: [77.209 + (Math.random() - 0.5) * 0.1, 28.6139 + (Math.random() - 0.5) * 0.1], address: 'New Delhi, India' },
      });
      // Skip the pre-save hook by setting isModified to avoid re-hashing
      await user.save();
      users.push(user);
    }
    console.log(`Created ${users.length} users`);

    // Create events
    const eventsData = [
      { title: 'Community Garden Spring Cleanup', description: 'Join us for our annual spring cleanup at the community garden. We\'ll be weeding, planting new vegetables, and beautifying our shared green space. All tools provided, just bring your enthusiasm!', category: 'environment', dateTime: new Date(Date.now() + 3 * 86400000), duration: 180, capacity: 30, urgency: 'medium', tags: ['gardening', 'outdoor', 'spring'] },
      { title: 'Charity Food Drive — Feed 500 Families', description: 'Help us collect and distribute food packages to 500 underprivileged families in the Delhi NCR area. Volunteers needed for collection, sorting, packing, and distribution.', category: 'charity', dateTime: new Date(Date.now() + 5 * 86400000), duration: 360, capacity: 80, urgency: 'high', tags: ['food', 'charity', 'families'] },
      { title: 'Youth Coding Bootcamp', description: 'Free 4-hour coding workshop for teenagers aged 13-18. Learn web development basics including HTML, CSS, and JavaScript. Laptops provided for those who need them.', category: 'education', dateTime: new Date(Date.now() + 7 * 86400000), duration: 240, capacity: 25, urgency: 'low', tags: ['coding', 'youth', 'technology'] },
      { title: 'Senior Citizens Health Walk', description: 'Weekly health walk for senior citizens around Lodhi Garden. Includes warm-up exercises, guided walking, and a cool-down stretching session. Medical support available.', category: 'health', dateTime: new Date(Date.now() + 2 * 86400000), duration: 90, capacity: 40, urgency: 'low', tags: ['health', 'seniors', 'walking'] },
      { title: 'Neighborhood Tree Plantation Drive', description: 'Plant 200 trees in our neighborhood! We\'ll be planting native species along the main road and park area. Saplings and tools provided. Let\'s make our area greener!', category: 'environment', dateTime: new Date(Date.now() + 10 * 86400000), duration: 300, capacity: 50, urgency: 'medium', tags: ['trees', 'planting', 'green'] },
      { title: 'Community Sports Day', description: 'Annual sports day with cricket, football, badminton, and track events for all ages. Prizes for winners! Food and drinks provided.', category: 'sports', dateTime: new Date(Date.now() + 14 * 86400000), duration: 480, capacity: 100, urgency: 'low', tags: ['sports', 'competition', 'fun'] },
      { title: 'Blood Donation Camp', description: 'Emergency blood donation camp in partnership with Red Cross. Every unit of blood can save up to 3 lives. Walk in or register on the app. Refreshments provided.', category: 'health', dateTime: new Date(Date.now() + 4 * 86400000), duration: 360, capacity: 200, urgency: 'high', tags: ['blood', 'donation', 'emergency'] },
      { title: 'Art Workshop: Watercolor Basics', description: 'Learn watercolor painting from scratch! This beginner-friendly workshop covers color theory, brush techniques, and composing your first landscape. All materials provided.', category: 'arts', dateTime: new Date(Date.now() + 8 * 86400000), duration: 180, capacity: 20, urgency: 'low', tags: ['art', 'watercolor', 'creative'] },
      { title: 'Clothes Donation & Sorting Drive', description: 'Donate your gently used clothes and help sort/pack them for distribution to shelters across Delhi. Accepting winter wear, casual clothes, and school uniforms.', category: 'charity', dateTime: new Date(Date.now() + 6 * 86400000), duration: 240, capacity: 35, urgency: 'medium', tags: ['clothes', 'charity', 'donation'] },
      { title: 'Community Literacy Program', description: 'Weekly sessions teaching reading and writing to adults and children in underserved areas. Volunteers needed for one-on-one tutoring. Training provided for new volunteers.', category: 'education', dateTime: new Date(Date.now() + 9 * 86400000), duration: 120, capacity: 15, urgency: 'medium', tags: ['literacy', 'education', 'volunteer'] },
      { title: 'River Cleanup Challenge', description: 'Join the challenge to clean up a 2km stretch of the Yamuna riverbank. Gloves, bags, and safety equipment provided. Together we can make a visible difference!', category: 'environment', dateTime: new Date(Date.now() + 12 * 86400000), duration: 240, capacity: 60, urgency: 'high', tags: ['river', 'cleanup', 'challenge'] },
      { title: 'Free Yoga & Meditation Session', description: 'Open-air yoga and guided meditation session at the central park. Suitable for all levels. Bring your own mat or borrow one from us. Start your morning right!', category: 'health', dateTime: new Date(Date.now() + 1 * 86400000), duration: 90, capacity: 50, urgency: 'low', tags: ['yoga', 'meditation', 'wellness'] },
      { title: 'Music for Charity Concert', description: 'Live music concert featuring local bands to raise funds for children\'s education. Entry is free, donations welcome. Food stalls and activities for kids.', category: 'arts', dateTime: new Date(Date.now() + 15 * 86400000), duration: 300, capacity: 150, urgency: 'low', tags: ['music', 'concert', 'charity'] },
      { title: 'Community Kitchen Day', description: 'Cook and serve meals for 200 people at the community center. Ingredients provided. We need cooks, servers, and cleanup volunteers.', category: 'charity', dateTime: new Date(Date.now() + 3 * 86400000), duration: 300, capacity: 40, urgency: 'high', tags: ['cooking', 'meals', 'serve'] },
      { title: 'Women\'s Self-Defense Workshop', description: 'Free self-defense workshop for women and girls. Learn practical defense techniques from professional martial arts instructors. All skill levels welcome.', category: 'community', dateTime: new Date(Date.now() + 11 * 86400000), duration: 180, capacity: 30, urgency: 'medium', tags: ['self-defense', 'women', 'safety'] },
      { title: 'Pet Adoption Fair', description: 'Find your furry friend! We\'re hosting an adoption fair with rescued dogs and cats. Veterinary checkups and vaccinations done. Come meet your next best friend.', category: 'community', dateTime: new Date(Date.now() + 13 * 86400000), duration: 360, capacity: 100, urgency: 'low', tags: ['pets', 'adoption', 'animals'] },
      { title: 'Tech Repair Cafe', description: 'Bring your broken electronics — phones, laptops, appliances — and our volunteer technicians will try to fix them for free! Reduce waste, repair instead of replace.', category: 'community', dateTime: new Date(Date.now() + 6 * 86400000), duration: 240, capacity: 25, urgency: 'low', tags: ['repair', 'electronics', 'sustainability'] },
      { title: 'Book Exchange Festival', description: 'Bring books you\'ve read and exchange them with others. Fiction, non-fiction, children\'s books — all genres welcome. Let\'s keep books circulating!', category: 'education', dateTime: new Date(Date.now() + 4 * 86400000), duration: 180, capacity: 45, urgency: 'low', tags: ['books', 'exchange', 'reading'] },
      { title: 'Marathon for Mental Health', description: '5K fun run/walk to raise awareness about mental health. T-shirts to all participants. Professional counselors will be available for conversations. No registration fee.', category: 'health', dateTime: new Date(Date.now() + 16 * 86400000), duration: 180, capacity: 200, urgency: 'medium', tags: ['marathon', 'mental-health', 'running'] },
      { title: 'Community Movie Night', description: 'Outdoor movie screening under the stars! Bringing the neighborhood together for a fun evening. Popcorn and beverages provided. Bring your blankets!', category: 'community', dateTime: new Date(Date.now() + 7 * 86400000), duration: 180, capacity: 80, urgency: 'low', tags: ['movie', 'outdoor', 'fun'] },
    ];

    const addresses = [
      'Connaught Place, New Delhi', 'Lodhi Garden, Delhi', 'Hauz Khas Village, Delhi',
      'Nehru Park, Delhi', 'India Gate Lawns, Delhi', 'Janpath Road, Delhi',
      'Saket Community Center, Delhi', 'R.K. Puram Park, Delhi', 'Vasant Kunj, Delhi',
      'Dwarka Sector 10, Delhi', 'Green Park Market, Delhi', 'Lajpat Nagar, Delhi',
      'Rajouri Garden, Delhi', 'Karol Bagh, Delhi', 'Defence Colony, Delhi',
      'GK-1 M Block Market, Delhi', 'Malviya Nagar, Delhi', 'Sarojini Nagar, Delhi',
      'Chanakyapuri, Delhi', 'Safdarjung Enclave, Delhi',
    ];

    const events = [];
    for (let i = 0; i < eventsData.length; i++) {
      const org = users[i % 4]; // First 4 users are organizers
      const participants = users.slice(4, 4 + Math.floor(Math.random() * 6) + 2).map(u => u._id);
      const event = new Event({
        ...eventsData[i],
        organizer: org._id,
        participants,
        location: {
          address: addresses[i],
          type: 'Point',
          coordinates: [77.209 + (Math.random() - 0.5) * 0.08, 28.6139 + (Math.random() - 0.5) * 0.08],
        },
      });
      await event.save();
      events.push(event);
    }
    console.log(`Created ${events.length} events`);

    // Create listings
    const listingsData = [
      { type: 'share', title: 'Power Drill & Tool Set', category: 'tools', description: 'Professional-grade power drill with 50-piece bit set. Available for weekend borrowing. Well-maintained and in great condition.' },
      { type: 'give', title: 'Children\'s Books Collection', category: 'books', description: 'Box of 25+ children\'s books for ages 5-12. Mix of English and Hindi. Great condition, some barely read.' },
      { type: 'take', title: 'Need a Sewing Machine', category: 'electronics', description: 'Starting a community tailoring class for women. Looking for a working sewing machine, even if old. Will put it to great use!' },
      { type: 'share', title: 'Projector for Events', category: 'electronics', description: 'Full HD projector with 100-inch screen. Perfect for movie nights, presentations, or community events. Available on weekends.' },
      { type: 'give', title: 'Winter Clothes Bundle', category: 'clothing', description: 'Assorted winter clothes — 3 jackets, 5 sweaters, scarves, and gloves. Good condition, various sizes. Prefer giving to families in need.' },
      { type: 'share', title: 'Community Cooking Pots (50L)', category: 'tools', description: 'Two large 50-liter cooking pots for community kitchens and events. Stainless steel, great condition.' },
      { type: 'give', title: 'Office Desk & Chair', category: 'furniture', description: 'Sturdy wooden desk with drawers and ergonomic chair. Moving to a smaller place. Free for pickup.' },
      { type: 'take', title: 'Looking for Gardening Tools', category: 'tools', description: 'Starting a community garden plot. Need basic tools: shovel, rake, hoe, watering can. Borrowing or donation welcome!' },
      { type: 'share', title: 'Guitar for Music Lessons', category: 'electronics', description: 'Acoustic guitar available for borrowing. Teaching free music lessons to interested youth on Sundays.' },
      { type: 'give', title: 'Rice & Dal — 20kg Each', category: 'food', description: 'Surplus stock of rice (20kg) and dal (20kg). Want to give to families who need it. Can deliver within 5km.' },
      { type: 'share', title: 'Bicycle for Daily Use', category: 'other', description: 'Hercules bicycle in good condition. Sharing with anyone who needs daily transport. Keep it for a month, return when done.' },
      { type: 'take', title: 'Need School Supplies', category: 'books', description: 'Running an after-school program for 30 kids. Need notebooks, pencils, erasers, and geometry boxes. Any donations appreciated!' },
      { type: 'give', title: 'Yoga Mats (10 pieces)', category: 'other', description: 'Set of 10 yoga/exercise mats. Used for a fitness class that ended. Clean and in good shape.' },
      { type: 'share', title: 'Tutoring: Math & Science', category: 'services', description: 'Offering free tutoring for students grades 6-10 in Math and Science. Can do in-person or video calls. 2 slots available.' },
      { type: 'give', title: 'Working Washing Machine', category: 'electronics', description: 'Semi-automatic 7kg washing machine. Works perfectly, upgrading to a fully automatic one. Free for pickup in Vasant Kunj.' },
    ];

    for (let i = 0; i < listingsData.length; i++) {
      const listing = new Listing({
        ...listingsData[i],
        owner: users[(i + 2) % users.length]._id,
        location: {
          address: addresses[i],
          type: 'Point',
          coordinates: [77.209 + (Math.random() - 0.5) * 0.08, 28.6139 + (Math.random() - 0.5) * 0.08],
        },
      });
      await listing.save();
    }
    console.log('Created 15 listings');

    // ─── SQUAD POSTS ───────────────────────────────────────────
    const ahmedabadAddresses = [
      'Satellite, Ahmedabad', 'Navrangpura, Ahmedabad', 'CG Road, Ahmedabad',
      'Vastrapur, Ahmedabad', 'Prahladnagar, Ahmedabad', 'Maninagar, Ahmedabad',
      'Bodakdev, Ahmedabad', 'SG Highway, Ahmedabad', 'Gota, Ahmedabad',
      'Bopal, Ahmedabad', 'Thaltej, Ahmedabad', 'Ambawadi, Ahmedabad',
      'Chandkheda, Ahmedabad', 'Gurukul, Ahmedabad', 'Drive-In, Ahmedabad',
      'Ellisbridge, Ahmedabad', 'Shilaj, Ahmedabad', 'Motera, Ahmedabad',
      'Science City, Ahmedabad', 'Sabarmati, Ahmedabad',
    ];

    // 12 Official category squad posts
    const officialSquadData = [
      {
        title: 'Carpool: Satellite → Navrangpura 6 PM',
        description: 'Going from Satellite to Navrangpura at 6pm, 3 seats, car, equal split, ₹40/person. Daily commute, DM to confirm pickup point.',
        category: 'carpool',
        minParticipants: 2, maxParticipants: 4,
        totalCost: 160, costPerPerson: 40, costSplitMethod: 'equal',
        tags: ['carpool', 'satellite', 'navrangpura', 'commute'],
        urgency: 'high',
        expiresAt: new Date(Date.now() + 1 * 86400000),
        meta: new Map([['vehicle', 'car'], ['seats', '3'], ['route', 'Satellite → Navrangpura']]),
      },
      {
        title: 'Blinkit Order — ₹47 more for free delivery',
        description: 'Ordering on Blinkit, cart ₹153, need ₹47 more for free delivery, 10 min deadline. Add your items quick!',
        category: 'order_split',
        minParticipants: 2, maxParticipants: 4,
        totalCost: 200, costPerPerson: 47, costSplitMethod: 'custom',
        tags: ['blinkit', 'delivery', 'quick-commerce', 'split'],
        urgency: 'urgent',
        expiresAt: new Date(Date.now() + 600000), // 10 min
        meta: new Map([['platform', 'Blinkit'], ['currentCart', '153'], ['freeDeliveryMin', '200']]),
      },
      {
        title: 'Group Order — Honest Restaurant on Swiggy',
        description: 'Group order from Honest, Swiggy, min ₹300, 4 people, deadline 1pm. Adding to cart now!',
        category: 'food_order',
        minParticipants: 3, maxParticipants: 5,
        totalCost: 300, costSplitMethod: 'custom',
        tags: ['honest', 'swiggy', 'group-order', 'lunch'],
        urgency: 'high',
        expiresAt: new Date(Date.now() + 3 * 3600000),
        meta: new Map([['restaurant', 'Honest'], ['platform', 'Swiggy'], ['minOrder', '300']]),
      },
      {
        title: 'Interstellar IMAX — Group of 4 gets 20% off',
        description: 'BookMyShow — Interstellar IMAX, group of 4 gets 20% off, ₹200/person. Weekend evening show.',
        category: 'ticket_split',
        minParticipants: 4, maxParticipants: 4,
        totalCost: 800, costPerPerson: 200, costSplitMethod: 'equal',
        tags: ['bookmyshow', 'imax', 'interstellar', 'movie'],
        urgency: 'medium',
        expiresAt: new Date(Date.now() + 5 * 86400000),
        meta: new Map([['platform', 'BookMyShow'], ['movie', 'Interstellar'], ['format', 'IMAX']]),
      },
      {
        title: 'Bulk Buy: 10kg Basmati Rice from APMC',
        description: '10kg basmati rice from APMC, split 4 ways, ₹60/kg vs ₹90 retail. Save 33% on premium rice!',
        category: 'bulk_buy',
        minParticipants: 3, maxParticipants: 5,
        totalCost: 600, costPerPerson: 150, costSplitMethod: 'equal',
        tags: ['rice', 'apmc', 'bulk', 'grocery'],
        urgency: 'medium',
        expiresAt: new Date(Date.now() + 3 * 86400000),
        meta: new Map([['item', 'Basmati Rice'], ['quantity', '10kg'], ['retailPrice', '90/kg'], ['bulkPrice', '60/kg']]),
      },
      {
        title: 'Pressure Washer Rental — Split 5 Ways',
        description: 'Pressure washer rental ₹800/day, 5 flats split = ₹160 each. Perfect for Diwali cleaning!',
        category: 'tool_rent',
        minParticipants: 4, maxParticipants: 6,
        totalCost: 800, costPerPerson: 160, costSplitMethod: 'equal',
        tags: ['pressure-washer', 'rental', 'cleaning', 'diwali'],
        urgency: 'low',
        expiresAt: new Date(Date.now() + 7 * 86400000),
        meta: new Map([['tool', 'Pressure Washer'], ['rentalCost', '800'], ['rentalPeriod', '1 day']]),
      },
      {
        title: 'Goa Trip Dec 15-18 — Airbnb Split',
        description: 'Goa trip Dec 15-18, Airbnb split 4 ways, ₹1200/person, budget adventure. Beach vibes and chill!',
        category: 'travel',
        minParticipants: 3, maxParticipants: 5,
        totalCost: 4800, costPerPerson: 1200, costSplitMethod: 'equal',
        tags: ['goa', 'trip', 'airbnb', 'adventure'],
        urgency: 'low',
        expiresAt: new Date(Date.now() + 14 * 86400000),
        meta: new Map([['destination', 'Goa'], ['dates', 'Dec 15-18'], ['accommodation', 'Airbnb']]),
      },
      {
        title: 'Mumbai Courier — Combine Parcels',
        description: 'Sending to Mumbai, combine parcels, Blue Dart, split shipping cost. Drop your parcel by Thursday.',
        category: 'courier',
        minParticipants: 2, maxParticipants: 6,
        totalCost: 600, costSplitMethod: 'equal',
        tags: ['courier', 'mumbai', 'bluedart', 'shipping'],
        urgency: 'medium',
        expiresAt: new Date(Date.now() + 4 * 86400000),
        meta: new Map([['destination', 'Mumbai'], ['service', 'Blue Dart']]),
      },
      {
        title: 'Netflix 4K Plan — 4-way Split',
        description: 'Netflix 4K plan ₹649/month, 4 slots, ₹163/person, renews 1st of every month.',
        category: 'subscription',
        minParticipants: 3, maxParticipants: 4,
        totalCost: 649, costPerPerson: 163, costSplitMethod: 'equal',
        tags: ['netflix', 'subscription', 'streaming', 'ott'],
        urgency: 'low',
        isRecurring: true, recurringSchedule: 'Monthly on the 1st',
        meta: new Map([['service', 'Netflix'], ['plan', '4K Premium'], ['renewalDate', '1st of month']]),
      },
      {
        title: 'Badminton Court — Sunday 7 AM',
        description: 'Badminton court CU Shah, Sunday 7am, 4 players, ₹50/person. Bring your own racket!',
        category: 'fitness',
        minParticipants: 2, maxParticipants: 4,
        totalCost: 200, costPerPerson: 50, costSplitMethod: 'equal',
        tags: ['badminton', 'cushah', 'sunday', 'sports'],
        urgency: 'medium',
        isRecurring: true, recurringSchedule: 'Every Sunday 7 AM',
        expiresAt: new Date(Date.now() + 5 * 86400000),
        meta: new Map([['venue', 'CU Shah'], ['sport', 'Badminton'], ['day', 'Sunday']]),
      },
      {
        title: 'Building Pest Control — 12 Flat Group',
        description: 'Building-wide pest control, 12 flats, ₹200/flat vs ₹800 solo. 75% savings when we do it together!',
        category: 'community_buy',
        minParticipants: 8, maxParticipants: 15,
        totalCost: 2400, costPerPerson: 200, costSplitMethod: 'equal',
        tags: ['pest-control', 'building', 'society', 'savings'],
        urgency: 'medium',
        expiresAt: new Date(Date.now() + 10 * 86400000),
        meta: new Map([['service', 'Pest Control'], ['soloPrice', '800'], ['groupPrice', '200']]),
      },
      {
        title: 'CAT 2025 Prep Group',
        description: 'CAT 2025 prep group, weekday evenings, online + Ahmedabad meetups. Serious aspirants only!',
        category: 'study_group',
        minParticipants: 3, maxParticipants: 8,
        costSplitMethod: 'free',
        tags: ['cat', 'mba', 'study', 'exam-prep'],
        urgency: 'low',
        isRecurring: true, recurringSchedule: 'Weekday evenings',
        meta: new Map([['exam', 'CAT 2025'], ['mode', 'Online + Offline'], ['location', 'Ahmedabad']]),
      },
    ];

    // 8 Custom "Inspire Me" posts (all completed)
    const customSquadData = [
      {
        title: 'Terrace Gardening Group',
        description: 'Join our terrace gardening group! Share tips, seeds, and saplings. We meet monthly to exchange plants and discuss organic growing techniques.',
        customCategoryLabel: 'Gardening',
        customBenefitType: 'more_fun',
        customBenefitNote: 'Grow together, share the harvest!',
        minParticipants: 2, maxParticipants: 4,
        costSplitMethod: 'free',
        tags: ['gardening', 'terrace', 'plants'],
        userDefinedTags: ['gardening', 'terrace', 'plants'],
        urgency: 'low',
      },
      {
        title: 'Diwali Decoration Squad',
        description: 'Let\'s decorate our building together for Diwali! Split costs for lights, rangoli materials, and flowers across flats.',
        customCategoryLabel: 'Festival Decoration',
        customBenefitType: 'save_money',
        customBenefitNote: 'Beautiful decorations at a fraction of the cost!',
        minParticipants: 4, maxParticipants: 8,
        totalCost: 1800, costPerPerson: 300, costSplitMethod: 'equal',
        tags: ['diwali', 'decoration', 'festival'],
        userDefinedTags: ['diwali', 'decoration', 'festival'],
        urgency: 'medium',
      },
      {
        title: 'Dog Walking Buddy',
        description: 'Looking for a dog walking buddy for morning walks! Let\'s keep our furry friends active and social.',
        customCategoryLabel: 'Pet Care',
        customBenefitType: 'more_fun',
        customBenefitNote: 'Happy dogs, happy owners!',
        minParticipants: 2, maxParticipants: 2,
        costSplitMethod: 'free',
        tags: ['dog', 'walking', 'pets', 'morning'],
        userDefinedTags: ['dog', 'walking', 'pets', 'morning'],
        urgency: 'low',
      },
      {
        title: 'Newspaper Bulk Subscription',
        description: 'Bulk newspaper subscription for the building — 10 flats together get a much cheaper rate per flat!',
        customCategoryLabel: 'Subscription Sharing',
        customBenefitType: 'save_money',
        customBenefitNote: 'Bulk discount on newspapers!',
        minParticipants: 8, maxParticipants: 12,
        totalCost: 150, costPerPerson: 15, costSplitMethod: 'equal',
        tags: ['newspaper', 'subscription', 'society'],
        userDefinedTags: ['newspaper', 'subscription', 'society'],
        urgency: 'low',
        isRecurring: true, recurringSchedule: 'Monthly',
      },
      {
        title: 'RO Water Can Group Order',
        description: 'Weekly RO water can delivery — ordering together in bulk brings the price down to ₹20/can instead of ₹35.',
        customCategoryLabel: 'Group Delivery',
        customBenefitType: 'save_money',
        customBenefitNote: '43% savings on water delivery!',
        minParticipants: 4, maxParticipants: 6,
        totalCost: 100, costPerPerson: 20, costSplitMethod: 'equal',
        tags: ['water', 'delivery', 'weekly'],
        userDefinedTags: ['water', 'delivery', 'weekly'],
        urgency: 'low',
        isRecurring: true, recurringSchedule: 'Weekly',
      },
      {
        title: 'Building Badminton Tournament',
        description: 'Organizing a building-level badminton tournament! 16 players, knockout format, prizes for top 3.',
        customCategoryLabel: 'Sports Tournament',
        customBenefitType: 'more_fun',
        customBenefitNote: 'Compete, connect, and have fun!',
        minParticipants: 8, maxParticipants: 16,
        totalCost: 800, costPerPerson: 50, costSplitMethod: 'equal',
        tags: ['badminton', 'tournament', 'sports'],
        userDefinedTags: ['badminton', 'tournament', 'sports'],
        urgency: 'medium',
      },
      {
        title: 'Homemade Tiffin Group',
        description: 'Rotation-based homemade tiffin group — 5 people take turns cooking for the group on weekdays. No cost, just share the effort!',
        customCategoryLabel: 'Meal Sharing',
        customBenefitType: 'save_time',
        customBenefitNote: 'Cook once a week, eat homemade every day!',
        minParticipants: 4, maxParticipants: 6,
        costSplitMethod: 'free',
        tags: ['tiffin', 'food', 'homemade', 'rotation'],
        userDefinedTags: ['tiffin', 'food', 'homemade', 'rotation'],
        urgency: 'low',
        isRecurring: true, recurringSchedule: 'Weekdays',
      },
      {
        title: 'EV Charging Slot Sharing',
        description: 'Sharing the building\'s 2 EV charging stations among 8 EV owners. Scheduling app to manage slots fairly.',
        customCategoryLabel: 'Resource Sharing',
        customBenefitType: 'save_time',
        customBenefitNote: 'Fair access to charging for everyone!',
        minParticipants: 4, maxParticipants: 10,
        costSplitMethod: 'free',
        tags: ['ev', 'charging', 'electric', 'schedule'],
        userDefinedTags: ['ev', 'charging', 'electric', 'schedule'],
        urgency: 'low',
        isRecurring: true, recurringSchedule: 'Daily',
      },
    ];

    const squadPosts = [];

    // Seed 12 official squad posts — spread across users
    for (let i = 0; i < officialSquadData.length; i++) {
      const creatorIdx = (i + 1) % users.length; // Spread organizers, skip user[0]
      const participantCount = Math.min(
        officialSquadData[i].maxParticipants - 1,
        Math.floor(Math.random() * 4) + 1
      );
      // Pick participants different from creator
      const participantIds = [];
      for (let p = 0; p < participantCount; p++) {
        const pIdx = (creatorIdx + p + 1) % users.length;
        if (pIdx !== creatorIdx) participantIds.push(users[pIdx]._id);
      }

      const post = new SquadPost({
        ...officialSquadData[i],
        creator: users[creatorIdx]._id,
        currentParticipants: participantIds,
        status: 'open',
        location: {
          address: ahmedabadAddresses[i % ahmedabadAddresses.length],
          coordinates: [72.5714 + (Math.random() - 0.5) * 0.06, 23.0225 + (Math.random() - 0.5) * 0.06],
        },
      });
      await post.save();
      squadPosts.push(post);
    }

    // Seed 8 custom "Inspire Me" posts — all completed
    for (let i = 0; i < customSquadData.length; i++) {
      const creatorIdx = (i + 3) % users.length; // Different spread than official
      // Fill currentParticipants up to maxParticipants to simulate completed squads
      const maxP = customSquadData[i].maxParticipants;
      const participantIds = [];
      for (let p = 0; p < maxP - 1; p++) {
        const pIdx = (creatorIdx + p + 1) % users.length;
        if (pIdx !== creatorIdx) participantIds.push(users[pIdx]._id);
      }

      const post = new SquadPost({
        ...customSquadData[i],
        category: 'custom',
        status: 'completed',
        creator: users[creatorIdx]._id,
        currentParticipants: participantIds,
        location: {
          address: ahmedabadAddresses[(i + 5) % ahmedabadAddresses.length],
          coordinates: [72.5714 + (Math.random() - 0.5) * 0.06, 23.0225 + (Math.random() - 0.5) * 0.06],
        },
      });
      await post.save();
      squadPosts.push(post);
    }

    // Threshold check: custom posts with 10+ currentParticipants → suggestedForCategory: true
    const updatedCustom = await SquadPost.updateMany(
      { category: 'custom', $expr: { $gte: [{ $size: '$currentParticipants' }, 10] } },
      { $set: { suggestedForCategory: true } }
    );
    if (updatedCustom.modifiedCount > 0) {
      console.log(`Marked ${updatedCustom.modifiedCount} custom posts as suggestedForCategory`);
    }

    const officialCount = officialSquadData.length;
    const customCount = customSquadData.length;
    console.log(`Seeded ${squadPosts.length} squad posts (${officialCount} official, ${customCount} custom)`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`\nTest credentials:\n  Email: arjun@sharemate.com\n  Password: password123`);
    console.log(`\n  Admin: meera@sharemate.com / password123`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
