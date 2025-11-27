import { TransactionCategory, ImpactType } from '../types/index.js';

/**
 * Map impact type to transaction category
 */
export const mapImpactToCategory = (impactType: ImpactType): TransactionCategory => {
  const mapping: Record<ImpactType, TransactionCategory> = {
    home: 'RENT',
    commute: 'TRANSPORT',
    tech: 'TECH',
  };
  return mapping[impactType] || 'TECH';
};

/**
 * Get default vendor name based on impact type
 */
export const getDefaultVendor = (impactType: ImpactType): string => {
  const vendors: Record<ImpactType, string> = {
    home: 'Oxford House / SafeHaven',
    commute: 'RTD Denver',
    tech: 'TechReuse Corp',
  };
  return vendors[impactType] || 'Verified Vendor';
};

/**
 * Get vendor category based on impact type
 */
export const getVendorCategory = (impactType: ImpactType): TransactionCategory => {
  return mapImpactToCategory(impactType);
};
