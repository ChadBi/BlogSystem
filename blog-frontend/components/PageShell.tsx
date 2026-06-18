import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export function PageShell({ children, showSidebar = true }: { children: React.ReactNode; showSidebar?: boolean }) {
  return (
    <>
      <Header />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 layout-grid" style={{ gridTemplateColumns: showSidebar ? '280px 1fr' : '1fr' }}>
        {showSidebar && <Sidebar />}
        <section>{children}</section>
      </main>
      <Footer />
    </>
  );
}
