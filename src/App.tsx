import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login'

import Canvas from './components/book/Canvas'
import CList from './components/book/CList';
function App() {
  console.log(process.env.REACT_APP_API)
  return (
    <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/dashboard" element={<Canvas />} />
  </Routes>
  );
}

export default App;
