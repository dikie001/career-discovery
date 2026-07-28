import { prisma } from "../lib/prisma"

async function main() {
  // Seed careers
  const careers = await prisma.career.createMany({
    data: [
      {
        title: "Data Analyst",
        description: "Analyze data to help business decisions. High demand in Kenya.",
        category: "Technology",
        salaryMin: 120000,
        salaryMax: 200000,
        matchPercentage: 92,
        color: "from-purple-400 to-purple-600",
      },
      {
        title: "Software Developer",
        description: "Build applications and systems. Highly sought after profession.",
        category: "Technology",
        salaryMin: 150000,
        salaryMax: 250000,
        matchPercentage: 87,
        color: "from-blue-400 to-blue-600",
      },
      {
        title: "Clinical Officer",
        description: "Healthcare profession with great growth opportunities in Kenya.",
        category: "Healthcare",
        salaryMin: 70000,
        salaryMax: 120000,
        matchPercentage: 81,
        color: "from-orange-400 to-orange-600",
      },
    ],
    skipDuplicates: true,
  })

  console.log(`Created ${careers.count} careers`)

  // Seed courses
  const courses = await prisma.course.createMany({
    data: [
      {
        title: "Python for Data Science",
        description: "Learn Python programming for data analysis and visualization.",
        category: "Data Science",
        level: "beginner",
        duration: 40,
        provider: "Coursera",
        matchScore: 95,
        skills: ["Python", "Data Analysis", "Pandas"],
      },
      {
        title: "React Advanced Patterns",
        description: "Master advanced React patterns and hooks for scalable applications.",
        category: "Web Development",
        level: "advanced",
        duration: 50,
        provider: "Udemy",
        matchScore: 88,
        skills: ["React", "JavaScript", "Web Development"],
      },
      {
        title: "SQL Database Design",
        description: "Learn to design and optimize databases for applications.",
        category: "Database",
        level: "intermediate",
        duration: 35,
        provider: "LinkedIn Learning",
        matchScore: 92,
        skills: ["SQL", "Database Design", "Optimization"],
      },
      {
        title: "Healthcare Fundamentals",
        description: "Essential knowledge for healthcare professionals.",
        category: "Healthcare",
        level: "beginner",
        duration: 60,
        provider: "WHO Academy",
        matchScore: 85,
        skills: ["Patient Care", "Medical Basics", "Healthcare"],
      },
    ],
    skipDuplicates: true,
  })

  console.log(`Created ${courses.count} courses`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
