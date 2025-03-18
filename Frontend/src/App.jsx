import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from '.pages/Home.jsx'
import Verify_Account from '.pages/Verify_Account.jsx'
import Reset_Password from '.pages/Reset_Password.jsx'
import Login from '.pages/Login.jsx'

const App = () => {
  return (
    <Router>  {/* ✅ Wrap everything inside <BrowserRouter> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify_account" element={<Verify_Account />} />
        <Route path="/reset_password" element={<Reset_Password />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
