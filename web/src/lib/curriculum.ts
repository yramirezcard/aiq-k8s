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
      { slug: "aiq-blueprint-overview", title: "1. AI-Q Blueprint Overview", blurb: "What the AI-Q Blueprint provides and where it fits in an enterprise research workflow.", minutes: 8 },
      { slug: "aiq-architecture", title: "2. AI-Q Architecture", blurb: "Follow the AI-Q routing path from intent classification to shallow and deep research agents.", minutes: 10 },
      { slug: "lab-environment", title: "3. Lab Environment", blurb: "Inspect the k3s lab and understand why this path does not require GPUs.", minutes: 8, hasLab: true },
    ],
  },
  {
    id: "aiq-deployment",
    title: "Part II - AI-Q Deployment",
    subtitle: "Install and validate AI-Q with Helm",
    lessons: [
      { slug: "aiq-helm-deployment", title: "4. AI-Q Helm Deployment", blurb: "Create Kubernetes resources, inspect values, and install the AI-Q chart.", minutes: 18, hasLab: true },
      { slug: "test-aiq-deployment", title: "5. Test AI-Q Deployment", blurb: "Verify pods, health, UI access, and a first meta-response test.", minutes: 12, hasLab: true },
    ],
  },
  {
    id: "frag-integration",
    title: "Part III - Foundational RAG (FRAG) Integration",
    subtitle: "Deploy RAG and connect it to AI-Q",
    lessons: [
      { slug: "rag-blueprint-overview", title: "6. RAG Blueprint Overview", blurb: "How NVIDIA RAG grounds generated answers in enterprise data.", minutes: 8 },
      { slug: "rag-architecture", title: "7. RAG Architecture", blurb: "Understand the RAG services, vector database, ingestion path, and query workflow.", minutes: 10 },
      { slug: "rag-blueprint-deployment", title: "8. RAG Blueprint Deployment", blurb: "Install the RAG Blueprint chart using hosted endpoints and a CPU vector database.", minutes: 20, hasLab: true },
      { slug: "use-frag-with-aiq", title: "9. Integrate FRAG with AI-Q", blurb: "Upgrade AI-Q to use the running RAG service and test the integration.", minutes: 14, hasLab: true },
    ],
  },
  {
    id: "customizing-aiq",
    title: "Part IV - Customizing AI-Q",
    subtitle: "Mount and run a custom AI-Q configuration file",
    lessons: [
      { slug: "configuration-file", title: "10. Configuration File", blurb: "Create a custom AI-Q config, mount it into the backend pod, and verify that AI-Q uses it.", minutes: 16, hasLab: true },
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
