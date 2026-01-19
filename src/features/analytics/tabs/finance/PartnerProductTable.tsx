import { Box, Typography, Paper } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { formatCurrency } from '../../../../lib/formatCurrency';
import type { PartnerDto, PartnerProductDto } from '../../../finance/types';

interface Props {
    partner: PartnerDto;
}

export const PartnerProductTable = ({ partner }: Props) => {
    const columns: GridColDef<PartnerProductDto>[] = [
        { field: 'productName', headerName: 'Товар', flex: 2 },
        {
            field: 'quantity',
            headerName: 'Кол-во',
            width: 120,
            renderCell: (p) => `${p.value} ${p.row.unit}`
        },
        {
            field: 'averagePrice',
            headerName: 'Ср. цена',
            width: 130,
            renderCell: (p) => formatCurrency(p.value)
        },
        {
            field: 'amount',
            headerName: 'Сумма',
            width: 150,
            renderCell: (p) => <span style={{ fontWeight: 'bold' }}>{formatCurrency(p.value)}</span>
        },
    ];

    return (
        <Box sx={{ p: 2, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle2" gutterBottom>
                Детализация по товарам: {partner.partnerName}
            </Typography>
            <Paper elevation={1}>
                <DataGrid
                    rows={partner.products || []}
                    columns={columns}
                    getRowId={(row) => row.productName}
                    density="compact"
                    autoHeight
                    hideFooter
                    disableRowSelectionOnClick
                />
            </Paper>
        </Box>
    );
};