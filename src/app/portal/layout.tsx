import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TenantShell from "./portal-shell";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "TENANT" || !user.tenantId) redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { fullName: true, phone: true, status: true, room: { select: { roomNumber: true, type: true } } },
  });
  if (!tenant || tenant.status !== "ACTIVE") redirect("/login");
  const building = await prisma.buildingConfig.findUnique({ where: { id: "default" }, select: { name: true, ownerPhone: true } });

  return (
    <TenantShell tenant={{ name: tenant.fullName, phone: tenant.phone, roomNumber: tenant.room.roomNumber, roomType: tenant.room.type }} building={{ name: building?.name ?? "Kostku", ownerPhone: building?.ownerPhone ?? "" }}>
      {children}
    </TenantShell>
  );
}
