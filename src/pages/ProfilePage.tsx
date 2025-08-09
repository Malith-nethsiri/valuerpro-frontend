import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { UpdateProfileRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    UserCircleIcon,
    PencilIcon,
    PhotoIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

interface ProfileForm extends UpdateProfileRequest {
    specialized_areas_text: string;
}

const ProfilePage: React.FC = () => {
    const { user, refetchUser } = useAuth();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingSignature, setUploadingSignature] = useState(false);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => usersAPI.getProfile(),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ProfileForm>({
        defaultValues: {
            full_name: profile?.profile?.full_name || '',
            phone: profile?.profile?.phone || '',
            address: profile?.profile?.address || '',
            qualification: profile?.profile?.qualification || '',
            experience_years: profile?.profile?.experience_years || 0,
            specialized_areas_text: profile?.profile?.specialized_areas?.join(', ') || '',
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateProfileRequest) => usersAPI.updateProfile(data),
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(['profile'], updatedUser);
            refetchUser();
            setIsEditing(false);
        },
    });

    const uploadSignatureMutation = useMutation({
        mutationFn: (file: File) => usersAPI.uploadSignature(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            refetchUser();
            setUploadingSignature(false);
        },
        onError: () => {
            setUploadingSignature(false);
        },
    });

    const onSubmit = (data: ProfileForm) => {
        const specialized_areas = data.specialized_areas_text
            ? data.specialized_areas_text.split(',').map(area => area.trim()).filter(Boolean)
            : [];

        const updateData: UpdateProfileRequest = {
            full_name: data.full_name,
            phone: data.phone,
            address: data.address,
            qualification: data.qualification,
            experience_years: data.experience_years,
            specialized_areas,
        };

        updateProfileMutation.mutate(updateData);
    };

    const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            setUploadingSignature(true);
            uploadSignatureMutation.mutate(file);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            reset(); // Reset form to original values
        } else {
            // Set current values when starting to edit
            reset({
                full_name: profile?.profile?.full_name || '',
                phone: profile?.profile?.phone || '',
                address: profile?.profile?.address || '',
                qualification: profile?.profile?.qualification || '',
                experience_years: profile?.profile?.experience_years || 0,
                specialized_areas_text: profile?.profile?.specialized_areas?.join(', ') || '',
            });
        }
        setIsEditing(!isEditing);
    };

    if (isLoading) {
        return <LoadingSpinner className="h-64" />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <UserCircleIcon className="h-12 w-12 text-gray-400 mr-4" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                                <p className="text-sm text-gray-600">
                                    Manage your professional information and preferences
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleEditToggle}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${isEditing
                                    ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                    : 'text-white bg-primary-600 hover:bg-primary-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                        >
                            {isEditing ? (
                                <>
                                    <XMarkIcon className="h-4 w-4 mr-2" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Profile Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        disabled={!isEditing}
                                        {...register('full_name', {
                                            required: 'Full name is required',
                                            minLength: {
                                                value: 2,
                                                message: 'Name must be at least 2 characters',
                                            },
                                        })}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${!isEditing
                                                ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                                                : errors.full_name
                                                    ? 'border-red-300'
                                                    : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.full_name && (
                                        <p className="mt-2 text-sm text-red-600">{errors.full_name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        disabled={!isEditing}
                                        {...register('phone')}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${!isEditing
                                                ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                                                : 'border-gray-300'
                                            }`}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        rows={3}
                                        disabled={!isEditing}
                                        {...register('address')}
                                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${!isEditing
                                                ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                                                : 'border-gray-300'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Professional Details */}
                            <div className="pt-6 border-t border-gray-200">
                                <h4 className="text-md font-medium text-gray-900 mb-4">Professional Details</h4>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">
                                            Qualification
                                        </label>
                                        <input
                                            type="text"
                                            id="qualification"
                                            disabled={!isEditing}
                                            placeholder="e.g., BSc (Hons) Quantity Surveying"
                                            {...register('qualification')}
                                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${!isEditing
                                                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                                                    : 'border-gray-300'
                                                }`}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700">
                                            Years of Experience
                                        </label>
                                        <input
                                            type="number"
                                            id="experience_years"
                                            min="0"
                                            max="50"
                                            disabled={!isEditing}
                                            {...register('experience_years', {
                                                valueAsNumber: true,
                                                min: {
                                                    value: 0,
                                                    message: 'Experience cannot be negative',
                                                },
                                            })}
                                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${!isEditing
                                                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                                                    : errors.experience_years
                                                        ? 'border-red-300'
                                                        : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.experience_years && (
                                            <p className="mt-2 text-sm text-red-600">{errors.experience_years.message}</p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="specialized_areas_text" className="block text-sm font-medium text-gray-700">
                                            Specialized Areas
                                        </label>
                                        <input
                                            type="text"
                                            id="specialized_areas_text"
                                            disabled={!isEditing}
                                            placeholder="e.g., Residential Properties, Commercial Buildings, Land Valuation"
                                            {...register('specialized_areas_text')}
                                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${!isEditing
                                                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                                                    : 'border-gray-300'
                                                }`}
                                        />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Separate multiple areas with commas
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            {isEditing && (
                                <div className="pt-6 border-t border-gray-200">
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleEditToggle}
                                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!isDirty || updateProfileMutation.isPending}
                                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {updateProfileMutation.isPending ? (
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
                                                <>
                                                    <CheckIcon className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Account Information */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">License Number</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {profile?.profile?.license_number || 'Not provided'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(user?.created_at || '').toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Digital Signature */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Digital Signature</h3>
                        </div>
                        <div className="px-6 py-4">
                            {profile?.profile?.signature_url ? (
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <img
                                            src={profile.profile.signature_url}
                                            alt="Digital Signature"
                                            className="max-w-full h-20 object-contain mx-auto"
                                        />
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingSignature}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                    >
                                        <PhotoIcon className="h-4 w-4 mr-2" />
                                        {uploadingSignature ? 'Uploading...' : 'Update Signature'}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No signature uploaded</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Upload your digital signature to include in reports
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingSignature}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                        >
                                            <PhotoIcon className="h-4 w-4 mr-2" />
                                            {uploadingSignature ? 'Uploading...' : 'Upload Signature'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleSignatureUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                PNG, JPG, GIF up to 5MB. Transparent backgrounds work best.
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Profile Completion</h3>
                        </div>
                        <div className="px-6 py-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Basic Information</span>
                                    <span className={profile?.profile?.full_name ? 'text-green-600' : 'text-gray-400'}>
                                        {profile?.profile?.full_name ? '✓' : '○'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Professional Details</span>
                                    <span className={profile?.profile?.qualification ? 'text-green-600' : 'text-gray-400'}>
                                        {profile?.profile?.qualification ? '✓' : '○'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Digital Signature</span>
                                    <span className={profile?.profile?.signature_url ? 'text-green-600' : 'text-gray-400'}>
                                        {profile?.profile?.signature_url ? '✓' : '○'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
