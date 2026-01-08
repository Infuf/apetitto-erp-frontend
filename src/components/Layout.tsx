import {useState} from 'react';
import {NavLink, Outlet} from 'react-router-dom';
import {
    AppBar as MuiAppBar,
    Avatar,
    Box,
    Button,
    Collapse,
    CssBaseline,
    Divider,
    Drawer as MuiDrawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
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
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ClassIcon from '@mui/icons-material/Class';
import PieChartIcon from '@mui/icons-material/PieChart';
import {Can} from './Can.tsx';
import {funnyTitles} from '../constants/titles';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
    isMobile?: boolean;
}

interface DrawerProps extends MuiDrawerProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile',
})<AppBarProps>(({theme, open, isMobile}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && !isMobile && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DesktopDrawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})<DrawerProps>(
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
    {text: 'Товары', path: '/products', icon: <InventoryIcon/>, roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']},
    {text: 'Категории', path: '/categories', icon: <CategoryIcon/>, roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']},
    {text: 'Склады', path: '/warehouses', icon: <WarehouseIcon/>, roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER']},
];

const operationsItems = [
    {text: 'Остатки на складе', path: '/stock', icon: <AssessmentIcon/>, roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER', 'ROLE_OWNER']},
    {text: 'Складские операции', path: '/movements', icon: <SyncAltIcon/>, roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER', 'ROLE_OWNER']},
    {text: 'Перемещения', path: '/transfers', icon: <CompareArrowsIcon/>, roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER', 'ROLE_STORE_MANAGER', 'ROLE_OWNER']},
];
const financeItems = [
    {text: 'Фобии', path: '/analytics', icon: <PieChartIcon/>, roles: ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_FINANCE_OFFICER']},
    {text: 'Бабки', path: '/finance/transactions', icon: <ReceiptLongIcon/>, roles: ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_FINANCE_OFFICER']},
    {text: 'Счета и Кассы', path: '/finance/accounts', icon: <AccountBalanceWalletIcon/>, roles: ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_FINANCE_OFFICER']},
    {text: 'Статьи (Категории)', path: '/finance/categories', icon: <ClassIcon/>, roles: ['ROLE_ADMIN', 'ROLE_OWNER', 'ROLE_FINANCE_OFFICER']},
];

const adminItems = [
    {text: 'Пользователи', path: '/admin/users', icon: <SupervisorAccountIcon/>, roles: ['ROLE_ADMIN']},
];

export const Layout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const {logout, user} = useAuth();

    const [open, setOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const [title, setTitle] = useState(() => funnyTitles[Math.floor(Math.random() * funnyTitles.length)]);
    const [openDirectory, setOpenDirectory] = useState(true);

    const handleChangeTitle = () => {
        let newTitle = title;
        while (newTitle === title) {
            newTitle = funnyTitles[Math.floor(Math.random() * funnyTitles.length)];
        }
        setTitle(newTitle);
    };

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setOpen(!open);
        }
    };

    const handleDirectoryClick = () => {
        setOpenDirectory(!openDirectory);
    };

    const handleNavClick = () => {
        if (isMobile) setMobileOpen(false);
    };

    const drawerContent = (
        <>
            <Toolbar sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1]}}>
                {!isMobile && (
                    <IconButton onClick={handleDrawerToggle}>
                        <ChevronLeftIcon/>
                    </IconButton>
                )}
            </Toolbar>
            <Divider />
            <List component="nav">
                {operationsItems.map((item) => (
                    <Can allowedRoles={item.roles} key={item.text}>
                        <ListItemButton
                            component={NavLink}
                            to={item.path}
                            onClick={handleNavClick}
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
                                    component={NavLink}
                                    to={item.path}
                                    onClick={handleNavClick}
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
                            onClick={handleNavClick}
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
                            component={NavLink}
                            to={item.path}
                            onClick={handleNavClick}
                            sx={{'&.active': {backgroundColor: 'action.selected'}}}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text}/>
                        </ListItemButton>
                    </Can>
                ))}
            </List>
        </>
    );

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>

            <AppBar position="absolute" open={open} isMobile={isMobile}>
                <Toolbar sx={{pr: '24px'}}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        sx={{marginRight: '36px', ...(open && !isMobile && {display: 'none'})}}
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
                    {!isMobile && <Typography sx={{mr: 2}}>{user?.username}</Typography>}
                    <Button color="inherit" onClick={logout}>Выход</Button>
                </Toolbar>
            </AppBar>

            {isMobile ? (
                <MuiDrawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </MuiDrawer>
            ) : (
                <DesktopDrawer variant="permanent" open={open}>
                    {drawerContent}
                </DesktopDrawer>
            )}

            <Box component="main" sx={{flexGrow: 1, height: '100vh', overflow: 'auto'}}>
                <Toolbar/>
                <Box sx={{p: isMobile ? 2 : 3}}>
                    <Outlet/>
                </Box>
            </Box>
        </Box>
    );
};