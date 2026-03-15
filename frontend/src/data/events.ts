import type { MeetupEvent } from "@/types/event"

export const mockEvents: MeetupEvent[] = [
  {
    id: "evt-001",
    title: "React Conf 2026",
    description:
      "Join the React community for the latest updates on React 19, Server Components, and the future of frontend development. Featuring talks from core team members and industry leaders building at scale.",
    date: "2026-04-05T09:00:00",
    endDate: "2026-04-05T18:00:00",
    location: "Moscone Center, San Francisco, CA",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    tags: ["React", "Frontend", "JavaScript"],
  },
  {
    id: "evt-002",
    title: "AI/ML Nights: LLMs in Production",
    description:
      "Monthly gathering of AI practitioners sharing real-world experiences deploying large language models. This month: fine-tuning strategies, RAG architectures, and cost optimization techniques.",
    date: "2026-04-12T18:30:00",
    endDate: "2026-04-12T21:00:00",
    location: "WeWork Mission St, San Francisco, CA",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    tags: ["AI", "Machine Learning", "LLM"],
  },
  {
    id: "evt-003",
    title: "DevOps Summit: Platform Engineering",
    description:
      "A two-day deep dive into modern platform engineering practices. Topics include internal developer platforms, golden paths, self-service infrastructure, and measuring developer productivity.",
    date: "2026-04-18T09:00:00",
    endDate: "2026-04-19T17:00:00",
    location: "Convention Center, Austin, TX",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    tags: ["DevOps", "Platform", "Infrastructure"],
  },
  {
    id: "evt-004",
    title: "Web3 Wednesday: DeFi Deep Dive",
    description:
      "Explore the latest in decentralized finance protocols, smart contract security patterns, and cross-chain interoperability. Hands-on workshop included with live contract deployment.",
    date: "2026-04-25T18:00:00",
    endDate: "2026-04-25T21:00:00",
    location: "Blockchain Hub, Miami, FL",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
    tags: ["Web3", "Blockchain", "DeFi"],
  },
  {
    id: "evt-005",
    title: "TypeScript Deep Dive: Advanced Patterns",
    description:
      "Level up your TypeScript skills with advanced type-level programming, conditional types, template literal types, and building type-safe APIs. Bring your laptop for live coding exercises.",
    date: "2026-05-03T10:00:00",
    endDate: "2026-05-03T16:00:00",
    location: "Google Developer Space, New York, NY",
    image:
      "https://images.unsplash.com/photo-1516116216624-8e32067e8d02?w=800&h=400&fit=crop",
    tags: ["TypeScript", "JavaScript", "Workshop"],
  },
  {
    id: "evt-006",
    title: "Cloud Native Meetup: K8s at Scale",
    description:
      "Real-world stories of running Kubernetes clusters at massive scale. Covering multi-tenancy, cost optimization, service mesh patterns, and GitOps workflows that actually work.",
    date: "2026-05-10T18:00:00",
    endDate: "2026-05-10T20:30:00",
    location: "AWS Loft, Seattle, WA",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    tags: ["Kubernetes", "Cloud", "DevOps"],
  },
  {
    id: "evt-007",
    title: "Design Systems Workshop",
    description:
      "Build a production-ready design system from scratch. Learn component architecture, token systems, documentation strategies, and how to get adoption across your organization.",
    date: "2026-05-16T09:00:00",
    endDate: "2026-05-16T17:00:00",
    location: "Figma HQ, San Francisco, CA",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=400&fit=crop",
    tags: ["Design", "UI/UX", "Components"],
  },
  {
    id: "evt-008",
    title: "Rust for Web Developers",
    description:
      "Bridge the gap from JavaScript to Rust. Learn memory safety, ownership, and how to build blazing-fast web services with Actix and Axum. No systems programming experience required.",
    date: "2026-05-23T10:00:00",
    endDate: "2026-05-23T15:00:00",
    location: "Mozilla Space, Portland, OR",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aede?w=800&h=400&fit=crop",
    tags: ["Rust", "WebAssembly", "Backend"],
  },
  {
    id: "evt-009",
    title: "Mobile Dev Night: Cross-Platform 2026",
    description:
      "Compare the latest in React Native, Flutter, and Kotlin Multiplatform. Live demos, performance benchmarks, and honest discussions about when to go native vs cross-platform.",
    date: "2026-06-01T18:30:00",
    endDate: "2026-06-01T21:00:00",
    location: "Apple Developer Center, Cupertino, CA",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    tags: ["Mobile", "React Native", "Flutter"],
  },
  {
    id: "evt-010",
    title: "Open Source Friday: Contributing 101",
    description:
      "Learn how to make your first open source contribution. We'll walk through finding good first issues, understanding project conventions, writing effective PRs, and building your OSS reputation.",
    date: "2026-06-07T14:00:00",
    endDate: "2026-06-07T17:00:00",
    location: "GitHub Office, San Francisco, CA",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop",
    tags: ["Open Source", "Community", "Git"],
  },
]
