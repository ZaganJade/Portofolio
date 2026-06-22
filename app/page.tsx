import { Suspense } from "react";
import { About } from "@/components/sections/About";
import { Achievements } from "@/components/sections/Achievements";
import { Capabilities } from "@/components/sections/Capabilities";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { GitHubSection } from "@/components/sections/GitHubSection";
import { Hero } from "@/components/sections/Hero";
import { Navigation } from "@/components/sections/Navigation";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { getPublicRepoCount } from "@/lib/github";

export default async function HomePage() {
  const publicRepos = await getPublicRepoCount();

  return (
    <>
      <Navigation />
      <main className="relative">
        <Hero />
        <About />
        <Capabilities />
        <Projects />
        <Skills />
        <Achievements />
        <Experience publicRepos={publicRepos} />
        <Suspense fallback={null}>
          <GitHubSection />
        </Suspense>
        <Contact />
      </main>
    </>
  );
}
