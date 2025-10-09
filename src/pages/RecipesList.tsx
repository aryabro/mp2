import { useEffect, useMemo, useState } from 'react';
import { searchMeals } from '../services/mealdb';
import { useDebounce } from '../services/useDebounce';
import './RecipesList.css';
import { Link } from 'react-router-dom';

export type Meal = {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strMealThumb: string | null;
};

type SortKey = 'name' | 'category' | 'area';
type SortOrder = 'asc' | 'desc';

function normalizeString(value: string | null | undefined): string {
  return (value ?? '').toLowerCase();
}

const sortComparators: Record<SortKey, (a: Meal, b: Meal) => number> = {
  name: (a, b) => normalizeString(a.strMeal).localeCompare(normalizeString(b.strMeal)),
  category: (a, b) => normalizeString(a.strCategory).localeCompare(normalizeString(b.strCategory)),
  area: (a, b) => normalizeString(a.strArea).localeCompare(normalizeString(b.strArea)),
};

export default function RecipesList() {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce(query, 300);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    let isCurrent = true;
    async function run() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const results = await searchMeals(debouncedQuery);
        if (!isCurrent) return;
        setMeals(results);
      } catch (err: unknown) {
        if (!isCurrent) return;
        setErrorMessage('Failed to fetch recipes. Please try again.');
        setMeals([]);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    run();
    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery]);

  const sortedMeals = useMemo(() => {
    const copy = [...meals];
    const comparator = sortComparators[sortKey];
    copy.sort((a, b) => comparator(a, b));
    if (sortOrder === 'desc') copy.reverse();
    return copy;
  }, [meals, sortKey, sortOrder]);

  return (
    <div className="recipes-list">
      <h1 className="recipes-title">List</h1>
      <div className="controls">
        <input
          className="search-input"
          type="text"
          placeholder="Search recipes by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="sort-controls">
          <label>
            Sort by :
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="area">Area</option>
            </select>
          </label>
          <label>
            Order :
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </div>

      {isLoading && <div className="status">Loading...</div>}
      {errorMessage && <div className="status error">{errorMessage}</div>}
      {!isLoading && !errorMessage && sortedMeals.length === 0 && (
        <div className="status">No results</div>
      )}

      <ul className="results">
        {sortedMeals.map((meal, idx) => (
          <li key={meal.idMeal} className="result-item">
            <Link
              to={`/recipe/${meal.idMeal}`}
              state={{ items: sortedMeals, currentIndex: idx }}
              className="link-wrap"
            >
              {meal.strMealThumb && (
                <img className="thumb" src={meal.strMealThumb} alt={meal.strMeal} />
              )}
              <div className="meta">
                <div className="name">{meal.strMeal}</div>
                <div className="sub">{[meal.strCategory, meal.strArea].filter(Boolean).join(' • ')}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


