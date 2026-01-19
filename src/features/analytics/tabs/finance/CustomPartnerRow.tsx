import { useState, Fragment } from 'react';
import { Collapse, IconButton, Box } from '@mui/material';
import { GridRow, type GridRowProps } from '@mui/x-data-grid';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { PartnerProductTable } from './PartnerProductTable';
import type { PartnerDto } from '../../../finance/types';

interface CustomPartnerRowProps extends GridRowProps {
    row: PartnerDto;
}

export const CustomPartnerRow = (props: CustomPartnerRowProps) => {

    const propsAny = props as any;
    const { row, ...other } = propsAny;

    const [open, setOpen] = useState(false);

    const children = propsAny.children || propsAny.unstable_children;

    if (!children || !Array.isArray(children) || children.length === 0) {
        return <GridRow {...props} />;
    }

    const firstCell = children[0];

    const firstCellWithButton = firstCell ? (
        <firstCell.type {...firstCell.props} key="expand-cell">
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%', justifyContent: 'center' }}>
                <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(!open);
                    }}
                >
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </Box>
        </firstCell.type>
    ) : null;

    const newChildren = [firstCellWithButton, ...children.slice(1)];

    return (
        <Fragment>
            <GridRow {...other}>
                {newChildren}
            </GridRow>

            {open && (
                <tr className="MuiDataGrid-row">
                    <td colSpan={children.length} style={{ padding: 0, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <PartnerProductTable partner={row} />
                            </Box>
                        </Collapse>
                    </td>
                </tr>
            )}
        </Fragment>
    );
};