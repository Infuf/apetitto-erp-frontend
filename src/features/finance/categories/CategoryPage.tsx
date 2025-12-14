import {useState} from 'react';
import {
    Box, Typography, Button, Tabs, Tab, CircularProgress,
    Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Chip, Divider, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

import {useFinanceDirectories} from '../hooks/useFinanceDirectories';
import {CategoryForm, type CategoryFormValues} from './CategoryForm';
import type {FinanceCategory} from '../types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = ({children, value, index, ...other}: TabPanelProps) => (
    <div role="tabpanel" hidden={value !== index} {...other} style={{paddingTop: 20}}>
        {value === index && <Box>{children}</Box>}
    </div>
);

export const CategoriesPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [parentCategory, setParentCategory] = useState<FinanceCategory | null>(null);

    const {categories, isLoadingCategories, createCategory, createSubCategory} = useFinanceDirectories();

    const handleOpenCreateModal = () => {
        setParentCategory(null);
        setIsModalOpen(true);
    };

    const handleOpenSubCategoryModal = (
        e: React.MouseEvent<HTMLElement>,
        category: FinanceCategory
    ) => {
        e.stopPropagation();
        setParentCategory(category);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (data: CategoryFormValues, parentId: number | null) => {
        if (parentId) {
            createSubCategory.mutate({categoryId: parentId, name: data.name}, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createCategory.mutate(data, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const incomeCategories = categories.filter(c => c.type === 'INCOME');
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

    const renderCategoryList = (list: FinanceCategory[]) => {
        if (list.length === 0) {
            return <Typography color="text.secondary" align="center" sx={{mt: 4}}>В этом разделе пока нет
                категорий.</Typography>;
        }

        return (
            <Box>
                {list.map((category) => (
                    <Accordion key={category.id} disableGutters elevation={1}
                               sx={{mb: 1, '&:before': {display: 'none'}}}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Box sx={{display: 'flex', alignItems: 'center', width: '100%', pr: 2}}>
                                <FolderIcon color={category.type === 'INCOME' ? 'success' : 'error'} sx={{mr: 2}}/>
                                <Box sx={{flexGrow: 1}}>
                                    <Typography variant="subtitle1">{category.name}</Typography>
                                    {category.description && (
                                        <Typography variant="caption"
                                                    color="text.secondary">{category.description}</Typography>
                                    )}
                                </Box>
                                <Chip
                                    label={`${category.subcategories.length} подкат.`}
                                    size="small"
                                    variant="outlined"
                                    sx={{mr: 2}}
                                />
                                <IconButton
                                    component="span"
                                    size="small"
                                    onClick={(e) => handleOpenSubCategoryModal(e, category)}
                                >
                                    <AddIcon fontSize="small"/>
                                </IconButton>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{bgcolor: '#fafafa', p: 0}}>
                            <List dense>
                                {category.subcategories.length > 0 ? (
                                    category.subcategories.map((sub) => (
                                        <div key={sub.id}>
                                            <Divider component="li"/>
                                            <ListItem sx={{pl: 4}}>
                                                <SubdirectoryArrowRightIcon color="action" sx={{mr: 2, fontSize: 20}}/>
                                                <ListItemText
                                                    primary={sub.name}
                                                />
                                            </ListItem>
                                        </div>
                                    ))
                                ) : (
                                    <ListItem sx={{pl: 4}}>
                                        <ListItemText secondary="Нет подкатегорий"/>
                                    </ListItem>
                                )}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        );
    };

    if (isLoadingCategories) return <CircularProgress/>;

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h4" component="h1">Статьи доходов и расходов</Typography>
                <Button variant="contained" startIcon={<AddIcon/>} onClick={handleOpenCreateModal}>
                    Новая категория
                </Button>
            </Box>

            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
                    <Tab label="Доходы (INCOME)"/>
                    <Tab label="Расходы (EXPENSE)"/>
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                {renderCategoryList(incomeCategories)}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                {renderCategoryList(expenseCategories)}
            </TabPanel>

            <CategoryForm
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                isSubmitting={createCategory.isPending || createSubCategory.isPending}
                parentCategory={parentCategory}
                defaultType={tabValue === 0 ? 'INCOME' : 'EXPENSE'}
            />
        </Box>
    );
};