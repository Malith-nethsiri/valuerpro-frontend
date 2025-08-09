import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import paddleService from '../services/paddle';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    CheckIcon,
    CreditCardIcon,
    StarIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

// Helper function to map plan types to Paddle price IDs
const getPaddlePriceId = (planType: string): string | null => {
    const priceMapping: Record<string, string> = {
        basic: 'pri_basic_plan_id',     // Replace with actual Paddle price IDs
        professional: 'pri_pro_plan_id',
        enterprise: 'pri_enterprise_plan_id',
    };
    return priceMapping[planType] || null;
};

const SubscriptionPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize Paddle on component mount
    useEffect(() => {
        paddleService.initialize();
    }, []);

    const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
        queryKey: ['subscriptions'],
        queryFn: () => paymentsAPI.getSubscriptions(),
    });

    const { data: plans, isLoading: plansLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: () => paymentsAPI.getPlans(),
    });

    const createSubscriptionMutation = useMutation({
        mutationFn: (planType: string) => paymentsAPI.createSubscription(planType),
        onSuccess: (paymentIntent) => {
            // Try Paddle integration first, fallback to direct URL
            const priceId = getPaddlePriceId(selectedPlan);
            if (priceId) {
                paddleService.openCheckout({
                    priceId,
                    email: user?.email,
                    customData: { planType: selectedPlan },
                    onSuccess: (data) => {
                        console.log('Payment successful:', data);
                        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
                        setIsProcessing(false);
                    },
                    onClose: () => {
                        setIsProcessing(false);
                    },
                }).catch(() => {
                    // Fallback to direct URL
                    window.location.href = paymentIntent.checkout_url;
                });
            } else {
                // Fallback to direct URL
                window.location.href = paymentIntent.checkout_url;
            }
        },
        onError: (error) => {
            console.error('Error creating subscription:', error);
            setIsProcessing(false);
        },
    });

    const cancelSubscriptionMutation = useMutation({
        mutationFn: (subscriptionId: string) => paymentsAPI.cancelSubscription(subscriptionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        },
    });

    const handleSubscribe = (planType: string) => {
        setSelectedPlan(planType);
        setIsProcessing(true);
        createSubscriptionMutation.mutate(planType);
    };

    const handleCancelSubscription = (subscriptionId: string) => {
        if (confirm('Are you sure you want to cancel this subscription?')) {
            cancelSubscriptionMutation.mutate(subscriptionId);
        }
    };

    const activeSubscription = subscriptions?.find(sub => sub.status === 'active');

    // Default plans if API doesn't return them
    const defaultPlans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 2500,
            currency: 'LKR',
            reports_limit: 10,
            features: [
                '10 reports per month',
                'Basic report templates',
                'PDF generation',
                'Email support',
                'Cloud storage',
            ],
            recommended: false,
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 5000,
            currency: 'LKR',
            reports_limit: 50,
            features: [
                '50 reports per month',
                'Advanced report templates',
                'PDF & DOCX generation',
                'AI-powered OCR',
                'Priority email support',
                'Cloud storage',
                'Digital signature',
                'Custom branding',
            ],
            recommended: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 10000,
            currency: 'LKR',
            reports_limit: 200,
            features: [
                'Unlimited reports',
                'All report templates',
                'PDF & DOCX generation',
                'AI-powered OCR & analysis',
                'Phone & email support',
                'Cloud storage',
                'Digital signature',
                'Custom branding',
                'API access',
                'Team collaboration',
                'Analytics dashboard',
            ],
            recommended: false,
        },
    ];

    const plansList = plans || defaultPlans;

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
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (subscriptionsLoading || plansLoading) {
        return <LoadingSpinner className="h-64" />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
                <p className="mt-4 text-lg text-gray-600">
                    Choose the perfect plan for your valuation business
                </p>
            </div>

            {/* Current Subscription */}
            {activeSubscription && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Current Subscription</h2>
                    </div>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <CreditCardIcon className="h-8 w-8 text-green-600 mr-4" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {activeSubscription.plan_type.charAt(0).toUpperCase() + activeSubscription.plan_type.slice(1)} Plan
                                    </h3>
                                    <div className="flex items-center space-x-4 mt-1">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                activeSubscription.status
                                            )}`}
                                        >
                                            {activeSubscription.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {formatCurrency(activeSubscription.price, activeSubscription.currency)}/month
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">
                                    {activeSubscription.reports_used}/{activeSubscription.reports_limit} reports used
                                </div>
                                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(
                                                (activeSubscription.reports_used / activeSubscription.reports_limit) * 100,
                                                100
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Renews on {new Date(activeSubscription.end_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => handleCancelSubscription(activeSubscription.id)}
                                disabled={cancelSubscriptionMutation.isPending}
                                className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
                            >
                                {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {plansList.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-white rounded-lg shadow-lg overflow-hidden relative ${plan.recommended ? 'ring-2 ring-primary-500' : ''
                            }`}
                    >
                        {plan.recommended && (
                            <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                                <StarIcon className="h-4 w-4 inline mr-1" />
                                Recommended
                            </div>
                        )}

                        <div className="px-6 py-8">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {formatCurrency(plan.price, plan.currency)}
                                    </span>
                                    <span className="text-lg text-gray-500">/month</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    Up to {plan.reports_limit === 200 ? 'unlimited' : plan.reports_limit} reports per month
                                </p>
                            </div>

                            <ul className="mt-8 space-y-4">
                                {plan.features.map((feature: string, index: number) => (
                                    <li key={index} className="flex items-start">
                                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                {activeSubscription?.plan_type === plan.id ? (
                                    <div className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-50">
                                        <CheckIcon className="h-4 w-4 mr-2" />
                                        Current Plan
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={isProcessing && selectedPlan === plan.id}
                                        className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${plan.recommended
                                                ? 'bg-primary-600 hover:bg-primary-700'
                                                : 'bg-gray-600 hover:bg-gray-700'
                                            }`}
                                    >
                                        {isProcessing && selectedPlan === plan.id ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
                                                Processing...
                                            </>
                                        ) : (
                                            'Subscribe Now'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h2>
                </div>
                <div className="px-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-base font-medium text-gray-900">Can I change my plan anytime?</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-900">What happens if I exceed my report limit?</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                You'll need to upgrade your plan or wait for the next billing cycle. We'll notify you when you're approaching your limit.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-900">Is there a free trial?</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Yes, all new accounts get a 14-day free trial with access to Basic plan features. No credit card required.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-900">What payment methods do you accept?</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                We accept all major credit cards, debit cards, and local payment methods through our secure payment processor Paddle.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-900">Can I cancel anytime?</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Yes, you can cancel your subscription at any time. You'll retain access to your plan features until the end of your billing period.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-primary-600" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Need a custom plan?</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Contact our sales team for enterprise solutions and custom pricing.
                </p>
                <div className="mt-4">
                    <a
                        href="mailto:sales@valuerpro.lk"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Contact Sales
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
