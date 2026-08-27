import React, { useEffect, useState } from "react";
// import "./UserDetails.css";
import apiClient from "../../api/apiClient";
import CustomTable from "./CustomTable/CustomTable";

const BonusReport = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pageIndex, setPageIndex] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const regno = sessionStorage.getItem("regno");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchBonus = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get(
          `/Dashboard/self-trading-history/${regno}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Validate the response data structure
        if (res.data && res.data.data) {
          // Get the tradingHistory array from the response
          const tradingData = res.data.data.tradingHistory;
        
          // Ensure we're setting an array
          const dataArray = Array.isArray(tradingData) ? tradingData : [];
          setRecords(dataArray);
        } else {
          setRecords([]);
          if (res.data && !res.data.success) {
            setError(res.data.message || "Failed to fetch data");
          }
        }
      } catch (error) {
        console.error("API Error:", error.response || error);
        setError(error.response?.data?.message || "An error occurred while fetching data");
        setRecords([]);
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
      (row.Rdate && row.Rdate.toLowerCase().includes(searchLower)) ||
      (row.paymode && row.paymode.toLowerCase().includes(searchLower)) ||
      (row.Rkprice && row.Rkprice.toString().toLowerCase().includes(searchLower)) ||
      (row.Rkid && row.Rkid.toString().toLowerCase().includes(searchLower))
    );
  });

  // Pagination logic
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (pageIndex - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset to first page when search term or items per page changes
  useEffect(() => {
    setPageIndex(1);
  }, [searchTerm, itemsPerPage]);

  // Navigation functions
  const goToPreviousPage = () => {
    if (pageIndex > 1) {
      setPageIndex(pageIndex - 1);
    }
  };

  const goToNextPage = () => {
    if (pageIndex < totalPages) {
      setPageIndex(pageIndex + 1);
    }
  };

  // Generate page numbers with ellipsis
  const getPagination = () => {
    if (totalPages <= 1) return [];
    
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= pageIndex - delta && i <= pageIndex + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setPageIndex(1);
  };

  // Format date if needed
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="report-container p-2 p-md-4 mb-5">
        <div className="mb-3">
          <h2>Investment Statement</h2>
        </div>
        <hr style={{ border: "1px solid #282727" }} />
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="downline-main-wrapper report-container p-2 p-md-4 mb-5">
      
      {/* Heading */}
      <div className="mb-3">
        <h2>Investment Statement</h2>
      </div>
      <hr style={{ border: "1px solid #282727" }} />

      {/* Search and Items per page */}
      <div className="entries-search-bar entries-control">
        <div className="entries-control">
          <label>Show entries:</label>
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={75}>75</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <input
            className="form-control"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              backgroundColor: "var(--inputcolor)",
              minWidth: "200px",
              borderRadius: "8px",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="report-card">
        <CustomTable
          columns={[
            "Sl.No.",
            "Investment Date",
            "Amount",
            "For Locking",
            "Invest Mode",
          ]}
          loading={loading}
        >
          {currentRecords.length > 0 ? (
            currentRecords.map((row, index) => (
              <tr key={row.Rid || index}>
                
                {/* Sl.No with proper pagination */}
                <td className="text-center">
                  <div className="sr-no-circle">
                    {startIndex + index + 1}
                  </div>
                </td>
                
                <td>{formatDate(row.Rdate)}</td>
                <td>${row.Rkprice || 0}</td>
                <td>{row.expDate || "Standard"}</td>
                <td>{row.paymode || row.paymentmode || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-4">
                {loading ? "Loading..." : "No records found"}
              </td>
            </tr>
          )}
        </CustomTable>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center mt-5 mb-3 flex-wrap gap-md-2">
    
            <button
              onClick={goToPreviousPage}
              disabled={pageIndex === 1}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "clamp(28px, 6vw, 38px)",
                height: "clamp(28px, 6vw, 38px)",
                borderRadius: "50%",
                fontSize: "clamp(13px, 4vw, 16px)",
                fontWeight: "600",
                cursor: pageIndex === 1 ? "not-allowed" : "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "white",
                color: pageIndex === 1 ? "#ccc" : "#667eea",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                opacity: pageIndex === 1 ? 0.5 : 1,
              }}
              aria-label="Previous page"
            >
              ←
            </button>

            {getPagination().map((page, i) => (
              <button
                key={i}
                disabled={page === "..."}
                onClick={() => page !== "..." && setPageIndex(page)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "clamp(28px, 6vw, 38px)",
                  height: "clamp(28px, 6vw, 38px)",
                  borderRadius: "50%",
                  fontSize: "clamp(13px, 4vw, 16px)",
                  fontWeight: pageIndex === page ? "700" : "500",
                  cursor: page === "..." ? "default" : "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: pageIndex === page
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                    : "white",
                  color: pageIndex === page ? "#fff" : "#667eea",
                  boxShadow: pageIndex === page
                    ? "0 8px 20px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0,0,0,0.1)" 
                    : "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
                  border: page === "..." 
                    ? "none" 
                    : pageIndex === page
                      ? "none"
                      : "1px solid rgba(102, 126, 234, 0.2)",
                  opacity: page === "..." ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (page !== "..." && pageIndex !== page) {
                    e.currentTarget.style.transform = "scale(1.08) translateY(-2px)";
                    e.currentTarget.style.backgroundColor = "#f8f9ff";
                    e.currentTarget.style.borderColor = "#667eea";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== "..." && pageIndex !== page) {
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.2)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                  }
                }}
                aria-label={page === "..." ? "More pages" : `Go to page ${page}`}
                aria-current={pageIndex === page ? "page" : undefined}
              >
                {page}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={pageIndex === totalPages}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "clamp(28px, 6vw, 38px)",
                height: "clamp(28px, 6vw, 38px)",
                borderRadius: "50%",
                fontSize: "clamp(13px, 4vw, 16px)",
                fontWeight: "600",
                cursor: pageIndex === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "white",
                color: pageIndex === totalPages ? "#ccc" : "#667eea",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                opacity: pageIndex === totalPages ? 0.5 : 1,
              }}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default BonusReport;