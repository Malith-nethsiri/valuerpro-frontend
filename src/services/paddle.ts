import { initializePaddle, Paddle } from '@paddle/paddle-js';

class PaddleService {
    private paddle: Paddle | null = null;
    private isInitialized = false;

    async initialize(): Promise<void> {
        if (this.isInitialized || this.paddle) {
            return;
        }

        const vendorId = import.meta.env.VITE_PADDLE_VENDOR_ID;
        const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT as 'sandbox' | 'production';

        if (!vendorId) {
            console.warn('Paddle vendor ID not found. Please add VITE_PADDLE_VENDOR_ID to your .env file');
            return;
        }

        try {
            const paddleInstance = await initializePaddle({
                token: vendorId, // Use token instead of vendorId for newer API
                environment: environment || 'sandbox',
            });

            if (paddleInstance) {
                this.paddle = paddleInstance;
                this.isInitialized = true;
                console.log('Paddle initialized successfully');
            }
        } catch (error) {
            console.error('Failed to initialize Paddle:', error);
        }
    }

    async openCheckout(options: {
        priceId: string;
        email?: string;
        customData?: any;
        onSuccess?: (data: any) => void;
        onClose?: () => void;
    }): Promise<void> {
        if (!this.paddle) {
            await this.initialize();
        }

        if (!this.paddle) {
            throw new Error('Paddle not initialized');
        }

        try {
            this.paddle.Checkout.open({
                items: [{ priceId: options.priceId, quantity: 1 }],
                customer: options.email ? { email: options.email } : undefined,
                customData: options.customData,
                settings: {
                    displayMode: 'overlay',
                    theme: 'light',
                },
            });
        } catch (error) {
            console.error('Failed to open Paddle checkout:', error);
            throw error;
        }
    }

    async updateUser(options: {
        email: string;
        country?: string;
        postcode?: string;
    }): Promise<void> {
        // Note: User updates are typically handled server-side with Paddle
        console.log('User update requested:', options);
    }

    getPaddle(): Paddle | null {
        return this.paddle;
    }
}

export const paddleService = new PaddleService();
export default paddleService;
