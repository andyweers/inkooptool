import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Orders from './pages/Orders';
import ChangePassword from './pages/ChangePassword';
import AddOrder from './pages/AddOrder';
import EditOrder from './pages/EditOrder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<EditOrder />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/add-order" element={<AddOrder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;