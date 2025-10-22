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

const drawerWidth = 240;
import {funnyTitles} from '../constants/titles';

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
    {text: 'Товары', path: '/products', icon: <InventoryIcon/>},
    {text: 'Категории', path: '/categories', icon: <CategoryIcon/>},
    {text: 'Склады', path: '/warehouses', icon: <WarehouseIcon/>},
];

const operationsItems = [
    {text: 'Остатки на складе', path: '/stock', icon: <AssessmentIcon/>},
    {text: 'Складские операции', path: '/movements', icon: <SyncAltIcon/>}
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
                    <Box sx={{flexGrow: 1}}/>
                    <Typography component="h1" variant="h6" color="inherit" noWrap sx={{flexGrow: 1}}>
                        Apetitto ERP
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
                        <ListItemButton
                            key={item.text}
                            component={NavLink}
                            to={item.path}
                            sx={{'&.active': {backgroundColor: 'action.selected'}}}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text}/>
                        </ListItemButton>
                    ))}
                    <Divider sx={{my: 1}}/>
                    <ListItemButton onClick={handleDirectoryClick}>
                        <ListItemIcon><FolderIcon/></ListItemIcon>
                        <ListItemText primary="Справочники"/>
                        {openDirectory ? <ExpandLess/> : <ExpandMore/>}
                    </ListItemButton>
                    <Collapse in={openDirectory} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {directoryItems.map((item) => (
                                <ListItemButton
                                    key={item.text}
                                    component={NavLink}
                                    to={item.path}
                                    sx={{pl: 4, '&.active': {backgroundColor: 'action.selected'}}}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text}/>
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>
                </List>
            </Drawer>

            <Box component="main" sx={{flexGrow: 1, height: '100vh', overflow: 'auto'}}>
                <Toolbar/>
                <Box sx={{p: 3}}>
                    <Outlet/>
                </Box>
            </Box>
        </Box>
    );
};