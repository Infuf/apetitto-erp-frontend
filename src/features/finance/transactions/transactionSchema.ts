import {z} from 'zod';
import {OPERATION_CONFIG} from './transactionConfig';
import type {TransactionType} from '../types';

export const transactionSchema = z.object({
    amount: z.coerce.number().positive('Сумма должна быть больше 0'),
    operationType: z.custom<TransactionType>(),
    transactionDate: z.date(),
    description: z.string().optional(),

    fromAccountId: z.number().nullable(),
    toAccountId: z.number().nullable(),
    categoryId: z.number().nullable(),
    subCategoryId: z.number().nullable(),
}).superRefine((data, ctx) => {
    const config = OPERATION_CONFIG[data.operationType];

    if (config.requiresFrom && !data.fromAccountId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Выберите счет списания",
            path: ["fromAccountId"],
        });
    }

    if (config.requiresTo && !data.toAccountId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Выберите счет зачисления",
            path: ["toAccountId"],
        });
    }

    if (config.requiresFrom && config.requiresTo && data.fromAccountId === data.toAccountId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Счета списания и зачисления не могут совпадать",
            path: ["toAccountId"],
        });
    }

    if (config.requiresCategory && !data.categoryId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Выберите категорию",
            path: ["categoryId"],
        });
    }
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
