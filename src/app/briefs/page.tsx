import Sidebar from "@/components/Sidebar";
import BriefsList from "@/components/BriefsList";

export default function BriefsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Briefs</h1>
            <p className="text-zinc-400">
              Save and reuse your favorite modification briefs
            </p>
          </div>
          <BriefsList />
        </div>
      </main>
    </div>
  );
}
