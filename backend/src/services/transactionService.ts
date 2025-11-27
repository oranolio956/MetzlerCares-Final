import { getDatabasePool } from '../config/database.js';
import { Transaction, TransactionCategory, TransactionStatus } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { DatabaseError, ValidationError, NotFoundError } from '../utils/errors.js';

export interface CreateTransactionInput {
  donationId: string | null;
  category: TransactionCategory;
  amount: number;
  vendor: string;
  recipientHash?: string;
}

export const createTransaction = async (input: CreateTransactionInput): Promise<Transaction> => {
  const pool = getDatabasePool();

  // Validate input
  if (input.amount <= 0) {
    throw new ValidationError('Transaction amount must be greater than 0');
  }

  const validCategories: TransactionCategory[] = ['RENT', 'TRANSPORT', 'TECH'];
  if (!validCategories.includes(input.category)) {
    throw new ValidationError(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  if (!input.vendor || input.vendor.trim().length === 0) {
    throw new ValidationError('Vendor name is required');
  }

  if (input.vendor.length > 255) {
    throw new ValidationError('Vendor name must be 255 characters or less');
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (donation_id, category, amount, vendor, recipient_hash, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [
        input.donationId,
        input.category,
        input.amount,
        input.vendor.trim(),
        input.recipientHash || null,
      ]
    );

    logger.info('Transaction created:', {
      transactionId: result.rows[0].id,
      category: input.category,
      amount: input.amount,
      vendor: input.vendor,
    });

    return result.rows[0];
  } catch (error: any) {
    logger.error('Failed to create transaction:', error);
    if (error.code === '23503') {
      throw new ValidationError('Invalid donation ID');
    }
    throw new DatabaseError('Failed to create transaction');
  }
};

export const updateTransactionStatus = async (
  id: string,
  status: TransactionStatus
): Promise<Transaction> => {
  const pool = getDatabasePool();

  try {
    const result = await pool.query(
      `UPDATE transactions 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Transaction');
    }

    logger.info('Transaction status updated:', { transactionId: id, status });
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Failed to update transaction status:', error);
    throw new DatabaseError('Failed to update transaction status');
  }
};

export interface LedgerFilters {
  category?: TransactionCategory;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  vendor?: string;
}

export const getLedgerTransactions = async (
  filters: LedgerFilters = {},
  limit: number = 50,
  offset: number = 0
): Promise<{ transactions: Transaction[]; total: number }> => {
  const pool = getDatabasePool();

  try {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.category) {
      whereClause += ` AND category = $${paramCount++}`;
      params.push(filters.category);
    }

    if (filters.status) {
      whereClause += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.startDate) {
      whereClause += ` AND created_at >= $${paramCount++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ` AND created_at <= $${paramCount++}`;
      params.push(filters.endDate);
    }

    if (filters.vendor) {
      whereClause += ` AND vendor ILIKE $${paramCount++}`;
      params.push(`%${filters.vendor}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM transactions ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get transactions
    const dataQuery = `SELECT * FROM transactions ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);
    const result = await pool.query(dataQuery, params);

    return {
      transactions: result.rows,
      total,
    };
  } catch (error) {
    logger.error('Failed to get ledger transactions:', error);
    throw new DatabaseError('Failed to fetch ledger transactions');
  }
};

export const getLedgerStats = async (): Promise<{
  totalAmount: number;
  totalTransactions: number;
  byCategory: Record<TransactionCategory, number>;
  byStatus: Record<TransactionStatus, number>;
}> => {
  const pool = getDatabasePool();

  try {
    // Get totals
    const totalsResult = await pool.query(
      `SELECT 
         COALESCE(SUM(amount), 0) as total_amount,
         COUNT(*) as total_transactions
       FROM transactions`
    );

    const totalAmount = parseFloat(totalsResult.rows[0]?.total_amount || '0');
    const totalTransactions = parseInt(totalsResult.rows[0]?.total_transactions || '0', 10);

    // Get by category
    const categoryResult = await pool.query(
      `SELECT category, SUM(amount) as category_total
       FROM transactions
       GROUP BY category`
    );

    const byCategory: Record<TransactionCategory, number> = {
      RENT: 0,
      TRANSPORT: 0,
      TECH: 0,
    };

    categoryResult.rows.forEach((row) => {
      if (row.category && byCategory.hasOwnProperty(row.category)) {
        byCategory[row.category as TransactionCategory] = parseFloat(row.category_total || '0');
      }
    });

    // Get by status
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as status_count
       FROM transactions
       GROUP BY status`
    );

    const byStatus: Record<TransactionStatus, number> = {
      PENDING: 0,
      CLEARED: 0,
    };

    statusResult.rows.forEach((row) => {
      if (row.status && byStatus.hasOwnProperty(row.status)) {
        byStatus[row.status as TransactionStatus] = parseInt(row.status_count || '0', 10);
      }
    });

    return {
      totalAmount,
      totalTransactions,
      byCategory,
      byStatus,
    };
  } catch (error) {
    logger.error('Failed to get ledger stats:', error);
    throw new DatabaseError('Failed to fetch ledger statistics');
  }
};

// Generate CSV export
export const generateLedgerCSV = async (filters: LedgerFilters = {}): Promise<string> => {
  const pool = getDatabasePool();

  try {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.category) {
      whereClause += ` AND category = $${paramCount++}`;
      params.push(filters.category);
    }

    if (filters.status) {
      whereClause += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.startDate) {
      whereClause += ` AND created_at >= $${paramCount++}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ` AND created_at <= $${paramCount++}`;
      params.push(filters.endDate);
    }

    const query = `SELECT 
      id,
      created_at,
      category,
      amount,
      vendor,
      status,
      recipient_hash
    FROM transactions 
    ${whereClause}
    ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    // Generate CSV
    const headers = ['ID', 'Timestamp', 'Category', 'Amount', 'Vendor', 'Status', 'Recipient Hash'];
    const rows = result.rows.map((row) => [
      row.id,
      new Date(row.created_at).toISOString(),
      row.category,
      row.amount,
      row.vendor,
      row.status,
      row.recipient_hash || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  } catch (error) {
    logger.error('Failed to generate ledger CSV:', error);
    throw new DatabaseError('Failed to generate CSV export');
  }
};
