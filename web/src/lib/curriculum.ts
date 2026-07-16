export type Lesson = {
  slug: string;
  title: string;
  blurb: string;
  minutes: number;
  hasLab?: boolean;
};

export type Part = {
  id: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
};

export const CURRICULUM: Part[] = [
  {
    id: "overview",
    title: "1. Overview",
    subtitle: "What AI-Q is and how the lab is prepared",
    lessons: [
      { slug: "overview", title: "1. Overview", blurb: "Orient to the launchable and tutorial flow.", minutes: 5 },
      { slug: "aiq-architecture", title: "1.1 AIQ Architecture", blurb: "Understand the major runtime pieces before deploying.", minutes: 8 },
      { slug: "environment-setup", title: "1.2 Environment Setup", blurb: "Review what the launchable prepared for you.", minutes: 6 },
    ],
  },
  {
    id: "rag-blueprint",
    title: "2. RAG Blueprint Deployment",
    subtitle: "Prepare and verify the Kubernetes environment",
    lessons: [
      { slug: "rag-blueprint-deployment", title: "2. RAG Blueprint Deployment", blurb: "Introduce the deployment path and prerequisites.", minutes: 6 },
      { slug: "verify-cluster", title: "2.1 Verify the Cluster", blurb: "Use kubectl against the live k3s cluster.", minutes: 8, hasLab: true },
    ],
  },
  {
    id: "aiq-deployment",
    title: "3. AIQ Deployment",
    subtitle: "Deploy and test the AI-Q Blueprint",
    lessons: [
      { slug: "aiq-deployment", title: "3. AIQ Deployment", blurb: "Deploy the AI-Q Helm chart from the official repository.", minutes: 10, hasLab: true },
      { slug: "test", title: "3.1 Test", blurb: "Validate the AI-Q services after deployment.", minutes: 8, hasLab: true },
    ],
  },
];

export const ALL_LESSONS: (Lesson & { partId: string; partTitle: string })[] =
  CURRICULUM.flatMap((p) => p.lessons.map((l) => ({ ...l, partId: p.id, partTitle: p.title })));

export function lessonNeighbors(slug: string) {
  const i = ALL_LESSONS.findIndex((l) => l.slug === slug);
  return {
    prev: i > 0 ? ALL_LESSONS[i - 1] : null,
    next: i >= 0 && i < ALL_LESSONS.length - 1 ? ALL_LESSONS[i + 1] : null,
    current: i >= 0 ? ALL_LESSONS[i] : null,
  };
}

export const FIRST_SLUG = ALL_LESSONS[0]?.slug ?? "overview";
