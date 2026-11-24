import { Shell } from "@/components/Shell";
import { verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BooksLayout({ children }: { children: React.ReactNode }) {
  await verifySession();
  return <Shell>{children}</Shell>;
}
