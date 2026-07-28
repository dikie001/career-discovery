const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

function hashPassword(password) {
  return Buffer.from(password).toString("base64");
}

async function main() {
  const adminEmail = 'admin@pathfinder.com';
  
  // Check if admin exists
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashPassword('admin123'),
        name: 'Super Admin',
        role: 'ADMIN',
      }
    });
    
    await prisma.userProfile.create({
      data: {
        userId: admin.id,
        interests: [],
        skills: [],
        experienceLevel: "advanced",
      }
    });
    
    console.log('Created new admin user:', admin.email);
  } else {
    // Ensure role is ADMIN
    admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' }
    });
    console.log('Updated existing user to ADMIN:', admin.email);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
