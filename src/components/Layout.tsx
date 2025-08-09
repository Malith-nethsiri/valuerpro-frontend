import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    DocumentTextIcon,
    UserIcon,
    CreditCardIcon,
    Cog8ToothIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
        { name: 'Profile', href: '/profile', icon: UserIcon },
        { name: 'Subscription', href: '/subscription', icon: CreditCardIcon },
    ];

    if (user?.role === 'admin') {
        navigation.push({ name: 'Admin', href: '/admin', icon: Cog8ToothIcon });
    }

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <XMarkIcon className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    <Sidebar navigation={navigation} currentPath={location.pathname} onLogout={handleLogout} />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <Sidebar navigation={navigation} currentPath={location.pathname} onLogout={handleLogout} />
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Top bar */}
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <button
                        type="button"
                        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex-1 px-4 flex justify-between">
                        <div className="flex-1 flex">
                            <div className="w-full flex md:ml-0">
                                <h1 className="text-2xl font-semibold text-gray-900 mt-4">ValuerPro</h1>
                            </div>
                        </div>
                        <div className="ml-4 flex items-center md:ml-6">
                            <div className="text-sm text-gray-700">
                                Welcome, {user?.profile?.full_name || user?.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

interface SidebarProps {
    navigation: Array<{ name: string; href: string; icon: React.ComponentType<any> }>;
    currentPath: string;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navigation, currentPath, onLogout }) => {
    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
                <h1 className="text-xl font-bold text-white">ValuerPro</h1>
            </div>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const isActive = currentPath === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`${isActive
                                        ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                            >
                                <item.icon
                                    className={`${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                                        } mr-3 h-6 w-6`}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                    <button
                        onClick={onLogout}
                        className="flex items-center w-full text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md px-2 py-2 text-sm font-medium"
                    >
                        <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-gray-400" />
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Layout;
