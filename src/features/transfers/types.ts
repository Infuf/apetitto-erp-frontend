export interface Item {
    productId: number;
    quantity: number;
    costPrice?: number;
}

export interface TransferFilters {
    dateFrom: string | null;
    dateTo: string | null;
}

export interface TransferOrder {
    id: number;
    sourceWarehouseId: number;
    sourceWarehouseName: string;
    destinationWarehouseId: number;
    destinationWarehouseName: string;
    status: 'PENDING' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
    createdAt: string;
    shippedAt?: string;
    receivedAt?: string;
    items: (Item & { productName?: string; productCode?: string })[];
}

export interface TransferOrderRequestDto {
    sourceWarehouseId: number;
    destinationWarehouseId: number;
    isAutoInbound: boolean;
    items: Item[];
}

export interface PageTransferOrderDto {
    content: TransferOrder[];
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface FetchTransfersParams {
    pageParam?: number;
    sort?: string;
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