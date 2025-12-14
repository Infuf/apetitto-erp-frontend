import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {useMutation} from '@tanstack/react-query';
import {useState} from 'react';
import {AxiosError} from 'axios';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Link as MuiLink,
    TextField,
    Typography
} from '@mui/material';

import {axiosInstance} from '../../api/axiosInstance';
import logo from '../../assets/logo.jpg';

const registerSchema = z.object({
    firstName: z.string().min(1, 'Имя обязательно'),
    lastName: z.string().min(1, 'Фамилия обязательна'),
    username: z.string().min(3, 'Имя пользователя должно быть не менее 3 символов'),
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const registerUser = async (userData: Omit<RegisterFormData, 'confirmPassword'>) => {
    const {data} = await axiosInstance.post('/auth/register', userData);
    return data;
};

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {register, handleSubmit, formState: {errors}} = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const {mutate: performRegister, isPending} = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            setSuccessMessage('Регистрация прошла успешно! Теперь вы можете войти в систему.');
            setErrorMessage(null);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || 'Произошла ошибка при регистрации.';
            setErrorMessage(message);
            setSuccessMessage(null);
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        performRegister({
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            email: data.email,
            password: data.password,

        });
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f0f2f5',
            py: 4,
            px: 2
        }}>
            <Card
                sx={{width: '100%', maxWidth: 500, p: {xs: 1, sm: 2}, borderRadius: 2, boxShadow: {xs: 'none', sm: 3}}}>
                <CardContent>
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3}}>
                        <Avatar src={logo} sx={{width: 80, height: 80, mb: 2}}/>
                        <Typography variant="h5" component="h1">
                            Создание аккаунта
                        </Typography>
                    </Box>

                    {successMessage ? (
                        <Alert severity="success">{successMessage}</Alert>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Box sx={{display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2}}>
                                    <TextField
                                        label="Имя"
                                        fullWidth
                                        {...register('firstName')}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName?.message}
                                        disabled={isPending}
                                    />
                                    <TextField
                                        label="Фамилия"
                                        fullWidth
                                        {...register('lastName')}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName?.message}
                                        disabled={isPending}
                                    />
                                </Box>
                                <TextField
                                    label="Имя пользователя"
                                    fullWidth
                                    {...register('username')}
                                    error={!!errors.username}
                                    helperText={errors.username?.message}
                                    disabled={isPending}
                                />
                                <TextField
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={isPending}
                                />
                                <TextField
                                    label="Пароль"
                                    type="password"
                                    fullWidth
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    disabled={isPending}
                                />
                                <TextField
                                    label="Подтвердите пароль"
                                    type="password"
                                    fullWidth
                                    {...register('confirmPassword')}
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword?.message}
                                    disabled={isPending}
                                />
                                {errorMessage && <Alert severity="error" sx={{mt: 1}}>{errorMessage}</Alert>}
                                <Button type="submit" variant="contained" disabled={isPending} sx={{mt: 2, py: 1.5}}>
                                    {isPending ? <CircularProgress size={24}/> : 'Зарегистрироваться'}
                                </Button>
                            </Box>
                        </form>
                    )}

                    <Typography variant="body2" align="center" sx={{mt: 3}}>
                        Уже есть аккаунт?{' '}
                        <MuiLink component={RouterLink} to="/login" underline="hover">
                            Войти
                        </MuiLink>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};