import { Link, useLocation } from 'react-router-dom';
import './TopNav.css';

export default function TopNav() {
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <div className="brand">Recipes</div>
        <div className="nav-actions">
          <Link className={activePath === '/' ? 'btn active' : 'btn'} to="/">List</Link>
          <Link className={activePath === '/gallery' ? 'btn active' : 'btn'} to="/gallery">Gallery</Link>
        </div>
      </div>
    </nav>
  );
}