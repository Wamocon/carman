import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// These tests verify three invariants across the whole project:
//   1. Category labels exist for every CostCategory in both locales
//   2. The ReminderTimeline widget has been fully removed
//   3. Only standardDark and standardLight themes exist
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let i18nModule: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prefsModule: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let legalModule: any;

before(async () => {
  i18nModule = await import("../src/lib/i18n.js");
  prefsModule = await import("../src/lib/preferences.js");
  legalModule = await import("../src/lib/legal.js");
});

function getDictionary(locale: "de" | "en") {
  return i18nModule.getDictionary(locale);
}

// Canonical list of cost categories from the domain model
const COST_CATEGORIES = [
  "fuel",
  "maintenance",
  "repair",
  "insurance",
  "tax",
  "leasing",
  "parking",
  "other",
] as const;

// ---------------------------------------------------------------------------
// 1. Cost category labels
// ---------------------------------------------------------------------------
describe("costCategories i18n", () => {
  for (const locale of ["de", "en"] as const) {
    it(`locale "${locale}" has a label for every cost category`, () => {
      const dict = getDictionary(locale);
      for (const category of COST_CATEGORIES) {
        assert.ok(
          dict.costCategories[category],
          `Missing label for category "${category}" in locale "${locale}"`,
        );
        assert.ok(
          dict.costCategories[category].length > 0,
          `Empty label for category "${category}" in locale "${locale}"`,
        );
      }
    });

    it(`locale "${locale}" — German labels are German, English labels are English`, () => {
      const de = getDictionary("de");
      const en = getDictionary("en");

      // "fuel" in German should be "Tanken", not "Fuel"
      assert.equal(de.costCategories.fuel, "Tanken");
      assert.equal(en.costCategories.fuel, "Fuel");
    });
  }

  it("category labels do not contain raw DB keys when locale is 'de'", () => {
    const dict = getDictionary("de");
    for (const category of COST_CATEGORIES) {
      // The raw DB key (e.g. "fuel") must not be used as the label
      assert.notEqual(
        dict.costCategories[category],
        category,
        `Label for "${category}" in DE equals the raw DB key — translation missing`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// 2. ReminderTimeline widget removal
// ---------------------------------------------------------------------------
describe("ReminderTimeline removal", () => {
  it("dashboard.widgetReminderTimeline key does not exist in DE dictionary", () => {
    const dict = getDictionary("de") as Record<string, unknown>;
    const dashboard = dict.dashboard as Record<string, unknown>;
    assert.equal(
      "widgetReminderTimeline" in dashboard,
      false,
      "widgetReminderTimeline still present in DE i18n",
    );
  });

  it("dashboard.widgetReminderTimeline key does not exist in EN dictionary", () => {
    const dict = getDictionary("en") as Record<string, unknown>;
    const dashboard = dict.dashboard as Record<string, unknown>;
    assert.equal(
      "widgetReminderTimeline" in dashboard,
      false,
      "widgetReminderTimeline still present in EN i18n",
    );
  });
});

// ---------------------------------------------------------------------------
// 3. Only standardDark and standardLight themes
// ---------------------------------------------------------------------------
describe("Theme restrictions", () => {
  it("THEMES contains exactly standardDark and standardLight", () => {
    assert.deepEqual([...prefsModule.THEMES], ["standardDark", "standardLight"]);
  });

  it("DARK_THEMES contains only standardDark", () => {
    assert.deepEqual([...prefsModule.DARK_THEMES], ["standardDark"]);
  });

  it("LIGHT_THEMES contains only standardLight", () => {
    assert.deepEqual([...prefsModule.LIGHT_THEMES], ["standardLight"]);
  });

  it("themeOptions has exactly two entries", () => {
    const keys = Object.keys(prefsModule.themeOptions);
    assert.equal(keys.length, 2);
    assert.ok(keys.includes("standardDark"));
    assert.ok(keys.includes("standardLight"));
  });

  it("resolveTheme falls back to standardDark for unknown themes", () => {
    assert.equal(prefsModule.resolveTheme("petrol"), "standardDark");
    assert.equal(prefsModule.resolveTheme("mostWanted"), "standardDark");
    assert.equal(prefsModule.resolveTheme("nonexistent"), "standardDark");
  });

  it("resolveTheme accepts valid themes", () => {
    assert.equal(prefsModule.resolveTheme("standardDark"), "standardDark");
    assert.equal(prefsModule.resolveTheme("standardLight"), "standardLight");
  });

  it("resolveTheme maps 'dark'/'light' shortcuts correctly", () => {
    assert.equal(prefsModule.resolveTheme("dark"), "standardDark");
    assert.equal(prefsModule.resolveTheme("light"), "standardLight");
  });

  it("DE themeOptions i18n has exactly two entries", () => {
    const dict = getDictionary("de");
    const keys = Object.keys(dict.themeOptions);
    assert.deepEqual(keys.sort(), ["standardDark", "standardLight"]);
  });

  it("EN themeOptions i18n has exactly two entries", () => {
    const dict = getDictionary("en");
    const keys = Object.keys(dict.themeOptions);
    assert.deepEqual(keys.sort(), ["standardDark", "standardLight"]);
  });
});

// ---------------------------------------------------------------------------
// 4. Legal links and legal routes
// ---------------------------------------------------------------------------
describe("Legal links", () => {
  it("shared legal link list contains exactly imprint, privacy policy, and terms", () => {
    assert.deepEqual(legalModule.LEGAL_LINKS, [
      { href: "/impressum", labelKey: "imprint" },
      { href: "/datenschutz", labelKey: "privacyPolicy" },
      { href: "/agb", labelKey: "termsAndConditions" },
    ]);
  });

  it("DE dictionary provides labels for all legal links", () => {
    const dict = getDictionary("de");
    assert.equal(dict.common.imprint, "Impressum");
    assert.equal(dict.common.privacyPolicy, "Datenschutz");
    assert.equal(dict.common.termsAndConditions, "AGB");
  });

  it("EN dictionary provides labels for all legal links", () => {
    const dict = getDictionary("en");
    assert.equal(dict.common.imprint, "Imprint");
    assert.equal(dict.common.privacyPolicy, "Privacy policy");
    assert.equal(dict.common.termsAndConditions, "Terms");
  });
});
