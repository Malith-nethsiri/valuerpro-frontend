import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const RegisterPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<RegisterData>();

    const password = watch('password');

    const onSubmit = async (data: RegisterData) => {
        setLoading(true);
        setError('');

        try {
            await registerUser(data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(
                err?.response?.data?.detail ||
                'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your ValuerPro account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join the professional valuation platform
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="full_name" className="form-label">
                                Full Name
                            </label>
                            <input
                                {...register('full_name', {
                                    required: 'Full name is required',
                                    minLength: {
                                        value: 2,
                                        message: 'Full name must be at least 2 characters',
                                    },
                                })}
                                type="text"
                                className="form-input"
                                placeholder="Enter your full name"
                            />
                            {errors.full_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="license_number" className="form-label">
                                License Number
                            </label>
                            <input
                                {...register('license_number', {
                                    required: 'License number is required',
                                })}
                                type="text"
                                className="form-input"
                                placeholder="Your professional license number"
                            />
                            {errors.license_number && (
                                <p className="mt-1 text-sm text-red-600">{errors.license_number.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone" className="form-label">
                                Phone Number
                            </label>
                            <input
                                {...register('phone', {
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^[0-9+\-\s()]+$/,
                                        message: 'Invalid phone number',
                                    },
                                })}
                                type="tel"
                                className="form-input"
                                placeholder="+94 71 234 5678"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: 'Password must contain uppercase, lowercase, and number',
                                    },
                                })}
                                type="password"
                                className="form-input"
                                placeholder="Create a strong password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirm_password" className="form-label">
                                Confirm Password
                            </label>
                            <input
                                {...register('confirm_password', {
                                    required: 'Please confirm your password',
                                    validate: (value) =>
                                        value === password || 'Passwords do not match',
                                })}
                                type="password"
                                className="form-input"
                                placeholder="Confirm your password"
                            />
                            {errors.confirm_password && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-primary-600 hover:text-primary-500"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
