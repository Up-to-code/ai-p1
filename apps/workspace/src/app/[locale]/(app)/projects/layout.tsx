import type { ReactNode } from "react";
import { ProjectResourceLayout } from "@/domains/projects/components/project-resource-layout";

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <ProjectResourceLayout>{children}</ProjectResourceLayout>;
}
