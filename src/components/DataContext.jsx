import React, { createContext, useContext, useState } from 'react';
import { dummyVendors, dummyCategories, dummySubCategories, dummyMaterials, dummyDashboardStats } from '../data/dummyData';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [vendors, setVendors] = useState(dummyVendors);
  const [categories, setCategories] = useState(dummyCategories);
  const [subCategories, setSubCategories] = useState(dummySubCategories);
  const [materials, setMaterials] = useState(dummyMaterials);
  const [dashboardStats, setDashboardStats] = useState(dummyDashboardStats);

  return (
    <DataContext.Provider value={{ vendors, setVendors, categories, setCategories, subCategories, setSubCategories, materials, setMaterials, dashboardStats, setDashboardStats }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};

export default DataContext;
