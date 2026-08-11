import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating database user locations to clean 'Nairobi, Kenya' for demonstration...");
  
  const users = await prisma.user.findMany();
  let updatedCount = 0;

  for (const u of users) {
    // If location is null, empty, or contains trailing flag/KE text
    if (!u.location || u.location.includes("🇰🇪") || u.location.includes("KE") || u.location === "") {
      await prisma.user.update({
        where: { id: u.id },
        data: { location: "Nairobi, Kenya" },
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} users in the database to 'Nairobi, Kenya'!`);
}

main()
  .catch((e) => {
    console.error("Error updating users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
