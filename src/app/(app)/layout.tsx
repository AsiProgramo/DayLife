import type { ReactNode } from "react";

import { Header } from "@/components/header";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <Header user={user} />
      <main className="container py-6 sm:py-10">{children}</main>
    </>
  );
}
