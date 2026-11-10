/**
 * src/lib/services/payments/gateway-health.ts
 *
 * DB-backed circuit breaker + verification state for card gateways (serverless-safe).
 *
 *  CLOSED    — normal routing.
 *  OPEN      — skipped. `openedUntil` set  => automatic cooldown, then HALF_OPEN.
 *              `openedUntil` null => provider-reported / manual outage, stays OPEN until a
 *              verified probe or an admin closes it.
 *  HALF_OPEN — exactly ONE trial attempt may be in flight (claimed atomically).
 *
 * Only infrastructure-level failures (SAFE class: 5xx outage, gateway rejected) count.
 * Customer declines never touch the breaker.
 */

import { prisma } from "../../db/client";

export const FAILURE_THRESHOLD = 3;
export const COOLDOWN_MINUTES = 15;
const HALF_OPEN_TRIAL_TTL_MS = 2 * 60 * 1000;

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export async function getGatewayCircuitState(gatewayId: string, now = new Date()): Promise<CircuitState> {
  const health = await prisma.gatewayHealth.findUnique({ where: { gatewayId } });
  if (!health) return "CLOSED";

  if (health.state === "OPEN") {
    if (health.openedUntil && health.openedUntil <= now) {
      await prisma.gatewayHealth.updateMany({
        where: { gatewayId, state: "OPEN" },
        data: { state: "HALF_OPEN", halfOpenTrialAt: null },
      });
      return "HALF_OPEN";
    }
    return "OPEN";
  }
  return health.state as CircuitState;
}

/**
 * Returns true when a new attempt may be sent to this gateway now.
 * In HALF_OPEN, atomically claims the single trial slot.
 */
export async function acquireGatewaySlot(gatewayId: string, now = new Date()): Promise<boolean> {
  const state = await getGatewayCircuitState(gatewayId, now);
  if (state === "CLOSED") return true;
  if (state === "OPEN") return false;

  const claim = await prisma.gatewayHealth.updateMany({
    where: {
      gatewayId,
      state: "HALF_OPEN",
      OR: [{ halfOpenTrialAt: null }, { halfOpenTrialAt: { lt: new Date(now.getTime() - HALF_OPEN_TRIAL_TTL_MS) } }],
    },
    data: { halfOpenTrialAt: now },
  });
  return claim.count === 1;
}

export async function recordGatewayFailure(gatewayId: string, errorMsg: string, now = new Date()): Promise<void> {
  const existing = await prisma.gatewayHealth.findUnique({ where: { gatewayId } });
  const failures = (existing?.consecutiveFailures || 0) + 1;
  const wasHalfOpen = existing?.state === "HALF_OPEN";
  const shouldOpen = wasHalfOpen || failures >= FAILURE_THRESHOLD;
  const openedUntil = new Date(now.getTime() + COOLDOWN_MINUTES * 60 * 1000);

  await prisma.gatewayHealth.upsert({
    where: { gatewayId },
    create: {
      gatewayId,
      state: shouldOpen ? "OPEN" : "CLOSED",
      consecutiveFailures: failures,
      openedUntil: shouldOpen ? openedUntil : null,
      lastError: errorMsg.slice(0, 255),
    },
    update: {
      // Never shorten a manual (openedUntil = null) outage.
      ...(existing?.state === "OPEN" && existing.openedUntil === null
        ? {}
        : { state: shouldOpen ? "OPEN" : existing?.state || "CLOSED", openedUntil: shouldOpen ? openedUntil : existing?.openedUntil ?? null }),
      consecutiveFailures: failures,
      halfOpenTrialAt: null,
      lastError: errorMsg.slice(0, 255),
    },
  });
}

/** Successful session initialization through this gateway: close the breaker. */
export async function recordGatewaySuccess(gatewayId: string, opts: { markVerified?: boolean } = {}, now = new Date()) {
  const verifiedFields = opts.markVerified ? { verified: true, verifiedAt: now } : {};
  await prisma.gatewayHealth.upsert({
    where: { gatewayId },
    create: { gatewayId, state: "CLOSED", consecutiveFailures: 0, ...verifiedFields },
    update: {
      state: "CLOSED",
      consecutiveFailures: 0,
      openedUntil: null,
      halfOpenTrialAt: null,
      lastError: null,
      ...verifiedFields,
    },
  });
}

/** Provider-reported or admin-declared outage: OPEN with no automatic recovery. */
export async function markGatewayOutage(gatewayId: string, note: string): Promise<void> {
  await prisma.gatewayHealth.upsert({
    where: { gatewayId },
    create: { gatewayId, state: "OPEN", openedUntil: null, note, lastError: note.slice(0, 255) },
    update: { state: "OPEN", openedUntil: null, halfOpenTrialAt: null, note, lastError: note.slice(0, 255) },
  });
}

/** Admin: allow the next attempt to act as a recovery trial. */
export async function moveGatewayToHalfOpen(gatewayId: string): Promise<void> {
  await prisma.gatewayHealth.upsert({
    where: { gatewayId },
    create: { gatewayId, state: "HALF_OPEN" },
    update: { state: "HALF_OPEN", halfOpenTrialAt: null, openedUntil: null },
  });
}

/** Records probe evidence (verified or not) for a gateway. */
export async function recordProbeResult(
  gatewayId: string,
  result: { accepted: boolean; summary: Record<string, unknown> },
  now = new Date()
): Promise<void> {
  const lastProbe = JSON.stringify({ at: now.toISOString(), ...result.summary }).slice(0, 4000);
  await prisma.gatewayHealth.upsert({
    where: { gatewayId },
    create: {
      gatewayId,
      state: result.accepted ? "CLOSED" : "OPEN",
      openedUntil: null,
      verified: result.accepted,
      verifiedAt: result.accepted ? now : null,
      lastProbe,
    },
    update: result.accepted
      ? { verified: true, verifiedAt: now, lastProbe, state: "CLOSED", openedUntil: null, consecutiveFailures: 0, lastError: null }
      : { lastProbe },
  });
}
