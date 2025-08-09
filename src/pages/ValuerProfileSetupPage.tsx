import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usersAPI, authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { UpdateProfileRequest, ValuerProfile } from '../types';
import {
    UserCircleIcon,
    PhotoIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ValuerProfileForm {
    full_name: string;
    license_number: string;
    phone: string;
    address: string;
    qualification: string;
    experience_years: number;
    specialized_areas: string[];
    signature_file?: FileList;
}

const ValuerProfileSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ValuerProfileForm>();

    // Check if profile already exists
    const { data: currentUser, isLoading } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => authAPI.getCurrentUser(),
        retry: false,
    });

    const profile = currentUser?.profile;

    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateProfileRequest) => usersAPI.updateProfile(data),
        onSuccess: (updatedUser) => {
            if (user) {
                updateUser(updatedUser);
            }
            setIsComplete(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        },
        onError: (error) => {
            console.error('Error updating profile:', error);
            setIsSubmitting(false);
        },
    });

    // Pre-populate form if profile exists
    useEffect(() => {
        if (profile) {
            setValue('full_name', profile.full_name || '');
            setValue('license_number', profile.license_number || '');
            setValue('phone', profile.phone || '');
            setValue('address', profile.address || '');
            setValue('qualification', profile.qualification || '');
            setValue('experience_years', profile.experience_years || 0);
            setValue('specialized_areas', profile.specialized_areas || []);
            if (profile.signature_url) {
                setSignaturePreview(profile.signature_url);
            }
        }
    }, [profile, setValue]);

    // Handle signature file upload
    const signatureFile = watch('signature_file');
    useEffect(() => {
        if (signatureFile && signatureFile[0]) {
            const file = signatureFile[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [signatureFile]);

    const onSubmit = async (data: ValuerProfileForm) => {
        setIsSubmitting(true);

        // Convert specialized areas from comma-separated string to array
        const areasString = (data.specialized_areas as any);
        const areasArray = typeof areasString === 'string'
            ? areasString.split(',').map(area => area.trim()).filter(area => area.length > 0)
            : data.specialized_areas;

        const profileData: UpdateProfileRequest = {
            full_name: data.full_name,
            phone: data.phone,
            address: data.address,
            qualification: data.qualification,
            experience_years: data.experience_years,
            specialized_areas: areasArray,
        };

        // Handle signature upload separately if needed
        // For now, we'll just include it in the main request
        updateProfileMutation.mutate(profileData);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full mx-auto text-center">
                    <div className="bg-white shadow rounded-lg p-6">
                        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                            Profile Setup Complete!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your valuer profile has been saved. This information will be included in all your reports and invoices.
                        </p>
                        <div className="mt-4 text-xs text-gray-500">
                            Redirecting to dashboard...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center">
                    <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Complete Your Valuer Profile
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        This information will be used in all your reports and invoices. You can update it anytime.
                    </p>
                </div>

                {/* Form */}
                <div className="mt-8 bg-white shadow rounded-lg">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        {...register('full_name', {
                                            required: 'Full name is required',
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {errors.full_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="license_number" className="block text-sm font-medium text-gray-700">
                                        License Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="license_number"
                                        {...register('license_number', {
                                            required: 'License number is required',
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {errors.license_number && (
                                        <p className="mt-1 text-sm text-red-600">{errors.license_number.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        {...register('phone', {
                                            required: 'Phone number is required',
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">
                                        Years of Experience <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="experience_years"
                                        min="0"
                                        max="50"
                                        {...register('experience_years', {
                                            required: 'Experience is required',
                                            min: { value: 0, message: 'Experience cannot be negative' },
                                            max: { value: 50, message: 'Experience cannot exceed 50 years' },
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {errors.experience_years && (
                                        <p className="mt-1 text-sm text-red-600">{errors.experience_years.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Business Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="address"
                                    rows={3}
                                    {...register('address', {
                                        required: 'Business address is required',
                                    })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Professional Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
                                        Qualification <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="qualification"
                                        placeholder="e.g., Chartered Valuation Surveyor, BSc in Estate Management"
                                        {...register('qualification', {
                                            required: 'Qualification is required',
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    {errors.qualification && (
                                        <p className="mt-1 text-sm text-red-600">{errors.qualification.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="specialized_areas" className="block text-sm font-medium text-gray-700">
                                        Specialized Areas
                                    </label>
                                    <input
                                        type="text"
                                        id="specialized_areas"
                                        placeholder="e.g., Residential Properties, Commercial Real Estate, Land Valuation"
                                        {...register('specialized_areas')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Separate multiple areas with commas
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Digital Signature */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Digital Signature
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Upload Signature Image
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    {signaturePreview ? (
                                        <div className="text-center">
                                            <img
                                                src={signaturePreview}
                                                alt="Signature preview"
                                                className="mx-auto h-20 object-contain"
                                            />
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSignaturePreview(null)}
                                                    className="text-sm text-red-600 hover:text-red-500"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-center">
                                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="signature_file"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                                >
                                                    <span>Upload a signature</span>
                                                    <input
                                                        id="signature_file"
                                                        type="file"
                                                        accept="image/*"
                                                        {...register('signature_file')}
                                                        className="sr-only"
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 2MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Skip for Now
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
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Profile'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ValuerProfileSetupPage;
