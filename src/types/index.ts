export interface User {
    id: string;
    email: string;
    role: 'admin' | 'valuer' | 'client';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    profile?: ValuerProfile;
}

export interface ValuerProfile {
    id: string;
    user_id: string;
    full_name: string;
    license_number: string;
    phone: string;
    address: string;
    qualification: string;
    experience_years: number;
    specialized_areas: string[];
    signature_url?: string;
}

export interface Report {
    id: string;
    title: string;
    report_type: 'residential' | 'commercial' | 'land' | 'industrial';
    status: 'draft' | 'in_progress' | 'completed' | 'sent';
    created_at: string;
    updated_at: string;
    valuer_id: string;
    applicant?: Applicant;
    property_info?: PropertyInfo;
    valuation?: Valuation;
    legal_aspects?: LegalAspect[];
    photos?: Photo[];
}

export interface Applicant {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    nic: string;
    bank_name?: string;
    bank_branch?: string;
    purpose: string;
}

export interface PropertyInfo {
    id: string;
    address: string;
    city: string;
    district: string;
    province: string;
    property_type: string;
    land_extent: string;
    built_up_area?: string;
    age_of_building?: number;
    no_of_rooms?: number;
    no_of_bathrooms?: number;
    facilities: string[];
    access_road: string;
    utilities: string[];
    neighborhood_info: string;
    latitude?: number;
    longitude?: number;
}

export interface Valuation {
    id: string;
    market_value: number;
    forced_sale_value: number;
    rental_value_per_month?: number;
    methodology: string[];
    comparable_sales: ComparableSale[];
    depreciation_rate?: number;
    land_value: number;
    building_value?: number;
    total_value: number;
    currency: string;
}

export interface ComparableSale {
    id: string;
    address: string;
    sale_price: number;
    sale_date: string;
    land_extent: string;
    built_up_area?: string;
    adjustments: string;
}

export interface LegalAspect {
    id: string;
    title_deed_no: string;
    deed_date: string;
    registered_owner: string;
    encumbrances: string;
    survey_plan_no?: string;
    local_authority: string;
    zoning: string;
    approval_status: string;
    restrictions: string[];
}

export interface Photo {
    id: string;
    url: string;
    caption: string;
    category: 'exterior' | 'interior' | 'documents' | 'vicinity' | 'other';
    uploaded_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    plan_type: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    start_date: string;
    end_date: string;
    reports_limit: number;
    reports_used: number;
    price: number;
    currency: string;
}

export interface PaymentIntent {
    checkout_url: string;
    transaction_id: string;
}

export interface APIResponse<T> {
    data: T;
    message?: string;
    status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    pages: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    confirm_password: string;
    full_name: string;
    license_number: string;
    phone: string;
}

export interface CreateReportRequest {
    title: string;
    report_type: 'residential' | 'commercial' | 'land' | 'industrial';
    property_address?: string;
    property_latitude?: number;
    property_longitude?: number;
}

export interface UpdateProfileRequest {
    full_name?: string;
    phone?: string;
    address?: string;
    qualification?: string;
    experience_years?: number;
    specialized_areas?: string[];
}
