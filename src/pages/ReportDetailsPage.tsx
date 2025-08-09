import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI, filesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    ArrowLeftIcon,
    PencilIcon,
    DocumentArrowDownIcon,
    PhotoIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    HomeIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

const ReportDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: report, isLoading, error } = useQuery({
        queryKey: ['report', id],
        queryFn: () => reportsAPI.getReport(id!),
        enabled: !!id,
    });

    const generateReportMutation = useMutation({
        mutationFn: ({ reportId, format }: { reportId: string; format: 'pdf' | 'docx' }) =>
            reportsAPI.generateReport(reportId, format),
        onSuccess: (blob, variables) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `report_${id}.${variables.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            setIsGenerating(false);
        },
        onError: () => {
            setIsGenerating(false);
        },
    });

    const generateInvoiceMutation = useMutation({
        mutationFn: ({ reportId, format }: { reportId: string; format: 'pdf' | 'docx' }) =>
            reportsAPI.generateInvoice(reportId, format),
        onSuccess: (blob, variables) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `invoice_${id}.${variables.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        },
    });

    const handleGenerateReport = (format: 'pdf' | 'docx') => {
        setIsGenerating(true);
        generateReportMutation.mutate({ reportId: id!, format });
    };

    const handleGenerateInvoice = (format: 'pdf' | 'docx') => {
        generateInvoiceMutation.mutate({ reportId: id!, format });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
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

    const formatCurrency = (amount: number, currency: string = 'LKR') => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return <LoadingSpinner className="h-64" />;
    }

    if (error || !report) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Error loading report. Please try again.</p>
                <button
                    onClick={() => navigate('/reports')}
                    className="mt-4 text-primary-600 hover:text-primary-500"
                >
                    Back to Reports
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', name: 'Overview', icon: ClipboardDocumentListIcon },
        { id: 'applicant', name: 'Applicant', icon: UserIcon },
        { id: 'property', name: 'Property', icon: HomeIcon },
        { id: 'valuation', name: 'Valuation', icon: CurrencyDollarIcon },
        { id: 'photos', name: 'Photos', icon: PhotoIcon },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/reports')}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Back to Reports
                    </button>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate(`/reports/${id}/edit`)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => handleGenerateReport('pdf')}
                            disabled={isGenerating}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            {isGenerating ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Header */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                            <div className="mt-2 flex items-center space-x-4">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                        report.status
                                    )}`}
                                >
                                    {report.status.replace('_', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Created {new Date(report.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleGenerateReport('docx')}
                                className="text-gray-600 hover:text-gray-500 text-sm"
                            >
                                Download DOCX
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                                onClick={() => handleGenerateInvoice('pdf')}
                                className="text-gray-600 hover:text-gray-500 text-sm"
                            >
                                Generate Invoice
                            </button>
                        </div>
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
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Quick Stats */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Report Progress</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Applicant Info</span>
                                            <span className={report.applicant ? 'text-green-600' : 'text-gray-400'}>
                                                {report.applicant ? '✓' : '○'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Property Info</span>
                                            <span className={report.property_info ? 'text-green-600' : 'text-gray-400'}>
                                                {report.property_info ? '✓' : '○'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Valuation</span>
                                            <span className={report.valuation ? 'text-green-600' : 'text-gray-400'}>
                                                {report.valuation ? '✓' : '○'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Photos</span>
                                            <span className={report.photos?.length ? 'text-green-600' : 'text-gray-400'}>
                                                {report.photos?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Key Values */}
                                {report.valuation && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Key Values</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Market Value</span>
                                                <span className="font-medium">
                                                    {formatCurrency(report.valuation.market_value, report.valuation.currency)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Forced Sale</span>
                                                <span className="font-medium">
                                                    {formatCurrency(report.valuation.forced_sale_value, report.valuation.currency)}
                                                </span>
                                            </div>
                                            {report.valuation.rental_value_per_month && (
                                                <div className="flex justify-between text-sm">
                                                    <span>Monthly Rental</span>
                                                    <span className="font-medium">
                                                        {formatCurrency(report.valuation.rental_value_per_month, report.valuation.currency)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => navigate(`/reports/${id}/edit`)}
                                            className="w-full text-left text-sm text-primary-600 hover:text-primary-500"
                                        >
                                            <PencilIcon className="h-4 w-4 inline mr-2" />
                                            Edit Report
                                        </button>
                                        <button
                                            onClick={() => handleGenerateReport('pdf')}
                                            className="w-full text-left text-sm text-primary-600 hover:text-primary-500"
                                        >
                                            <DocumentArrowDownIcon className="h-4 w-4 inline mr-2" />
                                            Generate Report
                                        </button>
                                        <button
                                            onClick={() => handleGenerateInvoice('pdf')}
                                            className="w-full text-left text-sm text-primary-600 hover:text-primary-500"
                                        >
                                            <CurrencyDollarIcon className="h-4 w-4 inline mr-2" />
                                            Create Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                            <span>Report created on {new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {report.updated_at !== report.created_at && (
                                            <div className="flex items-center text-sm">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                                <span>Last updated on {new Date(report.updated_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applicant Tab */}
                    {activeTab === 'applicant' && (
                        <div>
                            {report.applicant ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.applicant.name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.applicant.email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.applicant.phone}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">NIC</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.applicant.nic}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.applicant.address}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Purpose</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.applicant.purpose}</p>
                                        </div>
                                        {report.applicant.bank_name && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Bank</label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {report.applicant.bank_name} - {report.applicant.bank_branch}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No applicant information</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Add applicant details to complete the report.
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate(`/reports/${id}/edit`)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                        >
                                            Add Applicant Info
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Property Tab */}
                    {activeTab === 'property' && (
                        <div>
                            {report.property_info ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Address</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.property_info.address}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">City</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.property_info.city}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">District</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.property_info.district}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Property Type</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.property_info.property_type}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Land Extent</label>
                                            <p className="mt-1 text-sm text-gray-900">{report.property_info.land_extent}</p>
                                        </div>
                                        {report.property_info.built_up_area && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Built-up Area</label>
                                                <p className="mt-1 text-sm text-gray-900">{report.property_info.built_up_area}</p>
                                            </div>
                                        )}
                                        {report.property_info.age_of_building && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Age of Building</label>
                                                <p className="mt-1 text-sm text-gray-900">{report.property_info.age_of_building} years</p>
                                            </div>
                                        )}
                                    </div>

                                    {report.property_info.facilities.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                                            <div className="flex flex-wrap gap-2">
                                                {report.property_info.facilities.map((facility, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                    >
                                                        {facility}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(report.property_info.latitude && report.property_info.longitude) && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                            <div className="bg-gray-100 rounded-lg p-4 flex items-center">
                                                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">
                                                    {report.property_info.latitude}, {report.property_info.longitude}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No property information</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Add property details to complete the report.
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate(`/reports/${id}/edit`)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                        >
                                            Add Property Info
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Valuation Tab */}
                    {activeTab === 'valuation' && (
                        <div>
                            {report.valuation ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-green-900">Market Value</h3>
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(report.valuation.market_value, report.valuation.currency)}
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-blue-900">Forced Sale Value</h3>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {formatCurrency(report.valuation.forced_sale_value, report.valuation.currency)}
                                            </p>
                                        </div>
                                    </div>

                                    {report.valuation.rental_value_per_month && (
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-purple-900">Monthly Rental Value</h3>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {formatCurrency(report.valuation.rental_value_per_month, report.valuation.currency)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Land Value</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {formatCurrency(report.valuation.land_value, report.valuation.currency)}
                                            </p>
                                        </div>
                                        {report.valuation.building_value && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Building Value</label>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {formatCurrency(report.valuation.building_value, report.valuation.currency)}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {report.valuation.methodology.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Valuation Methodology</label>
                                            <div className="space-y-2">
                                                {report.valuation.methodology.map((method, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                                                        <span className="text-sm text-gray-900">{method}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {report.valuation.comparable_sales.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Comparable Sales</label>
                                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                                <table className="min-w-full divide-y divide-gray-300">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Address
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Sale Price
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Sale Date
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Land Extent
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {report.valuation.comparable_sales.map((sale) => (
                                                            <tr key={sale.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {sale.address}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {formatCurrency(sale.sale_price, report.valuation?.currency)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {new Date(sale.sale_date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {sale.land_extent}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No valuation data</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Add valuation details to complete the report.
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate(`/reports/${id}/edit`)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                        >
                                            Add Valuation
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Photos Tab */}
                    {activeTab === 'photos' && (
                        <div>
                            {report.photos && report.photos.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {report.photos.map((photo) => (
                                        <div key={photo.id} className="bg-white rounded-lg shadow overflow-hidden">
                                            <div className="aspect-w-3 aspect-h-2">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.caption}
                                                    className="w-full h-48 object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <p className="text-sm font-medium text-gray-900">{photo.caption}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {photo.category} • {new Date(photo.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No photos uploaded</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Add photos to enhance your valuation report.
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => navigate(`/reports/${id}/edit`)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                        >
                                            Upload Photos
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailsPage;
