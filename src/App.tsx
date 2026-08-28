import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import InquiryPopup from './components/InquiryPopup';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import MdPick from './pages/MdPick';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderComplete from './pages/OrderComplete';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

import MyAccountLayout from './pages/my/MyAccountLayout';
import MySummary from './pages/my/MySummary';
import MyOrders from './pages/my/MyOrders';
import MyAddresses from './pages/my/MyAddresses';
import MyReviews from './pages/my/MyReviews';
import MyCoupons from './pages/my/MyCoupons';
import MyProfile from './pages/my/MyProfile';
import MyWithdraw from './pages/my/MyWithdraw';

import Terms from './pages/policy/Terms';
import Privacy from './pages/policy/Privacy';
import ShippingReturn from './pages/policy/ShippingReturn';
import Faq from './pages/policy/Faq';

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-with-header-offset">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/top" element={<CategoryPage category="TOP" />} />
          <Route path="/bottom" element={<CategoryPage category="BOTTOM" />} />
          <Route path="/outer" element={<CategoryPage category="OUTER" />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/md/:activity" element={<MdPick />} />

          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/order-complete/:orderNo" element={<OrderComplete />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/my"
            element={
              <ProtectedRoute>
                <MyAccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MySummary />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="addresses" element={<MyAddresses />} />
            <Route path="reviews" element={<MyReviews />} />
            <Route path="coupons" element={<MyCoupons />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="withdraw" element={<MyWithdraw />} />
          </Route>

          <Route path="/policy/terms" element={<Terms />} />
          <Route path="/policy/privacy" element={<Privacy />} />
          <Route path="/policy/shipping-return" element={<ShippingReturn />} />
          <Route path="/policy/faq" element={<Faq />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <InquiryPopup />
    </div>
  );
}
