import { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Alert, IconButton } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { axiosInstance } from '../../api/axiosInstance';
import { CategoryForm } from './CategoryForm';
import type { Category } from './types';
import type { CategoryFormData } from './CategoryForm';

const fetchCategories = async (): Promise<Category[]> => {
    const { data } = await axiosInstance.get('/categories');
    return data;
};

const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
    const { data } = await axiosInstance.post('/categories', categoryData);
    return data;
};

const updateCategory = async (categoryData: Category): Promise<Category> => {
    const { data } = await axiosInstance.put(`/categories`, categoryData);
    return data;
};

const deleteCategory = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categories/${id}`);
};

export const CategoriesPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const queryClient = useQueryClient();

    const { data: categories, isLoading, isError, error } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const { mutate: addCategory, isPending: isCreating } = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            closeModal();
        },
    });

    const { mutate: editCategory, isPending: isEditing } = useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            closeModal();
        },
    });

    const { mutate: removeCategory } = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const handleEditClick = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
            removeCategory(id);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleFormSubmit = (formData: CategoryFormData) => {
        if (editingCategory) {
            const updatedCategory = { ...formData, id: editingCategory.id };
            editCategory(updatedCategory);
        } else {
            addCategory(formData);
        }
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Название', flex: 1, minWidth: 150 },
        { field: 'description', headerName: 'Описание', flex: 2, minWidth: 250 },
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            width: 120,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEditClick(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(params.row.id)}>
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    if (isLoading) {
        return <CircularProgress />;
    }

    if (isError) {
        return <Alert severity="error">Ошибка при загрузке категорий: {error.message}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Справочник: Категории
                </Typography>
                <Button variant="contained" onClick={() => setIsModalOpen(true)}>
                    Создать категорию
                </Button>
            </Box>

            <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={categories ?? []}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                />
            </Box>

            <CategoryForm
                open={isModalOpen}
                onClose={closeModal}
                onSubmit={handleFormSubmit}
                isSubmitting={isCreating || isEditing}
                initialData={editingCategory}
            />
        </Box>
    );
};