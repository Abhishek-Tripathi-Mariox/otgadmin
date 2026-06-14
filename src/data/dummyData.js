// Dummy Data
export const dummyVendors = [
  { id: 1, name: 'ABC Construction', mobile: '9876543210', email: 'abc@example.com', address: '123 Main St, City', status: 'active' },
  { id: 2, name: 'XYZ Materials', mobile: '9123456789', email: 'xyz@example.com', address: '456 Oak Ave, Town', status: 'active' },
  { id: 3, name: 'Prime Supplies', mobile: '9988776655', email: 'prime@example.com', address: '789 Pine Rd, Village', status: 'inactive' },
  { id: 4, name: 'Quality Builders', mobile: '9765432109', email: 'quality@example.com', address: '321 Elm St, Metro', status: 'active' },
  { id: 5, name: 'Rapid Logistics', mobile: '9654321098', email: 'rapid@example.com', address: '654 Birch Lane, City', status: 'active' },
];

export const dummyCategories = [
  { id: 1, name: 'Cement & Binders', status: 'active' },
  { id: 2, name: 'Aggregates', status: 'active' },
  { id: 3, name: 'Steel & Metal', status: 'active' },
  { id: 4, name: 'Wood & Timber', status: 'inactive' },
  { id: 5, name: 'Glass & Ceramics', status: 'active' },
];

export const dummySubCategories = [
  { id: 1, categoryId: 1, name: 'Ordinary Portland Cement', status: 'active' },
  { id: 2, categoryId: 1, name: 'White Cement', status: 'active' },
  { id: 3, categoryId: 2, name: 'River Sand', status: 'active' },
  { id: 4, categoryId: 2, name: 'Coarse Aggregate', status: 'active' },
  { id: 5, categoryId: 3, name: 'Reinforcement Bars', status: 'active' },
  { id: 6, categoryId: 3, name: 'Steel Plates', status: 'inactive' },
];

export const dummyMaterials = [
  { id: 1, categoryId: 1, subCategoryId: 1, name: 'Cement Bag 50kg', price: 450, unit: 'bag', description: 'High quality Portland cement', status: 'active' },
  { id: 2, categoryId: 1, subCategoryId: 2, name: 'White Cement 20kg', price: 850, unit: 'bag', description: 'Premium white cement for finishing', status: 'active' },
  { id: 3, categoryId: 2, subCategoryId: 3, name: 'River Sand', price: 350, unit: 'ton', description: 'Fine river sand for construction', status: 'active' },
  { id: 4, categoryId: 3, subCategoryId: 5, name: 'TMT Steel Bar 12mm', price: 65, unit: 'kg', description: 'High tensile strength steel bars', status: 'active' },
  { id: 5, categoryId: 2, subCategoryId: 4, name: 'Coarse Aggregate 20mm', price: 400, unit: 'ton', description: 'Machine crushed coarse aggregate', status: 'inactive' },
];

export const dummyDashboardStats = {
  totalVendors: dummyVendors.length,
  activeVendors: dummyVendors.filter(v => v.status === 'active').length,
  totalCategories: dummyCategories.length,
  totalMaterials: dummyMaterials.length,
  activeCategories: dummyCategories.filter(c => c.status === 'active').length,
};
