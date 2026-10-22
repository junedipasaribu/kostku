import { redirect } from "next/navigation";

export default function PortalLayout({ children: _children }: { children: React.ReactNode }) {
  // Tenant portal pages still use browser demo data. Keep the portal closed until it is backed by server data and authorization.
  redirect("/login");
}
