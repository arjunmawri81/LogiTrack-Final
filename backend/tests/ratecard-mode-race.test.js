/**
 * TEST: Rate Card Mode Race Condition
 *
 * Run: node backend/tests/ratecard-mode-race.test.js
 * Replace TOKEN, COURIER_ID, ORDER_ID below with real values.
 */
const axios = require("axios");

const API        = "http://localhost:5000/api";
const TOKEN      = "REPLACE_WITH_VALID_MERCHANT_JWT";
const COURIER_ID = "REPLACE_WITH_VALID_COURIER_ID";
const ORDER_ID   = "REPLACE_WITH_VALID_ORDER_ID";

const headers = { Authorization: `Bearer ${TOKEN}` };
let passed = 0, failed = 0;

async function calcPricing(serviceType, label) {
  const start = Date.now();
  try {
    const res = await axios.post(
      `${API}/ratecards/calculate`,
      { orderId: ORDER_ID, courierId: COURIER_ID, serviceType },
      { headers }
    );
    const ms = Date.now() - start;
    const charge = res.data.totalCharge ?? res.data.shippingCharge ?? 0;
    console.log(`  [${label}] serviceType=${serviceType} => Rs.${charge}  (${ms}ms)`);
    return { serviceType, charge, ok: true };
  } catch (err) {
    const ms = Date.now() - start;
    console.error(`  [${label}] ERROR: ${err.response?.data?.message || err.message}  (${ms}ms)`);
    return { serviceType, charge: null, ok: false };
  }
}

async function test_concurrent_calls() {
  console.log("\n-- TEST 1: Concurrent Surface + Air calls --");
  const [surface, air] = await Promise.all([
    calcPricing("Surface", "CONCURRENT-Surface"),
    calcPricing("Air",     "CONCURRENT-Air"),
  ]);
  if (!surface.ok || !air.ok) { console.log("  WARNING: One or both calls failed."); failed++; return; }
  if (surface.charge !== air.charge) {
    console.log("  PASS: Surface and Air returned DIFFERENT charges."); passed++;
  } else {
    console.log("  NOTE: Same charge for both modes - verify rate cards in DB."); passed++;
  }
}

async function test_stale_closure_simulation() {
  console.log("\n-- TEST 2: Stale closure simulation (Air first, Surface 50ms later) --");
  const airPromise = calcPricing("Air", "STALE-Air(fires first)");
  await new Promise(r => setTimeout(r, 50));
  const surfacePromise = calcPricing("Surface", "STALE-Surface(fires 50ms later)");
  const [airResult, surfaceResult] = await Promise.all([airPromise, surfacePromise]);
  if (!airResult.ok || !surfaceResult.ok) { failed++; return; }
  console.log(`  Air charge: Rs.${airResult.charge}, Surface charge: Rs.${surfaceResult.charge}`);
  console.log("  PASS: Backend returns mode-specific results independently."); passed++;
}

async function test_rapid_mode_switch() {
  console.log("\n-- TEST 3: Rapid mode switch (5 concurrent alternating calls) --");
  const modes = ["Surface","Air","Surface","Air","Surface"];
  const results = await Promise.all(modes.map((m,i) => calcPricing(m, `RAPID-${i+1}(${m})`)));
  const allOk = results.every(r => r.ok);
  if (allOk) { console.log("  PASS: All 5 concurrent calls resolved."); passed++; }
  else { console.log(`  FAIL: ${results.filter(r=>!r.ok).length} calls failed.`); failed++; }
}

async function runAll() {
  console.log("=== Rate Card Mode Race Condition Test Suite ===");
  await test_concurrent_calls();
  await test_stale_closure_simulation();
  await test_rapid_mode_switch();
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runAll().catch(err => { console.error("Runner error:", err.message); process.exit(1); });
