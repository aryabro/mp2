import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import RecipesList from './pages/RecipesList';
import RecipesGallery from './pages/RecipesGallery';
import TopNav from './components/TopNav';
import RecipeDetail from './pages/RecipeDetail';

function App() {
  return (
    <BrowserRouter basename="/mp2">
      <TopNav />
      <Routes>
        <Route path="/" element={<RecipesList />} />
        <Route path="/gallery" element={<RecipesGallery />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
