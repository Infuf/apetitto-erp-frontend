import {Route, Routes, Navigate} from 'react-router-dom';

import {ProtectedRoute} from './ProtectedRoute';
import {Layout} from '../components/Layout';
import {LoginPage} from '../features/auth/LoginPage';
import {WarehousesPage} from '../features/warehouses/WarehousesPage';
import {CategoriesPage} from "../features/categories/CategoryPage.tsx";
import {ProductsPage} from "../features/product/ProductPage.tsx";
import {StockPage} from "../features/stock/StockPage.tsx";
import {MovementsPage} from "../features/movements/MovementPage.tsx";
import {RegisterPage} from "../features/auth/RegisterPage.tsx";
// import {CreateTransferPage} from "../features/transfers/CreateTransferPage.tsx";
import {TransfersPage} from "../features/transfers/TransfersPage.tsx";
import {TransferDetailPage} from "../features/transfers/TransfersDetailsl.tsx";
// import {TransferDetailPage} from "../features/transfers/TransfersDetailPage.tsx";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/forbidden" element={<div>Доступ запрещен</div>}/>

            <Route element={<ProtectedRoute/>}>
                <Route element={<Layout/>}>
                    <Route path="/" element={<Navigate to="/warehouses"/>}/>
                    <Route path="/warehouses" element={<WarehousesPage/>}/>
                    <Route path="/categories" element={<CategoriesPage/>}/>
                    <Route path="/products" element={<ProductsPage/>}/>
                    <Route path="/movements" element={<MovementsPage/>}/>
                    <Route path="/transfers" element={<TransfersPage/>}/>
                    {/*<Route path="/transfers/create" element={<CreateTransferPage/>}/>*/}
                    <Route path="/transfers/:id" element={<TransferDetailPage/>}/>
                    <Route path="/stock" element={<StockPage/>}/>
                </Route>
            </Route>
        </Routes>
    );
};