import React, { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import apiClient from '../../../api/apiClient';
import CustomTable from '../CustomTable/CustomTable';
import Pagination from '../../../components/ui/Pagination';
// import './CapitalPayoutHistory.css';

// Currency Configuration
const currencyRates = {
    USD: 1,
    INR: 90,
    EUR: 0.92,
    GBP: 0.78
};

const currencySymbols = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£"
};

const CapitalPayoutHistory = () => {
    const { userData, loading: userLoading } = useUser();

    // Helper to get regno from context or sessionStorage
    const getRegNo = () => {
        if (userData?.regno) return userData.regno || userData.Regno;
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsed = JSON.parse(storedUserData);
                if (parsed.regno) return parsed.regno || parsed.Regno;
            } catch (e) { }
        }
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user?.Regno) return user.Regno || user.regno;
        return sessionStorage.getItem('regno') || '1';
    };

    const regno = getRegNo();

    // State
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Pagination & filter state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem("selectedCurrency") || "USD";
    });

    // Format currency function
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return `${currencySymbols[selectedCurrency]}0.00`;
        const converted = amount * currencyRates[selectedCurrency];
        return `${currencySymbols[selectedCurrency]}${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Update all currency elements
    const changeCurrency = (currency) => {
        sessionStorage.setItem("selectedCurrency", currency);
        document.querySelectorAll(".currency1").forEach(function (el) {
            let amount = parseFloat(el.getAttribute("data-value"));
            if (isNaN(amount)) {
                let text = el.innerText;
                let match = text.match(/(\d+(?:\.\d+)?)/);
                amount = match ? parseFloat(match[1]) : 0;
            }
            if (!isNaN(amount)) {
                let converted = amount * currencyRates[currency];
                el.innerHTML = currencySymbols[currency] + converted.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        });
    };

    // Listen for currency changes from Header
    useEffect(() => {
        const handleCurrencyChange = () => {
            let newCurrency = sessionStorage.getItem("selectedCurrency") || "USD";
            setSelectedCurrency(newCurrency);
            changeCurrency(newCurrency);
        };
        window.addEventListener('currencyChanged', handleCurrencyChange);
        return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
    }, []);

    // Initialize currency on mount
    useEffect(() => {
        let savedCurrency = sessionStorage.getItem("selectedCurrency") || "USD";
        setSelectedCurrency(savedCurrency);
        setTimeout(() => changeCurrency(savedCurrency), 100);
    }, []);

    // Fetch data when regno is available
    useEffect(() => {
        if (!regno) return;
        const fetchHistory = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await apiClient.get(`/IncomePayout/capital-payout-history/${regno}`);
                if (response.data?.success) {
                    const data = response.data.response?.data || [];
                    const formatted = data.map((item, idx) => ({
                        id: idx,
                        debit: item.debit || 0,
                        date: item.TransDate,
                        type: item.transType,
                        remark: item.Remark,
                        status: item.status,
                    }));
                    setHistory(formatted);
                } else {
                    setError(response.data?.message || 'Failed to load data');
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Server error');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [regno]);

    // Reset page when search or items per page changes
    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm, itemsPerPage]);

    // Filter records based on search term
    const filteredHistory = history.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (item.debit?.toString().toLowerCase().includes(searchLower)) ||
            (item.date?.toLowerCase().includes(searchLower)) ||
            (item.type?.toLowerCase().includes(searchLower)) ||
            (item.remark?.toLowerCase().includes(searchLower)) ||
            (item.status?.toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentData = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

    // Table columns
    const columns = ['SI.No.', 'Debit', 'Date', 'Type', 'Remark', 'Status'];

    // Build table rows
    const tableRows = currentData.map((item, idx) => {
        const serialNo = startIndex + idx + 1;
        const formattedDate = item.date !== '-' && item.date
            ? new Date(item.date).toLocaleDateString('en-GB')
            : '-';
        const statusClass = (item.status || 'pending').toLowerCase();

        return (
            <tr key={item.id}>
                <td className="text-center">
                    <div className="sr-no-circle">{serialNo}</div>
                </td>
                {/* ✅ Debit - currency conversion */}
                <td className="text-center amount-cell">
                    <span className="currency1" data-value={item.debit || 0}>
                        {formatCurrency(item.debit || 0)}
                    </span>
                </td>
                <td className="text-center">{formattedDate}</td>
                <td className="text-center">{item.type || '-'}</td>
                <td className="text-center">{item.remark || '-'}</td>
                <td className="text-center">
                    <span className={`status-badge ${statusClass}`}>
                        {item.status || 'Pending'}
                    </span>
                </td>
            </tr>
        );
    });

    if (userLoading) {
        return <div className="p-4 text-center">Loading user...</div>;
    }

    return (
        <div className="downline-main-wrapper capital-payout-history-wrapper p-4">
            <h4 className="mb-4">Capital Payout History</h4>

            {/* Filter Bar */}
            <div className="entries-search-bar entries-control">
                <div className="entries-control">
                    <label>Show entries:</label>
                    <select
                        className="form-select"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                        {[10, 25, 50, 75, 100].map((n) => (
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

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <CustomTable columns={columns} loading={loading} emptyMessage="No payout records found.">
                {tableRows}
            </CustomTable>

            {/* ✅ Reusable Pagination Component */}
            {filteredHistory.length > 0 && totalPages > 1 && (
                <Pagination
                    pageIndex={pageIndex}
                    totalPages={totalPages}
                    onPageChange={setPageIndex}
                    siblingCount={1}
                />
            )}
        </div>
    );
};

export default CapitalPayoutHistory;