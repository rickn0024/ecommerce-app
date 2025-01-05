import Footer from '@/components/footer';
import Header from '@/components/shared/header';

export const metadata = {
  title: 'Home',
  description: 'Find the best merch!',
  keywords: 'merch, swag, buy, shop',
};

export default function HomePage({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 wrapper">{children}</main>
      <Footer />
    </div>
  );
}
