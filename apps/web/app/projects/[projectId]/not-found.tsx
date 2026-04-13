import Link from "next/link";

import s from "@/components/projects/punch-list.module.css";

export default function ProjectNotFound() {
  return (
    <div className={s.page}>
      <h1 className={s.title}>Project not found</h1>
      <p className={s.muted} style={{ marginTop: "0.5rem" }}>
        <Link href="/projects">Back to projects</Link>
      </p>
    </div>
  );
}
