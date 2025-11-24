// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage"; // the full-page sign-up/sign-in form
//import Dashboard from "./pages/Dashboard"; // your post-login landing
import ExploreFunds from "./pages/ExploreFunds";
import SearchFund from "./pages/SearchFund";
import Portfolio from "./pages/Portfolio";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/search" element={<SearchFund />} />
      <Route path="/portfolio" element={<Portfolio />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      <Route
        path="*"
        element={<div className="p-8 text-center">404: Page not found</div>}
      />
      {/* <Route path="/explore" element={<ExploreFunds />} /> */}
      <Route path="/explore/:scheme_code" element={<ExploreFunds />} />
    </Routes>
  );
}
