import { parseAeatXml } from "../../scaffold/backend/src/aeat/parser";
import fs from "fs";
import path from "path";

const fixturesDir = path.join(__dirname, "..", "fixtures");
const validXml = fs.readFileSync(
  path.join(fixturesDir, "aeat_response_valid.xml"),
  "utf8"
);
const errorXml = fs.readFileSync(
  path.join(fixturesDir, "aeat_response_error.xml"),
  "utf8"
);

test("parseAeatXml extracts declarations from a valid response", async () => {
  const results = await parseAeatXml(validXml);
  expect(Array.isArray(results)).toBe(true);
  expect(results.length).toBe(2);
  expect(results[0].ejercicio).toBe("2024");
  expect(results[0].modelo).toBe("303");
  expect(results[0].nif).toBe("B12345678");
  expect(results[1].just_anterior).toBe("JST0000000000001");
});

test("parseAeatXml returns empty array for error response", async () => {
  const results = await parseAeatXml(errorXml);
  expect(results).toEqual([]);
});

test("parseAeatXml returns empty array for invalid XML", async () => {
  const results = await parseAeatXml("not-xml");
  expect(results).toEqual([]);
});
