import { useIsAuthenticated } from '@azure/msal-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'

function App() {
  const isAuthenticated = useIsAuthenticated()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
