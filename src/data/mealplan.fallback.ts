// src/data/mealplan.fallback.ts
export const recipesById = {
  r1: {
    id: "r1",
    title: "Placeholder Breakfast",
    mins: 10,
    servings: 1,
    image: "https://picsum.photos/600/400?seed=r1",
  },
} as const;

export const ingredientsByRecipe = {
  r1: [
    { name: "Granola", qty: "40g" },
    { name: "Yogurt", qty: "200g" },
  ],
} as const;

export const stepsByRecipe = {
  r1: ["Add granola to bowl", "Top with yogurt", "Serve immediately"],
} as const;

export const weekPlan = {
  Monday: { breakfast: "r1", lunch: "r1", dinner: "r1", snack: "r1" },
  Tuesday: { breakfast: "r1", lunch: "r1", dinner: "r1", snack: "r1" },
  Wednesday: { breakfast: "r1", lunch: "r1", dinner: "r1", snack: "r1" },
  Thursday: { breakfast: "r1", lunch: "r1", dinner: "r1", snack: "r1" },
  Friday: { breakfast: "r1", lunch: "r1", dinner: "r1", snack: "r1" },
  Saturday: { breakfast: "r1", lunch: "r1", dinner: "r1", snack: "r1" },
  Sunday: { breakfast: "r1", lunch: "r1", dinner: "r1", snack: "r1" },
} as const;
