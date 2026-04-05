import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[var(--bg-color)] transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
