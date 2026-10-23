import { ExternalLink, FolderGit2 } from "lucide-react";
import { displayDomain } from "@/lib/site";
import type { Project } from "@/lib/validation";

export function ProjectsSection({ projects }: { projects: Project[] }): React.JSX.Element {
    return (
        <section className="bg-card border-border rounded-3xl border p-5 shadow-lg sm:p-10" aria-labelledby="projects">
            <h2 id="projects" className="mb-8 flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                <FolderGit2 className="h-7 w-7 text-(--profile-accent)" aria-hidden />
                Projects
            </h2>
            <ul className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
                {projects.map((project) => (
                    <li key={project.title} className="min-w-0">
                        <h3 className="text-lg font-semibold">
                            {project.url ? (
                                <a
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="decoration-(--profile-accent) decoration-2 underline-offset-4 hover:underline"
                                >
                                    {project.title}
                                    <ExternalLink className="text-muted-foreground ml-1.5 inline size-4 align-[-2px]" aria-hidden />
                                </a>
                            ) : (
                                project.title
                            )}
                        </h3>
                        {project.url && <p className="text-muted-foreground truncate text-sm">{displayDomain(project.url)}</p>}
                        {project.description && (
                            <p className="text-muted-foreground mt-2 text-sm text-pretty break-words">{project.description}</p>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
