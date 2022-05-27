import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Keys',
  'Wallets',
  'Bags',
  'Clothing',
  'Books',
  'Accessories',
  'ID Cards',
  'Other',
]

const LOCATIONS = [
  { name: 'Central Library', building: 'Library Block', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Cafeteria', building: 'Student Center', latitude: 12.972, longitude: 77.595 },
  { name: 'Main Gate', building: null, latitude: 12.9705, longitude: 77.5938 },
  { name: 'Hostel A', building: 'Hostel Block A', latitude: 12.9698, longitude: 77.5962 },
  { name: 'Hostel B', building: 'Hostel Block B', latitude: 12.9701, longitude: 77.5968 },
  { name: 'Computer Science Block', building: 'CSE Block', latitude: 12.973, longitude: 77.5955 },
  { name: 'Parking Area', building: null, latitude: 12.9709, longitude: 77.5931 },
  { name: 'Auditorium', building: 'Main Auditorium', latitude: 12.9724, longitude: 77.5949 },
  { name: 'Sports Complex', building: null, latitude: 12.9688, longitude: 77.5972 },
]

async function main() {
  const campus = await prisma.campus.upsert({
    where: { domain: 'campus.edu' },
    update: {},
    create: { name: 'CampusFind University', domain: 'campus.edu' },
  })

  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } })
  }

  for (const loc of LOCATIONS) {
    const existing = await prisma.location.findFirst({ where: { name: loc.name, campusId: campus.id } })
    if (!existing) {
      await prisma.location.create({ data: { ...loc, campusId: campus.id } })
    }
  }

  const passwordHash = await argon2.hash('Password123!')

  const alice = await prisma.user.upsert({
    where: { email: 'alice@campus.edu' },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: 'alice@campus.edu',
      passwordHash,
      isVerified: true,
      role: 'STUDENT',
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@campus.edu' },
    update: {},
    create: {
      name: 'Bob Martinez',
      email: 'bob@campus.edu',
      passwordHash,
      isVerified: true,
      role: 'STUDENT',
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@campus.edu' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@campus.edu',
      passwordHash,
      isVerified: true,
      role: 'ADMIN',
    },
  })

  const electronics = await prisma.category.findUniqueOrThrow({ where: { name: 'Electronics' } })
  const library = await prisma.location.findFirstOrThrow({ where: { name: 'Central Library', campusId: campus.id } })

  const existingItem = await prisma.item.findFirst({ where: { title: 'AirPods Pro' } })
  if (!existingItem) {
    await prisma.item.create({
      data: {
        userId: alice.id,
        categoryId: electronics.id,
        locationId: library.id,
        type: 'LOST',
        title: 'AirPods Pro',
        description: 'White charging case, lost near the reading area on the second floor.',
        eventDate: new Date('2026-09-03'),
      },
    })

    await prisma.item.create({
      data: {
        userId: bob.id,
        categoryId: electronics.id,
        locationId: library.id,
        type: 'FOUND',
        title: 'AirPods',
        description: 'Found a pair of AirPods near the reading hall, in a white case.',
        eventDate: new Date('2026-09-04'),
      },
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
