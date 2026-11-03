import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { buttonClasses } from "../ui/Button.jsx";
import SearchBar from "../search/SearchBar.jsx";

export default function Header() {
  const { user, logout } = useAuth();

  const navLink = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${
      isActive ? "bg-surface text-accent" : "text-dim hover:text-soft"
    }`;

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-night/90 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link to="/" className="text-lg font-semibold text-text">
          Mi Tienda <span className="text-accent">de Electrónica</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={navLink}>
            Inicio
          </NavLink>
          <NavLink to="/productos" className={navLink}>
            Productos
          </NavLink>
          {user && (
            <>
              <NavLink to="/perfil" className={navLink}>
                Mi perfil
              </NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin" className={navLink}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <SearchBar />
          {user ? (
            <>
              <span className="hidden text-sm text-dim sm:block">
                Hola, <span className="text-soft">{user.nombre}</span>
              </span>
              <button type="button" onClick={logout} className={buttonClasses("ghost")}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonClasses("ghost")}>
                Login
              </Link>
              <Link to="/registro" className={buttonClasses("primary")}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
