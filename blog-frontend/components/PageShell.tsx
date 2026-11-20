import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export function PageShell({ children, notice }: { children: React.ReactNode; notice?: string }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-9">
        {notice && <p role="status" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{notice}</p>}
        <section>{children}</section>
      </main>
      <Footer />
    </>
  );
}
