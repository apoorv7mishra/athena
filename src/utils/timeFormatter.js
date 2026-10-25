/**
 * Time formatting and arithmetic utility functions for assessment countdown
 */

/**
 * Converts milliseconds to HH:MM:SS padded format
 * @param {number} ms - Milliseconds remaining
 * @returns {string} Formatted time string
 */
export function formatTimeLeft(ms) {
  if (typeof ms !== "number" || ms < 0 || isNaN(ms)) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  const minutes = (Math.floor(totalSeconds / 60) % 60).toString().padStart(2, "0");
  const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Calculates percentage of time elapsed
 * @param {number} remainingMs
 * @param {number} totalMs
 * @returns {number} Percentage between 0 and 100
 */
export function getElapsedPercentage(remainingMs, totalMs) {
  if (!totalMs || totalMs <= 0) return 0;
  const elapsed = Math.max(0, totalMs - remainingMs);
  return Math.min(100, Math.round((elapsed / totalMs) * 100));
}
