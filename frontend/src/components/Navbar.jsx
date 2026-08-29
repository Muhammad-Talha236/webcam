import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        MiniReels
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/create">Create Reel</Link>
      </div>
    </nav>
  );
}

export default Navbar;