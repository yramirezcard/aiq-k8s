import type { MDXComponents } from "mdx/types";
import { Terminal } from "@/components/Terminal";
import { Callout } from "@/components/Callout";
import { CodeBlock } from "@/components/CodeBlock";
import { AppLaunchButton } from "@/components/AppLaunchButton";

const components: MDXComponents = {
  Terminal,
  Callout,
  AppLaunchButton,
  pre: CodeBlock,
};

export function useMDXComponents(): MDXComponents {
  return components;
}

export { components as mdxComponents };
