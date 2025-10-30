
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { TransfersMobilePage } from './TransfersMobilePage';
import { TransfersDesktopPage } from './TransfersDecktopPage.tsx';

export const TransfersPage = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    return isDesktop ? <TransfersDesktopPage /> : <TransfersMobilePage />;
};