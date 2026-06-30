import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section>{children}</section>
      </main>
      <Footer />
    </>
  );
}
