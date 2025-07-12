// API configuration and service functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types for API responses
export interface Product {
    id?: string;
    name: string;
    price: number;
    originalPrice?: number;
    rating?: number;
    reviews?: number;
    image: string;
    discount?: number;
    url?: string;
    description?: string;
    source?: string;
}

export interface SearchResponse {
    products: Product[];
    query: string;
    total_results?: number;
    status: 'success' | 'error';
    message?: string;
    search_time?: number;
}

export interface SearchRequest {
    query: string;
    limit?: number;
    max_price?: number;
    min_rating?: number;
    filters?: {
        min_price?: number;
        max_price?: number;
        min_rating?: number;
    };
}

// API service class
class ApiService {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async searchProducts(searchRequest: SearchRequest): Promise<SearchResponse> {
        try {
            console.log('Sending search request:', searchRequest);

            const response = await fetch(`${this.baseUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(searchRequest),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Received response:', data);

            // Transform the response to match our frontend format
            return {
                products: (data.products || []).map((product: any, index: number) => ({
                    id: product.id || `product-${index}`,
                    name: product.name || product.title || 'Unknown Product',
                    price: this.parsePrice(product.price),
                    originalPrice: product.original_price ? this.parsePrice(product.original_price) : undefined,
                    rating: product.rating ? parseFloat(product.rating.toString()) : 4.0,
                    reviews: product.reviews ? parseInt(product.reviews.toString().replace(/[^0-9]/g, '')) : 0,
                    image: product.image || product.img_url || 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400',
                    discount: product.discount || 0,
                    url: product.url,
                    description: product.description,
                    source: product.source || 'walmart',
                })),
                query: data.query || searchRequest.query,
                total_results: data.total_results || (data.products || []).length,
                search_time: data.search_time,
                status: 'success',
            };
        } catch (error) {
            console.error('API Error:', error);
            return {
                products: [],
                query: searchRequest.query,
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to connect to search service',
            };
        }
    }

    // Helper method to parse price strings
    private parsePrice(priceStr: any): number {
        if (!priceStr) return 0;
        const cleanPrice = priceStr.toString().replace(/[^0-9.]/g, '');
        return parseFloat(cleanPrice) || 0;
    }

    // Health check endpoint
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });
            return response.ok;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export const apiService = new ApiService();

// Utility functions
export const isApiAvailable = async (): Promise<boolean> => {
    return await apiService.healthCheck();
};