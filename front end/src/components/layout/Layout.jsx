import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-line px-6 py-6 text-center text-sm text-dim">
        Mi Tienda de Electrónica · MERN
      </footer>
      <button> about this project </button>
    </div>
  );
}
