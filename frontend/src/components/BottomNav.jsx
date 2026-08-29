import { Link } from "react-router-dom";

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link to="/">
        <span>⌂</span>
        <small>Home</small>
      </Link>

      <Link to="/create" className="create-button">
        <span>＋</span>
        <small>Create</small>
      </Link>
    </nav>
  );
}

export default BottomNav;