import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import CreateGroup from './pages/CreateGroup';
import AddExpense from './pages/AddExpense';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/groups" element={
              <PrivateRoute>
                <Groups />
              </PrivateRoute>
            } />
            <Route path="/groups/:id" element={
              <PrivateRoute>
                <GroupDetail />
              </PrivateRoute>
            } />
            <Route path="/create-group" element={
              <PrivateRoute>
                <CreateGroup />
              </PrivateRoute>
            } />
            <Route path="/groups/:id/add-expense" element={
              <PrivateRoute>
                <AddExpense />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 