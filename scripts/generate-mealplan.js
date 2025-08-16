// scripts/generate-mealplan.js
// Node >= 18
require("dotenv").config();

const { log } = require("node:console");
const fs = require("node:fs");
const path = require("node:path");
const OpenAI = require("openai");
const { z } = require("zod");

/* =========================
   Zod schema (app contract)
   ========================= */
const Recipe = z.object({
  id: z.string(),
  title: z.string(),
  mins: z.number().int().positive().max(90),
  servings: z.number().int().positive().max(8),
  image: z.string().url(),
});
const Ingredient = z.object({
  name: z.string(),
  qty: z.string(),
});
const DayPlan = z.object({
  breakfast: z.string(),
  lunch: z.string(),
  dinner: z.string(),
  snack: z.string(),
});
const Step = z.string().min(5);

const DataSchema = z.object({
  recipesById: z.record(Recipe),
  ingredientsByRecipe: z.record(z.array(Ingredient)),
  stepsByRecipe: z.record(z.array(Step).min(4).max(12)),
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

/* =========================
   Constants / IDs
   ========================= */
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_ID_BUCKETS = {
  breakfast: Array.from({ length: 7 }, (_, i) => `r${1 + i}`),
  lunch: Array.from({ length: 7 }, (_, i) => `r${8 + i}`),
  dinner: Array.from({ length: 7 }, (_, i) => `r${15 + i}`),
  snack: Array.from({ length: 7 }, (_, i) => `r${22 + i}`),
};

/* =========================
   Helpers
   ========================= */
function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found.");
  }
  return text.slice(start, end + 1);
}

function enforceFoodImageUrls(recipesById) {
  const fallbacks = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&fit=crop",
    ,
  ];
  let i = 0;
  for (const r of Object.values(recipesById || {})) {
    r.image = fallbacks[i];
    i++;
    if (i > 3) i = 0;
  }
}

function sanitizeIngredientsMap(ingredientsByRecipe) {
  const out = {};
  for (const [rid, arr] of Object.entries(ingredientsByRecipe || {})) {
    const cleaned = (Array.isArray(arr) ? arr : [])
      .map((it) => ({
        name: String(it?.name ?? "").trim(),
        qty: String(it?.qty ?? "").trim(),
      }))
      .filter((it) => it.name);
    // keep ALL ingredients – no slice
    out[rid] = cleaned;
  }
  return out;
}

// function simplifyRecipes(recipesById) {
//   for (const r of Object.values(recipesById || {})) {
//     if (typeof r.mins === "number" && r.mins > 30) r.mins = 30;
//     if (typeof r.servings !== "number" || r.servings < 1) r.servings = 2;
//   }
// }

function findShortStepIds(stepsByRecipe, min = 4) {
  return Object.entries(stepsByRecipe || {})
    .filter(([_, arr]) => !Array.isArray(arr) || arr.length < min)
    .map(([id]) => id);
}

function padStepsIfNeeded(steps, min = 4) {
  const s = Array.isArray(steps) ? [...steps] : [];
  while (s.length < min) {
    if (s.length === 0) s.push("Prep all ingredients.");
    else if (s.length === 1) s.push("Heat pan/oven as needed.");
    else if (s.length === 2) s.push("Cook according to recipe until done.");
    else if (s.length === 3) s.push("Plate and serve.");
    else s.push("Adjust seasoning to taste.");
  }
  return s.slice(0, 12);
}

function buildWeekPlan() {
  const plan = {};
  for (let i = 0; i < 7; i++) {
    plan[DAYS[i]] = {
      breakfast: MEAL_ID_BUCKETS.breakfast[i],
      lunch: MEAL_ID_BUCKETS.lunch[i],
      dinner: MEAL_ID_BUCKETS.dinner[i],
      snack: MEAL_ID_BUCKETS.snack[i],
    };
  }
  return plan;
}

/* =========================
   OpenAI Helpers
   ========================= */
const usedTitles = new Set();

async function generateRecipesBatch(client, ids, mealType) {
  let prompt = `
Return ONLY valid JSON:
{
  "recipesById": {
    "ID": { "id":"ID", "title":"...", "mins":20, "servings":2, "image":"..." }
  },
  "ingredientsByRecipe": {
    "ID": [{ "name":"...", "qty":"..." }]
  },
  "stepsByRecipe": {
    "ID": ["Step 1", "Step 2", "Step 3", "Step 4"]
  }
}

Rules:
- Use EXACTLY these IDs as keys: ${ids.join(
    ", "
  )}. Include EVERY one. Do not add or omit IDs.
- ${mealType}-appropriate, Mediterranean-leaning but not only Mediterranean sometimes have meat, family-friendly, SIMPLE.
- 10–30 minutes, 5–8 ingredients, 4–6 steps.
- Images must be Unsplash food URLs.
`.trim();

  if (usedTitles.size > 0) {
    prompt += `\n- Do NOT repeat any of these titles: ${[...usedTitles].join(
      ", "
    )}`;
  }

  const res = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  const json = JSON.parse(extractJSON(res.choices[0].message.content));
  console.log(json.ingredientsByRecipe, "ress");

  enforceFoodImageUrls(json.recipesById || {});
  json.ingredientsByRecipe = sanitizeIngredientsMap(
    json.ingredientsByRecipe || {}
  );
  // simplifyRecipes(json.recipesById || {});

  // ensure minimum steps
  const steps = json.stepsByRecipe || {};
  for (const id of ids) {
    if (!Array.isArray(steps[id]) || steps[id].length < 4) {
      steps[id] = padStepsIfNeeded(steps[id], 4);
    }
  }
  json.stepsByRecipe = steps;

  // track titles to avoid duplicates in the next batch
  Object.values(json.recipesById).forEach((r) => usedTitles.add(r.title));

  return json;
}

async function generateInSmallerChunks(
  client,
  ids,
  mealType,
  chunkSize,
  target
) {
  for (let i = 0; i < ids.length; i += chunkSize) {
    const subIds = ids.slice(i, i + chunkSize);
    const batch = await generateRecipesBatch(client, subIds, mealType);
    Object.assign(target.recipesById, batch.recipesById);
    Object.assign(target.ingredientsByRecipe, batch.ingredientsByRecipe);
    Object.assign(target.stepsByRecipe, batch.stepsByRecipe);
  }
}

/* =========================
   Main
   ========================= */
async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });

  const weekPlan = buildWeekPlan();

  const acc = {
    recipesById: {},
    ingredientsByRecipe: {},
    stepsByRecipe: {},
  };

  await generateInSmallerChunks(
    client,
    MEAL_ID_BUCKETS.breakfast,
    "breakfast",
    3,
    acc
  );
  await generateInSmallerChunks(client, MEAL_ID_BUCKETS.lunch, "lunch", 3, acc);
  await generateInSmallerChunks(
    client,
    MEAL_ID_BUCKETS.dinner,
    "dinner",
    3,
    acc
  );
  await generateInSmallerChunks(client, MEAL_ID_BUCKETS.snack, "snack", 3, acc);

  // Sanity repair
  for (const id of findShortStepIds(acc.stepsByRecipe, 4)) {
    acc.stepsByRecipe[id] = padStepsIfNeeded(acc.stepsByRecipe[id], 4);
  }
  enforceFoodImageUrls(acc.recipesById);
  // simplifyRecipes(acc.recipesById);
  acc.ingredientsByRecipe = sanitizeIngredientsMap(acc.ingredientsByRecipe);

  const json = { ...acc, weekPlan };
  const data = DataSchema.parse(json);

  const header = `// AUTO-GENERATED. Do not edit by hand.\n// Generated at ${new Date().toISOString()}\n`;
  const outTs =
    header +
    `export const recipesById = ${JSON.stringify(
      data.recipesById,
      null,
      2
    )} as const;\n` +
    `export const ingredientsByRecipe = ${JSON.stringify(
      data.ingredientsByRecipe,
      null,
      2
    )} as const;\n` +
    `export const stepsByRecipe = ${JSON.stringify(
      data.stepsByRecipe,
      null,
      2
    )} as const;\n` +
    `export const weekPlan = ${JSON.stringify(
      data.weekPlan,
      null,
      2
    )} as const;\n`;

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
