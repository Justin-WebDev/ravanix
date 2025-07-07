// scripts/add-business.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const businesses = [
  {
    name: 'Elite Auto Detailing',
    logoUrl: null,
    businessType: 'both',
    address: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90028',
    phone: '(323) 555-0123',
    website: 'https://eliteautodetailing.com',
    description:
      'Premium auto detailing services with ceramic coating specialization',
    location: 'Los Angeles, CA',
  },
  {
    name: 'Premium Car Care',
    logoUrl: null,
    businessType: 'mobile',
    address: '567 Ocean Drive',
    city: 'Miami',
    state: 'FL',
    zipCode: '33139',
    phone: '(305) 555-0456',
    website: null,
    description: 'Mobile detailing specialists serving South Florida',
    location: 'Miami, FL',
  },
  {
    name: 'Crystal Clean Detailing',
    logoUrl: null,
    businessType: 'shop',
    address: '890 Congress Avenue',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    phone: '(512) 555-0789',
    website: 'https://crystalcleandetailing.com',
    description: 'Full-service auto spa with paint correction expertise',
    location: 'Austin, TX',
  },
  {
    name: 'Shine Masters',
    logoUrl: null,
    businessType: 'mobile',
    address: '432 Pike Street',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    phone: '(206) 555-0432',
    website: null,
    description: 'Eco-friendly mobile detailing for the Pacific Northwest',
    location: 'Seattle, WA',
  },
  {
    name: 'Sparkle & Shine',
    logoUrl: null,
    businessType: 'both',
    address: '1567 Colfax Avenue',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    phone: '(303) 555-1567',
    website: 'https://sparkleshine.co',
    description:
      'High-altitude detailing specialists with luxury vehicle focus',
    location: 'Denver, CO',
  },
];

const users = [
  {
    clerkId: 'user_2iH4qY1Z9jK8fL6N3oA5bE7XcVd',
    email: 'owner1@example.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    clerkId: 'user_3jI5rZ2a0kL9gM7O4pB6cF8YdWe',
    email: 'owner2@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
  },
  {
    clerkId: 'user_4kK6sA3b1lM0hN8P5qC7dG9ZeXf',
    email: 'owner3@example.com',
    firstName: 'Peter',
    lastName: 'Jones',
  },
  {
    clerkId: 'user_5lL7tB4c2mN1iO9Q6rD8eH0AfYg',
    email: 'owner4@example.com',
    firstName: 'Mary',
    lastName: 'Johnson',
  },
  {
    clerkId: 'user_6mM8uC5d3nO2jP0R7sE9fI1BgZh',
    email: 'owner5@example.com',
    firstName: 'David',
    lastName: 'Williams',
  },
];

async function main() {
  console.log('Starting to seed the database...');

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({ data: userData });
    createdUsers.push(user);
    console.log(`Created user: ${user.firstName} (${user.email})`);
  }

  for (let i = 0; i < businesses.length; i++) {
    const businessData = businesses[i];
    const owner = createdUsers[i];

    const business = await prisma.business.create({
      data: {
        ...businessData,
        ownerId: owner.id,
      },
    });

    // Also link the user to the business
    await prisma.user.update({
      where: { id: owner.id },
      data: { businessId: business.id },
    });

    console.log(
      `Created business: ${business.name}, owned by ${owner.firstName}`
    );
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// npx dotenv-cli -e .env.local -- tsx scripts/add-business.ts
