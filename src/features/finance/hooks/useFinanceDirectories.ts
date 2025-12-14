import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {axiosInstance} from '../../../api/axiosInstance';
import type {AccountFormData, AccountType, CategoryFormData, FinanceAccount, FinanceCategory} from '../types';

const fetchAccounts = async (type?: AccountType): Promise<FinanceAccount[]> => {
    const params = type ? { type } : {};
    const { data } = await axiosInstance.get('/finance/accounts', { params });
    return data;
};

const createAccount = async (data: AccountFormData): Promise<FinanceAccount> => {
    const { data: result } = await axiosInstance.post('/finance/accounts', data);
    return result;
};

const deleteAccount = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/finance/accounts/${id}`);
};


const fetchCategories = async (): Promise<FinanceCategory[]> => {
    const { data } = await axiosInstance.get('/finance/categories');
    return data;
};

const createCategory = async (data: CategoryFormData): Promise<FinanceCategory> => {
    const { data: result } = await axiosInstance.post('/finance/categories', data);
    return result;
};

const createSubCategory = async ({ categoryId, name }: { categoryId: number, name: string }): Promise<void> => {
    await axiosInstance.post(`/finance/categories/${categoryId}/subcategories`, null, { params: { name } });
};


export const useFinanceDirectories = () => {
    const queryClient = useQueryClient();

    const useAccounts = (type?: AccountType) => useQuery({
        queryKey: ['financeAccounts', type],
        queryFn: () => fetchAccounts(type),
    });

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['financeCategories'],
        queryFn: fetchCategories,
    });

    const createAccountMutation = useMutation({
        mutationFn: createAccount,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeAccounts'] }),
    });

    const deleteAccountMutation = useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeAccounts'] }),
    });

    const createCategoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeCategories'] }),
    });

    const createSubCategoryMutation = useMutation({
        mutationFn: createSubCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeCategories'] }),
    });

    return {
        useAccounts,
        categories,
        isLoadingCategories,
        createAccount: createAccountMutation,
        deleteAccount: deleteAccountMutation,
        createCategory: createCategoryMutation,
        createSubCategory: createSubCategoryMutation,
    };
};