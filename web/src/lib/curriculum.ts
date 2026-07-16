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
    title: "Part I - Overview",
    subtitle: "AI-Q concepts and the launchable cluster",
    lessons: [
      { slug: "aiq-blueprint-overview", title: "1. AIQ Blueprint Overview", blurb: "What the AI-Q Blueprint provides and how its agent workflow is organized.", minutes: 8 },
      { slug: "lab-environment", title: "2. Lab Environment", blurb: "Inspect the k3s lab and understand why this path does not require GPUs.", minutes: 8, hasLab: true },
    ],
  },
  {
    id: "aiq-deployment",
    title: "Part II - AIQ Deployment",
    subtitle: "Install and validate AI-Q with Helm",
    lessons: [
      { slug: "aiq-helm-deployment", title: "3. AI-Q Helm Deployment", blurb: "Create Kubernetes resources, inspect values, and install the AI-Q chart.", minutes: 18, hasLab: true },
      { slug: "test-aiq-deployment", title: "4. Test AIQ Deployment", blurb: "Verify pods, health, UI access, and a first meta-response test.", minutes: 12, hasLab: true },
    ],
  },
  {
    id: "frag-integration",
    title: "Part III - Foundational RAG (FRAG) Integration",
    subtitle: "Deploy RAG and connect it to AI-Q",
    lessons: [
      { slug: "rag-blueprint-overview", title: "1. RAG Blueprint Overview", blurb: "How NVIDIA RAG grounds generated answers in enterprise data.", minutes: 8 },
      { slug: "rag-blueprint-deployment", title: "2. RAG Blueprint Deployment", blurb: "Install the RAG Blueprint chart using hosted endpoints where appropriate.", minutes: 18, hasLab: true },
      { slug: "use-frag-with-aiq", title: "3. Use FRAG with AIQ", blurb: "Upgrade AI-Q to use the running RAG service and test the integration.", minutes: 14, hasLab: true },
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

export const FIRST_SLUG = ALL_LESSONS[0]?.slug ?? "aiq-blueprint-overview";
