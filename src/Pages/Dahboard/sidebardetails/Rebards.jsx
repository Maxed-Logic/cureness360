import React, { useEffect, useState } from "react";
import "./UserDetails.css";
import apiClient from "../../../api/apiClient";
import CustomTable from "../CustomTable/CustomTable";
import Pagination from "../../../components/ui/Pagination";

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

const BonusReport = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem("selectedCurrency") || "USD";
    });

    const regno = sessionStorage.getItem("regno");
    const token = sessionStorage.getItem("token");

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

    useEffect(() => {
        const fetchBonus = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(
                    `/Dashboard/member-reward/${regno}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (res.data.success) {
                    setRecords(res.data.data);
                } else {
                    setRecords([]);
                }
            } catch (error) {
                console.error("API Error:", error.response || error);
            } finally {
                setLoading(false);
            }
        };
        if (regno && token) {
            fetchBonus();
        }
    }, [regno, token]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.Ranks && row.Ranks.toLowerCase().includes(searchLower)) ||
            (row.rStatus && row.rStatus.toLowerCase().includes(searchLower)) ||
            (row.Bot100_amt && row.Bot100_amt.toString().toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when search term or items per page changes
    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm, itemsPerPage]);

    return (
        <div className="downline-main-wrapper mb-5">
            <div className="mb-4">
                <h3>Rewards Report</h3>
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

            <div className="report-card">
                <CustomTable
                    columns={[
                        "Sl.No.",
                        "RANK",
                        "MATCHING (P/O) TARGET",
                        "REMAINING (P/O) TARGET",
                        "REWARDS",
                        "STATUS",
                    ]}
                    loading={loading}
                >
                    {currentRecords.length > 0 ? (
                        currentRecords.map((row, index) => (
                            <tr key={row.rid}>
                                <td className="text-center">
                                    <div className="sr-no-circle">
                                        {startIndex + index + 1}
                                    </div>
                                </td>
                                <td>{row.Ranks}</td>
                                <td>{row.PowerLeg} / {row.OtherLeg}</td>
                                <td>{row.Remaining_PowerLeg || 0} / {row.Remaining_OtherLeg || 0}</td>
                                <td>
                                    <span className="currency1" style={{color: "green"}} data-value={row.Bot100_amt || 0}>
                                        {formatCurrency(row.Bot100_amt || 0)}
                                    </span>
                                </td>
                                <td
                                    style={{
                                        fontWeight: "600",
                                        color: row.rStatus === "Achieved" ? "green" : "red",
                                    }}
                                >
                                    {row.rStatus}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center py-4">
                                {loading ? "Loading..." : "No records found"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {/* Pagination Component */}
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

export default BonusReport;