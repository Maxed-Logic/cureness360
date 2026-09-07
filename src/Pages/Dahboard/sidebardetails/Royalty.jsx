import React, { useEffect, useState } from "react";
import apiClient from "../../../api/apiClient";
import CustomTable from "../CustomTable/CustomTable";
import Pagination from "../../../components/ui/Pagination";
import "./UserDetails.css";



const BonusReport = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);


    const regno = sessionStorage.getItem("regno");

    useEffect(() => {
        const fetchRoyalStatus = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(
                    `/Dashboard/member-royalty/${regno}`);
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
        if (regno) {
            fetchRoyalStatus();
        }
    }, [regno]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.Designation && row.Designation.toLowerCase().includes(searchLower)) ||
            (row.BusinessTarget && row.BusinessTarget.toString().toLowerCase().includes(searchLower)) ||
            (row.gift && row.gift.toString().toLowerCase().includes(searchLower)) ||
            (row.rStatus && row.rStatus.toLowerCase().includes(searchLower))
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

    const columns = [
        "Sl.No.",
        "RANK",
        "BUSINESS",
        "OTHER LEG",
        "ROYALTY",
        "STATUS",
    ];

    return (
        <div className="downline-main-wrapper mb-5">
            <h3 className="mb-3">Royal Status</h3>

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

            <div className="report-card">
                <CustomTable columns={columns} loading={loading}>
                    {currentRecords.length > 0 ? (
                        currentRecords.map((row, index) => (
                            <tr key={row.rid}>
                                <td className="text-center">
                                    <div className="sr-no-circle">
                                        {startIndex + index + 1}
                                    </div>
                                </td>

                                <td>{row.Designation}</td>

                                {/* ✅ Business - currency conversion */}
                                <td>
                                    <span className="currency1" data-value={row.BusinessTarget || 0}>
                                        ${row.BusinessTarget || 0}
                                    </span>
                                </td>

                                {/* ✅ Other Leg - currency conversion */}
                                <td>
                                    <span className="currency1" data-value={row.PowerLeg || 0}>
                                        ${row.PowerLeg || 0}
                                    </span>
                                    {" / "}
                                    <span className="currency1" data-value={row.Rem_powerLeg || 0}>
                                        ${row.Rem_powerLeg || 0}
                                    </span>
                                </td>

                                {/* ✅ Royalty - currency conversion */}
                                <td>
                                    {row.gift}                                  
                                </td>

                                <td
                                    style={{
                                        border: "2px double #e5e5e5",
                                        padding: "10px",
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
                            <td colSpan={columns.length} className="text-center py-4">
                                {loading ? "Loading..." : "No records found"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {/* ✅ Pagination Component */}
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