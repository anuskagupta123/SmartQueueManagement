/**
 * SmartQueue AI — Queue Intelligence Engine
 * Handles wait-time prediction, no-show probability, and queue optimization
 */

export interface QueueState {
  waitingCount: number;
  avgServiceTimeMinutes: number;
  noShowRate: number;
  staffEfficiency: number;
}

/**
 * Predict estimated wait time using AI-weighted formula:
 * - Base wait = position * avgServiceTime
 * - Adjusted for no-show probability (reduces wait)
 * - Adjusted for staff efficiency
 */
export function predictWaitTime(
  position: number,
  state: QueueState
): { minutes: number; confidence: "high" | "medium" | "low" } {
  const { avgServiceTimeMinutes, noShowRate, staffEfficiency } = state;

  const effectiveService = avgServiceTimeMinutes / staffEfficiency;
  const noShowAdjustment = 1 - noShowRate * 0.5;
  const baseWait = position * effectiveService * noShowAdjustment;

  const roundedWait = Math.max(1, Math.round(baseWait));

  // Confidence based on queue length — longer queues = less predictable
  let confidence: "high" | "medium" | "low";
  if (position <= 3) confidence = "high";
  else if (position <= 8) confidence = "medium";
  else confidence = "low";

  return { minutes: roundedWait, confidence };
}

/**
 * Predict no-show probability for a user in queue
 * Factors: time since joining, historical no-show rate, time of day
 */
export function predictNoShowProbability(
  minutesSinceJoining: number,
  historicalNoShowRate: number,
  isPeakHour: boolean
): number {
  let prob = historicalNoShowRate;

  // No-show risk increases with wait time
  if (minutesSinceJoining > 30) prob += 0.1;
  if (minutesSinceJoining > 60) prob += 0.15;

  // Peak hours have lower no-show rates (people are more committed)
  if (isPeakHour) prob *= 0.8;

  return Math.min(0.95, Math.max(0.02, prob));
}

/**
 * Calculate priority score for fair queue ordering
 * Balances FCFS, priority, and efficiency
 */
export function calculatePriorityScore(
  position: number,
  priority: "normal" | "vip" | "emergency",
  minutesWaited: number,
  noShowProbability: number
): number {
  const priorityWeights = {
    emergency: 100,
    vip: 50,
    normal: 0,
  };

  const fcfsScore = Math.min(50, minutesWaited * 0.5);
  const priorityScore = priorityWeights[priority];
  const reliabilityScore = (1 - noShowProbability) * 20;

  return fcfsScore + priorityScore + reliabilityScore - position * 0.1;
}

/**
 * Generate unique token number for a queue
 * Format: Q{queueId}-{prefix}{sequence}
 */
export function generateTokenNumber(queueId: number, sequence: number, industry: string): string {
  const prefixes: Record<string, string> = {
    hospital: "H",
    bank: "B",
    salon: "S",
    college: "C",
    government: "G",
    retail: "R",
    other: "T",
  };
  const prefix = prefixes[industry] || "T";
  return `${prefix}${String(sequence).padStart(3, "0")}`;
}

/**
 * Suggest best time slot for minimal waiting
 * Returns hours with lowest historical load
 */
export function suggestBestTimeSlots(
  peakData: Array<{ hour: number; avgCount: number }>
): number[] {
  const sorted = [...peakData].sort((a, b) => a.avgCount - b.avgCount);
  return sorted.slice(0, 3).map((d) => d.hour);
}

/**
 * Determine if current hour is a peak hour
 */
export function isPeakHour(hour: number): boolean {
  const peakHours = [8, 9, 10, 11, 14, 15, 16];
  return peakHours.includes(hour);
}
