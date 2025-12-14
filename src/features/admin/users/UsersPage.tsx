import {useState} from 'react';
import {Alert, Box, Chip, IconButton, Switch, Typography} from '@mui/material';
import {DataGrid, type GridColDef, type GridPaginationModel} from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyIcon from '@mui/icons-material/Key';

import {useUsers} from './hooks/useUsers';
import {UserEditForm} from './UserEditForm';
import {PasswordResetForm} from './PasswordResetForm';
import type {PasswordResetFormData, User, UserFormData} from './types';

export const UsersPage = () => {
    const {usePaginatedUsers, update, delete: deleteUser, resetPassword} = useUsers();

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({page: 0, pageSize: 10});
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

    const {data: usersPage, isFetching, isError, error} = usePaginatedUsers(
        paginationModel.page,
        paginationModel.pageSize
    );

    const handleEditSubmit = (userData: UserFormData) => {
        if (!userToEdit) return;
        update.mutate({id: userToEdit.id, userData}, {
            onSuccess: () => setUserToEdit(null),
        });
    };

    const handleDelete = (id: number, username: string) => {
        if (window.confirm(`Вы уверены, что хотите удалить пользователя ${username}?`)) {
            deleteUser.mutate(id);
        }
    };

    const handleResetPasswordSubmit = (passwordData: PasswordResetFormData) => {
        if (!userToResetPassword) return;
        resetPassword.mutate({id: userToResetPassword.id, passwordData}, {
            onSuccess: () => setUserToResetPassword(null),
        });
    };

    const columns: GridColDef<User>[] = [
        {field: 'id', headerName: 'ID', width: 90},
        {field: 'username', headerName: 'Логин', flex: 1},
        {field: 'firstName', headerName: 'Имя', flex: 1},
        {field: 'lastName', headerName: 'Фамилия', flex: 1},
        {field: 'email', headerName: 'Email', flex: 1.5},
        {
            field: 'roles',
            headerName: 'Роли',
            flex: 1.5,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>
                    {Array.isArray(params.value) && params.value.map((role: string) => <Chip key={role} label={role}
                                                                                             size="small"/>)}
                </Box>
            ),
        },
        {
            field: 'enabled',
            headerName: 'Активен',
            width: 100,
            renderCell: (params) => <Switch checked={params.value} readOnly/>,
        },
        {
            field: 'actions',
            headerName: 'Действия',
            sortable: false,
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => setUserToEdit(params.row)} title="Редактировать"><EditIcon/></IconButton>
                    <IconButton onClick={() => setUserToResetPassword(params.row)}
                                title="Сбросить пароль"><KeyIcon/></IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id, params.row.username)} title="Удалить"
                                color="error"><DeleteIcon/></IconButton>
                </Box>
            ),
        },
    ];

    if (isError) {
        return <Alert severity="error">Ошибка при загрузке: {(error as Error).message}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{mb: 2}}>
                Управление пользователями
            </Typography>
            <Box sx={{height: 650, width: '100%'}}>
                <DataGrid
                    rows={usersPage?.content ?? []}
                    columns={columns}
                    getRowId={(row) => row.id}
                    paginationMode="server"
                    rowCount={usersPage?.totalElements ?? 0}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    loading={isFetching}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                />
            </Box>
            <UserEditForm
                user={userToEdit}
                onClose={() => setUserToEdit(null)}
                onSubmit={handleEditSubmit}
                isSubmitting={update.isPending}
            />
            <PasswordResetForm
                username={userToResetPassword?.username || null}
                onClose={() => setUserToResetPassword(null)}
                onSubmit={handleResetPasswordSubmit}
                isSubmitting={resetPassword.isPending}
            />
        </Box>
    );
};