import {Avatar, Box, Paper, Tooltip, Typography} from '@mui/material';
import {eachDayOfInterval, format, isWeekend, parseISO} from 'date-fns';
import {uz} from 'date-fns/locale';

import {AttendanceCell} from './AttendanceCell';
import {formatDuration} from '../../../../lib/formatDate';
import type {AttendanceGridResponseDto, EmployeeGridRowDto, GridDayDto} from '../../types';

interface AttendanceHeatmapProps {
    data: AttendanceGridResponseDto;
    onCellClick: (employeeId: number, date: string) => void;
    onEmployeeClick: (employeeId: number) => void;
}

// Константы размеров
const NAME_COL_WIDTH = 130; // Узкая колонка для мобилок
const DATE_COL_WIDTH = 54;
const SUMMARY_COL_WIDTH = 70; // Ширина итоговых колонок

export const AttendanceHeatmap = ({data, onCellClick, onEmployeeClick}: AttendanceHeatmapProps) => {
    const startDate = parseISO(data.fromDate);
    const endDate = parseISO(data.toDate);

    const daysInPeriod = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    return (
        <Paper elevation={0} variant="outlined" sx={{width: '100%', overflow: 'hidden', borderRadius: 2}}>
            <Box sx={{overflowX: 'auto', position: 'relative'}}>
                <Box sx={{display: 'inline-block', minWidth: '100%'}}>

                    {/* === ШАПКА === */}
                    <Box sx={{display: 'flex', borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa'}}>

                        {/* 1. Имя (Sticky) */}
                        <Box sx={{
                            position: 'sticky', left: 0, zIndex: 20, bgcolor: '#f8f9fa',
                            width: NAME_COL_WIDTH,
                            p: 1,
                            borderRight: '1px solid #e0e0e0',
                            fontSize: '0.75rem', fontWeight: 'bold', color: 'text.secondary',
                            display: 'flex', alignItems: 'center',
                            boxShadow: '4px 0 8px -4px rgba(0,0,0,0.1)'
                        }}>
                            Xodim {/* Сотрудник */}
                        </Box>

                        {/* 2. Даты */}
                        {daysInPeriod.map((date) => {
                            const isWeekEnd = isWeekend(date);
                            return (
                                <Box key={date.toString()} sx={{
                                    width: DATE_COL_WIDTH,
                                    p: 0.5,
                                    textAlign: 'center',
                                    flexShrink: 0,
                                    borderRight: '1px solid #eee',
                                    bgcolor: isWeekEnd ? '#ffebee' : 'transparent',
                                    color: isWeekEnd ? 'error.main' : 'text.primary'
                                }}>
                                    <Typography variant="caption" display="block"
                                                sx={{textTransform: 'uppercase', opacity: 0.7, fontSize: '0.65rem'}}>
                                        {format(date, 'EE', {locale: uz})}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{fontSize: '0.8rem'}}>
                                        {format(date, 'd')}
                                    </Typography>
                                </Box>
                            );
                        })}

                        {/* 3. Итоговые заголовки */}
                        <Box sx={{
                            width: SUMMARY_COL_WIDTH,
                            p: 1,
                            borderRight: '1px solid #eee',
                            textAlign: 'center',
                            bgcolor: '#fff3e0'
                        }}>
                            <Typography variant="caption" fontWeight="bold"
                                        sx={{lineHeight: 1.1, display: 'block', fontSize: '0.65rem'}}>
                                Kamchilik {/* Недоработка */}
                            </Typography>
                        </Box>
                        <Box sx={{width: SUMMARY_COL_WIDTH, p: 1, textAlign: 'center', bgcolor: '#f3e5f5'}}>
                            <Typography variant="caption" fontWeight="bold"
                                        sx={{lineHeight: 1.1, display: 'block', fontSize: '0.65rem'}}>
                                Ortiqcha {/* Переработка */}
                            </Typography>
                        </Box>
                    </Box>

                    {/* === ТЕЛО === */}
                    {data.rows.map((row: EmployeeGridRowDto) => (
                        <Box key={row.employeeId}
                             sx={{display: 'flex', borderBottom: '1px solid #eee', '&:hover': {bgcolor: '#fafafa'}}}>

                            {/* 1. Имя (Sticky) */}
                            <Box
                                onClick={() => onEmployeeClick(row.employeeId)}
                                sx={{
                                    position: 'sticky', left: 0, zIndex: 10, bgcolor: 'white',
                                    width: NAME_COL_WIDTH,
                                    p: 1,
                                    borderRight: '1px solid #e0e0e0',
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    boxShadow: '4px 0 8px -4px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    '&:hover': {bgcolor: '#f5f5f5'}
                                }}
                            >
                                <Avatar sx={{width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main'}}>
                                    {row.fullName.charAt(0)}
                                </Avatar>
                                <Box sx={{overflow: 'hidden'}}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.1,
                                            whiteSpace: 'normal', wordBreak: 'break-word' // Перенос слов
                                        }}
                                    >
                                        {row.fullName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap display="block"
                                                sx={{fontSize: '0.65rem'}}>
                                        {row.positionTitle}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* 2. Ячейки дней */}
                            {daysInPeriod.map((date) => {
                                const dateKey = format(date, 'yyyy-MM-dd');
                                const dayData: GridDayDto | undefined = row.days[dateKey];
                                return (
                                    <Box key={dateKey} sx={{
                                        width: DATE_COL_WIDTH,
                                        p: 0,
                                        flexShrink: 0,
                                        borderRight: '1px solid #f0f0f0'
                                    }}>
                                        <AttendanceCell
                                            dayData={dayData}
                                            onClick={() => onCellClick(row.employeeId, dateKey)}
                                        />
                                    </Box>
                                );
                            })}

                            {/* 3. Итоговые данные */}
                            <Tooltip title={`Jami kamchilik: ${row.totalShortcomingMinutes} daqiqa`}>
                                <Box sx={{
                                    width: SUMMARY_COL_WIDTH, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRight: '1px solid #eee', bgcolor: '#fff3e0', color: '#ed6c02',
                                    fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    {formatDuration(row.totalShortcomingMinutes)}
                                </Box>
                            </Tooltip>

                            <Tooltip title={`Jami ortiqcha ish: ${row.totalOvertimeMinutes} daqiqa`}>
                                <Box sx={{
                                    width: SUMMARY_COL_WIDTH, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: '#f3e5f5', color: '#9c27b0',
                                    fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    {formatDuration(row.totalOvertimeMinutes)}
                                </Box>
                            </Tooltip>

                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
};