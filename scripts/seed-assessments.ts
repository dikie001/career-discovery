import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const assessments = [
  {
    skillTitle: "Software Engineering",
    data: {
      title: "Assessment: Software Engineering",
      timeLimitMinutes: 20,
      passMarkPercentage: 60,
      questions: [
        {
          id: "q1",
          text: "Which of the following describes the MVC architectural pattern?",
          options: [
            { id: "a", text: "Model View Controller" },
            { id: "b", text: "Multiple Virtual Computers" },
            { id: "c", text: "Main Variable Component" },
            { id: "d", text: "Minimal Viable Code" }
          ],
          correctOptionId: "a",
          explanation: "MVC stands for Model-View-Controller, a standard architectural pattern for separating application logic from the user interface."
        },
        {
          id: "q2",
          text: "What does 'CI/CD' stand for in modern software engineering?",
          options: [
            { id: "a", text: "Code Integration / Code Deployment" },
            { id: "b", text: "Continuous Integration / Continuous Deployment" },
            { id: "c", text: "Centralized Information / Centralized Distribution" },
            { id: "d", text: "Controlled Input / Controlled Delivery" }
          ],
          correctOptionId: "b",
          explanation: "CI/CD refers to Continuous Integration and Continuous Deployment (or Delivery), which automates building, testing, and deploying code."
        },
        {
          id: "q3",
          text: "Which of these is NOT a principle of Object-Oriented Programming (OOP)?",
          options: [
            { id: "a", text: "Encapsulation" },
            { id: "b", text: "Inheritance" },
            { id: "c", text: "Compilation" },
            { id: "d", text: "Polymorphism" }
          ],
          correctOptionId: "c",
          explanation: "Compilation is a process of converting source code to machine code, not an OOP principle like Encapsulation, Inheritance, or Polymorphism."
        },
        {
          id: "q4",
          text: "In Git, which command is used to save your changes to the local repository?",
          options: [
            { id: "a", text: "git push" },
            { id: "b", text: "git pull" },
            { id: "c", text: "git commit" },
            { id: "d", text: "git fetch" }
          ],
          correctOptionId: "c",
          explanation: "The 'git commit' command saves your staged changes to your local repository history."
        },
        {
          id: "q5",
          text: "What is the primary purpose of a REST API?",
          options: [
            { id: "a", text: "To render HTML pages in the browser" },
            { id: "b", text: "To provide a standard way for systems to communicate over HTTP" },
            { id: "c", text: "To store data permanently on a hard drive" },
            { id: "d", text: "To compile TypeScript code to JavaScript" }
          ],
          correctOptionId: "b",
          explanation: "REST APIs use standard HTTP methods to allow different software systems to communicate over the web."
        }
      ]
    }
  },
  {
    skillTitle: "Product Analyst",
    data: {
      title: "Assessment: Product Analyst",
      timeLimitMinutes: 20,
      passMarkPercentage: 60,
      questions: [
        {
          id: "q1",
          text: "What is the main objective of A/B testing in product analysis?",
          options: [
            { id: "a", text: "To find bugs in the application code" },
            { id: "b", text: "To compare two versions of a feature to determine which performs better" },
            { id: "c", text: "To test the application on two different servers" },
            { id: "d", text: "To write automated tests for the UI" }
          ],
          correctOptionId: "b",
          explanation: "A/B testing involves showing two variants (A and B) to users to see which one yields better metrics."
        },
        {
          id: "q2",
          text: "Which metric represents the percentage of users who stop using a product during a given time period?",
          options: [
            { id: "a", text: "Conversion Rate" },
            { id: "b", text: "Retention Rate" },
            { id: "c", text: "Churn Rate" },
            { id: "d", text: "Bounce Rate" }
          ],
          correctOptionId: "c",
          explanation: "Churn Rate measures the attrition of users over a specific period."
        },
        {
          id: "q3",
          text: "What does NPS stand for?",
          options: [
            { id: "a", text: "Net Product Score" },
            { id: "b", text: "New Product Sales" },
            { id: "c", text: "Net Promoter Score" },
            { id: "d", text: "Normalized Performance Statistic" }
          ],
          correctOptionId: "c",
          explanation: "Net Promoter Score (NPS) is a widely used market research metric that asks respondents to rate the likelihood they would recommend a company/product."
        },
        {
          id: "q4",
          text: "Which SQL clause is used to filter the results of a GROUP BY operation?",
          options: [
            { id: "a", text: "WHERE" },
            { id: "b", text: "HAVING" },
            { id: "c", text: "ORDER BY" },
            { id: "d", text: "LIMIT" }
          ],
          correctOptionId: "b",
          explanation: "The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions."
        },
        {
          id: "q5",
          text: "What is a 'Cohort Analysis'?",
          options: [
            { id: "a", text: "Analyzing the performance of competitors" },
            { id: "b", text: "Studying the behavior of a group of users who share a common characteristic over time" },
            { id: "c", text: "Calculating the total revenue generated by all users" },
            { id: "d", text: "A method to estimate server load" }
          ],
          correctOptionId: "b",
          explanation: "Cohort analysis breaks data down into related groups (cohorts) rather than looking at all users as one unit."
        }
      ]
    }
  },
  {
    skillTitle: "Data Analyst",
    data: {
      title: "Assessment: Data Analyst",
      timeLimitMinutes: 20,
      passMarkPercentage: 60,
      questions: [
        {
          id: "q1",
          text: "Which Python library is most commonly used for data manipulation and analysis?",
          options: [
            { id: "a", text: "Django" },
            { id: "b", text: "Flask" },
            { id: "c", text: "Pandas" },
            { id: "d", text: "PyGame" }
          ],
          correctOptionId: "c",
          explanation: "Pandas is a powerful, fast, and flexible open-source data analysis and manipulation tool built on top of Python."
        },
        {
          id: "q2",
          text: "In statistics, what does the 'median' represent?",
          options: [
            { id: "a", text: "The average of all values" },
            { id: "b", text: "The most frequently occurring value" },
            { id: "c", text: "The middle value when a dataset is ordered from least to greatest" },
            { id: "d", text: "The difference between the highest and lowest values" }
          ],
          correctOptionId: "c",
          explanation: "The median is the middle number in a sorted, ascending or descending, list of numbers."
        },
        {
          id: "q3",
          text: "What type of join in SQL returns all rows from the left table and the matched rows from the right table?",
          options: [
            { id: "a", text: "INNER JOIN" },
            { id: "b", text: "LEFT JOIN" },
            { id: "c", text: "RIGHT JOIN" },
            { id: "d", text: "FULL OUTER JOIN" }
          ],
          correctOptionId: "b",
          explanation: "A LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and the matched records from the right table."
        },
        {
          id: "q4",
          text: "Which of the following is an example of structured data?",
          options: [
            { id: "a", text: "An audio file" },
            { id: "b", text: "A plain text email" },
            { id: "c", text: "A relational database table" },
            { id: "d", text: "A JPEG image" }
          ],
          correctOptionId: "c",
          explanation: "Structured data is highly organized and formatted so that it's easily searchable in relational databases."
        },
        {
          id: "q5",
          text: "What is the purpose of 'Data Cleaning'?",
          options: [
            { id: "a", text: "To delete the database" },
            { id: "b", text: "To identify and correct (or remove) corrupt, inaccurate, or incomplete records from a dataset" },
            { id: "c", text: "To compress data so it takes up less space" },
            { id: "d", text: "To convert all text to lowercase" }
          ],
          correctOptionId: "b",
          explanation: "Data cleaning is the process of fixing or removing incorrect, corrupted, incorrectly formatted, duplicate, or incomplete data within a dataset."
        }
      ]
    }
  }
];

async function main() {
  console.log("Seeding MVP assessments...");
  
  for (const assessment of assessments) {
    await prisma.assessmentCache.upsert({
      where: { skillTitle: assessment.skillTitle },
      update: { data: assessment.data },
      create: {
        skillTitle: assessment.skillTitle,
        data: assessment.data
      }
    });
    console.log(`✅ Seeded assessment for: ${assessment.skillTitle}`);
  }
  
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
