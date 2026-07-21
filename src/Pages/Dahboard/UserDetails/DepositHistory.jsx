import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import apiClient from "../../../api/apiClient";
import CustomTable from "../CustomTable/CustomTable";
import Pagination from "../../../components/ui/Pagination";
import "./UserDetails.css";

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

const DepositHistory = () => {
    const { userData } = useUser();

    // Deposit state (client-side pagination)
    const [historyData, setHistoryData] = useState([]);
    const [filteredDepositData, setFilteredDepositData] = useState([]);
    const [depositSearchTerm, setDepositSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    // Client-side pagination for deposit
    const [depositCurrentPage, setDepositCurrentPage] = useState(1);
    const depositItemsPerPage = 10;

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return localStorage.getItem("selectedCurrency") || "USD";
    });

    const filterType = "ALL";
    const regno = Number(userData?.regno || localStorage.getItem("regno"));

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

    // ========== DEPOSIT: Fetch all data once (client-side pagination) ==========
    const fetchAllDepositData = async () => {
        if (!regno) return [];
        try {
            const res = await apiClient.get("/Dashboard/topup-wallet-report", {
                params: { regno, type: "ALL", pageIndex: 1, pageSize: 10000 }
            });
            const data = res.data?.data?.data || [];
            setHistoryData(data);
            return data;
        } catch (err) {
            console.log("ERROR fetching deposit data:", err);
            return [];
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchAllDepositData();
            setLoading(false);
        };
        if (regno) fetchData();
    }, [regno]);

    // Apply deposit filter (client-side)
    useEffect(() => {
        applyDepositFilter(historyData, filterType, depositSearchTerm);
        setDepositCurrentPage(1);
    }, [filterType, historyData, depositSearchTerm]);

    const applyDepositFilter = (data, type, searchTerm) => {
        if (!data || data.length === 0) {
            setFilteredDepositData([]);
            return;
        }
        let result = [...data];
        if (searchTerm) {
            result = result.filter(item =>
                JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (type === "P2P") {
            result = result.filter(item =>
                item.transType?.toLowerCase().includes("transfer") ||
                item.Remark?.toLowerCase().includes("p2p") ||
                item.remark?.toLowerCase().includes("p2p") ||
                item.Remark?.toLowerCase().includes("deposit to deposit")
            );
        } else if (type === "SELF") {
            result = result.filter(item =>
                item.transType?.toLowerCase().includes("self") ||
                item.Remark?.toLowerCase().includes("self") ||
                item.remark?.toLowerCase().includes("income to deposit") ||
                item.Remark?.toLowerCase().includes("self transfer")
            );
        }
        setFilteredDepositData(result);
    };

    // Deposit pagination helpers (client-side)
    const depositTotalRecords = filteredDepositData.length;
    const depositTotalPages = Math.ceil(depositTotalRecords / depositItemsPerPage);
    const depositStartIndex = (depositCurrentPage - 1) * depositItemsPerPage;
    const depositCurrentItems = filteredDepositData.slice(depositStartIndex, depositStartIndex + depositItemsPerPage);

    const goToDepositPage = (page) => {
        if (page >= 1 && page <= depositTotalPages) setDepositCurrentPage(page);
    };

    // Calculate total balance
    const totalBalance = historyData.reduce((sum, item) => {
        const credit = parseFloat(item.credit) || 0;
        const debit = parseFloat(item.debit) || 0;
        return sum + credit - debit;
    }, 0);

    const getColumns = () => ["Sl.No.", "Date", "Credit", "Debit", "Remark"];

    const getTitle = () => {
        if (filterType === "P2P") return "P2P Transfer History (Deposit to Deposit)";
        if (filterType === "SELF") return "Self Transfer History (Deposit to Deposit)";
        return "Deposit Wallet History";
    };

    const renderRow = (item, idx) => {
        const serial = depositStartIndex + idx + 1;
        return (
            <tr key={idx}>
                <td className="text-center">
                    <div className="sr-no-circle">{serial}</div>
                </td>
                <td>{item.dt || "-"}</td>
                <td className="credit">
                    <span className="currency1" data-value={item.credit || 0}>
                        {formatCurrency(item.credit || 0)}
                    </span>
                </td>
                <td className="debit">
                    <span className="currency1" data-value={item.debit || 0}>
                        {formatCurrency(item.debit || 0)}
                    </span>
                </td>
                <td className="text-muted" title={item.remark || item.Remark || "-"}>
                    {item.remark || item.Remark || "-"}
                </td>
            </tr>
        );
    };

    return (
        <div className="container-fluid p-3 mb-5">
            <div className="report-card p-3">
                <h3 className="fw-bold mb-4">{getTitle()}</h3>

                <div className="entries-search-bar entries-control">
                    <div className="entries-control">
                        <div className="p-2" style={{ fontWeight: "500" }}>
                            Total Balance: 
                            <span className="currency1" data-value={totalBalance}>
                                {formatCurrency(totalBalance)}
                            </span>
                        </div>
                    </div>
                    <div className="search-wrapper p-2">
                        <input 
                            className="search-wrapper" 
                            placeholder="Search records..."
                            value={depositSearchTerm}
                            onChange={(e) => setDepositSearchTerm(e.target.value)}
                            style={{ 
                                backgroundColor: "var(--inputcolor)", 
                                minWidth: "250px", 
                                borderRadius: "8px", 
                                border: "1px solid rgba(102, 126, 234, 0.2)",
                                padding: "8px 12px"
                            }} 
                        />
                    </div>
                </div>

                <CustomTable columns={getColumns()} loading={loading}>
                    {depositCurrentItems.length > 0 ? (
                        depositCurrentItems.map((item, idx) => renderRow(item, idx))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">
                                {loading ? "Loading..." : "No data available"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {/* ✅ Pagination Component - Reusable */}
                {depositTotalPages > 1 && (
                    <Pagination
                        pageIndex={depositCurrentPage}
                        totalPages={depositTotalPages}
                        onPageChange={goToDepositPage}
                        siblingCount={1}
                    />
                )}
            </div>
        </div>
    );
};

export default DepositHistory;