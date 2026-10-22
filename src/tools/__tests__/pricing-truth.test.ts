import { describe, expect, it } from "vitest";
import { pricingGetPlans, pricingGetCountryPlans } from "../pricing.js";
import { COUNTRY_PRICING } from "../../data/website-mirror.js";

// Canonical source: hellocrmwebsite src/lib/pricing-constants.ts
// India = Rs 899/user/mo + 18% GST on BOTH billing modes (Rs 1,060.82 billed).
// The Rs 1,099 "month-to-month rate" was retired 2026-09-03; it must not return.
async function text(tool: { handle: (a: unknown) => Promise<{ content: { text: string }[] }> }, args: unknown = {}) {
  const r = await tool.handle(args);
  return r.content.map((c) => c.text).join("\n");
}

describe("pricing truth", () => {
  it("never serves the retired Rs 1,099 monthly price", async () => {
    expect(await text(pricingGetPlans, { region: "both" })).not.toMatch(/1,?099/);
    expect(await text(pricingGetCountryPlans)).not.toMatch(/1,?099/);
    expect(JSON.stringify(COUNTRY_PRICING)).not.toMatch(/1,?099/);
  });

  it("states India Growth as Rs 899 + 18% GST", async () => {
    const out = await text(pricingGetPlans, { region: "both" });
    expect(out).toContain("₹899/user/month + 18% GST");
    expect(out).toContain("1,060.82");
  });

  it("states USD Growth monthly as $12", async () => {
    expect(await text(pricingGetPlans, { region: "both" })).toContain("$12/user/month");
  });
});
