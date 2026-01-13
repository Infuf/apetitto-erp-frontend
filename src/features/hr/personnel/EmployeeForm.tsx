import {useEffect} from 'react';
import {Controller, type Resolver, type SubmitHandler, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import {useDepartments} from '../hooks/useDepartments';
import type {Employee, EmployeeCreateDto, EmployeeUpdateDto} from '../types';

const salaryTypes = [
    {value: 'FIXED', label: 'Оклад (Фикс)'},
    {value: 'HOURLY', label: 'Почасовая'},
    {value: 'DAILY_SHIFT', label: 'За смену'},
] as const;

const formatTimeForBackend = (timeStr?: string | null): string | null => {
    if (!timeStr) return null;
    if (timeStr.length === 5) return `${timeStr}:00`;
    if (timeStr.length >= 8) return timeStr.substring(0, 8);
    return null;
};

const employeeSchema = z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    firstName: z.string().min(1, 'Имя обязательно'),
    lastName: z.string().min(1, 'Фамилия обязательна'),
    email: z.string().email('Некорректный email').optional().or(z.literal('')),

    departmentId: z.number().min(1, "Выберите департамент"),

    positionTitle: z.string().min(1, 'Должность обязательна'),
    salaryType: z.enum(['FIXED', 'HOURLY', 'DAILY_SHIFT']),

    salaryBase: z.coerce.number().min(0, 'Ставка не может быть отрицательной'),

    shiftStartTime: z.string().optional().nullable(),
    shiftEndTime: z.string().optional().nullable(),

    daysOffPerMonth: z.coerce.number().optional(),
    terminalId: z.coerce.number().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: EmployeeCreateDto | EmployeeUpdateDto) => void;
    isSubmitting: boolean;
    initialData?: Employee | null;
}

export const EmployeeForm = ({open, onClose, onSubmit, isSubmitting, initialData}: EmployeeFormProps) => {
    const {departments} = useDepartments();

    const resolver = zodResolver(employeeSchema) as unknown as Resolver<EmployeeFormValues>;

    const {register, control, handleSubmit, formState: {errors}, reset, watch} = useForm<EmployeeFormValues>({
        resolver,
        defaultValues: {
            salaryType: 'FIXED',
            salaryBase: 0,
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            positionTitle: '',
            departmentId: 0,
            shiftStartTime: '',
            shiftEndTime: '',
            daysOffPerMonth: 2,
            terminalId: 0,
        }
    });

    const isEditMode = !!initialData;
    const salaryType = watch('salaryType');

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    firstName: initialData.fullName.split(' ')[0] || '',
                    lastName: initialData.fullName.split(' ')[1] || '',
                    email: initialData.email || '',
                    departmentId: initialData.departmentId || 0,
                    positionTitle: initialData.positionTitle,
                    salaryType: initialData.salaryType,
                    salaryBase: initialData.salaryBase,
                    shiftStartTime: initialData.shiftStartTime?.substring(0, 5) || '',
                    shiftEndTime: initialData.shiftEndTime?.substring(0, 5) || '',
                    daysOffPerMonth: initialData.daysOffPerMonth ?? 2,
                    terminalId: initialData.terminalId ?? 0,
                    username: '',
                    password: ''
                });
            } else {
                reset({
                    username: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    departmentId: 0,
                    positionTitle: '',
                    salaryType: 'FIXED',
                    salaryBase: 0,
                    shiftStartTime: '',
                    shiftEndTime: '',
                    daysOffPerMonth: 2,
                    terminalId: 0,
                });
            }
        }
    }, [open, initialData, reset]);

    const handleFormSubmit: SubmitHandler<EmployeeFormValues> = (data) => {
        const formattedStart = formatTimeForBackend(data.shiftStartTime);
        const formattedEnd = formatTimeForBackend(data.shiftEndTime);
        const activeStatus = isEditMode && initialData ? initialData.isActive : true;


        const commonData = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || null,
            departmentId: data.departmentId,
            positionTitle: data.positionTitle,
            salaryType: data.salaryType,
            salaryBase: data.salaryBase,
            shiftStartTime: formattedStart,
            shiftEndTime: formattedEnd,
            daysOffPerMonth: data.daysOffPerMonth || null,
            terminalId: data.terminalId ? data.terminalId : null,
            isActive: activeStatus,
        };

        if (isEditMode && initialData) {
            const updateDto: EmployeeUpdateDto = {...commonData};
            onSubmit(updateDto);
        } else {
            const createDto: EmployeeCreateDto = {
                username: data.username || '',
                password: data.password || '',
                ...commonData,
            };
            onSubmit(createDto);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
                PaperProps={{component: 'form', onSubmit: handleSubmit(handleFormSubmit)}}>
            <DialogTitle>{isEditMode ? 'Карточка сотрудника' : 'Найм нового сотрудника'}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>

                    {!isEditMode && (
                        <>
                            <Grid size={{xs: 12}}>
                                <Typography variant="subtitle2" color="primary">Учетная запись</Typography>
                            </Grid>
                            <Grid size={{xs: 6}}>
                                <TextField
                                    label="Логин (Username)"
                                    fullWidth required
                                    {...register('username')}
                                    error={!!errors.username}
                                    helperText={errors.username?.message}
                                />
                            </Grid>
                            <Grid size={{xs: 6}}>
                                <TextField
                                    label="Пароль"
                                    type="password"
                                    fullWidth required
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                />
                            </Grid>
                            <Grid size={{xs: 12}}><Divider/></Grid>
                        </>
                    )}

                    <Grid size={{xs: 12}}>
                        <Typography variant="subtitle2" color="primary">Личные данные</Typography>
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <TextField label="Имя" fullWidth required {...register('firstName')}
                                   error={!!errors.firstName} helperText={errors.firstName?.message}/>
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <TextField label="Фамилия" fullWidth required {...register('lastName')}
                                   error={!!errors.lastName} helperText={errors.lastName?.message}/>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <TextField label="Email" fullWidth {...register('email')} error={!!errors.email}
                                   helperText={errors.email?.message}/>
                    </Grid>

                    <Grid size={{xs: 12}}><Divider/></Grid>

                    <Grid size={{xs: 12}}>
                        <Typography variant="subtitle2" color="primary">Должность и График</Typography>
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <Controller
                            name="departmentId"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Департамент"
                                    fullWidth
                                    required
                                    value={field.value || ''}
                                    error={!!errors.departmentId}
                                    helperText={errors.departmentId?.message}
                                >
                                    {departments.map((d) => (
                                        <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <TextField label="Должность" fullWidth required {...register('positionTitle')}
                                   error={!!errors.positionTitle} helperText={errors.positionTitle?.message}/>
                    </Grid>
                    <Grid size={{xs: 12}}>
                        <TextField
                            label="ID Терминала"
                            type="number"
                            fullWidth
                            {...register('terminalId')}
                            helperText="Введите ID устройства (опционально)"
                        />
                    </Grid>
                    <Grid size={{xs: 4}}>
                        <TextField label="Начало смены" type="time" fullWidth
                                   InputLabelProps={{shrink: true}} {...register('shiftStartTime')} />
                    </Grid>
                    <Grid size={{xs: 4}}>
                        <TextField label="Конец смены" type="time" fullWidth
                                   InputLabelProps={{shrink: true}} {...register('shiftEndTime')} />
                    </Grid>
                    <Grid size={{xs: 4}}>
                        <TextField
                            label="Выходных в мес."
                            type="number"
                            fullWidth
                            {...register('daysOffPerMonth')}
                            error={!!errors.daysOffPerMonth}
                            helperText={errors.daysOffPerMonth?.message}
                        />
                    </Grid>

                    <Grid size={{xs: 12}}><Divider/></Grid>

                    <Grid size={{xs: 12}}>
                        <Typography variant="subtitle2" color="primary">Финансовые условия</Typography>
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <Controller
                            name="salaryType"
                            control={control}
                            render={({field}) => (
                                <TextField {...field} select label="Тип оплаты" fullWidth required>
                                    {salaryTypes.map((s) => (
                                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <TextField
                            label={salaryType === 'HOURLY' ? 'Ставка в час' : salaryType === 'DAILY_SHIFT' ? 'Ставка за смену' : 'Оклад (в месяц)'}
                            type="number" fullWidth required
                            {...register('salaryBase')}
                            error={!!errors.salaryBase}
                            helperText={errors.salaryBase?.message}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24}/> : (isEditMode ? 'Сохранить изменения' : 'Нанять')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};