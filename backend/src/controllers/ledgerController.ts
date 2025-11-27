import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ValidationError } from '../utils/errors.js';
import {
  getLedgerTransactions,
  getLedgerStats,
  generateLedgerCSV,
  LedgerFilters,
} from '../services/transactionService.js';
import { TransactionCategory, TransactionStatus } from '../types/index.js';

// Get public ledger (no authentication required)
export const getLedger = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const category = req.query.category as TransactionCategory | undefined;
    const status = req.query.status as TransactionStatus | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const vendor = req.query.vendor as string | undefined;

    if (limit > 100) {
      throw new ValidationError('limit cannot exceed 100');
    }

    if (category && !['RENT', 'TRANSPORT', 'TECH'].includes(category)) {
      throw new ValidationError('Invalid category. Must be one of: RENT, TRANSPORT, TECH');
    }

    if (status && !['PENDING', 'CLEARED'].includes(status)) {
      throw new ValidationError('Invalid status. Must be one of: PENDING, CLEARED');
    }

    if (startDate && isNaN(startDate.getTime())) {
      throw new ValidationError('Invalid startDate format');
    }

    if (endDate && isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid endDate format');
    }

    const filters: LedgerFilters = {
      category,
      status,
      startDate,
      endDate,
      vendor,
    };

    const { transactions, total } = await getLedgerTransactions(filters, limit, offset);

    res.json({
      transactions: transactions.map((tx) => ({
        id: tx.id,
        timestamp: tx.created_at,
        category: tx.category,
        amount: parseFloat(tx.amount.toString()),
        vendor: tx.vendor,
        recipientHash: tx.recipient_hash,
        status: tx.status,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
});

// Get ledger statistics
export const getStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const stats = await getLedgerStats();

    res.json({
      stats: {
        totalAmount: stats.totalAmount,
        totalTransactions: stats.totalTransactions,
        byCategory: stats.byCategory,
        byStatus: stats.byStatus,
      },
    });
});

// Export ledger as CSV
export const exportCSV = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = req.query.category as TransactionCategory | undefined;
    const status = req.query.status as TransactionStatus | undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    if (category && !['RENT', 'TRANSPORT', 'TECH'].includes(category)) {
      throw new ValidationError('Invalid category');
    }

    if (status && !['PENDING', 'CLEARED'].includes(status)) {
      throw new ValidationError('Invalid status');
    }

    if (startDate && isNaN(startDate.getTime())) {
      throw new ValidationError('Invalid startDate format');
    }

    if (endDate && isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid endDate format');
    }

    const filters: LedgerFilters = {
      category,
      status,
      startDate,
      endDate,
    };

    const csv = await generateLedgerCSV(filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="secondwind-ledger-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
});
