
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomTable from "./CustomTable/CustomTable";
import Pagination from "../../components/ui/Pagination";
import apiClient from "../../api/apiClient";
import "./sidebardetails/UserDetails.css";

// Currency Configuration
const currencyRates = {
    USD: 1,
    INR: 90,
    EUR: 0.92,
    GBP: 0.78,
};

const currencySymbols = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
};

const FlushIncomeReport = () => {
    // -----------------------------
    // State
    // -----------------------------
    const [flushTypes, setFlushTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("");

    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [typeLoading, setTypeLoading] = useState(false);

    const [totalRecords, setTotalRecords] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);

    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        return sessionStorage.getItem("selectedCurrency") || "USD";
    });

    const regno = sessionStorage.getItem("regno");

    // -----------------------------
    // Table Columns
    // -----------------------------
    const columns = [
        "Sl.No.",
        "Flush/Lost",
        "Date",
        "Type",
        "Remark",
    ];

    // -----------------------------
    // Currency
    // -----------------------------
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || amount === "") {
            amount = 0;
        }

        const numericAmount = Number(amount) || 0;

        const converted =
            numericAmount * (currencyRates[selectedCurrency] || 1);

        return `${currencySymbols[selectedCurrency] || "$"}${converted.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    // -----------------------------
    // Currency Change
    // -----------------------------
    const changeCurrency = (currency) => {
        sessionStorage.setItem("selectedCurrency", currency);

        setSelectedCurrency(currency);
    };

    // -----------------------------
    // Listen Currency Change
    // -----------------------------
    useEffect(() => {
        const handleCurrencyChange = () => {
            const newCurrency =
                sessionStorage.getItem("selectedCurrency") || "USD";

            setSelectedCurrency(newCurrency);
        };

        window.addEventListener("currencyChanged", handleCurrencyChange);

        return () => {
            window.removeEventListener(
                "currencyChanged",
                handleCurrencyChange
            );
        };
    }, []);

    // -----------------------------
    // Get Flush Income Types
    // -----------------------------
    const fetchFlushIncomeTypes = async () => {
        try {
            setTypeLoading(true);

            const response = await apiClient.get(
                "/Dashboard/flush-income-type"
            );

            console.log("Flush Income Types:", response);

            const types = response.data?.data?.data || [];

            setFlushTypes(types);

            // Select first type automatically
            if (types.length > 0) {
                setSelectedType(types[0]);
            }
        } catch (error) {
            console.error("Flush Income Type API Error:", error);

            setFlushTypes([]);
            setSelectedType("");
        } finally {
            setTypeLoading(false);
        }
    };

    // -----------------------------
    // Get Flush Income Report
    // -----------------------------
    const fetchFlushIncomeReport = async () => {
        if (!regno || !selectedType) {
            setTableData([]);
            setTotalRecords(0);
            return;
        }

        try {
            setLoading(true);

            const response = await apiClient.get(
                "/Dashboard/flush-income-report",
                {
                    params: {
                        regno: Number(regno),
                        transtype: selectedType,
                        pageNumber: pageNumber,
                        pageSize: pageSize,
                    },
                }
            );

            console.log("Flush Income Report:", response);

            const apiData = response.data?.data?.data || [];

            const total =
                response.data?.data?.recordCount ||
                response.data?.data?.totalRecords ||
                0;

            setTableData(apiData);
            setTotalRecords(total);
        } catch (error) {
            console.error("Flush Income Report API Error:", error);

            setTableData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // Load Types On Page Load
    // -----------------------------
    useEffect(() => {
        fetchFlushIncomeTypes();
    }, []);

    // -----------------------------
    // Load Report
    // -----------------------------
    useEffect(() => {
        if (selectedType) {
            fetchFlushIncomeReport();
        }
    }, [selectedType, pageNumber]);

    // -----------------------------
    // Dropdown Change
    // -----------------------------
    const handleTypeChange = (event) => {
        const newType = event.target.value;

        setSelectedType(newType);
        setPageNumber(1);
    };

    // -----------------------------
    // Total Pages
    // -----------------------------
    const totalPages = Math.ceil(totalRecords / pageSize);

    // -----------------------------
    // Date Format
    // -----------------------------
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    // -----------------------------
    // Status Badge
    // -----------------------------
    const getStatusClass = (status) => {
        if (!status) return "";

        const value = status.toLowerCase();

        if (value.includes("approved")) {
            return "status-approved";
        }

        if (value.includes("pending")) {
            return "status-pending";
        }

        if (
            value.includes("reject") ||
            value.includes("failed") ||
            value.includes("cancel")
        ) {
            return "status-rejected";
        }

        return "";
    };

    return (
        <div className="container-fluid p-2 mb-5">
            <div className="report-card p-3">

                {/* Header */}
                    <h3 className="fw-bold mb-4">
                        {selectedType || "Flush Income"} Statement
                    </h3>


                {/* Controls */}
                <div className="entries-search-bar entries-control">
                    <div>
                        <select
                            className="form-select w-auto"
                            value={selectedType}
                            onChange={handleTypeChange}
                            disabled={typeLoading || flushTypes.length === 0}
                        >
                            {typeLoading ? (
                                <option value="">
                                    Loading types...
                                </option>
                            ) : flushTypes.length === 0 ? (
                                <option value="">
                                    No flush type found
                                </option>
                            ) : (
                                <>
                                    <option value="">
                                        -- Select Flush Type --
                                    </option>

                                    {flushTypes.map((type, index) => (
                                        <option
                                            key={`${type}-${index}`}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <CustomTable
                    columns={columns}
                    loading={loading}
                >
                    {tableData.length > 0 ? (
                        tableData.map((item, index) => (
                            <tr
                                key={
                                    item.Payid ||
                                    `${item.regno}-${index}`
                                }
                            >
                                {/* Sl No */}
                                <td className="text-center">
                                    <div className="sr-no-circle">
                                        {item.RowNumber ||
                                            (pageNumber - 1) *
                                                pageSize +
                                                index +
                                                1}
                                    </div>
                                </td>

                              {/* Credit / Debit */} <td style={{ textAlign: "center" }}> <span className="currency1" data-value={item.tramount || 0} style={{ color: "red" }} > {Number(item.tramount) > 0 ? formatCurrency(item.credit || 0) : formatCurrency(item.debit || 0)} </span> </td>

                                {/* Date */}
                                <td>
                                    {formatDate(item.TransDate)}
                                </td>
                                {/* Transaction Type */}
                                <td>
                                    {item.transType || "-"}
                                </td>

                                {/* Remark */}
                                <td
                                    className="remark-cell"
                                    title={item.Remark || ""}
                                    style={{
                                        maxWidth: "300px",
                                        whiteSpace: "normal",
                                    }}
                                >
                                    {item.Remark || "-"}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="12"
                                className="text-center"
                            >
                                {loading
                                    ? "Loading..."
                                    : "No data available in table"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        pageIndex={pageNumber}
                        totalPages={totalPages}
                        onPageChange={setPageNumber}
                        siblingCount={1}
                        showFirstLast={true}
                    />
                )}
            </div>
        </div>
    );
};

export default FlushIncomeReport;