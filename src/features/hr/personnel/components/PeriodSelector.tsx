import {Box, IconButton, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {format} from 'date-fns';
import {ru} from 'date-fns/locale';
import type {PeriodType} from '../../hooks/useEmployeeProfile';

interface Props {
    periodType: PeriodType;
    setPeriodType: (val: PeriodType) => void;
    currentMonth: Date;
    nextMonth: () => void;
    prevMonth: () => void;
    customFrom: string;
    setCustomFrom: (v: string) => void;
    customTo: string;
    setCustomTo: (v: string) => void;
}

export const PeriodSelector = ({
                                   periodType, setPeriodType,
                                   currentMonth, nextMonth, prevMonth,
                                   customFrom, setCustomFrom, customTo, setCustomTo
                               }: Props) => {

    return (
        <Paper elevation={0} variant="outlined" sx={{p: 2, mb: 2, borderRadius: 2}}>

            {periodType !== 'CUSTOM' && (
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                    <IconButton onClick={prevMonth}><ChevronLeftIcon/></IconButton>
                    <Typography variant="h6" fontWeight="bold">
                        {format(currentMonth, 'LLLL yyyy', {locale: ru})}
                    </Typography>
                    <IconButton onClick={nextMonth}><ChevronRightIcon/></IconButton>
                </Box>
            )}

            <ToggleButtonGroup
                value={periodType}
                exclusive
                onChange={(_, newVal) => {
                    if (newVal) setPeriodType(newVal);
                }}
                fullWidth
                size="small"
                sx={{mb: periodType === 'CUSTOM' ? 2 : 0}}
            >
                <ToggleButton value="FIRST_HALF">1-15</ToggleButton>
                <ToggleButton value="SECOND_HALF">16-TUGASH</ToggleButton>
                <ToggleButton value="FULL_MONTH">OY</ToggleButton>
                <ToggleButton value="CUSTOM">O'zga</ToggleButton>
            </ToggleButtonGroup>

            {periodType === 'CUSTOM' && (
                <Box sx={{display: 'flex', gap: 2, mt: 2}}>
                    <TextField
                        label="С" type="date" fullWidth size="small"
                        InputLabelProps={{shrink: true}}
                        value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    />
                    <TextField
                        label="По" type="date" fullWidth size="small"
                        InputLabelProps={{shrink: true}}
                        value={customTo} onChange={e => setCustomTo(e.target.value)}
                    />
                </Box>
            )}
        </Paper>
    );
};