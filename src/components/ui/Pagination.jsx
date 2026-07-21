import React from 'react';

const Pagination = ({ pageIndex, totalPages, onPageChange, siblingCount = 1, showFirstLast = true }) => {
    
    const getPagination = () => {
        if (totalPages <= 1) return [1];
        
        const pages = [];
        pages.push(1);
        
        let start = Math.max(2, pageIndex - siblingCount);
        let end = Math.min(totalPages - 1, pageIndex + siblingCount);
        
        if (start > 2) pages.push("...");
        
        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
        }
        
        if (end < totalPages - 1) pages.push("...");
        if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
        
        return pages;
    };

    if (totalPages <= 1) return null;

    // Common button style
    const buttonStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "clamp(32px, 6vw, 40px)",
        height: "clamp(32px, 6vw, 40px)",
        borderRadius: "12px",
        fontSize: "clamp(14px, 4vw, 16px)",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "#ffffff",
        color: "#4f46e5",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    };

    const disabledStyle = {
        ...buttonStyle,
        cursor: "not-allowed",
        opacity: 0.4,
        color: "#94a3b8",
    };

    const activeStyle = {
        ...buttonStyle,
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        color: "#ffffff",
        border: "none",
        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
    };

    const ellipsisStyle = {
        ...buttonStyle,
        cursor: "default",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        color: "#94a3b8",
    };

    return (
        <div 
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "24px",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "8px",
                padding: "8px",
            }}
        >   
            {/* Previous Page Button */}
            <button 
                onClick={() => onPageChange(pageIndex - 1)} 
                disabled={pageIndex === 1}
                style={pageIndex === 1 ? disabledStyle : buttonStyle}
                onMouseEnter={(e) => {
                    if (pageIndex !== 1) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 14px rgba(79, 70, 229, 0.2)";
                        e.currentTarget.style.borderColor = "#4f46e5";
                    }
                }}
                onMouseLeave={(e) => {
                    if (pageIndex !== 1) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }
                }}
            >
                ←
            </button>
            
            {/* Page Numbers */}
            {getPagination().map((page, i) => (
                <button
                    key={i}
                    onClick={() => page !== "..." && onPageChange(page)}
                    disabled={page === "..."}
                    style={
                        page === "..." 
                            ? ellipsisStyle 
                            : pageIndex === page 
                                ? activeStyle 
                                : buttonStyle
                    }
                    onMouseEnter={(e) => {
                        if (page !== "..." && pageIndex !== page) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 14px rgba(79, 70, 229, 0.2)";
                            e.currentTarget.style.borderColor = "#4f46e5";
                            e.currentTarget.style.background = "#f8fafc";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (page !== "..." && pageIndex !== page) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.background = "#ffffff";
                        }
                    }}
                >
                    {page}
                </button>
            ))}
            
            {/* Next Page Button */}
            <button 
                onClick={() => onPageChange(pageIndex + 1)} 
                disabled={pageIndex === totalPages}
                style={pageIndex === totalPages ? disabledStyle : buttonStyle}
                onMouseEnter={(e) => {
                    if (pageIndex !== totalPages) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 14px rgba(79, 70, 229, 0.2)";
                        e.currentTarget.style.borderColor = "#4f46e5";
                    }
                }}
                onMouseLeave={(e) => {
                    if (pageIndex !== totalPages) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                    }
                }}
            >
                →
            </button>
            
        </div>
    );
};

export default Pagination;