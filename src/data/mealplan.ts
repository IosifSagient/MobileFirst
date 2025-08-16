// src/data/mealplan.ts
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

let gen: any;
try {
  gen = require("./mealplan.generated");
} catch {}

const fb = require("./mealplan.fallback");

export const recipesById = (gen?.recipesById ??
  fb.recipesById) as typeof fb.recipesById;
export const ingredientsByRecipe = (gen?.ingredientsByRecipe ??
  fb.ingredientsByRecipe) as typeof fb.ingredientsByRecipe;
export const weekPlan = (gen?.weekPlan ?? fb.weekPlan) as typeof fb.weekPlan;
