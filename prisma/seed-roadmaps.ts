import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NodeDefinition {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'skill' | 'project' | 'career_opportunity';
  isRoot?: boolean;
}

interface EdgeDefinition {
  source: string;
  target: string;
}

interface DetailedRoadmap {
  careerTitle: string;
  roadmapTitle: string;
  roadmapDescription: string;
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
}

const detailedRoadmaps: DetailedRoadmap[] = [
  // --- TECH & COMPUTER SCIENCE ---
  {
    careerTitle: 'Software Engineer',
    roadmapTitle: 'Software Engineer Master Path',
    roadmapDescription: 'Industry-ready path from computer science fundamentals to scalable software architecture.',
    nodes: [
      { id: 'se-1', title: 'Computer Science Fundamentals', description: 'Data structures, algorithms, object-oriented programming, and memory layout. Recommended: freeCodeCamp & Coursera.', type: 'milestone', isRoot: true },
      { id: 'se-2', title: 'Git & Version Control', description: 'Branching strategies, pull requests, and open-source collaboration on GitHub.', type: 'skill' },
      { id: 'se-3', title: 'Fullstack Development (React & Node.js)', description: 'Building responsive user interfaces and backend REST/GraphQL APIs using TypeScript.', type: 'skill' },
      { id: 'se-4', title: 'Relational Databases & ORMs', description: 'Database design, indexing, and query optimization with PostgreSQL and Prisma.', type: 'skill' },
      { id: 'se-5', title: 'Software Architecture & System Design', description: 'Microservices, caching strategies (Redis), and distributed system patterns.', type: 'skill' },
      { id: 'se-6', title: 'Production App Portfolio & Attachment', description: 'Real-world logistics: Build a production SaaS application and complete a local tech hub industrial attachment.', type: 'project' }
    ],
    edges: [
      { source: 'se-1', target: 'se-2' },
      { source: 'se-2', target: 'se-3' },
      { source: 'se-3', target: 'se-4' },
      { source: 'se-4', target: 'se-5' },
      { source: 'se-5', target: 'se-6' }
    ]
  },
  {
    careerTitle: 'Fullstack Web Developer',
    roadmapTitle: 'Fullstack Web Developer Path',
    roadmapDescription: 'Master modern frontend frameworks, backend runtimes, and cloud deployments.',
    nodes: [
      { id: 'fwd-1', title: 'HTML5, CSS3 & Modern JavaScript', description: 'DOM manipulation, async/await, ES6+, and semantic web markup. Recommended: MDN Web Docs & freeCodeCamp.', type: 'milestone', isRoot: true },
      { id: 'fwd-2', title: 'Tailwind CSS & Responsive Design', description: 'Utility-first styling, mobile-first design systems, and component layout.', type: 'skill' },
      { id: 'fwd-3', title: 'Frontend Framework (React / Next.js)', description: 'Component state, server-side rendering (SSR), and dynamic routing.', type: 'skill' },
      { id: 'fwd-4', title: 'Backend APIs (Node.js / Express / Supabase)', description: 'Authentication, CORS, database schemas, and API integration.', type: 'skill' },
      { id: 'fwd-5', title: 'Single-Vendor E-Commerce Capstone', description: 'Build and deploy a full-stack storefront with mobile payment API webhooks and live DNS routing.', type: 'project' }
    ],
    edges: [
      { source: 'fwd-1', target: 'fwd-2' },
      { source: 'fwd-2', target: 'fwd-3' },
      { source: 'fwd-3', target: 'fwd-4' },
      { source: 'fwd-4', target: 'fwd-5' }
    ]
  },
  {
    careerTitle: 'Cybersecurity Analyst',
    roadmapTitle: 'Cybersecurity & Threat Defense Path',
    roadmapDescription: 'Protect organizational assets, analyze threat vectors, and execute security audits.',
    nodes: [
      { id: 'sec-1', title: 'Networking & OS Security', description: 'TCP/IP stack, Linux/Windows administration, and firewall rules. Recommended: Cybrary & TryHackMe.', type: 'milestone', isRoot: true },
      { id: 'sec-2', title: 'Ethical Hacking & Penetration Testing', description: 'Vulnerability assessment tools (Nmap, Metasploit, Wireshark) and OWASP Top 10.', type: 'skill' },
      { id: 'sec-3', title: 'SIEM & Threat Monitoring', description: 'Log analysis, incident response, and security operations using Splunk or Elastic Security.', type: 'skill' },
      { id: 'sec-4', title: 'CompTIA Security+ / Certified Ethical Hacker', description: 'Industry certification preparation and compliance standards (ISO 27001).', type: 'skill' },
      { id: 'sec-5', title: 'Enterprise Audit & Simulation', description: 'Perform a full vulnerability audit and incident response write-up for a simulated corporate network.', type: 'project' }
    ],
    edges: [
      { source: 'sec-1', target: 'sec-2' },
      { source: 'sec-2', target: 'sec-3' },
      { source: 'sec-3', target: 'sec-4' },
      { source: 'sec-4', target: 'sec-5' }
    ]
  },
  {
    careerTitle: 'Network Engineer',
    roadmapTitle: 'Network Engineering & Infrastructure Path',
    roadmapDescription: 'Configure, optimize, and maintain reliable local and wide-area network systems.',
    nodes: [
      { id: 'net-1', title: 'Network Fundamentals & Cisco CCNA', description: 'Routing protocols (OSPF, BGP), VLANs, and IPv4/IPv6 subnetting. Recommended: Cisco Networking Academy & Udemy.', type: 'milestone', isRoot: true },
      { id: 'net-2', title: 'Switching & Wireless Architectures', description: 'Enterprise switch configurations, trunking, STP, and wireless LAN controllers.', type: 'skill' },
      { id: 'net-3', title: 'Network Security & Firewalls', description: 'VPN tunnels, NAT, Access Control Lists (ACLs), and hardware firewalls.', type: 'skill' },
      { id: 'net-4', title: 'Multi-Site Subnet Infrastructure', description: 'Deploy and test isolated private subnet routing and Virtual Machines in an enterprise sandbox.', type: 'project' }
    ],
    edges: [
      { source: 'net-1', target: 'net-2' },
      { source: 'net-2', target: 'net-3' },
      { source: 'net-3', target: 'net-4' }
    ]
  },
  {
    careerTitle: 'Cloud Solutions Architect',
    roadmapTitle: 'Cloud Solutions Architecture Path',
    roadmapDescription: 'Design scalable, fault-tolerant cloud environments on AWS, Google Cloud, or Azure.',
    nodes: [
      { id: 'csa-1', title: 'Cloud Computing Foundations', description: 'IaaS, PaaS, SaaS models, cloud security, and IAM controls. Recommended: AWS Skill Builder & Google Cloud Skills Boost.', type: 'milestone', isRoot: true },
      { id: 'csa-2', title: 'Serverless & Virtual Networking', description: 'VPCs, subnets, elastic load balancing, auto-scaling, and serverless compute functions.', type: 'skill' },
      { id: 'csa-3', title: 'Cloud Migration & Cost Optimization', description: 'Database migration services, storage tiering (S3/Cloud Storage), and FinOps.', type: 'skill' },
      { id: 'csa-4', title: 'Multi-Region Distributed Architecture', description: 'Design a high-availability cloud architecture with automated failover and CDN distribution.', type: 'project' }
    ],
    edges: [
      { source: 'csa-1', target: 'csa-2' },
      { source: 'csa-2', target: 'csa-3' },
      { source: 'csa-3', target: 'csa-4' }
    ]
  },
  {
    careerTitle: 'Junior Data Analyst',
    roadmapTitle: 'Data Analytics Master Path',
    roadmapDescription: 'Transform raw datasets into actionable business insights using SQL, Python, and BI tools.',
    nodes: [
      { id: 'da-1', title: 'Excel & Data Manipulation', description: 'Advanced formulas, pivot tables, and statistical data cleaning. Recommended: Coursera Data Analytics Certificate.', type: 'milestone', isRoot: true },
      { id: 'da-2', title: 'SQL for Analytics', description: 'Complex joins, window functions, aggregation, and relational database queries.', type: 'skill' },
      { id: 'da-3', title: 'Data Visualization (PowerBI / Tableau)', description: 'Dashboard design, business KPIs, and interactive reporting.', type: 'skill' },
      { id: 'da-4', title: 'Python for Data Analysis', description: 'Data exploratory analysis using Pandas, NumPy, and Seaborn.', type: 'skill' },
      { id: 'da-5', title: 'Industry Dataset Case Study', description: 'Clean, analyze, and present interactive dashboard insights from a local market industry dataset.', type: 'project' }
    ],
    edges: [
      { source: 'da-1', target: 'da-2' },
      { source: 'da-2', target: 'da-3' },
      { source: 'da-3', target: 'da-4' },
      { source: 'da-4', target: 'da-5' }
    ]
  },
  {
    careerTitle: 'DevOps & SRE Engineer',
    roadmapTitle: 'DevOps & Site Reliability Engineering Path',
    roadmapDescription: 'Automate deployment pipelines, scale infrastructure-as-code, and ensure 99.99% uptime.',
    nodes: [
      { id: 'dev-1', title: 'Linux Administration & Scripting', description: 'Kernel operations, systemd, networking tools, and Bash/Python automation. Recommended: KodeKloud & Linux Foundation.', type: 'milestone', isRoot: true },
      { id: 'dev-2', title: 'Containerization & Docker', description: 'Dockerfile optimization, multi-stage builds, container security, and Docker Compose.', type: 'skill' },
      { id: 'dev-3', title: 'Infrastructure as Code (Terraform)', description: 'Declarative resource provisioning, module creation, and state management.', type: 'skill' },
      { id: 'dev-4', title: 'CI/CD Pipelines & Kubernetes', description: 'GitHub Actions, automated testing, container orchestration, and cluster auto-scaling.', type: 'skill' },
      { id: 'dev-5', title: 'Automated Microservices Deployment', description: 'Deploy an isolated distributed RPC microservices system using Terraform and continuous integration workflows.', type: 'project' }
    ],
    edges: [
      { source: 'dev-1', target: 'dev-2' },
      { source: 'dev-2', target: 'dev-3' },
      { source: 'dev-3', target: 'dev-4' },
      { source: 'dev-4', target: 'dev-5' }
    ]
  },
  {
    careerTitle: 'Mobile App Developer',
    roadmapTitle: 'Mobile Application Engineering Path',
    roadmapDescription: 'Engineer high-performance mobile applications for iOS and Android ecosystems.',
    nodes: [
      { id: 'mob-1', title: 'Mobile UX & Core Language (Dart/Kotlin/Swift)', description: 'Mobile design principles, state management, and memory constraints. Recommended: Udemy Mobile Bootcamp.', type: 'milestone', isRoot: true },
      { id: 'mob-2', title: 'Cross-Platform Framework (Flutter / React Native)', description: 'Widget trees, reactive UI components, navigation, and native module bridges.', type: 'skill' },
      { id: 'mob-3', title: 'REST APIs & Mobile Payment Webhooks', description: 'Backend synchronization, offline persistence, and automated mobile money API integrations.', type: 'skill' },
      { id: 'mob-4', title: 'App Store Deployment & CI/CD', description: 'Fastlane, Google Play Console, and Apple App Store submission guidelines.', type: 'skill' },
      { id: 'mob-5', title: 'Utility App Capstone', description: 'Build and publish a functional mobile commerce or community application with automated payment testing.', type: 'project' }
    ],
    edges: [
      { source: 'mob-1', target: 'mob-2' },
      { source: 'mob-2', target: 'mob-3' },
      { source: 'mob-3', target: 'mob-4' },
      { source: 'mob-4', target: 'mob-5' }
    ]
  },
  {
    careerTitle: 'Artificial Intelligence Engineer',
    roadmapTitle: 'Artificial Intelligence & Machine Learning Path',
    roadmapDescription: 'Develop machine learning models, neural networks, and generative AI pipelines.',
    nodes: [
      { id: 'ai-1', title: 'Mathematics & Python for AI', description: 'Linear algebra, calculus, probability, and PyTorch/TensorFlow basics. Recommended: DeepLearning.AI.', type: 'milestone', isRoot: true },
      { id: 'ai-2', title: 'Supervised & Unsupervised Learning', description: 'Regression, classification, clustering, decision trees, and model evaluation metrics.', type: 'skill' },
      { id: 'ai-3', title: 'Deep Learning & Neural Networks', description: 'Convolutional networks (CNNs), recurrent networks (RNNs), and transformers.', type: 'skill' },
      { id: 'ai-4', title: 'Generative AI & LLM Fine-Tuning', description: 'Prompt engineering, RAG (Retrieval-Augmented Generation), vector databases, and model deployment.', type: 'skill' },
      { id: 'ai-5', title: 'Domain-Specific AI Agent Project', description: 'Train or fine-tune an open-source model and expose it as a real-time web service API.', type: 'project' }
    ],
    edges: [
      { source: 'ai-1', target: 'ai-2' },
      { source: 'ai-2', target: 'ai-3' },
      { source: 'ai-3', target: 'ai-4' },
      { source: 'ai-4', target: 'ai-5' }
    ]
  },
  {
    careerTitle: 'Database Administrator',
    roadmapTitle: 'Database Administration & Data Reliability Path',
    roadmapDescription: 'Ensure performance, security, high availability, and backups across database clusters.',
    nodes: [
      { id: 'dba-1', title: 'Relational Database Architecture', description: 'ACID properties, indexing types, query execution plans, and storage engines. Recommended: Oracle / PostgreSQL Docs.', type: 'milestone', isRoot: true },
      { id: 'dba-2', title: 'Database Administration & Maintenance', description: 'User management, grants, backup/restore procedures, and point-in-time recovery.', type: 'skill' },
      { id: 'dba-3', title: 'Performance Tuning & Replication', description: 'Slow query optimization, connection pooling, read replicas, and sharding.', type: 'skill' },
      { id: 'dba-4', title: 'Database Cluster Deployment', description: 'Deploy a high-availability primary-replica PostgreSQL database cluster with automated failover.', type: 'project' }
    ],
    edges: [
      { source: 'dba-1', target: 'dba-2' },
      { source: 'dba-2', target: 'dba-3' },
      { source: 'dba-3', target: 'dba-4' }
    ]
  },
  {
    careerTitle: 'Systems Analyst',
    roadmapTitle: 'Systems Analysis & IT Optimization Path',
    roadmapDescription: 'Evaluate business IT infrastructures and design specifications for technical teams.',
    nodes: [
      { id: 'sa-1', title: 'Requirements Engineering & SDLC', description: 'Functional vs. non-functional requirements, Agile methodologies, and user stories. Recommended: IIBA.', type: 'milestone', isRoot: true },
      { id: 'sa-2', title: 'UML & Business Process Mapping', description: 'Use case diagrams, sequence diagrams, and workflow models (BPMN).', type: 'skill' },
      { id: 'sa-3', title: 'System Architecture Evaluation', description: 'Legacy system audits, data flow analysis, and technical feasibility studies.', type: 'skill' },
      { id: 'sa-4', title: 'Enterprise System Blueprint', description: 'Draft a comprehensive software specification document for decoupling and modernizing a publication repository system.', type: 'project' }
    ],
    edges: [
      { source: 'sa-1', target: 'sa-2' },
      { source: 'sa-2', target: 'sa-3' },
      { source: 'sa-3', target: 'sa-4' }
    ]
  },
  {
    careerTitle: 'Blockchain Developer',
    roadmapTitle: 'Blockchain & Decentralized Applications Path',
    roadmapDescription: 'Engineer smart contracts and decentralized protocols on distributed ledgers.',
    nodes: [
      { id: 'bc-1', title: 'Cryptography & Blockchain Mechanics', description: 'Hashing, public/private keys, consensus algorithms (PoW, PoS). Recommended: Buildspace & Ethereum Docs.', type: 'milestone', isRoot: true },
      { id: 'bc-2', title: 'Smart Contract Development (Solidity)', description: 'EVM architecture, state variables, modifiers, events, and gas optimization.', type: 'skill' },
      { id: 'bc-3', title: 'Web3 Frontend Integration', description: 'Connecting web interfaces to smart contracts using Ethers.js / Viem and Web3 wallets.', type: 'skill' },
      { id: 'bc-4', title: 'Decentralized App (dApp) Capstone', description: 'Deploy a audited smart contract to a testnet and build a web interface to interact with it.', type: 'project' }
    ],
    edges: [
      { source: 'bc-1', target: 'bc-2' },
      { source: 'bc-2', target: 'bc-3' },
      { source: 'bc-3', target: 'bc-4' }
    ]
  },
  {
    careerTitle: 'Game Developer',
    roadmapTitle: 'Game Development & Graphics Engineering Path',
    roadmapDescription: 'Program interactive game mechanics, physics engines, and virtual worlds.',
    nodes: [
      { id: 'gd-1', title: 'C# / C++ Programming & Math', description: 'Vectors, linear algebra, object-oriented design, and frame loops. Recommended: Unity Learn / Unreal Online.', type: 'milestone', isRoot: true },
      { id: 'gd-2', title: 'Game Engine Mastery (Unity / Unreal)', description: 'Prefab structures, collision detection, lighting, and particle systems.', type: 'skill' },
      { id: 'gd-3', title: 'Game Mechanics & AI Behaviors', description: 'State machines, pathfinding algorithms, and user interaction mechanics.', type: 'skill' },
      { id: 'gd-4', title: 'Playable Game Prototype', description: 'Build and export a complete multi-level 2D/3D game prototype with sound and particle effects.', type: 'project' }
    ],
    edges: [
      { source: 'gd-1', target: 'gd-2' },
      { source: 'gd-2', target: 'gd-3' },
      { source: 'gd-3', target: 'gd-4' }
    ]
  },
  {
    careerTitle: 'IT Support Specialist',
    roadmapTitle: 'IT Support & Systems Operations Path',
    roadmapDescription: 'Troubleshoot hardware, software, user permissions, and network connectivity.',
    nodes: [
      { id: 'it-1', title: 'Hardware & OS Troubleshooting', description: 'CompTIA A+ topics: PC assembly, Windows/Linux OS repair, and driver configuration. Recommended: Google IT Support Professional Certificate.', type: 'milestone', isRoot: true },
      { id: 'it-2', title: 'Active Directory & User Management', description: 'Domain administration, Group Policies (GPO), and cloud directory services.', type: 'skill' },
      { id: 'it-3', title: 'Helpdesk Ticketing & Remote Support', description: 'ITIL service management, SLAs, and remote desktop administration.', type: 'skill' },
      { id: 'it-4', title: 'IT Operations Lab Setup', description: 'Set up an isolated domain controller with user permissions and automated workstation deployment scripts.', type: 'project' }
    ],
    edges: [
      { source: 'it-1', target: 'it-2' },
      { source: 'it-2', target: 'it-3' },
      { source: 'it-3', target: 'it-4' }
    ]
  },

  // --- CREATIVES & DESIGN ---
  {
    careerTitle: 'UI/UX Product Designer',
    roadmapTitle: 'UI/UX Design & Product Strategy Path',
    roadmapDescription: 'Design user-centered digital interfaces, component design systems, and prototypes.',
    nodes: [
      { id: 'ux-1', title: 'User Research & Personas', description: 'User interviews, journey mapping, empathy maps, and usability testing. Recommended: Google UX Design Certificate.', type: 'milestone', isRoot: true },
      { id: 'ux-2', title: 'Information Architecture & Wireframing', description: 'Low-fidelity layouts, sitemaps, and user flows in Figma.', type: 'skill' },
      { id: 'ux-3', title: 'Design Systems & High-Fidelity UI', description: 'Auto-layout, responsive grid design, typography scales, and accessibility (WCAG).', type: 'skill' },
      { id: 'ux-4', title: 'Interactive Prototyping & Handoff', description: 'Interactive micro-animations and developer design tokens.', type: 'skill' },
      { id: 'ux-5', title: 'Community App Design Overhaul', description: 'Real-world logistics: Prototype a responsive mobile application layout in Figma for a local community initiative.', type: 'project' }
    ],
    edges: [
      { source: 'ux-1', target: 'ux-2' },
      { source: 'ux-2', target: 'ux-3' },
      { source: 'ux-3', target: 'ux-4' },
      { source: 'ux-4', target: 'ux-5' }
    ]
  },
  {
    careerTitle: 'Graphic Designer',
    roadmapTitle: 'Graphic Design & Brand Identity Path',
    roadmapDescription: 'Master visual communication, brand assets, typography layouts, and print/digital vector design.',
    nodes: [
      { id: 'gd-1', title: 'Design Theory & Color Psychology', description: 'Composition, grid systems, visual hierarchy, and color palettes. Recommended: Adobe Creative Cloud Tutorials.', type: 'milestone', isRoot: true },
      { id: 'gd-2', title: 'Vector Illustration (Adobe Illustrator)', description: 'Pen tool techniques, logo creation, scalable vector assets, and typography.', type: 'skill' },
      { id: 'gd-3', title: 'Image Editing & Layout (Photoshop / InDesign)', description: 'Photo manipulation, color correction, print setup, and publication layouts.', type: 'skill' },
      { id: 'gd-4', title: 'Brand Identity Package', description: 'Design a complete brand identity package (logos, brand guidelines, graphic poster layouts, and social media assets).', type: 'project' }
    ],
    edges: [
      { source: 'gd-1', target: 'gd-2' },
      { source: 'gd-2', target: 'gd-3' },
      { source: 'gd-3', target: 'gd-4' }
    ]
  },
  {
    careerTitle: 'Video Editor & Motion Designer',
    roadmapTitle: 'Video Editing & Motion Graphics Path',
    roadmapDescription: 'Craft visual storytelling, visual effects, motion graphics, and post-production audio.',
    nodes: [
      { id: 've-1', title: 'Video Editing Fundamentals', description: 'Timeline pacing, rough cuts, transitions, and audio sync. Recommended: Premiere Pro Masterclass on Udemy.', type: 'milestone', isRoot: true },
      { id: 've-2', title: 'Color Grading & Audio Post', description: 'Lumetri color wheels, sound balancing, noise reduction, and EQ adjustments.', type: 'skill' },
      { id: 've-3', title: 'Motion Graphics (Adobe After Effects)', description: 'Keyframe animation, kinetic typography, lower thirds, and compositing.', type: 'skill' },
      { id: 've-4', title: 'Commercial Video Reel', description: 'Produce a 60-second high-energy promotional video reel featuring animated graphic overlays.', type: 'project' }
    ],
    edges: [
      { source: 've-1', target: 've-2' },
      { source: 've-2', target: 've-3' },
      { source: 've-3', target: 've-4' }
    ]
  },
  {
    careerTitle: 'Content Strategist',
    roadmapTitle: 'Content Strategy & Editorial Planning Path',
    roadmapDescription: 'Plan, produce, and optimize digital content campaigns to drive engagement and retention.',
    nodes: [
      { id: 'cs-1', title: 'Audience Research & Content Audits', description: 'Identifying user intent, content mapping, and competitive analysis. Recommended: HubSpot Content Marketing.', type: 'milestone', isRoot: true },
      { id: 'cs-2', title: 'SEO Copywriting & Editorial Calendars', description: 'Keyword research, long-form content structuring, and publication planning.', type: 'skill' },
      { id: 'cs-3', title: 'Multi-Channel Distribution & Analytics', description: 'Repurposing content across social, email, and web platforms; measuring ROI.', type: 'skill' },
      { id: 'cs-4', title: 'Digital Campaign Blueprint', description: 'Develop a 3-month content strategy plan and editorial calendar for a digital campaign launch.', type: 'project' }
    ],
    edges: [
      { source: 'cs-1', target: 'cs-2' },
      { source: 'cs-2', target: 'cs-3' },
      { source: 'cs-3', target: 'cs-4' }
    ]
  },
  {
    careerTitle: '3D Artist & Modeler',
    roadmapTitle: '3D Modeling & Digital Asset Path',
    roadmapDescription: 'Create high-resolution 3D models, textures, rigs, and assets for gaming or product rendering.',
    nodes: [
      { id: 'art-1', title: '3D Mesh Topology & Sculpting', description: 'Poly modeling, sub-surface division, and digital sculpting. Recommended: Blender Guru & CG Boost.', type: 'milestone', isRoot: true },
      { id: 'art-2', title: 'Blender Workflow & Rigging', description: 'Object hierarchies, armature creation, bone weights, and animation keys.', type: 'skill' },
      { id: 'art-3', title: 'UV Unwrapping, Texturing & Rendering', description: 'PBR materials, node shaders, studio lighting, and Cycles rendering.', type: 'skill' },
      { id: 'art-4', title: '4K Rendered Product Asset Pack', description: 'Real-world logistics: Render a high-resolution 4K asset showcase suitable for commercial brand pitches.', type: 'project' }
    ],
    edges: [
      { source: 'art-1', target: 'art-2' },
      { source: 'art-2', target: 'art-3' },
      { source: 'art-3', target: 'art-4' }
    ]
  },

  // --- BUSINESS & MANAGEMENT ---
  {
    careerTitle: 'Product Manager',
    roadmapTitle: 'Product Management Master Path',
    roadmapDescription: 'Lead product strategy, roadmap execution, user validation, and cross-functional teams.',
    nodes: [
      { id: 'pm-1', title: 'Product Discovery & Market Research', description: 'Problem definition, competitive benchmarks, and product-market fit. Recommended: Product School & Reforge.', type: 'milestone', isRoot: true },
      { id: 'pm-2', title: 'Agile & Scrum Methodologies', description: 'Backlog prioritization (MoSCoW, RICE), sprint planning, and user stories.', type: 'skill' },
      { id: 'pm-3', title: 'Product Analytics & Metrics', description: 'Cohort retention, conversion funnels, A/B testing, and OKR tracking.', type: 'skill' },
      { id: 'pm-4', title: 'PRD & Interactive Spec Document', description: 'Write a comprehensive Product Requirements Document (PRD) with interactive wireframes for a new digital product feature.', type: 'project' }
    ],
    edges: [
      { source: 'pm-1', target: 'pm-2' },
      { source: 'pm-2', target: 'pm-3' },
      { source: 'pm-3', target: 'pm-4' }
    ]
  },
  {
    careerTitle: 'Digital Marketing Specialist',
    roadmapTitle: 'Digital Marketing & Growth Path',
    roadmapDescription: 'Drive acquisition through search engine optimization, performance ads, and sales funnels.',
    nodes: [
      { id: 'dm-1', title: 'Marketing Funnels & Customer Acquisition', description: 'TOFU/MOFU/BOFU strategies, buyer personas, and campaign analytics. Recommended: Google Digital Garage.', type: 'milestone', isRoot: true },
      { id: 'dm-2', title: 'Search Engine Optimization (SEO)', description: 'On-page SEO, technical audits, backlink strategy, and keyword mapping.', type: 'skill' },
      { id: 'dm-3', title: 'Performance Ads & Social Funnels', description: 'Meta Ads Manager, Google Search Ads, retargeting, and landing page optimization.', type: 'skill' },
      { id: 'dm-4', title: 'Growth Marketing Campaign', description: 'Design and execute an integrated end-to-end digital acquisition campaign with tracked conversion conversion goals.', type: 'project' }
    ],
    edges: [
      { source: 'dm-1', target: 'dm-2' },
      { source: 'dm-2', target: 'dm-3' },
      { source: 'dm-3', target: 'dm-4' }
    ]
  },
  {
    careerTitle: 'Financial Analyst',
    roadmapTitle: 'Financial Analysis & Valuation Path',
    roadmapDescription: 'Evaluate business performance, build financial models, and analyze market trends.',
    nodes: [
      { id: 'fa-1', title: 'Financial Accounting & Statements', description: 'Income statements, balance sheets, and cash flow analysis. Recommended: Corporate Finance Institute (CFI).', type: 'milestone', isRoot: true },
      { id: 'fa-2', title: 'Financial Modeling in Excel', description: 'Discounted Cash Flow (DCF), three-statement modeling, and scenario analysis.', type: 'skill' },
      { id: 'fa-3', title: 'Corporate Valuation & Capital Markets', description: 'WACC calculations, enterprise value, and industry ratio benchmarks.', type: 'skill' },
      { id: 'fa-4', title: 'Corporate Valuation Report', description: 'Build a dynamic DCF model and equity research report for a publicly traded enterprise.', type: 'project' }
    ],
    edges: [
      { source: 'fa-1', target: 'fa-2' },
      { source: 'fa-2', target: 'fa-3' },
      { source: 'fa-3', target: 'fa-4' }
    ]
  },
  {
    careerTitle: 'Human Resources Manager',
    roadmapTitle: 'Human Resources & Talent Management Path',
    roadmapDescription: 'Oversee talent acquisition, organizational development, policy compliance, and employee culture.',
    nodes: [
      { id: 'hr-1', title: 'HR Fundamentals & Labor Law', description: 'Employment contracts, statutory compliance, workplace regulations, and dispute resolution. Recommended: SHRM / CIPD.', type: 'milestone', isRoot: true },
      { id: 'hr-2', title: 'Talent Acquisition & Onboarding', description: 'Structured interviewing, candidate evaluation, compensation structuring, and onboarding logistics.', type: 'skill' },
      { id: 'hr-3', title: 'Performance Management & Learning Logistics', description: 'KPI setting, performance appraisal frameworks, and real-world employee training logistics.', type: 'skill' },
      { id: 'hr-4', title: 'HR Strategy & Policy Blueprint', description: 'Draft a complete employee handbook, performance evaluation rubric, and annual training logistics plan.', type: 'project' }
    ],
    edges: [
      { source: 'hr-1', target: 'hr-2' },
      { source: 'hr-2', target: 'hr-3' },
      { source: 'hr-3', target: 'hr-4' }
    ]
  },
  {
    careerTitle: 'Business Development Executive',
    roadmapTitle: 'Business Development & Strategic Partnerships Path',
    roadmapDescription: 'Identify growth channels, pitch corporate leads, negotiate deals, and scale revenue streams.',
    nodes: [
      { id: 'bd-1', title: 'Sales Pipelines & Lead Generation', description: 'B2B prospecting, cold outreach strategies, and CRM management. Recommended: HubSpot Sales Academy.', type: 'milestone', isRoot: true },
      { id: 'bd-2', title: 'Deal Structuring & Pitching', description: 'Value proposition design, pitch deck creation, and client presentation skills.', type: 'skill' },
      { id: 'bd-3', title: 'Contract Negotiation & Key Accounts', description: 'Closing strategies, contract terms, pricing structures, and account management.', type: 'skill' },
      { id: 'bd-4', title: 'B2B Partnership Proposal', description: 'Build a complete B2B expansion strategy, pitch deck, and revenue-sharing proposal.', type: 'project' }
    ],
    edges: [
      { source: 'bd-1', target: 'bd-2' },
      { source: 'bd-2', target: 'bd-3' },
      { source: 'bd-3', target: 'bd-4' }
    ]
  },
  {
    careerTitle: 'Management Consultant',
    roadmapTitle: 'Management Consulting & Strategy Path',
    roadmapDescription: 'Solve corporate operational challenges, restructure processes, and maximize organizational ROI.',
    nodes: [
      { id: 'mc-1', title: 'Problem Solving & Hypothesis Frameworks', description: 'Issue trees, MECE principle, and structured diagnostic frameworks. Recommended: Victor Cheng / CaseInterview.', type: 'milestone', isRoot: true },
      { id: 'mc-2', title: 'Data Analysis & Executive Storytelling', description: 'Quantitative modeling, market sizing, and executive C-suite slide deck design.', type: 'skill' },
      { id: 'mc-3', title: 'Operational Restructuring & Change Management', description: 'Process optimization, cost-cutting strategies, and organizational alignment.', type: 'skill' },
      { id: 'mc-4', title: 'Business Restructuring Case Study', description: 'Conduct an end-to-end operational analysis and present a strategic recommendation deck.', type: 'project' }
    ],
    edges: [
      { source: 'mc-1', target: 'mc-2' },
      { source: 'mc-2', target: 'mc-3' },
      { source: 'mc-3', target: 'mc-4' }
    ]
  },

  // --- MEDICINE & HEALTHCARE ---
  {
    careerTitle: 'Clinical Data Analyst',
    roadmapTitle: 'Clinical Data Analytics Path',
    roadmapDescription: 'Analyze medical datasets, clinical trial records, and healthcare operational workflows.',
    nodes: [
      { id: 'cda-1', title: 'Medical Terminology & EHR Standards', description: 'ICD-10 codes, HIPAA compliance, electronic health record structures. Recommended: Coursera Healthcare Analytics.', type: 'milestone', isRoot: true },
      { id: 'cda-2', title: 'Healthcare Biostatistics & R/Python', description: 'Survival analysis, clinical trial statistics, and hypothesis testing on health data.', type: 'skill' },
      { id: 'cda-3', title: 'SQL & Clinical Quality Dashboarding', description: 'Querying medical records, tracking patient outcomes, and hospital performance metrics.', type: 'skill' },
      { id: 'cda-4', title: 'Patient Outcome Data Study', description: 'Perform statistical analysis on an anonymized public health dataset and report risk factors.', type: 'project' }
    ],
    edges: [
      { source: 'cda-1', target: 'cda-2' },
      { source: 'cda-2', target: 'cda-3' },
      { source: 'cda-3', target: 'cda-4' }
    ]
  },
  {
    careerTitle: 'Healthcare Informatics Specialist',
    roadmapTitle: 'Health Informatics & Systems Path',
    roadmapDescription: 'Bridge medical practice and IT infrastructure to optimize health record technology.',
    nodes: [
      { id: 'his-1', title: 'Health Information Systems', description: 'EHR/EMR architecture, HL7/FHIR interoperability standards. Recommended: AMIA Online.', type: 'milestone', isRoot: true },
      { id: 'his-2', title: 'Clinical Workflow Optimization', description: 'Mapping clinical care pathways, user adoption, and system usability.', type: 'skill' },
      { id: 'his-3', title: 'Health Data Security & Privacy', description: 'Patient data encryption, audit trails, and regulatory compliance.', type: 'skill' },
      { id: 'his-4', title: 'EHR Workflow Integration Blueprint', description: 'Design a modernized digital patient check-in and records management system diagram.', type: 'project' }
    ],
    edges: [
      { source: 'his-1', target: 'his-2' },
      { source: 'his-2', target: 'his-3' },
      { source: 'his-3', target: 'his-4' }
    ]
  },
  {
    careerTitle: 'Biomedical Engineer',
    roadmapTitle: 'Biomedical Engineering & Devices Path',
    roadmapDescription: 'Design medical diagnostic machinery, prosthetic devices, and healthcare hardware.',
    nodes: [
      { id: 'bme-1', title: 'Human Anatomy & Engineering Physics', description: 'Biomechanics, bio-materials, and physiological sensor inputs. Recommended: EDX Biomedical Engineering.', type: 'milestone', isRoot: true },
      { id: 'bme-2', title: 'Bio-Instrumentation & Signal Processing', description: 'ECG/EEG circuits, signal filtering, and medical device electronics.', type: 'skill' },
      { id: 'bme-3', title: 'Medical Device CAD & Regulations', description: '3D CAD modeling (SolidWorks), prototyping, and ISO 13485 regulations.', type: 'skill' },
      { id: 'bme-4', title: 'Diagnostic Device CAD Prototype', description: 'Model a portable diagnostic medical housing device and submit technical compliance docs.', type: 'project' }
    ],
    edges: [
      { source: 'bme-1', target: 'bme-2' },
      { source: 'bme-2', target: 'bme-3' },
      { source: 'bme-3', target: 'bme-4' }
    ]
  },
  {
    careerTitle: 'Registered Nurse',
    roadmapTitle: 'Nursing Care & Clinical Practice Path',
    roadmapDescription: 'Provide high-quality clinical care, patient administration, and emergency health treatments.',
    nodes: [
      { id: 'rn-1', title: 'Anatomy, Physiology & Pharmacology', description: 'Human body systems, drug dosages, and disease pathophysiology. Recommended: Nursing Council Guidelines.', type: 'milestone', isRoot: true },
      { id: 'rn-2', title: 'Clinical Nursing Skills & Patient Care', description: 'Vital signs monitoring, IV administration, wound care, and triage procedures.', type: 'skill' },
      { id: 'rn-3', title: 'Patient Advocacy & Critical Care', description: 'Emergency response, ethics, patient communication, and care plan documentation.', type: 'skill' },
      { id: 'rn-4', title: 'Hospital Attachment & Clinical Logbook', description: 'Real-world logistics: Complete a clinical hospital rotation logbook documenting supervised patient management hours.', type: 'project' }
    ],
    edges: [
      { source: 'rn-1', target: 'rn-2' },
      { source: 'rn-2', target: 'rn-3' },
      { source: 'rn-3', target: 'rn-4' }
    ]
  },
  {
    careerTitle: 'Health Services Manager',
    roadmapTitle: 'Health Services Administration Path',
    roadmapDescription: 'Direct medical practices, hospital departments, healthcare budgets, and clinical staff.',
    nodes: [
      { id: 'hsm-1', title: 'Healthcare Administration & Policy', description: 'Public health systems, hospital governance, and healthcare finance. Recommended: ACHE.', type: 'milestone', isRoot: true },
      { id: 'hsm-2', title: 'Clinical Operations & Quality Control', description: 'Resource scheduling, patient satisfaction metrics, and infection control protocols.', type: 'skill' },
      { id: 'hsm-3', title: 'Healthcare Budgeting & Compliance', description: 'Medical billing, insurance claims, inventory control, and legal compliance.', type: 'skill' },
      { id: 'hsm-4', title: 'Clinic Operations Overhaul Plan', description: 'Develop an operational efficiency, inventory control, and staffing optimization plan for a regional health center.', type: 'project' }
    ],
    edges: [
      { source: 'hsm-1', target: 'hsm-2' },
      { source: 'hsm-2', target: 'hsm-3' },
      { source: 'hsm-3', target: 'hsm-4' }
    ]
  }
];

async function main() {
  console.log('🚀 Seeding detailed roadmaps for all 30 careers...');

  for (const item of detailedRoadmaps) {
    // 1. Locate the existing career in database
    const career = await prisma.career.findFirst({
      where: { title: { equals: item.careerTitle, mode: 'insensitive' } }
    });

    if (!career) {
      console.warn(`⚠️ Career "${item.careerTitle}" not found in database. Please run career seeding first.`);
      continue;
    }

    // 2. Remove any existing generic roadmaps for this career to replace with detailed ones
    const oldRoadmaps = await prisma.roadmap.findMany({
      where: { careerId: career.id },
      select: { id: true }
    });

    for (const old of oldRoadmaps) {
      // Step A: Find all node IDs belonging to this old roadmap
      const oldNodes = await prisma.roadmapNode.findMany({
        where: { roadmapId: old.id },
        select: { id: true }
      });
      const oldNodeIds = oldNodes.map(n => n.id);

      // Step B: If there are nodes, delete all edges connected to them
      if (oldNodeIds.length > 0) {
        await prisma.roadmapEdge.deleteMany({
          where: {
            OR: [
              { sourceId: { in: oldNodeIds } },
              { targetId: { in: oldNodeIds } }
            ]
          }
        });
      }

      // Step C: Delete the nodes themselves
      await prisma.roadmapNode.deleteMany({ where: { roadmapId: old.id } });
      
      // Step D: Finally, delete the roadmap wrapper
      await prisma.roadmap.delete({ where: { id: old.id } });
    }

    // 3. Create the clean detailed Roadmap
    const roadmap = await prisma.roadmap.create({
      data: {
        title: item.roadmapTitle,
        description: item.roadmapDescription,
        careerId: career.id,
      }
    });

    // 4. Create Nodes and map memory IDs to DB UUIDs
    const dbIdMap = new Map<string, string>();

    for (const nodeDef of item.nodes) {
      const createdNode = await prisma.roadmapNode.create({
        data: {
          roadmapId: roadmap.id,
          title: nodeDef.title,
          description: nodeDef.description,
          type: nodeDef.type,
          isRoot: nodeDef.isRoot || false,
        }
      });
      dbIdMap.set(nodeDef.id, createdNode.id);
    }

    // 5. Connect Edges
    for (const edgeDef of item.edges) {
      const realSourceId = dbIdMap.get(edgeDef.source);
      const realTargetId = dbIdMap.get(edgeDef.target);

      if (realSourceId && realTargetId) {
        await prisma.roadmapEdge.create({
          data: {
            sourceId: realSourceId,
            targetId: realTargetId,
          }
        });
      }
    }

    console.log(`✅ Seeded detailed roadmap for: ${career.title}`);
  }

  console.log('🎉 Successfully seeded granular roadmaps for all 30 careers!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });