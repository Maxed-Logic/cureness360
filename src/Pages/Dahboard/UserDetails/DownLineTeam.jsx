import React, { useState, useEffect } from "react";
import apiClient from "../../../api/apiClient";
import CustomTable from "../CustomTable/CustomTable";
import Pagination from "../../../components/ui/Pagination";
import "./UserDetails.css";
import { Link } from "react-router-dom";

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

const DownlineTeam = () => {
    const [level, setLevel] = useState(0);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalBusiness, setTotalBusiness] = useState(0);
    const pageSize = 10;
    const regno = localStorage.getItem("regno");

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return localStorage.getItem("selectedCurrency") || "USD";
    });

    // Function to format currency
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return `${currencySymbols[selectedCurrency]}0.00`;
        const converted = amount * currencyRates[selectedCurrency];
        return `${currencySymbols[selectedCurrency]}${converted.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Function to update all currency elements
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

        return () => {
            window.removeEventListener('currencyChanged', handleCurrencyChange);
        };
    }, []);

    // Initialize currency on mount
    useEffect(() => {
        let savedCurrency = localStorage.getItem("selectedCurrency") || "USD";
        setSelectedCurrency(savedCurrency);

        setTimeout(() => {
            changeCurrency(savedCurrency);
        }, 100);
    }, []);

    // ================= API =================
    const fetchUsers = async (selectedLevel, page) => {
        if (!regno) return;
        setLoading(true);
        try {
            let findlvl;
            if (selectedLevel === 0) {
                findlvl = 0;
            } else {
                findlvl = selectedLevel;
            }

            const payload = {
                mregno: Number(regno),
                type: 1,
                findlvl: findlvl,
                pageIndex: page,
                pageSize: pageSize,
            };

            const response = await apiClient.post("/Dashboard/downline-team", payload);
            console.log("📥 DownLine-Api:", response?.data);

            const resData = response?.data?.data?.data || [];
            let count = response?.data?.data?.recordCount || 0;
            let business = response?.data?.data?.totalBusiness || 0;

            setUsers(resData);
            setTotalRecords(count);
            setTotalBusiness(business);

        } catch (error) {
            console.error("API Error:", error);
            setUsers([]);
            setTotalRecords(0);
            setTotalBusiness(0);
        } finally {
            setLoading(false);
        }
    };

    // Reset to page 1 when level changes
    useEffect(() => {
        setPageIndex(1);
    }, [level]);

    // Fetch users when level or pageIndex changes
    useEffect(() => {
        fetchUsers(level, pageIndex);
    }, [level, pageIndex]);

    // ================= FILTER =================
    const filteredUsers = users.filter(
        (u) =>
            u.loginid?.toLowerCase().includes(search.toLowerCase()) ||
            u.Name?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination calculation
    const totalPages = Math.ceil(totalRecords / pageSize);

    const columns = ["Sl.No.", "DOWNLINE INFO", "SPONSOR", "INVESTED AMOUNT", "STATUS", "Action"];

    return (
        <div className="downline-main-wrapper mb-5">
            <h3 className="mt-4 mb-4">All Downline Team</h3>

            {/* TOP BOX */}
            <div
                className="p-3 mb-2 d-flex justify-content-between flex-wrap"
                style={{
                    background: "linear-gradient(to right, var(--primary-clr), var(--secondary-clr))",
                    color: "#fff",
                    borderRadius: "10px",
                }}
            >
                <div>
                    <label>Select Level</label>
                    <select
                        className="form-select w-auto"
                        style={{ backgroundColor: "var(--inputcolor)" }}
                        value={level}
                        onChange={(e) => {
                            setLevel(Number(e.target.value));
                        }}
                    >
                        <option value={0}>All Levels</option>
                        {Array.from({ length: 30 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <p>Total Team: {totalRecords}</p>
                    <p>Total Business:
                        <span className="currency1" data-value={totalBusiness}>
                            {formatCurrency(totalBusiness)}
                        </span>
                    </p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="d-flex justify-content-end mb-2">
                <input
                    className="form-control w-auto"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ backgroundColor: "var(--inputcolor)" }}
                />
            </div>

            {/* TABLE */}
            <div className="report-card">
                <CustomTable columns={columns} loading={loading}>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user, index) => {
                            const serialNo = (pageIndex - 1) * pageSize + index + 1;
                            const formattedNo = serialNo.toString().padStart(2, "0");

                            return (
                                <tr key={user.regno || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle mx-auto">
                                            {formattedNo}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="user-name-text">{user.loginid || "N/A"}</div>
                                        <div className="user-id-subtext">{user.name || "N/A"}</div>
                                    </td>
                                    <td className="text-center">
                                        <div className="sponsor-id-text">{user.Sponsor || "N/A"}</div>
                                        <div className="user-id-subtext">{user.introName || "N/A"}</div>
                                    </td>
                                    <td className="text-center">
                                        <div className="amount-text-green currency1" data-value={user.FundInvest || 0}>
                                            {formatCurrency(user.FundInvest || 0)}
                                        </div>
                                        <div className="date-subtext">
                                            {user.TopupDate || "-"}
                                        </div>
                                    </td>
                                    <td className="pe-3">
                                        <div className={`status-pill mx-auto ${user.kitPrice > 0 ? "active" : "inactive"}`}>
                                            <span className="dot"></span>
                                            {user.kitPrice > 0 ? "Active" : "Inactive"}
                                        </div>
                                    </td>
                                    <td className="pe-3">
                                        <Link
                                            to={`/dashboard/downlineUserHistory?regno=${user.regno}&loginid=${user.loginid}`}
                                            className="capital-payout-btn"
                                            style={{ padding: "12px 20px" }}
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-5">
                                {loading ? "Loading..." : "No records found"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {/* ✅ PAGINATION COMPONENT */}
                {totalPages > 1 && (
                    <Pagination
                        pageIndex={pageIndex}
                        totalPages={totalPages}
                        onPageChange={setPageIndex}
                        siblingCount={1}
                        showFirstLast={true}
                    />
                )}
            </div>
        </div>
    );
};

export default DownlineTeam;