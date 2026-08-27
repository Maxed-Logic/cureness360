import React, { useState, useEffect, useCallback } from 'react';
import CustomTable from '../CustomTable/CustomTable';
import Pagination from '../../../components/ui/Pagination';

const Smartwallethistory = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination state
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Transaction type filter
  const [transactionType, setTransactionType] = useState("all");


  
  // Transaction types for dropdown
  const transactionTypes = [
    { value: "all", label: "--Select--" },
    { value: "Level Income", label: "Level Income" },
    { value: "Matching Income", label: "Matching Income" },
    { value: "IB Income", label: "IB Income" },
    { value: "Invest", label: "Investment" },
    { value: "Balance Deposit", label: "Balance Deposit" },
    { value: "Balance Transfer", label: "Balance Transfer" },
    { value: "Fund Deduct", label: "Fund Deduct" }
  ];

  // API call function
  const fetchSmartWalletData = useCallback(async (page = 1, size = 10, transType = "all") => {
    setLoading(true);
    setError(null);
    
    try {
      const regno = sessionStorage.getItem("regno");
      const token = sessionStorage.getItem("token");
      
      if (!regno || !token) {
        throw new Error("Authentication required. Please login again.");
      }

      // Build URL with all parameters
      const url = new URL('https://api.mangowealthplanner.com/api/IncomePayout/smart-wallet');
      url.searchParams.append('regno', regno);
      url.searchParams.append('pageIndex', page);
      url.searchParams.append('pageSize', size);
      url.searchParams.append('transtype', transType);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        },
        // Empty body as per API
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setTableData(result.data.data || []);
        setTotalRecords(result.data.totalRecords || 0);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
      setTableData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data when pageIndex, pageSize, or transactionType changes
  useEffect(() => {
    fetchSmartWalletData(pageIndex, pageSize, transactionType);
  }, [pageIndex, pageSize, transactionType, fetchSmartWalletData]);

  // Reset to first page when pageSize or transactionType changes
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setPageIndex(1);
  };

  // Handle transaction type filter change
  const handleTransactionTypeChange = (e) => {
    const newType = e.target.value;
    setTransactionType(newType);
    setPageIndex(1); // Reset to first page
    // Clear search when filter changes
    setSearchTerm("");
  };

  // Handle search (client-side filtering)
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Don't reset page for client-side search
  };

  // Filter records based on search term (client-side filtering)
  const filteredRecords = tableData.filter((row) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      (row.transType && row.transType.toLowerCase().includes(searchLower)) ||
      (row.remark && row.remark.toLowerCase().includes(searchLower)) ||
      (row.Dt && row.Dt.toLowerCase().includes(searchLower)) ||
      (row.credit !== undefined && row.credit.toString().includes(searchLower)) ||
      (row.debit !== undefined && row.debit.toString().includes(searchLower))
    );
  });

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalRecords / pageSize);
  
  // For display purposes - showing filtered data with pagination
  const startIndex = (pageIndex - 1) * pageSize;
  const currentRecords = filteredRecords.slice(0, pageSize);

  // Columns for the table
  const columns = ['Sl.No.', 'Date', 'Credit', 'Debit', 'Transaction Type', 'Remark'];

  // Format amount function
  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) return '00';
    return `$${Number(amount).toFixed(2)}`;
  };

  // Get status class for transaction type
  const getTransactionTypeClass = (type) => {
    const classes = {
      'Level Income': 'status-level',
      'Matching Income': 'status-matching',
      'IB Income': 'status-ib',
      'Invest': 'status-invest',
      'Balance Deposit': 'status-deposit',
      'Balance Transfer': 'status-transfer',
      'Fund Deduct': 'status-deduct',
      'Default': 'status-other'
    };
    return classes[type] || classes['Default'];
  };

  return (
    <div className="downline-main-wrapper mb-5 smartwallet-main-wrapper">
      <h3 className="mb-3">Smart Wallet History</h3>



      {/* Controls Row */}
      <div className="entries-search-bar entries-control mb-3">
        {/* Left side - Filter controls */}
        <div className="d-flex align-items-center gap-3 flex-wrap">

          {/* Transaction Type Filter */}
          <div className="filter-control d-flex align-items-center">
            <select 
              className="form-select form-select-sm" 
              value={transactionType}
              onChange={handleTransactionTypeChange}
              style={{ minWidth: '150px' }}
            >
              {transactionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side - Search */}
        <div className="search-wrapper">
          <input
            className="form-control search-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="report-card">
        <CustomTable columns={columns} loading={loading} emptyMessage="No transaction history found">
          {currentRecords.length > 0 ? (
            currentRecords.map((item, index) => {
              const hasCredit = item.credit > 0 && item.credit !== null;
              const hasDebit = item.debit > 0 && item.debit !== null;
              
              return (
                <tr key={index} className="transaction-row">
                  <td className="text-center">
                    <div className="sr-no-circle">
                      {String(startIndex + index + 1).padStart(2, '0')}
                    </div>
                  </td>
                  <td>{item.Dt || '-'}</td>
                  <td className={hasCredit ? 'amount-credit text-success' : 'text-muted'}>
                    {hasCredit ? formatAmount(item.credit) : '00'}
                  </td>
                  <td className={hasDebit ? 'amount-debit text-danger' : 'text-muted'}>
                    {hasDebit ? formatAmount(item.debit) : '00'}
                  </td>
                  <td>
                    <span className={`status-badge ${getTransactionTypeClass(item.transType)}`}>
                      {item.transType || '-'}
                    </span>
                  </td>
                  <td className="text-start" style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                    {item.remark || '-'}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                {loading ? (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "No records found"
                )}
              </td>
            </tr>
          )}
        </CustomTable>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="pagination-wrapper mt-3">
            <Pagination
              pageIndex={pageIndex}
              totalPages={totalPages}
              onPageChange={setPageIndex}
              siblingCount={1}
              showFirstLast={true}
            />
            
            {/* Page info */}
            <div className="text-center text-muted small mt-2">
              Showing page {pageIndex} of {totalPages} 
              {totalRecords > 0 && ` (${totalRecords} total records)`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Smartwallethistory;