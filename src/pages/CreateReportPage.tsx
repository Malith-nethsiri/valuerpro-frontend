import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { reportsAPI, aiAPI } from '../services/api';
import { CreateReportRequest } from '../types';
import GoogleMap from '../components/GoogleMap';
import FileUpload from '../components/FileUpload';
import {
    DocumentTextIcon,
    HomeIcon,
    BuildingOfficeIcon,
    MapIcon,
    CogIcon,
} from '@heroicons/react/24/outline';

interface CreateReportForm {
    title: string;
    report_type: 'residential' | 'commercial' | 'land' | 'industrial';
    property_address?: string;
    property_latitude?: number;
    property_longitude?: number;
}

const CreateReportPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
        address: string;
    } | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [extractedData, setExtractedData] = useState<any>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateReportForm>();

    const selectedType = watch('report_type');

    const createReportMutation = useMutation({
        mutationFn: (data: CreateReportRequest) => reportsAPI.createReport(data),
        onSuccess: (newReport) => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            navigate(`/reports/${newReport.id}`);
        },
        onError: (error) => {
            console.error('Error creating report:', error);
            setIsSubmitting(false);
        },
    });

    const onSubmit = async (data: CreateReportForm) => {
        setIsSubmitting(true);

        const reportData: CreateReportRequest = {
            ...data,
            property_address: selectedLocation?.address,
            property_latitude: selectedLocation?.lat,
            property_longitude: selectedLocation?.lng,
        };

        createReportMutation.mutate(reportData);
    };

    const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
        setSelectedLocation(location);
        setValue('property_address', location.address);
        setValue('property_latitude', location.lat);
        setValue('property_longitude', location.lng);
    };

    const handleFilesUploaded = (files: any[]) => {
        setUploadedFiles(files);
    };

    const handleExtractedData = (data: any) => {
        setExtractedData(data);
        // Auto-populate form fields from extracted data if available
        if (data.property_address && !selectedLocation) {
            setValue('title', data.property_address);
        }
    };

    const reportTypes = [
        {
            value: 'residential',
            label: 'Residential Property',
            description: 'Houses, apartments, condos, and other residential properties',
            icon: HomeIcon,
            color: 'bg-blue-50 border-blue-200 text-blue-700',
        },
        {
            value: 'commercial',
            label: 'Commercial Property',
            description: 'Office buildings, retail spaces, warehouses, and business properties',
            icon: BuildingOfficeIcon,
            color: 'bg-green-50 border-green-200 text-green-700',
        },
        {
            value: 'land',
            label: 'Land/Plot',
            description: 'Vacant land, development plots, and agricultural land',
            icon: MapIcon,
            color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        },
        {
            value: 'industrial',
            label: 'Industrial Property',
            description: 'Factories, manufacturing facilities, and industrial complexes',
            icon: CogIcon,
            color: 'bg-purple-50 border-purple-200 text-purple-700',
        },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h1 className="mt-2 text-3xl font-bold text-gray-900">Create New Report</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Start a new property valuation report by providing basic information
                </p>
            </div>

            {/* Form */}
            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
                    {/* Report Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Report Title <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="title"
                                placeholder="e.g., Valuation of Property at 123 Main Street, Colombo"
                                {...register('title', {
                                    required: 'Report title is required',
                                    minLength: {
                                        value: 10,
                                        message: 'Title must be at least 10 characters long',
                                    },
                                })}
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.title ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Choose a descriptive title that includes the property address or key identifying information
                        </p>
                    </div>

                    {/* Property Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Property Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {reportTypes.map((type) => (
                                <div key={type.value}>
                                    <input
                                        type="radio"
                                        id={type.value}
                                        value={type.value}
                                        {...register('report_type', {
                                            required: 'Property type is required',
                                        })}
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor={type.value}
                                        className={`relative block w-full border-2 rounded-lg p-4 cursor-pointer hover:bg-gray-50 focus:outline-none ${selectedType === type.value
                                                ? type.color
                                                : 'border-gray-200 bg-white text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <type.icon className="h-6 w-6 mr-3" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{type.label}</div>
                                                <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                                            </div>
                                            {selectedType === type.value && (
                                                <div className="text-primary-600">
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        {errors.report_type && (
                            <p className="mt-2 text-sm text-red-600">{errors.report_type.message}</p>
                        )}
                    </div>

                    {/* Property Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Property Location (Optional)
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                            Click on the map to select the property location, or the map will show a general view of Sri Lanka.
                        </p>
                        <GoogleMap
                            onLocationSelect={handleLocationSelect}
                            marker={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : undefined}
                            className="mb-3"
                        />
                        {selectedLocation && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <p className="text-sm text-green-800">
                                    <strong>Selected Location:</strong> {selectedLocation.address}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Document Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Upload Documents (Optional)
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                            Upload property documents, title deeds, or any relevant files. AI will help extract information automatically.
                        </p>
                        <FileUpload
                            onFilesUploaded={handleFilesUploaded}
                            onExtractedData={handleExtractedData}
                            enableOCR={true}
                            enableAISuggestions={true}
                            maxFiles={5}
                        />
                        {extractedData && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
                                <p className="text-sm text-blue-800 font-medium">
                                    AI extracted information from uploaded documents:
                                </p>
                                <div className="text-xs text-blue-600 mt-1 space-y-1">
                                    {extractedData.property_address && (
                                        <p>• Property Address: {extractedData.property_address}</p>
                                    )}
                                    {extractedData.owner_name && (
                                        <p>• Owner: {extractedData.owner_name}</p>
                                    )}
                                    {extractedData.land_size && (
                                        <p>• Land Size: {extractedData.land_size}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-blue-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        After creating the report, you'll be able to:
                                    </p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Add applicant and property information</li>
                                        <li>Upload photos and documents</li>
                                        <li>Use AI-powered OCR to extract data from documents</li>
                                        <li>Get AI suggestions for property descriptions and valuations</li>
                                        <li>Generate professional PDF and DOCX reports</li>
                                        <li>Create invoices for your services</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/reports')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Creating Report...
                                </>
                            ) : (
                                'Create Report'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Additional Help */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600">
                    This form creates the initial report structure. You'll be able to add detailed information,
                    photos, and generate the final valuation report in the next steps. If you need assistance,
                    check our documentation or contact support.
                </p>
            </div>
        </div>
    );
};

export default CreateReportPage;
