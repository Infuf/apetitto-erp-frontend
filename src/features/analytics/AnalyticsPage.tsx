import {useState} from 'react';
import {Box, Paper, Tab, Tabs, Typography} from '@mui/material';
import PieChartIcon from '@mui/icons-material/PieChart';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import HandshakeIcon from '@mui/icons-material/Handshake';

import {FinanceAnalyticsTab} from './tabs/finance/FinanceAnalyticsTab.tsx';
import {WarehouseAnalyticsTab} from './tabs/WarehouseAnalyticsTab';
import {PartnersAnalyticsTab} from "./tabs/finance/PartnersAnalyticsTab.tsx";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ paddingTop: 20 }}>
        {value === index && <Box>{children}</Box>}
    </div>
);

export const AnalyticsPage = () => {
    const [tabValue, setTabValue] = useState(0);

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
                Центр Фобий
            </Typography>

            <Paper sx={{ width: '100%' }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, newVal) => setTabValue(newVal)}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab icon={<PieChartIcon />} iconPosition="start" label="Где бабки?" />
                    <Tab icon={<WarehouseIcon />} iconPosition="start" label="Склад - кладбище денег" />
                    <Tab icon={<HandshakeIcon/>} iconPosition="start" label="Партнеры"/>
                </Tabs>
            </Paper>

            <TabPanel value={tabValue} index={0}>
                <FinanceAnalyticsTab />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <WarehouseAnalyticsTab />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <PartnersAnalyticsTab/>
            </TabPanel>
        </Box>
    );
};