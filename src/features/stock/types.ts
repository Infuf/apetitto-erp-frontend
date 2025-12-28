export interface WarehouseOption {
    id: number;
    name: string;
}

export interface CategoryOption {
    id: number;
    name: string;
}

export interface StockItem {
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    unit: string;
    averageCost: number;
}

export interface StockPageResponse {
    content: StockItem[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface DashboardStockItemDto {
    warehouseId: number;
    warehouseName: string;
    productName: string;
    quantity: number;
    calculatedValue: number;
    valuationType: 'COST' | 'PRICE';
}

export interface IncomingStockReportDto {
    warehouseName: string;
    productName: string;
    totalQuantity: number;
    pricePerUnit: number;
    totalAmount: number;
}