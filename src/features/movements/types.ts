export type MovementType = 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';

export interface MovementItem {
    productId: number;
    quantity: number;
    costPrice?: number;
    productName?: string;
    productCode?: string;
}

export interface StockMovementRequestDto {
    warehouseId: number;
    movementType: MovementType;
    comment?: string;
    items: {
        productId: number;
        quantity: number;
        costPrice?: number;
    }[];
}


export interface WarehouseOption {
    id: number;
    name: string;
}

export interface ProductOption {
    id: number;
    name: string;
    productCode: string;
}

export interface MovementHistoryItem {
    id: number;
    type: MovementType;
    warehouseName: string;
    productName: string;
    quantityChange: number;
    comment?: string;
    createdAt: string;
}

export interface MovementsPageResponse {
    content: MovementHistoryItem[];
    totalElements: number;
}
export interface MovementHistoryItem {
    id: number;
    warehouseId: number;
    warehouseName: string;
    movementType: 'INBOUND' | 'OUTBOUND' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT' | 'SELL';
    movementTime: string;
    comment?: string;
    items: { productId: number; quantity: number; costPrice?: number }[];
}
export interface MovementsPageResponse {
    content: MovementHistoryItem[];
    totalElements: number;
}
export interface MovementDetailItem {
    productId: number;
    quantity: number;
    costPrice?: number;
    productName: string;
    productCode: string;
}