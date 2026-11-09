import { ActorType, Prisma } from "@prisma/client";
import { prisma } from "../db/client";

export interface AuditLogParams {
  actorType: ActorType;
  adminId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  ip?: string | null;
  diff?: Record<string, unknown> | null;
}

export async function logAudit(
  params: AuditLogParams,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const db = tx || prisma;
  try {
    await db.auditLog.create({
      data: {
        actorType: params.actorType,
        adminId: params.adminId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        ip: params.ip || null,
        diff: params.diff ? JSON.stringify(params.diff) : null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
