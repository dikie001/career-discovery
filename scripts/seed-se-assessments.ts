import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const assessments = [
  {
    skillTitle: "HTML5 & Semantic Web",
    assessment: {
      title: "HTML5 & Semantic Web Industry Exam",
      timeLimitMinutes: 20,
      passMarkPercentage: 60,
      questions: [
        {
          id: "q1",
          text: "Which HTML5 semantic element is most appropriate for containing a self-contained composition in a document, such as a blog post?",
          options: [
            { id: "o1", text: "<section>" },
            { id: "o2", text: "<article>" },
            { id: "o3", text: "<div>" },
            { id: "o4", text: "<aside>" }
          ],
          correctOptionId: "o2",
          explanation: "<article> represents a complete, self-contained composition."
        },
        {
          id: "q2",
          text: "What is the primary purpose of the <main> element in HTML5?",
          options: [
            { id: "o1", text: "To contain the site navigation" },
            { id: "o2", text: "To represent the dominant content of the <body>" },
            { id: "o3", text: "To group header elements" },
            { id: "o4", text: "To define a generic container" }
          ],
          correctOptionId: "o2",
          explanation: "<main> should contain the primary content unique to that page."
        },
        {
          id: "q3",
          text: "Which attribute is used to provide an alternative text for an image if it cannot be displayed?",
          options: [
            { id: "o1", text: "title" },
            { id: "o2", text: "src" },
            { id: "o3", text: "alt" },
            { id: "o4", text: "description" }
          ],
          correctOptionId: "o3",
          explanation: "The 'alt' attribute provides alternative information for an image if a user for some reason cannot view it (because of slow connection, an error in the src attribute, or if the user uses a screen reader)."
        }
      ]
    }
  },
  {
    skillTitle: "CSS3 & Flexbox",
    assessment: {
      title: "CSS3 & Flexbox Industry Exam",
      timeLimitMinutes: 20,
      passMarkPercentage: 60,
      questions: [
        {
          id: "q1",
          text: "Which CSS property is used to create a flex container?",
          options: [
            { id: "o1", text: "display: block" },
            { id: "o2", text: "display: flex" },
            { id: "o3", text: "display: grid" },
            { id: "o4", text: "flex-direction: row" }
          ],
          correctOptionId: "o2",
          explanation: "The display property set to 'flex' or 'inline-flex' creates a flex container."
        },
        {
          id: "q2",
          text: "How do you align flex items along the main axis?",
          options: [
            { id: "o1", text: "align-items" },
            { id: "o2", text: "justify-content" },
            { id: "o3", text: "align-content" },
            { id: "o4", text: "justify-items" }
          ],
          correctOptionId: "o2",
          explanation: "justify-content aligns items along the main axis (horizontal by default)."
        },
        {
          id: "q3",
          text: "What does the 'flex-wrap' property do?",
          options: [
            { id: "o1", text: "Specifies the direction of the flexible items" },
            { id: "o2", text: "Specifies whether the flex items should wrap or not" },
            { id: "o3", text: "Aligns the flex lines" },
            { id: "o4", text: "Changes the size of the container" }
          ],
          correctOptionId: "o2",
          explanation: "flex-wrap determines whether flex items are forced onto one line or can wrap onto multiple lines."
        }
      ]
    }
  },
  {
    skillTitle: "JavaScript ES6",
    assessment: {
      title: "JavaScript ES6 Industry Exam",
      timeLimitMinutes: 20,
      passMarkPercentage: 60,
      questions: [
        {
          id: "q1",
          text: "Which keyword is used to declare a block-scoped variable that cannot be reassigned?",
          options: [
            { id: "o1", text: "var" },
            { id: "o2", text: "let" },
            { id: "o3", text: "const" },
            { id: "o4", text: "static" }
          ],
          correctOptionId: "o3",
          explanation: "'const' declares a block-scoped variable whose value cannot be reassigned."
        },
        {
          id: "q2",
          text: "What is the output of `console.log(typeof [])` in JavaScript?",
          options: [
            { id: "o1", text: "array" },
            { id: "o2", text: "object" },
            { id: "o3", text: "list" },
            { id: "o4", text: "undefined" }
          ],
          correctOptionId: "o2",
          explanation: "Arrays are a special type of object in JavaScript, so typeof [] returns 'object'."
        },
        {
          id: "q3",
          text: "Which of the following is correct syntax for an arrow function?",
          options: [
            { id: "o1", text: "function = () => {}" },
            { id: "o2", text: "() => {}" },
            { id: "o3", text: "=> () {}" },
            { id: "o4", text: "() {} =>" }
          ],
          correctOptionId: "o2",
          explanation: "The correct arrow function syntax is () => {}."
        }
      ]
    }
  },
  {
    skillTitle: "React.js",
    assessment: {
      title: "React.js Industry Exam",
      timeLimitMinutes: 20,
      passMarkPercentage: 60,
      questions: [
        {
          id: "q1",
          text: "Which hook is used to perform side effects in a functional component?",
          options: [
            { id: "o1", text: "useState" },
            { id: "o2", text: "useContext" },
            { id: "o3", text: "useEffect" },
            { id: "o4", text: "useReducer" }
          ],
          correctOptionId: "o3",
          explanation: "useEffect is the hook used for managing side effects in functional components."
        },
        {
          id: "q2",
          text: "What is JSX?",
          options: [
            { id: "o1", text: "A template language" },
            { id: "o2", text: "A syntax extension for JavaScript" },
            { id: "o3", text: "A new version of HTML" },
            { id: "o4", text: "A styling framework" }
          ],
          correctOptionId: "o2",
          explanation: "JSX is a syntax extension for JavaScript that looks similar to XML/HTML, used by React."
        },
        {
          id: "q3",
          text: "How do you pass data from a parent component to a child component?",
          options: [
            { id: "o1", text: "Using state" },
            { id: "o2", text: "Using props" },
            { id: "o3", text: "Using Context" },
            { id: "o4", text: "Using Redux" }
          ],
          correctOptionId: "o2",
          explanation: "Props are used to pass data from a parent component down to a child component."
        }
      ]
    }
  },
  {
    skillTitle: "Node.js & Express.js",
    assessment: {
      title: "Node.js & Express.js Industry Exam",
      timeLimitMinutes: 20,
      passMarkPercentage: 60,
      questions: [
        {
          id: "q1",
          text: "Which object is used in Express to represent the HTTP request?",
          options: [
            { id: "o1", text: "res" },
            { id: "o2", text: "req" },
            { id: "o3", text: "app" },
            { id: "o4", text: "next" }
          ],
          correctOptionId: "o2",
          explanation: "The 'req' object represents the HTTP request and has properties for the request query string, parameters, body, HTTP headers, and so on."
        },
        {
          id: "q2",
          text: "How do you define a middleware in Express?",
          options: [
            { id: "o1", text: "app.use()" },
            { id: "o2", text: "app.middleware()" },
            { id: "o3", text: "app.set()" },
            { id: "o4", text: "app.get()" }
          ],
          correctOptionId: "o1",
          explanation: "app.use() is used to bind middleware to your application."
        },
        {
          id: "q3",
          text: "What is the event loop in Node.js?",
          options: [
            { id: "o1", text: "A library for mathematical operations" },
            { id: "o2", text: "The mechanism that allows Node to perform non-blocking I/O operations" },
            { id: "o3", text: "A built-in database" },
            { id: "o4", text: "A framework for routing" }
          ],
          correctOptionId: "o2",
          explanation: "The event loop is what allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel whenever possible."
        }
      ]
    }
  }
];

async function main() {
  console.log("Seeding Software Engineering assessments...");

  for (const item of assessments) {
    const existing = await prisma.assessmentCache.findUnique({
      where: { skillTitle: item.skillTitle }
    });

    if (existing) {
      console.log(`Updating ${item.skillTitle}...`);
      await prisma.assessmentCache.update({
        where: { skillTitle: item.skillTitle },
        data: {
          data: item.assessment
        }
      });
    } else {
      console.log(`Creating ${item.skillTitle}...`);
      await prisma.assessmentCache.create({
        data: {
          skillTitle: item.skillTitle,
          data: item.assessment
        }
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
