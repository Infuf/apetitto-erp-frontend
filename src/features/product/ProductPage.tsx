import {useState, useCallback, useEffect} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Alert,
    IconButton,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    DataGrid,
    type GridColDef,
    type GridPaginationModel,
} from '@mui/x-data-grid';
import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import {formatCurrency} from "../../lib/formatCurrency.ts";

import {axiosInstance} from '../../api/axiosInstance';
import {ProductForm} from './ProductForm';
import type {Product, ProductFormData, ProductPageResponse} from './types';


function useDebounce<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debounced;
}


const fetchProducts = async (
    page: number,
    size: number,
    search: string
): Promise<ProductPageResponse> => {
    const endpoint = search ? '/products/search' : '/products';
    const {data} = await axiosInstance.get(endpoint, {
        params: {page, size, name: search},
    });
    return data;
};

const createProduct = async (productData: ProductFormData): Promise<Product> => {
    const {data} = await axiosInstance.post('/products', productData);
    return data;
};

const updateProduct = async (productData: Product): Promise<Product> => {
    const {data} = await axiosInstance.put(`/products`, productData);
    return data;
};

const deleteProduct = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/products/${id}`);
};


export const ProductsPage = () => {
    const queryClient = useQueryClient();

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [search, setSearch] = useState('');

    const debouncedSearch = useDebounce(search, 500);

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery<ProductPageResponse, Error>({
        queryKey: ['products', paginationModel.page, paginationModel.pageSize, debouncedSearch],
        queryFn: () =>
            fetchProducts(paginationModel.page, paginationModel.pageSize, debouncedSearch),
        placeholderData: keepPreviousData,
        staleTime: 15_000, // 15 секунд кэш
    });

    const {mutate: addProduct, isPending: isCreating} = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
            closeModal();
        },
    });

    const {mutate: editProduct, isPending: isEditing} = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
            closeModal();
        },
    });

    const {mutate: removeProduct} = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']});
        },
    });


    const handleEditClick = useCallback((product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    }, []);

    const handleDeleteClick = useCallback(
        (id: number) => {
            if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
                removeProduct(id);
            }
        },
        [removeProduct]
    );

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingProduct(null);
    }, []);

    const handleFormSubmit = (formData: ProductFormData) => {
        if (formData.categoryId == null) {
            console.error('Попытка отправить форму с пустой категорией!');
            return;
        }

        if (editingProduct) {
            editProduct({
                ...editingProduct,
                ...formData,
                categoryId: formData.categoryId!,
            });
        } else {
            addProduct({
                ...formData,
                categoryId: formData.categoryId!,
            });
        }
    };


    const columns: GridColDef<Product>[] = [
            {field: 'productCode', headerName: 'Артикул', width: 130},
            {field: 'name', headerName: 'Название', flex: 1, minWidth: 150},
            {field: 'categoryName', headerName: 'Категория', flex: 1, minWidth: 150},
            {
                field: 'sellingPrice', headerName: 'Цена', width: 120,
                renderCell: (params) => {
                    return formatCurrency(params.value);
                }
            },
            {field: 'unit', headerName: 'Ед. изм.', width: 100},
            {
                field: 'actions', headerName: 'Действия', sortable:
                    false,
                width:
                    120,
                renderCell:
                    (params) => (
                        <>
                            <IconButton onClick={() => handleEditClick(params.row)}>
                                <EditIcon/>
                            </IconButton>
                            <IconButton onClick={() => handleDeleteClick(params.row.id)}>
                                <DeleteIcon/>
                            </IconButton>
                        </>
                    ),
            }
            ,
        ]
    ;


    if (isLoading && !data) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (isError) {
        return (
            <Alert severity="error">
                Ошибка при загрузке: {error.message}
            </Alert>
        );
    }


    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="h4" component="h1">
                    Справочник: Товары
                </Typography>
                <Button variant="contained" onClick={() => setIsModalOpen(true)}>
                    Создать товар
                </Button>
            </Box>

            <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                <TextField
                    label="Поиск по названию"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action"/>
                            </InputAdornment>
                        ),
                        endAdornment: isFetching ? (
                            <InputAdornment position="end">
                                <CircularProgress size={20}/>
                            </InputAdornment>
                        ) : null,
                    }}
                />
            </Box>

            <Box sx={{height: 600, width: '100%'}}>
                <DataGrid
                    rows={data?.content ?? []}
                    columns={columns}
                    getRowId={(row) => row.id}
                    paginationMode="server"
                    rowCount={data?.totalElements ?? 0}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 25]}
                    loading={isFetching}
                    disableRowSelectionOnClick
                />
            </Box>

            <ProductForm
                open={isModalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                isSubmitting={isCreating || isEditing}
                initialData={editingProduct}
            />
        </Box>
    );
};
