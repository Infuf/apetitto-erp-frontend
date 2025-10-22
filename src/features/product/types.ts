export interface Product {
    id: number;
    productCode: string;
    name: string;
    description?: string | null;
    unit: string;
    barcode?: string | null;
    categoryId: number;
    categoryName: string;
    sellingPrice?: number | null;
}

export interface ProductFormData {
    productCode: string;
    name: string;
    description?: string | null;
    unit: string;
    barcode?: string | null;
    categoryId: number | null;
    sellingPrice?: number | null;
}

export interface ProductPageResponse {
    content: Product[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
export interface CategoryOption {
    id: number;
    name: string;
}
