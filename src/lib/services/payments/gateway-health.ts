/**
 * src/lib/services/payments/gateway-health.ts
 *
 * DB-backed circuit breaker for card gateways.
 * Prevents cascading timeouts by temporarily opening the circuit when
 * a provider experiences consecutive infrastructure outages (502, 503, connection timeouts).
 * Customer-level card declines NEVER trip the circuit breaker.
 */

import { prisma } from "../../db/client";

const FAILURE_THRESHOLD = 3; // 3 consecutive failures trips the breaker
const COOLDOWN_MINUTES = 15; // 15-minute open circuit cooldown

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export async function getGatewayCircuitState(gatewayId: string): Promise<CircuitState> {
  const health = await prisma.gatewayHealth.findUnique({
    where: { gatewayId },
  });

  if (!health) {
    return "CLOSED";
  }

  const now = new Date();

  if (health.state === "OPEN") {
    if (health.openedUntil && health.openedUntil <= now) {
      // Cooldown elapsed: transition to HALF_OPEN for single test attempt
      await prisma.gatewayHealth.update({
        where: { gatewayId },
        data: { state: "HALF_OPEN" },
      });
      return "HALF_OPEN";
    }
    return "OPEN";
  }

  return health.state as CircuitState;
}

export async function isGatewayAvailable(gatewayId: string): Promise<boolean> {
  const state = await getGatewayCircuitState(gatewayId);
  return state !== "OPEN";
}

/**
 * Records an infrastructure failure for a gateway.
 */
export async function recordGatewayFailure(
  gatewayId: string,
  errorMsg: string
): Promise<void> {
  const now = new Date();
  const existing = await prisma.gatewayHealth.findUnique({
    where: { gatewayId },
  });

  const failures = (existing?.consecutiveFailures || 0) + 1;
  const shouldOpen = failures >= FAILURE_THRESHOLD;
  const openedUntil = shouldOpen
    ? new Date(now.getTime() + COOLDOWN_MINUTES * 60 * 1000)
    : null;

  await prisma.gatewayHealth.upsert({
    where: { gatewayId },
    create: {
      gatewayId,
      state: shouldOpen ? "OPEN" : "CLOSED",
      consecutiveFailures: failures,
      openedUntil,
      lastError: errorMsg.slice(0, 255),
    },
    update: {
      state: shouldOpen ? "OPEN" : existing?.state || "CLOSED",
      consecutiveFailures: failures,
      openedUntil: shouldOpen ? openedUntil : existing?.openedUntil,
      lastError: errorMsg.slice(0, 255),
    },
  });
}

/**
 * Records a successful initialization, resetting the breaker to CLOSED.
 */
export async function recordGatewaySuccess(gatewayId: string): Promise<void> {
  await prisma.gatewayHealth.upsert({
    where: { gatewayId },
    create: {
      gatewayId,
      state: "CLOSED",
      consecutiveFailures: 0,
      openedUntil: null,
      lastError: null,
    },
    update: {
      state: "CLOSED",
      consecutiveFailures: 0,
      openedUntil: null,
      lastError: null,
    },
  });
}
