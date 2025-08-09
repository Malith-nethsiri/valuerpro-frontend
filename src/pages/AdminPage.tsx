import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    UsersIcon,
    DocumentTextIcon,
    CreditCardIcon,
    ChartBarIcon,
    EyeIcon,
    PencilIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [usersPage, setUsersPage] = useState(1);
    const [reportsPage, setReportsPage] = useState(1);
    const [subscriptionsPage, setSubscriptionsPage] = useState(1);

    // Redirect if not admin
    if (user?.role !== 'admin') {
        return (
            <div className="text-center py-12">
                <ShieldExclamationIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                <p className="mt-1 text-sm text-gray-500">
                    You don't have permission to access this page.
                </p>
            </div>
        );
    }

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: () => adminAPI.getAnalytics(),
    });

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users', usersPage],
        queryFn: () => adminAPI.getUsers(usersPage, 10),
    });

    const { data: reportsData, isLoading: reportsLoading } = useQuery({
        queryKey: ['admin-reports', reportsPage],
        queryFn: () => adminAPI.getReports(reportsPage, 10),
    });

    const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery({
        queryKey: ['admin-subscriptions', subscriptionsPage],
        queryFn: () => adminAPI.getSubscriptions(subscriptionsPage, 10),
    });

    const updateUserStatusMutation = useMutation({
        mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
            adminAPI.updateUserStatus(userId, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
        },
    });

    const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} this user?`)) {
            updateUserStatusMutation.mutate({ userId, isActive: !currentStatus });
        }
    };

    const formatCurrency = (amount: number, currency: string = 'LKR') => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'sent':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: ChartBarIcon },
        { id: 'users', name: 'Users', icon: UsersIcon },
        { id: 'reports', name: 'Reports', icon: DocumentTextIcon },
        { id: 'subscriptions', name: 'Subscriptions', icon: CreditCardIcon },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <ShieldCheckIcon className="h-8 w-8 text-primary-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-600">Manage users, reports, and subscriptions</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="h-5 w-5 inline mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {analyticsLoading ? (
                                <LoadingSpinner className="h-32" />
                            ) : (
                                <>
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="bg-white overflow-hidden shadow rounded-lg">
                                            <div className="p-5">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <UsersIcon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <div className="ml-5 w-0 flex-1">
                                                        <dl>
                                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                                            <dd className="text-lg font-medium text-gray-900">
                                                                {analytics?.total_users || 0}
                                                            </dd>
                                                        </dl>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white overflow-hidden shadow rounded-lg">
                                            <div className="p-5">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <CreditCardIcon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <div className="ml-5 w-0 flex-1">
                                                        <dl>
                                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                                Active Subscriptions
                                                            </dt>
                                                            <dd className="text-lg font-medium text-gray-900">
                                                                {analytics?.active_subscriptions || 0}
                                                            </dd>
                                                        </dl>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white overflow-hidden shadow rounded-lg">
                                            <div className="p-5">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <div className="ml-5 w-0 flex-1">
                                                        <dl>
                                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Reports</dt>
                                                            <dd className="text-lg font-medium text-gray-900">
                                                                {analytics?.total_reports || 0}
                                                            </dd>
                                                        </dl>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white overflow-hidden shadow rounded-lg">
                                            <div className="p-5">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <ChartBarIcon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <div className="ml-5 w-0 flex-1">
                                                        <dl>
                                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                                Revenue This Month
                                                            </dt>
                                                            <dd className="text-lg font-medium text-gray-900">
                                                                {formatCurrency(analytics?.revenue_this_month || 0)}
                                                            </dd>
                                                        </dl>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <button
                                                onClick={() => setActiveTab('users')}
                                                className="text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                                            >
                                                <UsersIcon className="h-8 w-8 text-primary-600 mb-2" />
                                                <div className="text-sm font-medium text-gray-900">Manage Users</div>
                                                <div className="text-xs text-gray-500">View and manage user accounts</div>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('reports')}
                                                className="text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                                            >
                                                <DocumentTextIcon className="h-8 w-8 text-primary-600 mb-2" />
                                                <div className="text-sm font-medium text-gray-900">View Reports</div>
                                                <div className="text-xs text-gray-500">Monitor all valuation reports</div>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('subscriptions')}
                                                className="text-left p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                                            >
                                                <CreditCardIcon className="h-8 w-8 text-primary-600 mb-2" />
                                                <div className="text-sm font-medium text-gray-900">Subscriptions</div>
                                                <div className="text-xs text-gray-500">Manage billing and plans</div>
                                            </button>
                                            <div className="text-left p-4 bg-white rounded-lg shadow">
                                                <ChartBarIcon className="h-8 w-8 text-gray-400 mb-2" />
                                                <div className="text-sm font-medium text-gray-900">Analytics</div>
                                                <div className="text-xs text-gray-500">Coming Soon</div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Users Management</h3>
                            </div>

                            {usersLoading ? (
                                <LoadingSpinner className="h-32" />
                            ) : (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {usersData?.items.map((user) => (
                                            <li key={user.id}>
                                                <div className="px-4 py-4 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {user.email.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {user.profile?.full_name || user.email}
                                                                </p>
                                                                <span
                                                                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                        }`}
                                                                >
                                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                                </span>
                                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                                                    {user.role}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 flex">
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <p>
                                                                        {user.email} • Joined{' '}
                                                                        {new Date(user.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            className="text-primary-600 hover:text-primary-500 p-1"
                                                            title="View User"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                                                            disabled={updateUserStatusMutation.isPending}
                                                            className={`p-1 ${user.is_active
                                                                    ? 'text-red-600 hover:text-red-500'
                                                                    : 'text-green-600 hover:text-green-500'
                                                                } disabled:opacity-50`}
                                                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                                                        >
                                                            {user.is_active ? (
                                                                <ShieldExclamationIcon className="h-5 w-5" />
                                                            ) : (
                                                                <ShieldCheckIcon className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Reports Overview</h3>
                            </div>

                            {reportsLoading ? (
                                <LoadingSpinner className="h-32" />
                            ) : (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {reportsData?.items.map((report) => (
                                            <li key={report.id}>
                                                <div className="px-4 py-4 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {report.title}
                                                                </p>
                                                                <span
                                                                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                                        report.status
                                                                    )}`}
                                                                >
                                                                    {report.status.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 flex">
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <p>
                                                                        {report.report_type.charAt(0).toUpperCase() +
                                                                            report.report_type.slice(1)}{' '}
                                                                        • Created {new Date(report.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            className="text-primary-600 hover:text-primary-500 p-1"
                                                            title="View Report"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subscriptions Tab */}
                    {activeTab === 'subscriptions' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Subscriptions</h3>
                            </div>

                            {subscriptionsLoading ? (
                                <LoadingSpinner className="h-32" />
                            ) : (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {subscriptionsData?.items.map((subscription) => (
                                            <li key={subscription.id}>
                                                <div className="px-4 py-4 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            <CreditCardIcon className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {subscription.plan_type.charAt(0).toUpperCase() +
                                                                        subscription.plan_type.slice(1)}{' '}
                                                                    Plan
                                                                </p>
                                                                <span
                                                                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                                        subscription.status
                                                                    )}`}
                                                                >
                                                                    {subscription.status}
                                                                </span>
                                                            </div>
                                                            <div className="mt-2 flex">
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <p>
                                                                        {formatCurrency(subscription.price, subscription.currency)}/month •{' '}
                                                                        {subscription.reports_used}/{subscription.reports_limit} reports used
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500">
                                                            Ends {new Date(subscription.end_date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
