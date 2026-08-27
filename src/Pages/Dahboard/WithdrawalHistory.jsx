import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import CustomTable from './CustomTable/CustomTable';


const WithdrawalHistory = () => {
    const [loading, setLoading] = useState(true);
    const [withdrawals, setWithdrawals] = useState([]);
    const [error, setError] = useState(null);
    // ✅ Yeh states add karo
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [pageIndex, setPageIndex] = useState(1);

    const getRegNo = () => sessionStorage.getItem('regno');

    const fetchWithdrawalHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const regno = getRegNo();
            if (!regno) {
                setError('User not logged in');
                setLoading(false);
                return;
            }
            const response = await apiClient.get('/IncomePayout/withdraw-request-report', {
                params: { regno: regno, transtype: 'FUND WITHDRAWAL' }
            });
            if (response.data?.success && response.data?.response?.tradingHistory) {
                setWithdrawals(response.data.response.tradingHistory);
            } else {
                setWithdrawals([]);
                setError(response.data?.message || 'No data found');
            }
        } catch (err) {
            console.error('Error fetching withdrawal history:', err);
            setError(err.response?.data?.message || 'Failed to load withdrawal history');
            setWithdrawals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawalHistory();
    }, []);

    // ✅ Filter records based on search term (all columns)
    const filteredRecords = withdrawals.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            item.status?.toLowerCase().includes(searchLower) ||
            new Date(item.TransDate).toLocaleDateString('en-GB').includes(searchLower) ||
            `$${item.debit}`.includes(searchLower) ||
            `$${item.handlingcharge}`.includes(searchLower) ||
            `$${item.netPayable}`.includes(searchLower)
        );
    });

    // ✅ Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    // Reset to first page when search or items per page changes
    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm, itemsPerPage]);

    const goToPreviousPage = () => pageIndex > 1 && setPageIndex(pageIndex - 1);
    const goToNextPage = () => pageIndex < totalPages && setPageIndex(pageIndex + 1);

    const getPagination = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= pageIndex - delta && i <= pageIndex + delta)) {
                range.push(i);
            }
        }
        range.forEach((i) => {
            if (l) {
                if (i - l === 2) rangeWithDots.push(l + 1);
                else if (i - l !== 1) rangeWithDots.push('...');
            }
            rangeWithDots.push(i);
            l = i;
        });
        return rangeWithDots;
    };

    const columns = ['S.No.', 'Date', 'Total Withdrawal', 'Admin Charge', 'Net Payable', 'Status'];

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '$0.00';
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    return (
        <div className="downline-main-wrapper withdrawal-history-container p-4 mb-4">
            <div className="d-flex justify-content-between mb-3">
                <h2 className="withdrawal-title mb-3">Withdrawal Release</h2>
            </div>


            <div className="entries-search-bar entries-control">
                <div className="entries-control">
                    <label>Show entries:</label>
                    <select
                        className="form-select"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                        {[10, 25, 50, 75, 100].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
                <div className="search-wrapper">
                    <input
                        className="form-control search-input"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="withdrawal-table-wrapper">
                <CustomTable
                    columns={columns}
                    loading={loading}
                    emptyMessage={error || "No withdrawal requests found"}
                    loaderSize="md"
                    loaderText="Loading withdrawals..."
                >
                    {currentRecords.map((item, index) => (
                        <tr key={item.Payid || index}>
                            <td className="text-center">
                                <div className="sr-no-circle">{startIndex + index + 1}</div>
                            </td>
                            <td>{formatDate(item.TransDate)}</td>
                            <td>{formatCurrency(item.debit)}</td>
                            <td>{formatCurrency(item.handlingcharge)}</td>
                            <td>{formatCurrency(item.netPayable)}</td>
                            <td>
                                <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                                    {item.status || 'Pending'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </CustomTable>
            </div>

            {/* ✅ Pagination buttons */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-5 mb-3 flex-wrap gap-md-2">
                    <button onClick={goToPreviousPage} disabled={pageIndex === 1} className="pagination-btn">←</button>
                    {getPagination().map((page, i) => (
                        <button
                            key={i}
                            disabled={page === '...'}
                            onClick={() => page !== '...' && setPageIndex(page)}
                            className={`pagination-btn ${pageIndex === page ? 'active' : ''}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button onClick={goToNextPage} disabled={pageIndex === totalPages} className="pagination-btn">→</button>
                </div>
            )}
        </div>
    );
};

export default WithdrawalHistory;