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
  { name: 'Central Library', building: 'Library Block', latitude: 30.7691, longitude: 76.5764 },
  { name: 'Cafeteria', building: 'Student Center', latitude: 30.7696, longitude: 76.5769 },
  { name: 'Main Gate', building: null, latitude: 30.7680, longitude: 76.5758 },
  { name: 'Hostel A', building: 'Hostel Block A', latitude: 30.7674, longitude: 76.5781 },
  { name: 'Hostel B', building: 'Hostel Block B', latitude: 30.7677, longitude: 76.5787 },
  { name: 'Computer Science Block', building: 'CSE Block', latitude: 30.7702, longitude: 76.5772 },
  { name: 'Parking Area', building: null, latitude: 30.7685, longitude: 76.5750 },
  { name: 'Auditorium', building: 'Main Auditorium', latitude: 30.7699, longitude: 76.5766 },
  { name: 'Sports Complex', building: null, latitude: 30.7663, longitude: 76.5793 },
]

async function main() {
  const campus = await prisma.campus.upsert({
    where: { domain: 'cuchd.in' },
    update: { name: 'Chandigarh University' },
    create: { name: 'Chandigarh University', domain: 'cuchd.in' },
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

  async function upsertUser({ name, email, role, isActive = true }) {
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, passwordHash, isVerified: true, role, isActive, campusId: campus.id },
    })
  }

  const aarav = await upsertUser({ name: 'Aarav Sharma', email: 'aarav.sharma@cuchd.in', role: 'STUDENT' })
  const priya = await upsertUser({ name: 'Priya Patel', email: 'priya.patel@cuchd.in', role: 'STUDENT' })
  const rohan = await upsertUser({ name: 'Rohan Verma', email: 'rohan.verma@cuchd.in', role: 'STUDENT' })
  const ananya = await upsertUser({ name: 'Ananya Iyer', email: 'ananya.iyer@cuchd.in', role: 'STUDENT' })
  const vikram = await upsertUser({ name: 'Vikram Reddy', email: 'vikram.reddy@cuchd.in', role: 'STUDENT' })
  const sneha = await upsertUser({ name: 'Sneha Gupta', email: 'sneha.gupta@cuchd.in', role: 'STUDENT' })
  const karan = await upsertUser({ name: 'Karan Malhotra', email: 'karan.malhotra@cuchd.in', role: 'MODERATOR' })
  const neha = await upsertUser({ name: 'Neha Kapoor', email: 'admin@cuchd.in', role: 'ADMIN' })
  const devansh = await upsertUser({
    name: 'Devansh Nair',
    email: 'devansh.nair@cuchd.in',
    role: 'STUDENT',
    isActive: false,
  })

  const already = await prisma.item.findFirst({ where: { title: 'AirPods Pro' } })
  if (already) {
    console.log('Demo dataset already present, skipping.')
    return
  }

  const categoryByName = {}
  for (const name of CATEGORIES) {
    categoryByName[name] = await prisma.category.findUniqueOrThrow({ where: { name } })
  }
  const locationByName = {}
  for (const loc of LOCATIONS) {
    locationByName[loc.name] = await prisma.location.findFirstOrThrow({
      where: { name: loc.name, campusId: campus.id },
    })
  }

  const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

  // --- Item 1 & 2: matched pair, claim accepted, resolved with messages + ratings ---
  const item1 = await prisma.item.create({
    data: {
      userId: aarav.id,
      categoryId: categoryByName.Electronics.id,
      locationId: locationByName['Central Library'].id,
      type: 'LOST',
      status: 'ACTIVE',
      title: 'AirPods Pro',
      description: 'White charging case, lost near the reading area on the second floor.',
      eventDate: daysAgo(9),
      createdAt: daysAgo(9),
    },
  })

  const item2 = await prisma.item.create({
    data: {
      userId: priya.id,
      categoryId: categoryByName.Electronics.id,
      locationId: locationByName['Central Library'].id,
      type: 'FOUND',
      status: 'RESOLVED',
      title: 'AirPods',
      description: 'Found a pair of AirPods near the reading hall, in a white case with a small scratch on the lid.',
      eventDate: daysAgo(8),
      createdAt: daysAgo(8),
    },
  })

  const match1 = await prisma.match.create({
    data: { lostItemId: item1.id, foundItemId: item2.id, score: 87, status: 'CONFIRMED' },
  })

  await prisma.notification.create({
    data: {
      userId: aarav.id,
      type: 'MATCH_FOUND',
      title: 'Someone found an item matching your report',
      message: `"${item2.title}" may match your report "${item1.title}" (87% match).`,
      metadata: { matchId: match1.id, itemId: item2.id },
      read: true,
      createdAt: daysAgo(7),
    },
  })

  const claim1 = await prisma.claim.create({
    data: {
      itemId: item2.id,
      claimantId: aarav.id,
      status: 'ACCEPTED',
      message:
        "These are mine — white case with a small scratch on the lid. I lost them near the reading area on the 2nd floor.",
      createdAt: daysAgo(7),
      evidence: {
        create: [
          { type: 'DESCRIPTION', content: 'Small scratch on the lid, left side.' },
          { type: 'IDENTIFYING_DETAIL', content: 'Serial number ends in 4F21, visible under the lid.' },
        ],
      },
    },
  })

  await prisma.notification.create({
    data: {
      userId: priya.id,
      type: 'CLAIM_SUBMITTED',
      title: 'Someone submitted a claim',
      message: `${aarav.name} submitted a claim on "${item2.title}".`,
      metadata: { itemId: item2.id, claimId: claim1.id },
      read: true,
      createdAt: daysAgo(7),
    },
  })

  await prisma.notification.create({
    data: {
      userId: aarav.id,
      type: 'CLAIM_ACCEPTED',
      title: 'Your claim was accepted',
      message: `Your claim on "${item2.title}" was accepted. You can now message the owner.`,
      metadata: { itemId: item2.id, claimId: claim1.id },
      read: false,
      createdAt: daysAgo(6),
    },
  })

  const conversation1 = await prisma.conversation.create({
    data: {
      claimId: claim1.id,
      participants: {
        create: [
          { userId: priya.id, lastReadAt: daysAgo(6) },
          { userId: aarav.id, lastReadAt: daysAgo(6) },
        ],
      },
    },
  })

  const messages1 = [
    { senderId: aarav.id, body: 'Hi! I think the AirPods you found are mine — thank you for posting.', createdAt: daysAgo(6) },
    { senderId: priya.id, body: 'Hey, sure — can you describe the case a bit more?', createdAt: daysAgo(6) },
    { senderId: aarav.id, body: "There's a small scratch on the lid, left side, near the hinge.", createdAt: daysAgo(6) },
    { senderId: priya.id, body: "That matches what I found. I'm at the library help desk until 5pm today if you want to pick them up.", createdAt: daysAgo(5) },
    { senderId: aarav.id, body: "I'll come by around 3! Thanks so much 🙏", createdAt: daysAgo(5) },
  ]
  for (const m of messages1) {
    await prisma.message.create({ data: { conversationId: conversation1.id, ...m } })
  }

  await prisma.notification.create({
    data: {
      userId: priya.id,
      type: 'NEW_MESSAGE',
      title: 'New message',
      message: messages1[messages1.length - 1].body,
      metadata: { conversationId: conversation1.id },
      read: true,
      createdAt: daysAgo(5),
    },
  })

  await prisma.rating.create({
    data: {
      claimId: claim1.id,
      raterId: priya.id,
      ratedUserId: aarav.id,
      score: 5,
      comment: 'Picked them up quickly and was very polite about it. Thanks!',
      createdAt: daysAgo(4),
    },
  })
  await prisma.rating.create({
    data: {
      claimId: claim1.id,
      raterId: aarav.id,
      ratedUserId: priya.id,
      score: 5,
      comment: 'Super honest, held on to them and responded fast. Thank you!',
      createdAt: daysAgo(4),
    },
  })

  await prisma.notification.create({
    data: {
      userId: priya.id,
      type: 'ITEM_RESOLVED',
      title: 'Item marked resolved',
      message: `"${item2.title}" has been marked as resolved.`,
      metadata: { itemId: item2.id },
      read: true,
      createdAt: daysAgo(4),
    },
  })

  // --- Item 3: active LOST item with a pending report against it ---
  const item3 = await prisma.item.create({
    data: {
      userId: rohan.id,
      categoryId: categoryByName.Documents.id,
      locationId: locationByName['Main Gate'].id,
      type: 'LOST',
      status: 'ACTIVE',
      title: 'Aadhaar Card + College ID',
      description: 'Lost my Aadhaar card and college ID together, likely near the main gate security desk.',
      eventDate: daysAgo(3),
      createdAt: daysAgo(3),
    },
  })

  const report1 = await prisma.report.create({
    data: {
      reporterId: vikram.id,
      itemId: item3.id,
      reason: 'INCORRECT_INFORMATION',
      description: 'The location looks wrong — security desk cameras show nothing there that day.',
      status: 'PENDING',
      createdAt: daysAgo(2),
    },
  })
  void report1

  // --- Item 4: active FOUND item with a pending claim ---
  const item4 = await prisma.item.create({
    data: {
      userId: ananya.id,
      categoryId: categoryByName.Wallets.id,
      locationId: locationByName.Cafeteria.id,
      type: 'FOUND',
      status: 'CLAIM_PENDING',
      title: 'Brown leather wallet',
      description: 'Found a brown leather wallet near the cafeteria seating area, handed in at the counter.',
      eventDate: daysAgo(5),
      createdAt: daysAgo(5),
    },
  })

  const claim2 = await prisma.claim.create({
    data: {
      itemId: item4.id,
      claimantId: vikram.id,
      status: 'PENDING',
      message: 'This is my wallet — it has my college ID and a metro card inside.',
      createdAt: daysAgo(2),
      evidence: {
        create: [{ type: 'DESCRIPTION', content: 'Contains a maroon college ID and a blue metro card.' }],
      },
    },
  })

  await prisma.notification.create({
    data: {
      userId: ananya.id,
      type: 'CLAIM_SUBMITTED',
      title: 'Someone submitted a claim',
      message: `${vikram.name} submitted a claim on "${item4.title}".`,
      metadata: { itemId: item4.id, claimId: claim2.id },
      read: false,
      createdAt: daysAgo(2),
    },
  })

  // --- Item 5: LOST item with a rejected claim, item reverted to ACTIVE ---
  const item5 = await prisma.item.create({
    data: {
      userId: vikram.id,
      categoryId: categoryByName.Keys.id,
      locationId: locationByName['Hostel A'].id,
      type: 'LOST',
      status: 'ACTIVE',
      title: 'Hostel room keys with keychain',
      description: 'A set of two keys on a red keychain, lost somewhere around Hostel A.',
      eventDate: daysAgo(6),
      createdAt: daysAgo(6),
    },
  })

  const claim3 = await prisma.claim.create({
    data: {
      itemId: item5.id,
      claimantId: sneha.id,
      status: 'REJECTED',
      message: 'I think these might be my spare keys, I lost a set around there too.',
      createdAt: daysAgo(5),
      evidence: { create: [{ type: 'DESCRIPTION', content: 'Black keychain, two keys.' }] },
    },
  })

  await prisma.notification.create({
    data: {
      userId: sneha.id,
      type: 'CLAIM_REJECTED',
      title: 'Your claim was rejected',
      message: `Your claim on "${item5.title}" was not accepted.`,
      metadata: { itemId: item5.id, claimId: claim3.id },
      read: false,
      createdAt: daysAgo(4),
    },
  })

  // --- A few more items for browse/search variety ---
  const item6 = await prisma.item.create({
    data: {
      userId: sneha.id,
      categoryId: categoryByName.Books.id,
      locationId: locationByName['Computer Science Block'].id,
      type: 'FOUND',
      status: 'ACTIVE',
      title: 'Data Structures textbook',
      description: 'Found a Data Structures textbook (Cormen) with handwritten notes, left on a desk in the CSE block.',
      eventDate: daysAgo(2),
      createdAt: daysAgo(2),
    },
  })

  const item7 = await prisma.item.create({
    data: {
      userId: karan.id,
      categoryId: categoryByName.Bags.id,
      locationId: locationByName['Parking Area'].id,
      type: 'LOST',
      status: 'ACTIVE',
      title: 'Black backpack',
      description: 'Black Wildcraft backpack, lost near the two-wheeler parking area.',
      eventDate: daysAgo(1),
      createdAt: daysAgo(1),
    },
  })

  const item8 = await prisma.item.create({
    data: {
      userId: aarav.id,
      categoryId: categoryByName.Clothing.id,
      locationId: locationByName.Auditorium.id,
      type: 'FOUND',
      status: 'CLAIM_PENDING',
      title: 'Blue hoodie',
      description: 'Found a blue hoodie left on a seat after the auditorium event.',
      eventDate: daysAgo(3),
      createdAt: daysAgo(3),
    },
  })

  const claim4 = await prisma.claim.create({
    data: {
      itemId: item8.id,
      claimantId: sneha.id,
      status: 'PENDING',
      message: 'That looks like mine, I left it behind after the seminar.',
      createdAt: daysAgo(1),
      evidence: { create: [{ type: 'IDENTIFYING_DETAIL', content: 'There should be a small paint stain on the left sleeve.' }] },
    },
  })

  await prisma.notification.create({
    data: {
      userId: aarav.id,
      type: 'CLAIM_SUBMITTED',
      title: 'Someone submitted a claim',
      message: `${sneha.name} submitted a claim on "${item8.title}".`,
      metadata: { itemId: item8.id, claimId: claim4.id },
      read: false,
      createdAt: daysAgo(1),
    },
  })

  const item9 = await prisma.item.create({
    data: {
      userId: priya.id,
      categoryId: categoryByName.Accessories.id,
      locationId: locationByName['Sports Complex'].id,
      type: 'LOST',
      status: 'ACTIVE',
      title: 'Silver wristwatch',
      description: 'A silver analog wristwatch, lost during badminton practice at the sports complex.',
      eventDate: daysAgo(4),
      createdAt: daysAgo(4),
    },
  })

  const item10 = await prisma.item.create({
    data: {
      userId: ananya.id,
      categoryId: categoryByName['ID Cards'].id,
      locationId: locationByName['Main Gate'].id,
      type: 'FOUND',
      status: 'ACTIVE',
      title: 'Student ID card',
      description: 'Found a student ID card near the main gate, handed to security for pickup.',
      eventDate: daysAgo(1),
      createdAt: daysAgo(1),
    },
  })

  const item11 = await prisma.item.create({
    data: {
      userId: sneha.id,
      categoryId: categoryByName.Other.id,
      locationId: locationByName['Hostel B'].id,
      type: 'LOST',
      status: 'ACTIVE',
      title: 'Black umbrella',
      description: 'Compact black umbrella, left near the Hostel B common room during the rain last week.',
      eventDate: daysAgo(7),
      createdAt: daysAgo(7),
    },
  })

  // Naturally expired listing (old event, never resolved)
  const item12 = await prisma.item.create({
    data: {
      userId: vikram.id,
      categoryId: categoryByName.Electronics.id,
      locationId: locationByName['Computer Science Block'].id,
      type: 'FOUND',
      status: 'EXPIRED',
      title: 'USB-C charger',
      description: 'Found a USB-C charger (no brand markings) left plugged in at a CSE block workstation.',
      eventDate: daysAgo(45),
      createdAt: daysAgo(45),
    },
  })
  void item12

  // --- Item 13: reported, reviewed by a moderator, hidden ---
  const item13 = await prisma.item.create({
    data: {
      userId: priya.id,
      categoryId: categoryByName.Documents.id,
      locationId: locationByName['Central Library'].id,
      type: 'LOST',
      status: 'EXPIRED',
      title: 'Semester mark sheet',
      description: 'Lost a printed semester mark sheet, likely left inside a library study room.',
      eventDate: daysAgo(10),
      createdAt: daysAgo(10),
    },
  })

  const report2 = await prisma.report.create({
    data: {
      reporterId: rohan.id,
      itemId: item13.id,
      reason: 'FAKE_LISTING',
      description: 'This looks like a duplicate of an already-resolved listing.',
      status: 'ACTIONED',
      reviewedById: karan.id,
      reviewedAt: daysAgo(1),
      createdAt: daysAgo(3),
    },
  })

  await prisma.moderationAction.create({
    data: { reportId: report2.id, moderatorId: karan.id, action: 'HIDE_ITEM', metadata: { itemId: item13.id } },
  })

  await prisma.auditLog.create({
    data: {
      actorId: karan.id,
      action: 'HIDE_ITEM',
      entityType: 'Report',
      entityId: report2.id,
      metadata: { itemId: item13.id },
      createdAt: daysAgo(1),
    },
  })

  // --- Suspended user, actioned by admin ---
  await prisma.auditLog.create({
    data: {
      actorId: neha.id,
      action: 'SUSPEND_USER',
      entityType: 'User',
      entityId: devansh.id,
      metadata: { reason: 'Repeated fake listings reported by multiple students.' },
      createdAt: daysAgo(2),
    },
  })
  await prisma.moderationAction.create({
    data: { moderatorId: neha.id, action: 'SUSPEND_USER', metadata: { userId: devansh.id } },
  })

  // --- Saved searches ---
  await prisma.savedSearch.create({
    data: {
      userId: aarav.id,
      name: 'Lost electronics near the library',
      type: 'LOST',
      categoryId: categoryByName.Electronics.id,
      locationId: locationByName['Central Library'].id,
      search: 'airpods',
      createdAt: daysAgo(9),
    },
  })
  const savedSearch2 = await prisma.savedSearch.create({
    data: {
      userId: priya.id,
      name: 'Found wallets on campus',
      type: 'FOUND',
      categoryId: categoryByName.Wallets.id,
      search: null,
      createdAt: daysAgo(5),
    },
  })

  await prisma.notification.create({
    data: {
      userId: priya.id,
      type: 'SAVED_SEARCH_MATCH',
      title: 'New item matches your saved search',
      message: `"${item4.title}" matches your saved search "${savedSearch2.name}".`,
      metadata: { itemId: item4.id, savedSearchId: savedSearch2.id },
      read: false,
      createdAt: daysAgo(5),
    },
  })

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
