import {useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    MenuItem, CircularProgress, Grid
} from '@mui/material';
import type {FinanceCategory} from '../types';

const categorySchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    type: z.string().min(1, 'Тип обязателен'),
    description: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormValues, parentId: number | null) => void;
    isSubmitting: boolean;
    parentCategory: FinanceCategory | null;
    defaultType: string;
}

export const CategoryForm = ({
                                 open,
                                 onClose,
                                 onSubmit,
                                 isSubmitting,
                                 parentCategory,
                                 defaultType
                             }: CategoryFormProps) => {
    const {register, handleSubmit, formState: {errors}, reset, control} = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            type: defaultType,
            description: '',
        }
    });

    useEffect(() => {
        if (open) {
            reset({
                name: '',
                type: parentCategory ? parentCategory.type : defaultType,
                description: '',
            });
        }
    }, [open, parentCategory, defaultType, reset]);

    const handleFormSubmit = (data: CategoryFormValues) => {
        onSubmit(data, parentCategory ? parentCategory.id : null);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
                PaperProps={{component: 'form', onSubmit: handleSubmit(handleFormSubmit)}}>
            <DialogTitle>
                {parentCategory
                    ? `Добавить подкатегорию в "${parentCategory.name}"`
                    : 'Новая категория'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{mt: 1}}>
                    <Grid size={{xs: 12}}>
                        <TextField
                            autoFocus
                            label="Название"
                            placeholder={parentCategory ? "Например: Канцелярия" : "Например: Офисные расходы"}
                            fullWidth
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={isSubmitting}
                        />
                    </Grid>
                    {!parentCategory && (
                        <Grid size={{xs: 12}}>

                            <Controller
                                name="type"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Тип категории"
                                        fullWidth
                                        error={!!errors.type}
                                        helperText={errors.type?.message}
                                        disabled={isSubmitting}
                                    >
                                        <MenuItem value="INCOME">Доходы</MenuItem>
                                        <MenuItem value="EXPENSE">Расходы</MenuItem>
                                    </TextField>
                                )}
                            />
                        </Grid>
                    )}
                    <Grid size={{xs: 12}}>

                        <TextField
                            label="Описание (необязательно)"
                            fullWidth
                            multiline
                            rows={2}
                            {...register('description')}
                            disabled={isSubmitting}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? <CircularProgress size={24}/> : 'Создать'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};