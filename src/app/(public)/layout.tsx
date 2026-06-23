import { GlobalHeader } from '@/components/public/GlobalHeader';
import { GlobalFooter } from '@/components/public/GlobalFooter';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <GlobalHeader />
      <main className="flex-1">
        {children}
      </main>
      <GlobalFooter />
    </div>
  );
}
