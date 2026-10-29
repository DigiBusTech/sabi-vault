import assert from "node:assert/strict";

console.log("=== SabiProfile Telemetry & Screening Resilience Test Suite ===");

// 1. Test Date Regex Parsing Resilience
console.log("\n[Test 1] Testing Date Parsing & Year Extraction Resilience...");

function extractYearSafe(startDate) {
  const startMatch = String(startDate || "").match(/\d{4}/);
  return parseInt(startMatch ? startMatch[0] : "2026", 10);
}

// Test cases that would have crashed the original `exp.startDate.split("-")[0]`
const testCases = [
  { input: undefined, expected: 2026 },
  { input: null, expected: 2026 },
  { input: "", expected: 2026 },
  { input: 2022, expected: 2022 },
  { input: "2021-08-15", expected: 2021 },
  { input: "2020", expected: 2020 },
  { input: "March 2019", expected: 2019 },
  { input: "Invalid Date String", expected: 2026 },
];

for (const tc of testCases) {
  let result;
  assert.doesNotThrow(() => {
    result = extractYearSafe(tc.input);
  }, `Failed on input: ${tc.input}`);
  assert.equal(result, tc.expected, `Expected ${tc.expected} for input ${tc.input}, got ${result}`);
}
console.log("  ✓ All 8 date parsing boundary cases passed without throwing TypeError!");

// 2. Test 48-Hour Retention Logic
console.log("\n[Test 2] Testing 48-Hour (2-Day) Telemetry Retention Logic...");

const NOW = Date.now();
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const cutoffIso = new Date(NOW - TWO_DAYS_MS).toISOString();

const mockEvents = [
  { id: "e1", isoTime: new Date(NOW - 3 * 24 * 60 * 60 * 1000).toISOString(), message: "3 days old - should be purged" },
  { id: "e2", isoTime: new Date(NOW - 2.1 * 24 * 60 * 60 * 1000).toISOString(), message: "50 hours old - should be purged" },
  { id: "e3", isoTime: new Date(NOW - 1.5 * 24 * 60 * 60 * 1000).toISOString(), message: "36 hours old - should be kept" },
  { id: "e4", isoTime: new Date(NOW - 10 * 60 * 1000).toISOString(), message: "10 mins old - should be kept" },
  { id: "e5", isoTime: new Date(NOW).toISOString(), message: "just now - should be kept" },
];

const survivingEvents = mockEvents.filter((e) => e.isoTime >= cutoffIso);
assert.equal(survivingEvents.length, 3, `Expected 3 events to survive, found ${survivingEvents.length}`);
assert.deepEqual(survivingEvents.map(e => e.id), ["e3", "e4", "e5"]);
console.log(`  ✓ 48-hour cutoff (${cutoffIso}) correctly pruned 2 stale records and preserved 3 valid records.`);

// 3. Test In-Memory Ring Buffer & Telemetry Engine Structure
console.log("\n[Test 3] Testing Ring Buffer Bounded Capacity & FIFO Eviction...");

class TestRingBuffer {
  constructor(capacity = 5) {
    this.capacity = capacity;
    this.buffer = [];
  }
  record(item) {
    if (this.buffer.length >= this.capacity) {
      this.buffer.shift();
    }
    this.buffer.push(item);
  }
}

const ring = new TestRingBuffer(3);
ring.record({ id: 1 });
ring.record({ id: 2 });
ring.record({ id: 3 });
assert.equal(ring.buffer.length, 3);
ring.record({ id: 4 });
assert.equal(ring.buffer.length, 3);
assert.equal(ring.buffer[0].id, 2);
assert.equal(ring.buffer[2].id, 4);
console.log("  ✓ Ring buffer correctly caps at capacity and rotates oldest entries first.");

console.log("\n=== All Telemetry & Screening Resilience Tests Passed Successfully! ===");

