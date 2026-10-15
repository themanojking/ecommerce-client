
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import store from "./redux/store";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Signup from "./authentication/Signup";
import Signin from "./authentication/Signin";
import Orders from "./pages/Orders";
import ProtectedRoute from "./pages/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import Ordersuccess from "./pages/Ordersuccess";

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        
        <Toaster position="top-right" />

        <Routes>
  <Route path="/signup" element={<Signup />} />
  <Route path="/signin" element={<Signin />} />

  <Route path="/" element={<Home />} />
  <Route path="/products" element={<Products />} />
  <Route path="/products/:id" element={<ProductDetails />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/cart" element={<Cart />} />

  {/* Order success page */}
  <Route
    path="/order-success/:id"
    element={<Ordersuccess /> }
  />

  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/orders" element={<Orders />} />
  </Route>
</Routes>
        <Footer />
        <ScrollToTop />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
