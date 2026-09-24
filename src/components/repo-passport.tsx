import { ArrowUpRight, GitBranch, Radio, Star } from "lucide-react";
import type { ProjectMetadata } from "@/lib/project";

export function RepoPassport({ project }: { project: ProjectMetadata }) {
  return (
    <section className="paper-panel repo-passport" aria-labelledby="repo-passport-title">
      <div className="passport-top">
        <span className="stamp green">open source / public</span>
        <span className="muted" style={{ fontFamily: "Cascadia Code", fontSize: 10 }}>{project.source} passport</span>
      </div>
      <div className="passport-main">
        <div>
          <p className="eyebrow">REPOSITORY PASSPORT</p>
          <h2 id="repo-passport-title">Build in the open.</h2>
          <p className="muted" style={{ maxWidth: 570, margin: "10px 0 0", fontSize: 13, lineHeight: 1.5 }}>{project.description}</p>
          <div className="topic-list" aria-label="GitHub topics">
            {project.topics.map((topic) => <span key={topic}>#{topic}</span>)}
          </div>
        </div>
        <div className="passport-stats" aria-label="Repository stats">
          <div><Star size={15} /><strong>{project.stars}</strong><span>stars</span></div>
          <div><GitBranch size={15} /><strong>{project.forks}</strong><span>forks</span></div>
          <div><Radio size={15} /><strong>{project.defaultBranch}</strong><span>branch</span></div>
        </div>
      </div>
      <div className="passport-links">
        <a href={project.repoUrl} target="_blank" rel="noreferrer"><GitBranch size={14} /> GitHub repository <ArrowUpRight size={13} /></a>
        <a href={project.liveUrl} target="_blank" rel="noreferrer"><Radio size={14} /> Live deployment <ArrowUpRight size={13} /></a>
        <span className="muted" style={{ fontSize: 10 }}>{project.notice}</span>
      </div>
    </section>
  );
}
