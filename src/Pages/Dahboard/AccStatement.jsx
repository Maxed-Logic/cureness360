import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import CustomTable from "./CustomTable/CustomTable";
import Pagination from "../../components/ui/Pagination";
import apiClient from "../../api/apiClient";
import './sidebardetails/UserDetails.css';

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

const AccStatement = () => {
    const location = useLocation();
    const columns = ["Sl.No.","Date","Credit",  "Debit",  "Type", "status"];

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

    // Currency State
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem("selectedCurrency") || "USD";
    });

    // Get type from URL
    const queryParams = new URLSearchParams(location.search);
    const urlType = queryParams.get("type") || "ALL";

    const stateType = location.state?.transtype || location.state?.type;

    // Map URL param to correct API value
    let initialSelectedType = urlType;

    if (urlType === "fundtransfer") {
        initialSelectedType = "Fund Transfer";
    }
    if (stateType === "Fund Transfer" || stateType === "FUND TRANSFER" || stateType === "fundtransfer") {
        initialSelectedType = "Fund Transfer";
    }

    const [selectedType, setSelectedType] = useState(initialSelectedType);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);

    const regno = sessionStorage.getItem("regno");

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

    // Function to get API param value from display type
    const getApiTypeValue = (displayType) => {
        const typeMap = {
            "ALL": "ALL",
            "Fund Transfer": "Fund Transfer",
            "FUND WITHDRAWAL": "FUND WITHDRAWAL",
            "INSURANCE FEE": "INSURANCE FEE",
            "LEVEL INCOME": "LEVEL INCOME",
            "LOST IB INCOME": "LOST IB INCOME",
            "MATCHING INCOME": "MATCHING INCOME",
            "TRADING PASSIVE INCOME": "TRADING PASSIVE INCOME"
        };
        return typeMap[displayType] || displayType;
    };

    // Function to get display name
    const getTypeDisplayName = (typeValue) => {
        const typeMap = {
            "ALL": "All Transactions",
            "Fund Transfer": "Fund Transfer",
            "FUND WITHDRAWAL": "Fund Withdrawal",
            "INSURANCE FEE": "Insurance Fee",
            "LEVEL INCOME": "Level Income",
            "LOST IB INCOME": "Lost IB Income",
            "MATCHING INCOME": "Matching Income",
            "TRADING PASSIVE INCOME": "Trading Passive Income"
        };
        return typeMap[typeValue] || typeValue;
    };

    useEffect(() => {
        fetchStatement();
    }, [pageIndex, selectedType]);

    useEffect(() => {
        const newTypeParam = queryParams.get("type") || "ALL";
        let newType = newTypeParam;

        if (newTypeParam === "fundtransfer") {
            newType = "Fund Transfer";
        }

        if (newType !== selectedType && !location.state?.transtype) {
            setSelectedType(newType);
            setPageIndex(1);
        }
    }, [location.search]);

    const fetchStatement = async () => {
        try {
            setLoading(true);
            const apiType = getApiTypeValue(selectedType);
            const response = await apiClient.get("/Dashboard/income-report", {
                params: {
                    regno: regno,
                    transtype: apiType,
                    pageIndex: pageIndex,
                    pageSize: pageSize,
                },
            });
            const apiData = response.data?.data?.data || [];
            const total = response.data?.data?.recordCount || 0;
            setTableData(apiData);
            setTotalRecords(total);
            setHasNextPage(apiData.length === pageSize);
        } catch (error) {
            console.error("API Error:", error);
            setTableData([]);
            setHasNextPage(false);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        setSelectedType(newType);
        setPageIndex(1);

        let urlParam = newType;
        if (newType === "Fund Transfer") {
            urlParam = "fundtransfer";
        }

        const url = new URL(window.location);
        url.searchParams.set("type", urlParam);
        window.history.pushState({}, "", url);
    };

    const totalPages = Math.ceil(totalRecords / pageSize);

    return (
        <div className="container-fluid p-2 mb-5">
            <div className="report-card p-3">
                {/* <h3 className="fw-bold mb-4">{getTypeDisplayName(selectedType)} Statement</h3> */}
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold mb-4">
                        {getTypeDisplayName(selectedType)} Statement
                    </h3>

                    <Link
                        to="/dashboard/flush-income"
                        className="btn btn-primary mb-4"
                    >
                        Flush/Lost Income
                    </Link>
                </div>

                <div className="entries-search-bar entries-control">
                    <div className="">
                        <select
                            className="form-select w-auto"
                            value={selectedType}
                            onChange={handleTypeChange}
                        >
                            <option value="ALL">--Select--</option>
                            <option value="Fund Transfer">Fund Transfer</option>
                            <option value="FUND WITHDRAWAL">Fund Withdrawal</option>
                            <option value="INSURANCE FEE">Insurance Fee</option>
                            <option value="LEVEL INCOME">Level Income</option>
                            <option value="LOST IB INCOME">Lost IB Income</option>
                            <option value="MATCHING INCOME">Matching Income</option>
                            <option value="TRADING PASSIVE INCOME">Trading Passive Income</option>
                        </select>
                    </div>
                    <div className="search-control mt-2 mb-2">
                        <input type="text" placeholder="Search..." />
                    </div>
                </div>

                <CustomTable columns={columns} loading={loading}>
                    {tableData.length > 0 ? (
                        tableData.map((item, index) => (
                            <tr key={item.id || index}>
                                <td className="text-center">
                                    <div className="sr-no-circle">{(pageIndex - 1) * pageSize + index + 1}</div>
                                </td>
                                                       <td>
                                    {item.TransDate
                                        ? new Date(item.TransDate).toLocaleString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: false,
                                        })
                                        : ""}
                                </td>
                                {/* ✅ Fixed - Credit amount with currency conversion */}
                                <td className="text-success">
                                    <span className="currency1" data-value={item.credit || 0}>
                                        {formatCurrency(item.credit || 0)}
                                    </span>
                                </td>
                                {/* ✅ Fixed - Debit amount with currency conversion */}
                                <td className="text-danger">
                                    <span className="currency1" data-value={item.debit || 0}>
                                        {formatCurrency(item.debit || 0)}
                                    </span>
                                </td>
         
                                <td>{item.transType}</td>
                          <td className="remark-cell" title={item.status || ""}>
  {item.status ? (
    <span
      className={`status-badge01 ${
        item.status.toLowerCase().includes("approved")
          ? "status-approved"
          : item.status.toLowerCase().includes("pending")
          ? "status-pending"
          : ""
      }`}
    >
      {item.status.split(" ").slice(0, 3).join(" ") +
        (item.status.split(" ").length > 3 ? "..." : "")}
    </span>
  ) : (
    ""
  )}
</td>
                             </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">
                                {loading ? "Loading..." : "No data available in table"}
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

export default AccStatement;