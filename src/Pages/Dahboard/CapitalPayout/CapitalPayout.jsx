import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CustomTable from "../CustomTable/CustomTable";
import { useUser } from "../../../context/UserContext";
import apiClient from "../../../api/apiClient";
import Pagination from "../../../components/ui/Pagination";
import "./CapitalPayout.css";

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

const CapitalPayout = () => {
    const { userData, loading: userLoading } = useUser();
    const regno = userData?.Regno || userData?.regno || userData?.regNo || localStorage.getItem("regno");

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return localStorage.getItem("selectedCurrency") || "USD";
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
        localStorage.setItem("selectedCurrency", currency);
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
            let newCurrency = localStorage.getItem("selectedCurrency") || "USD";
            setSelectedCurrency(newCurrency);
            changeCurrency(newCurrency);
        };
        window.addEventListener('currencyChanged', handleCurrencyChange);
        return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
    }, []);

    // Initialize currency on mount
    useEffect(() => {
        let savedCurrency = localStorage.getItem("selectedCurrency") || "USD";
        setSelectedCurrency(savedCurrency);
        setTimeout(() => changeCurrency(savedCurrency), 100);
    }, []);

    // Fetch data when regno is available
    useEffect(() => {
        if (regno) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const res = await apiClient.get(`/IncomePayout/capital-payout-status/${regno}`);
                    console.log("api", res);
                    if (res.data?.success && res.data?.response?.data) {
                        const mapped = res.data.response.data.map((item, idx) => ({
                            id: item.Rid || idx,
                            investmentDate: item.Rdate ? new Date(item.Rdate).toLocaleDateString("en-GB") : "-",
                            amount: item.Rkprice || 0,
                            profit: item.Rpayid || 0,
                            withdrawal: item.incomePercent,
                            remainingCapital: item.payout || 0,
                            remainingDays: item.Remainingdays ?? "-",
                        }));
                        setRecords(mapped);
                    } else {
                        setRecords([]);
                    }
                } catch (err) {
                    console.error(err);
                    setRecords([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else if (!userLoading && !regno) {
            setLoading(false);
        }
    }, [regno, userLoading]);

    // Filter & Pagination
    const filteredRecords = useMemo(() => {
        if (!searchTerm) return records;
        const lower = searchTerm.toLowerCase();
        return records.filter(row =>
            (row.investmentDate?.toLowerCase().includes(lower)) ||
            row.amount.toString().includes(lower) ||
            row.profit.toString().includes(lower) ||
            row.remainingCapital.toString().includes(lower)
        );
    }, [records, searchTerm]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const start = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(start, start + itemsPerPage);

    useEffect(() => setPageIndex(1), [searchTerm, itemsPerPage]);

    const columns = ["Sl.No.", "Investment Date", "Amount", "Profit", "Withdrawal", "Remaining Capital", "Remaining Days", "Action"];

    return (
        <div className="downline-main-wrapper report-container p-2 p-md-4 mb-5">
            <div className="mb-4 d-flex justify-content-between">
                <h2>Capital Status For Payout</h2>
                <Link to="/dashboard/CapitalPayoutHistory">
                    <div className="text-small mt-4">Capital Payout history</div>
                </Link>
            </div>

            {/* Controls */}
            <div className="entries-search-bar entries-control">
                <div className="entries-control">
                    <label>Show entries:</label>
                    <select className="form-select" value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))}>
                        {[10, 25, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="search-wrapper">
                    <input
                        className="form-control search-input"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="report-card">
                <CustomTable columns={columns} loading={loading} loaderSize="md" loaderText="Loading capital data...">
                    {!loading && currentRecords.length > 0 ? (
                        currentRecords.map((row, idx) => {
                            const isRemainingZero = Number(row.remainingDays) === 0;
                            return (
                                <tr key={row.id}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">{start + idx + 1}</div>
                                    </td>
                                    <td className="text-center">{row.investmentDate}</td>
                                    {/* Amount - currency conversion */}
                                    <td className="text-center amount-cell">
                                        <span className="currency1" data-value={row.amount}>
                                            {formatCurrency(row.amount)}
                                        </span>
                                    </td>
                                    {/* Profit - currency conversion */}
                                    <td className="text-center profit-cell">
                                        <span className="currency1" data-value={row.profit}>
                                            {formatCurrency(row.profit)}
                                        </span>
                                    </td>
                                    {/* Withdrawal - currency conversion */}
                                    <td className="text-center">
                                        <span className="currency1" data-value={row.withdrawal}>
                                            {formatCurrency(row.withdrawal)}
                                        </span>
                                    </td>
                                    {/* Remaining Capital - currency conversion */}
                                    <td className="text-center remaining-capital">
                                        <span className="currency1" data-value={row.remainingCapital}>
                                            {formatCurrency(row.remainingCapital)}
                                        </span>
                                    </td>
                                    <td className="text-center">{row.remainingDays === undefined ? "-" : row.remainingDays}</td>
                                    <td className="text-center">
                                        <Link to={isRemainingZero ? `/dashboard/capitalwithdrawalrequest?Capital=${row.id}` : "#"}>
                                            <button
                                                className="capital-payout-btn"
                                                disabled={!isRemainingZero}
                                                title={!isRemainingZero ? `Withdraw available only after remaining days become 0 (Current: ${row.remainingDays})` : "Click to withdraw capital"}
                                                style={{ opacity: !isRemainingZero ? 0.6 : 1, cursor: !isRemainingZero ? "not-allowed" : "pointer" }}
                                            >
                                                CAPITAL PAYOUT
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        !loading && (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4">
                                    No records found
                                </td>
                            </tr>
                        )
                    )}
                </CustomTable>

                {/* ✅ Reusable Pagination Component */}
                {totalPages > 1 && (
                    <Pagination
                        pageIndex={pageIndex}
                        totalPages={totalPages}
                        onPageChange={setPageIndex}
                        siblingCount={1}
                    />
                )}
            </div>
        </div>
    );
};

export default CapitalPayout;