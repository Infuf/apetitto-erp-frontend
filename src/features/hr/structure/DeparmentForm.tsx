import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Autocomplete
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { axiosInstance } from '../../../api/axiosInstance';
import type { Department, DepartmentFormData, Employee } from '../types';
// Здесь осознанный костыль чтобы не менять писать бэк ендпоит (Нету ресурсов у заказчика чтобы писать нормально)
// Должно хватать на пару лет
// Этим формам будут пользоваться раз несколько месяцов
const fetchEmployeesList = async (): Promise<Employee[]> => {
    const { data } = await axiosInstance.get('/hr/employees', {
        params: { page: 0, size: 500 }
    });
    return data.content || [];
};

const departmentSchema = z.object({
    name: z.string().min(2, 'Минимум 2 символа').max(100),
    description: z.string().optional(),
    managerId: z.number().nullable().optional(),
});

interface DepartmentFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: DepartmentFormData) => void;
    isSubmitting: boolean;
    initialData?: Department | null;
}

export const DepartmentForm = ({ open, onClose, onSubmit, isSubmitting, initialData }: DepartmentFormProps) => {
    const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
        queryKey: ['employees', 'list'],
        queryFn: fetchEmployeesList,
        enabled: open,
        staleTime: 1000 * 60 * 5,
    });
    const activeEmployees = employees.filter(emp => emp.isActive);

    const { register, handleSubmit, formState: { errors }, reset, control } = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            name: '',
            description: '',
            managerId: null
        }
    });

    useEffect(() => {
        if (open) {
            reset({
                name: initialData?.name || '',
                description: initialData?.description || '',
                managerId: initialData?.managerId || null,
            });
        }
    }, [open, initialData, reset]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }}>
            <DialogTitle>{initialData ? 'Редактировать департамент' : 'Новый департамент'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            autoFocus
                            label="Название"
                            fullWidth
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={isSubmitting}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="managerId"
                            control={control}
                            render={({ field: { onChange, value, ref } }) => (
                                <Autocomplete
                                    options={activeEmployees}
                                    getOptionLabel={(option) => `${option.fullName} (${option.positionTitle})`}

                                    isOptionEqualToValue={(option, val) => option.userId === val.userId}

                                    value={value ? employees.find(e => e.userId === value) || null : null}

                                    onChange={(_, newValue) => {
                                        onChange(newValue ? newValue.userId : null);
                                    }}

                                    loading={isLoadingEmployees}
                                    disabled={isSubmitting}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Руководитель департамента"
                                            inputRef={ref}
                                            error={!!errors.managerId}
                                            helperText={errors.managerId?.message}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {isLoadingEmployees ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Описание"
                            fullWidth
                            multiline
                            rows={3}
                            {...register('description')}
                            disabled={isSubmitting}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};