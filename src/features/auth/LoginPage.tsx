import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from 'react-router-dom';
import {useMutation} from '@tanstack/react-query';
import {useState} from 'react';
import {Alert, Avatar, Box, Button, Card, CardContent, CircularProgress, TextField, Typography} from '@mui/material';

import {axiosInstance} from '../../api/axiosInstance.ts';
import {useAuth} from '../../context/useAuth.ts';
import logo from '../../assets/logo.jpg';
import {loginQuotes} from '../../constants/login-quotes';
import type {AxiosError} from "axios";

const loginSchema = z.object({
    username: z.string().min(1, 'Имя пользователя обязательно'),
    password: z.string().min(1, 'Пароль обязателен'),
});

const randomQuote = loginQuotes[Math.floor(Math.random() * loginQuotes.length)];
type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    employeeId: number | null;
}

const loginUser = async (credentials: LoginFormData): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    return data;
};

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const { mutate: performLogin, isPending } = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            const user = {
                id: data.id,
                username: data.username,
                roles: data.roles,
                employeeId: data.employeeId,
            };

            login(user, data.token);

            navigate('/');
        },
        onError: (error: AxiosError) => {
            setErrorMessage('Неверное имя пользователя или пароль.');
            console.error('Login error:', error);
        },
    });

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f0f2f5',
                px: 2,
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    boxShadow: { xs: 'none', sm: 3 },
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Avatar src={logo} sx={{ width: 80, height: 80, mb: 2 }} />
                        <Typography variant="h5" component="h1">
                            Вход в Apetitto ERP
                        </Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                            {randomQuote}
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit((data) => performLogin(data))}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Имя пользователя"
                                variant="outlined"
                                {...register('username')}
                                error={!!errors.username}
                                helperText={errors.username?.message}
                                disabled={isPending}
                            />
                            <TextField
                                label="Пароль"
                                type="password"
                                variant="outlined"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                disabled={isPending}
                            />
                            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                            <Button type="submit" variant="contained" disabled={isPending} sx={{ mt: 2, py: 1.5 }}>
                                {isPending ? <CircularProgress size={24} /> : 'Войти'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};