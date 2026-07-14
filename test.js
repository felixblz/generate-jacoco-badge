import { strict as assert } from "assert";
import { DOMParser } from "xmldom";
import fs from "fs";

const parser = new DOMParser();

function generateBadge(string, coverage) {
  const color = coverage >= 80 ? "green" : coverage >= 50 ? "yellow" : "red";
  return `https://img.shields.io/static/v1?label=${string}&message=${coverage}%25&color=${color}`;
}

function parseCoverage(xmlPath) {
  const xmlData = fs.readFileSync(xmlPath, "utf8");
  const xmlParsed = parser.parseFromString(xmlData, "application/xml");
  const root = xmlParsed.documentElement;
  const counters = Array.from(root.childNodes).filter(
    (node) => node.nodeName === "counter",
  );
  const lineCounters = counters.filter(
    (counter) => counter.getAttribute("type") === "LINE",
  );
  const lineMissed = parseInt(lineCounters[0].getAttribute("missed"));
  const lineCovered = parseInt(lineCounters[0].getAttribute("covered"));
  const lineTotal = lineMissed + lineCovered;
  const lineCoverage = (lineCovered / lineTotal) * 100;
  return Math.floor(lineCoverage * 10) / 10;
}

console.log("🧪 Running tests...\n");

// Test 1: Parse coverage from XML
try {
  const coverage = parseCoverage("./test-report.xml");
  assert.strictEqual(coverage, 80, "Coverage should be 80%");
  console.log("✅ Test 1 passed: Parse coverage from XML (80%)");
} catch (error) {
  console.log("❌ Test 1 failed:", error.message);
  process.exit(1);
}

// Test 2: Generate badge with green color (coverage >= 80)
try {
  const url = generateBadge("Coverage", 80);
  assert(url.includes("green"), "Badge should be green for 80% coverage");
  console.log("✅ Test 2 passed: Badge color green for 80% coverage");
} catch (error) {
  console.log("❌ Test 2 failed:", error.message);
  process.exit(1);
}

// Test 3: Generate badge with yellow color (50 <= coverage < 80)
try {
  const url = generateBadge("Coverage", 65);
  assert(url.includes("yellow"), "Badge should be yellow for 65% coverage");
  console.log("✅ Test 3 passed: Badge color yellow for 65% coverage");
} catch (error) {
  console.log("❌ Test 3 failed:", error.message);
  process.exit(1);
}

// Test 4: Generate badge with red color (coverage < 50)
try {
  const url = generateBadge("Coverage", 40);
  assert(url.includes("red"), "Badge should be red for 40% coverage");
  console.log("✅ Test 4 passed: Badge color red for 40% coverage");
} catch (error) {
  console.log("❌ Test 4 failed:", error.message);
  process.exit(1);
}

// Test 5: Badge URL contains coverage percentage
try {
  const url = generateBadge("Coverage", 75.5);
  assert(url.includes("75.5"), "Badge should contain coverage percentage");
  console.log("✅ Test 5 passed: Badge URL contains coverage percentage");
} catch (error) {
  console.log("❌ Test 5 failed:", error.message);
  process.exit(1);
}

console.log("\n✨ All tests passed!");
