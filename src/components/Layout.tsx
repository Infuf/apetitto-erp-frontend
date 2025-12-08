import {useState} from 'react';
import {NavLink, Outlet} from 'react-router-dom';
import {
    AppBar as MuiAppBar, Box, Button, Toolbar, Typography, Drawer as MuiDrawer, List,
    ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, CssBaseline, Divider, Avatar
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {useAuth} from '../context/AuthContext';
import logo from '../assets/logo.jpg';

import type {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import type {DrawerProps as MuiDrawerProps} from '@mui/material/Drawer';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FolderIcon from '@mui/icons-material/Folder';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import {Can} from './Can.tsx';
import {funnyTitles} from '../constants/titles';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Журнал
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'; // Счета
import ClassIcon from '@mui/icons-material/Class'; // Категории фин.

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

interface DrawerProps extends MuiDrawerProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})<DrawerProps>(
    ({theme, open}) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const directoryItems = [
    {
        text: 'Товары', path: '/products', icon: <InventoryIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']
    },
    {
        text: 'Категории', path: '/categories', icon: <CategoryIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']
    },
    {
        text: 'Склады', path: '/warehouses', icon: <WarehouseIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']
    },
];

const operationsItems = [
    {
        text: 'Остатки на складе',
        path: '/stock',
        icon: <AssessmentIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']
    },
    {
        text: 'Складские операции',
        path: '/movements',
        icon: <SyncAltIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']
    },
    {
        text: 'Перемещения',
        path: '/transfers',
        icon: <CompareArrowsIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER', 'ROLE_STORE_MANAGER']
    },
];
const financeItems = [
    {
        text: 'Бабки',
        path: '/finance/transactions',
        icon: <ReceiptLongIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_FINANCE_OFFICER']
    },
    {
        text: 'Счета и Кассы',
        path: '/finance/accounts',
        icon: <AccountBalanceWalletIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_FINANCE_OFFICER']
    },
    {
        text: 'Статьи (Категории)',
        path: '/finance/categories',
        icon: <ClassIcon/>,
        roles: ['ROLE_ADMIN', 'ROLE_OWNER']
    },
];

const adminItems = [
    {
        text: 'Пользователи', path: '/admin/users', icon: <SupervisorAccountIcon/>,
        roles: ['ROLE_ADMIN']
    },
];

export const Layout = () => {
    const {logout, user} = useAuth();
    const [open, setOpen] = useState(true);
    const [title, setTitle] = useState(
        () => funnyTitles[Math.floor(Math.random() * funnyTitles.length)]
    );
    const [openDirectory, setOpenDirectory] = useState(true);

    const handleChangeTitle = () => {
        let newTitle = title;
        while (newTitle === title) {
            newTitle = funnyTitles[Math.floor(Math.random() * funnyTitles.length)];
        }
        setTitle(newTitle);
    };

    const toggleDrawer = () => {
        setOpen(!open);
    };
    const handleDirectoryClick = () => {
        setOpenDirectory(!openDirectory);
    };
    const handleLogout = () => {
        logout();
    };

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar position="absolute" open={open}>
                <Toolbar sx={{pr: '24px'}}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{marginRight: '36px', ...(open && {display: 'none'})}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Avatar src={logo} sx={{width: 40, height: 40, mr: 2}}/>
                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{flexGrow: 1, cursor: 'pointer', userSelect: 'none'}}
                        onClick={handleChangeTitle}
                    >
                        {title}
                    </Typography>
                    <Typography sx={{mr: 2}}>{user?.username}</Typography>
                    <Button color="inherit" onClick={handleLogout}>Выход</Button>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" open={open}>
                <Toolbar sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1]}}>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon/>
                    </IconButton>
                </Toolbar>
                <List component="nav">
                    {operationsItems.map((item) => (
                        <Can allowedRoles={item.roles} key={item.text}>
                            <ListItemButton
                                key={item.text}
                                component={NavLink}
                                to={item.path}
                                sx={{'&.active': {backgroundColor: 'action.selected'}}}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text}/>
                            </ListItemButton>
                        </Can>
                    ))}
                    <Divider sx={{my: 1}}/>
                    <Can allowedRoles={['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']}>
                        <ListItemButton onClick={handleDirectoryClick}>
                            <ListItemIcon><FolderIcon/></ListItemIcon>
                            <ListItemText primary="Справочники"/>
                            {openDirectory ? <ExpandLess/> : <ExpandMore/>}
                        </ListItemButton>
                    </Can>
                    <Collapse in={openDirectory} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {directoryItems.map((item) => (
                                <Can allowedRoles={item.roles} key={item.text}>
                                    <ListItemButton
                                        key={item.text}
                                        component={NavLink}
                                        to={item.path}
                                        sx={{pl: 4, '&.active': {backgroundColor: 'action.selected'}}}
                                    >
                                        <ListItemIcon>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text}/>
                                    </ListItemButton>
                                </Can>
                            ))}
                        </List>
                    </Collapse>
                    <Divider sx={{my: 1}}/>

                    {financeItems.map((item) => (
                        <Can allowedRoles={item.roles} key={item.text}>
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                sx={{'&.active': {backgroundColor: 'action.selected'}}}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text}/>
                            </ListItemButton>
                        </Can>
                    ))}
                    {adminItems.map((item) => (
                        <Can allowedRoles={item.roles} key={item.text}>
                            <ListItemButton
                                key={item.text}
                                component={NavLink}
                                to={item.path}
                                sx={{'&.active': {backgroundColor: 'action.selected'}}}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text}/>
                            </ListItemButton>
                        </Can>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{flexGrow: 1, height: '100vh', overflow: 'auto'}}>
                <Toolbar/>
                <Box sx={{p: 3}}>
                    <Outlet/>
                </Box>
            </Box>
        </Box>
    )
        ;
};