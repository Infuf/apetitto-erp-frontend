import {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
    Autocomplete,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Switch,
    TextField
} from '@mui/material';
import Grid from '@mui/material/Grid';

import {useQuery} from '@tanstack/react-query';
import {axiosInstance} from '../../../api/axiosInstance';
import type {RoleOption, User, UserFormData, WarehouseOption} from './types';

const userSchema = z.object({
    firstName: z.string().min(1, 'Имя обязательно'),
    lastName: z.string().min(1, 'Фамилия обязательна'),
    email: z.string().email('Некорректный email'),
    enabled: z.boolean(),
    warehouseId: z.number().nullable(),
    roles: z.array(z.string()).min(1, 'Нужна хотя бы одна роль'),
});

// VALUES (4, 'ROLE_WAREHOUSE_MANAGER'),
//        (5, 'ROLE_STORE_MANAGER'),
//        (6, 'ROLE_DEPARTMENT_MANAGER'),
//        (7, 'ROLE_FINANCE_OFFICER'),
//        (8, 'ROLE_OWNER')
const availableRoles: RoleOption[] = [
    { value: 'ROLE_USER', label: 'Пользователь' },
    { value: 'ROLE_ADMIN', label: 'Администратор' },
    { value: 'ROLE_STORE_MANAGER', label: 'Менеджер магазина' },
    { value: 'ROLE_OWNER', label: 'Овнер' },
    { value: 'ROLE_FINANCE_OFFICER', label: 'Главный по бабкам' },
    { value: 'ROLE_WAREHOUSE_MANAGER', label: 'Менеджер склада' },
];

const fetchWarehouses = async (): Promise<WarehouseOption[]> => {
    const { data } = await axiosInstance.get('/warehouses');
    return data;
};

interface UserEditFormProps {
    user: User | null;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
    isSubmitting: boolean;
}

export const UserEditForm = ({
                                 user,
                                 onClose,
                                 onSubmit,
                                 isSubmitting,
                             }: UserEditFormProps) => {
    const { data: warehouses = [], isLoading: isLoadingWarehouses } = useQuery({
        queryKey: ['warehouses'],
        queryFn: fetchWarehouses,
    });

    const { control, handleSubmit, reset, formState: { errors } } =
        useForm<UserFormData>({ resolver: zodResolver(userSchema) });

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                enabled: user.enabled,
                warehouseId: user.warehouseId ?? null,
                roles: user.roles,
            });
        }
    }, [user, reset]);

    if (!user) return null;

    return (
        <Dialog
            open={!!user}
            onClose={onClose}
            PaperProps={{ component: 'form', onSubmit: handleSubmit(onSubmit) }}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Редактирование пользователя: {user.username}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Имя"
                                    fullWidth
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Фамилия"
                                    fullWidth
                                    error={!!errors.lastName}
                                    helperText={errors.lastName?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="warehouseId"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={warehouses}
                                    getOptionLabel={(option) => option.name}
                                    value={warehouses.find((w) => w.id === field.value) || null}
                                    onChange={(_, newValue) => field.onChange(newValue?.id ?? null)}
                                    loading={isLoadingWarehouses}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Привязанный склад"
                                            error={!!errors.warehouseId}
                                            helperText={errors.warehouseId?.message}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="roles"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    multiple
                                    options={availableRoles}
                                    getOptionLabel={(option) => option.label}
                                    value={availableRoles.filter((role) =>
                                        field.value?.includes(role.value)
                                    )}
                                    onChange={(_, newValue) =>
                                        field.onChange(newValue.map((role) => role.value))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Роли"
                                            error={!!errors.roles}
                                            helperText={errors.roles?.message}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="enabled"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Switch {...field} checked={field.value} />}
                                    label="Активен"
                                />
                            )}
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
