import axios from 'axios';
import type { Meal } from '../pages/RecipesList';

type MealDBSearchResponse = {
  meals: Array<{
    idMeal: string;
    strMeal: string;
    strCategory: string | null;
    strArea: string | null;
    strMealThumb: string | null;
  }> | null;
};

export async function searchMeals(query: string): Promise<Meal[]> {
  const trimmed = query.trim();
  const url = trimmed
    ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(trimmed)}`
    : `https://www.themealdb.com/api/json/v1/1/search.php?s=`;

  const { data } = await axios.get<MealDBSearchResponse>(url);
  const meals = data.meals ?? [];
  return meals.map((m) => ({
    idMeal: m.idMeal,
    strMeal: m.strMeal,
    strCategory: m.strCategory ?? null,
    strArea: m.strArea ?? null,
    strMealThumb: m.strMealThumb ?? null,
  }));
}

type MealDBListResponse<TField extends string> = {
  meals: Array<Record<TField, string>> | null;
};

export async function listCategories(): Promise<string[]> {
  const { data } = await axios.get<MealDBListResponse<'strCategory'>>(
    'https://www.themealdb.com/api/json/v1/1/list.php?c=list'
  );
  const rows = data.meals ?? [];
  return rows.map((r) => r.strCategory).filter(Boolean);
}

export async function listAreas(): Promise<string[]> {
  const { data } = await axios.get<MealDBListResponse<'strArea'>>(
    'https://www.themealdb.com/api/json/v1/1/list.php?a=list'
  );
  const rows = data.meals ?? [];
  return rows.map((r) => r.strArea).filter(Boolean);
}

export async function filterByCategory(category: string): Promise<Meal[]> {
  const { data } = await axios.get<{ meals: Array<{ idMeal: string; strMeal: string; strMealThumb: string | null }> | null }>(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`
  );
  const rows = data.meals ?? [];
  return rows.map((m) => ({
    idMeal: m.idMeal,
    strMeal: m.strMeal,
    strCategory: category,
    strArea: null,
    strMealThumb: m.strMealThumb,
  }));
}

export async function filterByArea(area: string): Promise<Meal[]> {
  const { data } = await axios.get<{ meals: Array<{ idMeal: string; strMeal: string; strMealThumb: string | null }> | null }>(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`
  );
  const rows = data.meals ?? [];
  return rows.map((m) => ({
    idMeal: m.idMeal,
    strMeal: m.strMeal,
    strCategory: null,
    strArea: area,
    strMealThumb: m.strMealThumb,
  }));
}

type MealDBLookupResponse = {
  meals: Array<{
    idMeal: string;
    strMeal: string;
    strCategory: string | null;
    strArea: string | null;
    strInstructions: string | null;
    strMealThumb: string | null;
    strTags: string | null;
    strYoutube: string | null;
    [key: string]: string | null;
  }> | null;
};

export type MealDetail = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  strTags: string[];
  strYoutube: string | null;
  ingredients: Array<{ ingredient: string; measure: string | null }>;
};

export async function lookupMeal(id: string): Promise<MealDetail | null> {
  const { data } = await axios.get<MealDBLookupResponse>(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`
  );
  const row = data.meals?.[0];
  if (!row) return null;

  const tags = (row.strTags ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const ingredients: Array<{ ingredient: string; measure: string | null }> = [];
  for (let i = 1; i <= 20; i++) {
    const ing = row[`strIngredient${i}`];
    const meas = row[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ ingredient: ing.trim(), measure: meas?.trim() || null });
    }
  }

  return {
    idMeal: row.idMeal,
    strMeal: row.strMeal,
    strCategory: row.strCategory,
    strArea: row.strArea,
    strInstructions: row.strInstructions,
    strMealThumb: row.strMealThumb,
    strTags: tags,
    strYoutube: row.strYoutube,
    ingredients,
  };
}