import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI, billingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    DocumentTextIcon,
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    CreditCardIcon,
    ChartBarIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    const { data: reportsData, isLoading: reportsLoading } = useQuery({
        queryKey: ['reports', 1, 5],
        queryFn: () => reportsAPI.getReports(1, 5),
    });

    const { data: subscription, isLoading: subscriptionLoading } = useQuery({
        queryKey: ['subscription'],
        queryFn: () => billingAPI.getSubscription(),
    });

    const hasProfile = user?.profile && user.profile.full_name;

    if (reportsLoading || subscriptionLoading) {
        return <LoadingSpinner className="h-64" />;
    }

    const reports = reportsData?.items || [];
    const recentReports = reports.slice(0, 3);

    // Calculate this month's reports
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthReports = reports.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
    }).length;

    const stats = [
        {
            name: 'Reports This Month',
            value: thisMonthReports,
            icon: ChartBarIcon,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            name: 'Remaining Quota',
            value: subscription?.reports_remaining || 0,
            icon: DocumentTextIcon,
            color: 'text-green-600',
            bgColor: 'bg-yellow-100',
        },
        {
            name: 'Completed',
            value: reports.filter(r => r.status === 'completed').length,
            icon: CheckCircleIcon,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.profile?.full_name || user?.email}!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Here's what's happening with your valuation reports today.
                    </p>
                </div>
            </div>

            {/* Profile Setup Notification */}
            {!hasProfile && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-amber-800">Complete Your Profile</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Complete your valuer profile to include your professional information in all reports and invoices.
                            </p>
                            <div className="mt-4">
                                <Link
                                    to="/profile-setup"
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                >
                                    Complete Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription status */}
            {subscription && subscription.status === 'active' && (
                <div className="bg-white overflow-hidden shadow-soft rounded-2xl">
                    <div className="p-6">
                        <div className="flex items-center">
                            <CreditCardIcon className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">{subscription.plan} Subscription</h3>
                                <p className="text-sm text-gray-600">
                                    {subscription.reports_used}/{subscription.monthly_quota} reports used this month
                                    • {subscription.reports_remaining} remaining
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade prompt for trial users */}
            {subscription && subscription.plan === 'TRIAL' && subscription.reports_remaining <= 1 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900">Running Low on Reports</h3>
                            <p className="text-blue-700 mt-1">
                                You have {subscription.reports_remaining} reports remaining. Upgrade to PRO for 20 reports per month.
                            </p>
                        </div>
                        <Link
                            to="/subscription"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white rounded-2xl shadow-soft p-6">
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 p-3 rounded-xl ${item.bgColor}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                            <div className="ml-4 flex-1">
                                <dt className="text-sm font-medium text-gray-600">{item.name}</dt>
                                <dd className="text-2xl font-bold text-gray-900 mt-1">{item.value}</dd>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="bg-white shadow rounded-lg">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Link
                            to="/reports/new"
                            className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                Create New Report
                            </span>
                        </Link>
                        <Link
                            to="/reports"
                            className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                View All Reports
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent reports */}
            {recentReports.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
                            <Link
                                to="/reports"
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentReports.map((report) => (
                                <div key={report.id} className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {report.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {report.report_type} • {new Date(report.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : report.status === 'in_progress'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {report.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <Link
                                            to={`/reports/${report.id}`}
                                            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
