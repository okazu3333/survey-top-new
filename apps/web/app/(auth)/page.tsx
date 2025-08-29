import { NewsSection } from "./_components/news-section";
import { ProjectsSection } from "./_components/projects-section";

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-6 space-y-6">
        <NewsSection />
        <ProjectsSection />
      </main>
    </div>
  );
};

export default Page;
