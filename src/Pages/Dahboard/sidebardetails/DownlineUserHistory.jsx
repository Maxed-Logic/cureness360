import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import apiClient from "../../../api/apiClient";
import CustomTable from "../CustomTable/CustomTable";
import Pagination from "../../../components/ui/Pagination";
import "./UserDetails.css";

// Currency Configuration
const currencyRates = {
    USD: 1,
    INR: 90,

};

const currencySymbols = {
    USD: "$",
    INR: "₹",
};

const DownlineUserHistory = () => {
    const { userData } = useUser();
    const [searchParams] = useSearchParams();
    const targetRegno = searchParams.get("regno");
    const targetLoginid = searchParams.get("loginid");

    const [downlineData, setDownlineData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem("selectedCurrency") || "USD";
    });

    const columns = ["S.No.", "DOWNLINE INFO", "SPONSOR", "INVESTED AMOUNT", "Status"];

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

        return () => {
            window.removeEventListener('currencyChanged', handleCurrencyChange);
        };
    }, []);

    // Initialize currency on mount
    useEffect(() => {
        let savedCurrency = sessionStorage.getItem("selectedCurrency") || "USD";
        setSelectedCurrency(savedCurrency);

        setTimeout(() => {
            changeCurrency(savedCurrency);
        }, 100);
    }, []);

    // Fetch downline data
    useEffect(() => {
        const fetchDownline = async () => {
            const regno = targetRegno || userData?.regno || userData?.Regno;
            if (!regno) {
                setDownlineData([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const payload = {
                    mregno: Number(regno),
                    type: 1,
                    findlvl: 1,
                    pageIndex: 1,
                    pageSize: 100,
                };
                const response = await apiClient.post("/Dashboard/member-downline-team", payload);
                let apiData = response?.data?.data?.data || [];
                if (apiData.length === 0) {
                    setDownlineData([]);
                    setLoading(false);
                    return;
                }
                const records = apiData.map((item) => ({
                    id: item.regno,
                    loginid: item.loginid || "N/A",
                    name: item.Name || "N/A",
                    regno: item.regno,
                    sponsor: item.Sponsor || "N/A",
                    sponsername: item.sponsername || "N/A",
                    fundInvest: item.FundInvest || 0,
                    status: item.kitPrice > 0 ? "Active" : "Inactive",
                }));
                setDownlineData(records);
            } catch (err) {
                console.error("API Error:", err);
                setDownlineData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDownline();
    }, [targetRegno, userData]);

    // Filter & pagination
    const filteredData = useMemo(() => {
        if (!searchTerm) return downlineData;
        const lower = searchTerm.toLowerCase();
        return downlineData.filter(
            (row) =>
                row.loginid.toLowerCase().includes(lower) ||
                row.name.toLowerCase().includes(lower) ||
                row.sponsor.toLowerCase().includes(lower)
        );
    }, [downlineData, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm, itemsPerPage]);

    return (
        <div className="downline-main-wrapper downline-history-container p-3 mb-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
                <h2>
                    Downline User{" "}
                    {targetRegno ? `( ${targetLoginid || "N/A"} )` : ""}
                </h2>
            </div>

            <div className="entries-control d-flex justify-content-between flex-wrap mb-3 gap-2">
                <div className="d-flex gap-2 entries-control">
                    <label>Show entries:</label>
                    <select
                        className="form-select w-auto"
                        value={itemsPerPage}
                        onChange={e => setItemsPerPage(Number(e.target.value))}
                    >
                        {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <input
                    className="form-control w-auto"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-responsive">
                <CustomTable columns={columns} loading={loading} loaderSize="md" loaderText="Loading downline...">
                    {!loading && currentRecords.map((row, idx) => (
                        <tr key={row.id}>
                            <td className="text-center">
                                <div className="sr-no-circle mx-auto">{startIndex + idx + 1}</div>
                            </td>
                            <td className="text-center">
                                <div className="user-name-text">{row.loginid}</div>
                                <div className="user-id-subtext">{row.name}</div>
                            </td>
                            <td className="text-center">
                                <div className="sponsor-id-text">{row.sponsor}</div>
                                <div className="user-id-subtext">{row.sponsername}</div>
                            </td>
                            <td className="text-center">
                                <div className="amount-text-green currency1" data-value={row.fundInvest}>
                                    {formatCurrency(row.fundInvest)}
                                </div>
                            </td>
                            <td className="text-center">
                                <div className={`status-pill mx-auto ${row.status === "Active" ? "active" : "inactive"}`}>
                                    <span className="dot"></span> {row.status}
                                </div>
                            </td>
                        </tr>
                    ))}
                </CustomTable>
            </div>

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
    );
};

export default DownlineUserHistory;