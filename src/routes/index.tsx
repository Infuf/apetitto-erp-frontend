import {Navigate, Route, Routes} from 'react-router-dom';

import {ProtectedRoute} from './ProtectedRoute';
import {Layout} from '../components/Layout';
import {LoginPage} from '../features/auth/LoginPage';
import {WarehousesPage} from '../features/warehouses/WarehousesPage';
import {CategoriesPage} from "../features/categories/CategoryPage";
import {ProductsPage} from "../features/product/ProductPage";
import {StockPage} from "../features/stock/StockPage";
import {MovementsPage} from "../features/movements/MovementPage";
import {RegisterPage} from "../features/auth/RegisterPage";
import {TransfersPage} from "../features/transfers/TransfersPage";
import {TransferDetailPage} from "../features/transfers/TransfersDetailsl";
import {UsersPage} from "../features/admin/users/UsersPage";
import {FinanceAccountsPage} from "../features/finance/accounts/FinanceAccountsPage.tsx";
import {CategoriesPage as FinanceCategoriesPage} from '../features/finance/categories/CategoryPage.tsx';
import {FinancePage} from '../features/finance/FinancePage.tsx';
import {FinanceAnalyticsTab} from '../features/analytics/tabs/finance/FinanceAnalyticsTab.tsx';
import {useAuth} from "../context/useAuth.ts";
import {AnalyticsPage} from "../features/analytics/AnalyticsPage.tsx";
import {DepartmentsPage} from "..//features/hr/structure/DepartmentsPage.tsx"
import {EmployeesPage} from "../features/hr/personnel/EmployeePage.tsx";
import {EmployeeProfilePage} from "../features/hr/personnel/EmployeeProfilePage.tsx";
import {AttendanceGridPage} from "../features/hr/attendance/components/AttendanceGridPage.tsx";

const RootRedirect = () => {
    const { user } = useAuth();

    const managementRoles = ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_FINANCE_OFFICER'];
    const isManagement = user?.roles.some(role => managementRoles.includes(role));

    if (isManagement) {
        return <Navigate to="/analytics" replace />;
    }

    if (user?.employeeId) {
        return <Navigate to={`/hr/employees/${user.employeeId}`} replace />;
    }

    return <Navigate to="/transfers" replace />;
};

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/forbidden" element={<div>Доступ запрещен</div>}/>

            <Route element={<ProtectedRoute/>}>
                <Route element={<Layout/>}>

                    <Route path="/" element={<RootRedirect/>}/>
                    <Route path="/warehouses" element={<WarehousesPage/>}/>
                    <Route path="/categories" element={<CategoriesPage/>}/>
                    <Route path="/products" element={<ProductsPage/>}/>
                    <Route path="/stock" element={<StockPage/>}/>
                    <Route path="/movements" element={<MovementsPage/>}/>


                    <Route path="/transfers" element={<TransfersPage/>}/>
                    <Route path="/transfers/:id" element={<TransferDetailPage/>}/>

                    <Route path="/finance/transactions" element={<FinancePage />} />
                    <Route path="/finance/accounts" element={<FinanceAccountsPage/>}/>
                    <Route path="/finance/categories" element={<FinanceCategoriesPage/>}/>
                    <Route path="/finance/dashboard" element={<FinanceAnalyticsTab/>}/>
                    <Route path="/analytics" element={<AnalyticsPage/>}/>

                    <Route path="/hr/departments" element={<DepartmentsPage/>}/>
                    <Route path="/hr/employees" element={<EmployeesPage/>}/>
                    <Route path="/hr/employees/:id" element={<EmployeeProfilePage />} />
                    <Route path="/hr/attendance" element={<AttendanceGridPage/>}/>

                    <Route path="/admin/users" element={<UsersPage/>}/>

                </Route>
            </Route>
        </Routes>
    );
};