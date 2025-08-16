// scripts/generate-mealplan.js
// Node >=18 required
require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const OpenAI = require("openai");
const { z } = require("zod");

// ---------- Zod schema (matches your app types) ----------
const Recipe = z.object({
  id: z.string(),
  title: z.string(),
  mins: z.number().int().positive().max(90),
  servings: z.number().int().positive().max(8),
  image: z.string().url(),
});
const Ingredient = z.object({
  name: z.string(),
  qty: z.string(), // keep as text for simplicity (e.g., "200g", "1 tbsp")
});
const DayPlan = z.object({
  breakfast: z.string(),
  lunch: z.string(),
  dinner: z.string(),
  snack: z.string(),
});
const DataSchema = z.object({
  recipesById: z.record(Recipe),
  ingredientsByRecipe: z.record(z.array(Ingredient)),
  weekPlan: z.object({
    Monday: DayPlan,
    Tuesday: DayPlan,
    Wednesday: DayPlan,
    Thursday: DayPlan,
    Friday: DayPlan,
    Saturday: DayPlan,
    Sunday: DayPlan,
  }),
});

// ---------- Prompt ----------
const PROMPT = `
Return ONLY valid JSON (no backticks, no prose).
Produce a weekly meal plan with exactly these keys and shapes:

{
  "recipesById": {
    "r1": { "id":"r1", "title":"...", "mins": 20, "servings": 2, "image": "https://picsum.photos/seed/r1/800/600" },
    "...": { ... }
  },
  "ingredientsByRecipe": {
    "r1": [{ "name":"Greek yogurt", "qty":"200g" }, { "name":"Honey", "qty":"1 tbsp" }],
    "...": [ ... ]
  },
  "weekPlan": {
    "Monday":    { "breakfast":"r1","lunch":"r2","dinner":"r3","snack":"r4" },
    "Tuesday":   { "breakfast":"...","lunch":"...","dinner":"...","snack":"..." },
    "Wednesday": { "breakfast":"...","lunch":"...","dinner":"...","snack":"..." },
    "Thursday":  { "breakfast":"...","lunch":"...","dinner":"...","snack":"..." },
    "Friday":    { "breakfast":"...","lunch":"...","dinner":"...","snack":"..." },
    "Saturday":  { "breakfast":"...","lunch":"...","dinner":"...","snack":"..." },
    "Sunday":    { "breakfast":"...","lunch":"...","dinner":"...","snack":"..." }
  }
}

Constraints & style guidelines:
- Cuisine vibe: Mediterranean-leaning, family-friendly.
- Most recipes 20–35 min; allow a couple up to 45 min.
- 5–10 ingredients per recipe. Avoid ultra-rare items.
- Units: g, ml, tbsp, tsp, piece.
- Avoid duplicates across dinners; variety across the week.
- Each recipe's image must be a reliable royalty-free URL (e.g., https://images.unsplash.com/* or https://picsum.photos/*).
- Titles should be short and appetizing.
- Use recipe IDs like r1, r2, r3... and reuse where appropriate (e.g., breakfast parfait multiple days).
`;

// ---------- Util: extract pure JSON safely ----------
function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in response.");
  }
  return text.slice(start, end + 1);
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY env var.");
  }

  const client = new OpenAI({ apiKey });

  const res = await client.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You are a careful meal-planning assistant. Output strictly valid JSON only.",
      },
      { role: "user", content: PROMPT },
    ],
    temperature: 0.6,
  });

  // pull the raw text
  const raw = res.output_text || "";
  const json = JSON.parse(extractJSON(raw));
  const data = DataSchema.parse(json); // throws if invalid

  const header = `// AUTO-GENERATED. Do not edit by hand.
// Generated at ${new Date().toISOString()}
`;

  const outTs =
    header +
    `export const recipesById = ${JSON.stringify(
      data.recipesById,
      null,
      2
    )} as const;
export const ingredientsByRecipe = ${JSON.stringify(
      data.ingredientsByRecipe,
      null,
      2
    )} as const;
export const weekPlan = ${JSON.stringify(data.weekPlan, null, 2)} as const;
`;

  const outPath = path.join(
    process.cwd(),
    "src",
    "data",
    "mealplan.generated.ts"
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outTs, "utf8");
  console.log("✅ Wrote", outPath);
}

main().catch((err) => {
  console.error("❌ Generation failed:", err);
  process.exit(1);
});
