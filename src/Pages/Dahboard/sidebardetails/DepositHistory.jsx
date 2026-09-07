import React, { useState, useEffect } from "react";
import { useUser } from "../../../context/UserContext";
import apiClient from "../../../api/apiClient";
import CustomTable from "../CustomTable/CustomTable";
import Pagination from "../../../components/ui/Pagination";
import "./UserDetails.css";


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


    const filterType = "ALL";
    const regno = Number(userData?.regno || sessionStorage.getItem("regno"));

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
                        ${item.credit || 0}
                    </span>
                </td>
                <td className="debit">
                    <span className="currency1" data-value={item.debit || 0}>
                        ${item.debit || 0}
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
                                {totalBalance}
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