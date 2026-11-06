import { prisma } from "@/lib/prisma";

export type ActivityActor = {
  id: string;
  name: string;
  role: string;
};

export type ActivityEntry = {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
};

/** Persist business activity for the admin audit trail without interrupting the action itself. */
export async function recordActivity(actor: ActivityActor, entry: ActivityEntry) {
  const event = {
    type: "kostku.activity",
    at: new Date().toISOString(),
    actorId: actor.id,
    actorRole: actor.role,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId ?? null,
  };
  console.info(JSON.stringify(event));

  try {
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        actorName: actor.name.slice(0, 160),
        actorRole: actor.role.slice(0, 24),
        action: entry.action.slice(0, 80),
        entityType: entry.entityType.slice(0, 80),
        entityId: entry.entityId?.slice(0, 120) ?? null,
        summary: entry.summary.slice(0, 500),
      },
    });
  } catch (error) {
    console.error("[activity-log] Failed to persist audit event", error instanceof Error ? error.message : "unknown error");
  }
}
