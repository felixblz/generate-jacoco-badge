const core = require("@actions/core");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { DOMParser } = require("xmldom");
const parser = new DOMParser();

async function run() {
  try {
    const xmlPath = core.getInput("xml-path", { required: true });
    const badgeText = core.getInput("badge-text", { required: true });

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
    const lineCoverageFormatted = Math.floor(lineCoverage * 10) / 10;
    console.log(`${lineTotal}: ${lineCoverage} : ${lineCoverageFormatted}`);

    const badgeUrl = generateBadge(badgeText, lineCoverageFormatted);
    console.log(`Badge URL: ${badgeUrl}`);
    await downloadBadge(badgeUrl, ".github/badges/jacoco.svg");
    core.setOutput("coverage", lineCoverageFormatted);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function generateBadge(string, coverage) {
  const color = coverage >= 80 ? "green" : coverage >= 50 ? "yellow" : "red";
  //return `https://img.shields.io/badge/${string}-${coverage}%25-${color}.svg`;
  return `https://img.shields.io/static/v1?label=${string}&message=${coverage}%25&color=${color}`;
}

async function downloadBadge(url, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const response = await axios.get(url, { responseType: "stream" });
  if (response.status !== 200) {
    throw new Error(`Failed to download badge: ${response.statusText}`);
  }
  response.data.pipe(fs.createWriteStream(filePath));
}

module.exports = run;
