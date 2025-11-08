import {Route, Routes} from 'react-router-dom';

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

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/forbidden" element={<div>Доступ запрещен</div>}/>

            <Route element={<ProtectedRoute/>}>
                <Route element={<Layout/>}>

                    <Route path="/"/>
                    <Route path="/warehouses" element={<WarehousesPage/>}/>
                    <Route path="/categories" element={<CategoriesPage/>}/>
                    <Route path="/products" element={<ProductsPage/>}/>
                    <Route path="/stock" element={<StockPage/>}/>
                    <Route path="/movements" element={<MovementsPage/>}/>


                    <Route path="/transfers" element={<TransfersPage/>}/>
                    <Route path="/transfers/:id" element={<TransferDetailPage/>}/>

                    <Route path="/admin/users" element={<UsersPage/>}/>

                </Route>
            </Route>
        </Routes>
    );
};