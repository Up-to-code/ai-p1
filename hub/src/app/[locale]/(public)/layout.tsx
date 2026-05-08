import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto prose-sm">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
