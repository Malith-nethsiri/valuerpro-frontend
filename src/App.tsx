import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './pages/ReportsPage'
import ReportDetailsPage from './pages/ReportDetailsPage'
import CreateReportPage from './pages/CreateReportPage'
import ProfilePage from './pages/ProfilePage'
import SubscriptionPage from './pages/SubscriptionPage'
import AdminPage from './pages/AdminPage'
import ValuerProfileSetupPage from './pages/ValuerProfileSetupPage'
import LoadingSpinner from './components/LoadingSpinner'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="reports/new" element={<CreateReportPage />} />
                        <Route path="reports/:id" element={<ReportDetailsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="subscription" element={<SubscriptionPage />} />

                        {/* Admin routes */}
                        <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                    </Route>

                    {/* Profile Setup - standalone route */}
                    <Route path="/profile-setup" element={<ProtectedRoute><ValuerProfileSetupPage /></ProtectedRoute>} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
        </AuthProvider>
    )
}

export default App
