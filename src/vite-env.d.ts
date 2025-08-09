/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_GOOGLE_MAPS_API_KEY: string
    readonly VITE_PADDLE_VENDOR_ID: string
    readonly VITE_PADDLE_ENVIRONMENT: 'sandbox' | 'production'
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
