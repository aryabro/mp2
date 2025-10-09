import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { filterByArea, filterByCategory, listAreas, listCategories } from '../services/mealdb';
import type { Meal } from './RecipesList';
import './RecipesGallery.css';

type MultiMap = Record<string, boolean>;

function toSelectedList(map: MultiMap): string[] {
  return Object.keys(map).filter((k) => map[k]);
}

async function unionResults(promises: Array<Promise<Meal[]>>): Promise<Meal[]> {
  const batches = await Promise.all(promises);
  const map = new Map<string, Meal>();
  for (const arr of batches) {
    for (const m of arr) map.set(m.idMeal, m);
  }
  return Array.from(map.values());
}

export default function RecipesGallery() {
  const location = useLocation();
  const [categories, setCategories] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<MultiMap>({});
  const [selectedAreas, setSelectedAreas] = useState<MultiMap>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [items, setItems] = useState<Meal[]>([]);

  useEffect(() => {
    let live = true;
    async function loadOptions() {
      try {
        const [cats, ars] = await Promise.all([listCategories(), listAreas()]);
        if (!live) return;
        setCategories(cats);
        setAreas(ars);
      } catch (e) {
      }
    }
    loadOptions();
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    let live = true;
    async function loadItems() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const catList = toSelectedList(selectedCategories);
        const areaList = toSelectedList(selectedAreas);

        let finalResults: Meal[] = [];

        if (catList.length === 0 && areaList.length === 0) {
          const defaults = categories.slice(0, 3);
          finalResults = await unionResults(defaults.map((c) => filterByCategory(c)));
        } else if (catList.length > 0 && areaList.length === 0) {
          finalResults = await unionResults(catList.map((c) => filterByCategory(c)));
        } else if (catList.length === 0 && areaList.length > 0) {
          finalResults = await unionResults(areaList.map((a) => filterByArea(a)));
        } else {
          const byCategory = await unionResults(catList.map((c) => filterByCategory(c)));
          const byArea = await unionResults(areaList.map((a) => filterByArea(a)));
          const areaIds = new Set(byArea.map((m) => m.idMeal));
          finalResults = byCategory.filter((m) => areaIds.has(m.idMeal));
        }

        if (!live) return;
        setItems(finalResults);
      } catch (e) {
        if (!live) return;
        setErrorMessage('Failed to load gallery. Try again.');
        setItems([]);
      } finally {
        if (live) setIsLoading(false);
      }
    }
    loadItems();
    return () => {
      live = false;
    };
  }, [selectedCategories, selectedAreas, categories]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => (a.strMeal || '').localeCompare(b.strMeal || ''));
  }, [items]);

  function toggle(map: MultiMap, setMap: (m: MultiMap) => void, key: string) {
    setMap({ ...map, [key]: !map[key] });
  }

  return (
    <div className="recipes-gallery">
      <h1 className="page-title">Gallery</h1>
      <div className="filters">
        <div className="filter-group">
          <div className="filter-title">Category</div>
          <div className="chip-row">
            {categories.map((c) => (
              <button
                key={c}
                className={selectedCategories[c] ? 'chip active' : 'chip'}
                onClick={() => toggle(selectedCategories, setSelectedCategories, c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <div className="filter-title">Area</div>
          <div className="chip-row">
            {areas.map((a) => (
              <button
                key={a}
                className={selectedAreas[a] ? 'chip active' : 'chip'}
                onClick={() => toggle(selectedAreas, setSelectedAreas, a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && <div className="status">Loading...</div>}
      {errorMessage && <div className="status error">{errorMessage}</div>}

      <div className="grid">
        {sortedItems.map((m, idx) => (
          <Link
            key={m.idMeal}
            to={`/recipe/${m.idMeal}`}
            state={{ items: sortedItems, currentIndex: idx, from: location.pathname }}
            className="card-link"
          >
            <div className="card">
              {m.strMealThumb && (
                <img className="photo" src={m.strMealThumb} alt={m.strMeal} />
              )}
              <div className="caption">{m.strMeal}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


