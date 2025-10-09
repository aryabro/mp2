import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { lookupMeal, type MealDetail } from '../services/mealdb';
import type { Meal } from './RecipesList';
import './RecipeDetail.css';

type NavState = {
  items?: Meal[];
  currentIndex?: number;
};

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as NavState) || {};

  const [detail, setDetail] = useState<MealDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    async function run() {
      if (!id) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const d = await lookupMeal(id);
        if (!live) return;
        setDetail(d);
      } catch (e) {
        if (!live) return;
        setErrorMessage('Failed to load recipe.');
      } finally {
        if (live) setIsLoading(false);
      }
    }
    run();
    return () => {
      live = false;
    };
  }, [id]);

  const { items, currentIndex } = navState;
  const hasPrev = useMemo(() => typeof currentIndex === 'number' && items && currentIndex > 0, [currentIndex, items]);
  const hasNext = useMemo(() => typeof currentIndex === 'number' && items && currentIndex < items.length - 1, [currentIndex, items]);

  function goPrev() {
    if (!items || typeof currentIndex !== 'number' || currentIndex <= 0) return;
    const prev = items[currentIndex - 1];
    navigate(`/recipe/${prev.idMeal}`, { state: { items, currentIndex: currentIndex - 1 }, replace: true });
  }

  function goNext() {
    if (!items || typeof currentIndex !== 'number' || currentIndex >= items.length - 1) return;
    const next = items[currentIndex + 1];
    navigate(`/recipe/${next.idMeal}`, { state: { items, currentIndex: currentIndex + 1 }, replace: true });
  }

  return (
    <div className="recipe-detail">
      <div className="header">
        <Link className="back" to={-1 as unknown as string}>&#60;- Back</Link>
        {items && typeof currentIndex === 'number' && (
          <div className="pager">
            <button className="pager-btn" onClick={goPrev} disabled={!hasPrev}>Previous</button>
            <div className="pager-pos">{currentIndex + 1} / {items.length}</div>
            <button className="pager-btn" onClick={goNext} disabled={!hasNext}>Next</button>
          </div>
        )}
      </div>

      {isLoading && <div className="status">Loading...</div>}
      {errorMessage && <div className="status error">{errorMessage}</div>}
      {!isLoading && !errorMessage && detail && (
        <div className="content">
          <div className="hero">
            {detail.strMealThumb && (
              <img src={detail.strMealThumb} alt={detail.strMeal} />
            )}
            <div className="hero-meta">
              <h1>{detail.strMeal}</h1>
              <div className="sub">{[detail.strCategory, detail.strArea].filter(Boolean).join(' • ')}</div>
              {detail.strTags.length > 0 && (
                <div className="tags">
                  {detail.strTags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>


          {detail.ingredients.length > 0 && (
            <section>
              <h2>Ingredients</h2>
              <ul className="ingredients">
                {detail.ingredients.map(({ ingredient, measure }) => (
                  <li key={ingredient}>
                    <span className="ing-name">{ingredient}</span>
                    {measure && <span className="ing-measure"> - {measure}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {detail.strInstructions && (
            <section>
              <h2>Instructions</h2>
              <p className="instructions">{detail.strInstructions}</p>
            </section>
          )}

          

          {detail.strYoutube && (
            <section>
              <h2>Video</h2>
              <a href={detail.strYoutube} target="_blank" rel="noreferrer">Watch on YouTube</a>
            </section>
          )}
        </div>
      )}
    </div>
  );
}


