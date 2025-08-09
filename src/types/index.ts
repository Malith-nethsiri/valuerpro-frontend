export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'valuer' | 'client';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    profile?: ValuerProfile;
    subscription?: Subscription;
}

export interface ValuerProfile {
    id: string;
    user_id: string;
    titles?: string[];
    full_name: string;
    qualifications?: string[];
    panel_memberships?: string[];
    address_lines?: string[];
    phones?: string[];
    email?: string;
    created_at: string;
    updated_at?: string;
}

export interface Subscription {
    plan: 'TRIAL' | 'PRO';
    status: 'active' | 'inactive';
    monthly_quota: number;
    reports_used: number;
    reports_remaining: number;
    current_period_start?: string;
    current_period_end?: string;
    paddle_subscription_id?: string;
}

// New Report schemas matching backend
export interface ReportSummary {
    id: number;
    report_reference: string;
    subject_text?: string;
    requesting_bank_name?: string;
    status: string;
    market_value?: number;
    inspection_date?: string;
    created_at: string;
    updated_at?: string;
    completion_percentage: number;
    landmarks_text?: string;
}

export interface ReportDetail {
    id: number;
    report_reference: string;
    requesting_bank_name?: string;
    requesting_branch?: string;
    bank_reference_letter?: string;
    purpose?: string;
    inspection_date?: string;
    inspection_time?: string;
    weather_conditions?: string;
    subject_text?: string;
    latitude?: number;
    longitude?: number;
    access_route_description?: string;
    nearest_main_road?: string;
    distance_to_main_road?: string;
    valuation_summary?: string;
    recommendations?: string;
    certificate_of_identity?: string;
    special_conditions?: string;
    valuation_fee?: number;
    travel_cost?: number;
    landmarks_text?: string;
    market_value?: number;
    status: string;
    created_at: string;
    updated_at?: string;
    completion_percentage: number;
    user_id: number;
}

// Legacy Report interface for backward compatibility
export interface Report extends ReportDetail {
    title?: string;
    report_type?: 'residential' | 'commercial' | 'land' | 'industrial';
    valuer_id?: string;
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
    requesting_bank_name?: string;
    requesting_branch?: string;
    bank_reference_letter?: string;
    purpose?: string;
}

export interface UpdateProfileRequest {
    full_name?: string;
    phone?: string;
    address?: string;
    qualification?: string;
    experience_years?: number;
    specialized_areas?: string[];
}
