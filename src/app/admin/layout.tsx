import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminShell from "./admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) redirect("/login");
  return <AdminShell user={{ name: user.name }}>{children}</AdminShell>;
}
