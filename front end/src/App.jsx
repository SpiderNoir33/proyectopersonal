import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import PrivateRoute from "./components/layout/PrivateRoute.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import SellerPage from "./pages/SellerPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import ProductFormPage from "./pages/ProductFormPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import Admin from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        {/* slug + id: ambos deben coincidir en el backend (404 si cambia uno) */}
        <Route path="/productos/:slug/:id" element={<ProductDetail />} />
        <Route path="/vendedores/:id" element={<SellerPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        {/* sesión requerida */}
        <Route element={<PrivateRoute />}>
          <Route path="/perfil" element={<Profile />} />
          <Route path="/perfil/productos/nuevo" element={<ProductFormPage />} />
          <Route path="/perfil/productos/:id/editar" element={<ProductFormPage />} />
          {/* compra demo: hábito de checkout autenticado, como en producción */}
          <Route path="/comprar/:slug/:id" element={<CheckoutPage />} />
        </Route>

        {/* sesión + rol admin */}
        <Route element={<PrivateRoute roles={["admin"]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
