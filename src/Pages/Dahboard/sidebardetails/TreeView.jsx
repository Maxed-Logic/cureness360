import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import apiClient from "../../../api/apiClient";
import Preloader from "../../../Preloader";
import "./UserDetails.css";

/**
 * TREE COMPONENT - Network tree visualization with expand/collapse
 * Data comes from API, not hardcoded
 */
const TreeComponent = () => {
  // ==================== STATE MANAGEMENT ====================
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRegNo, setCurrentRegNo] = useState(null);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // ==================== DOM REFERENCES ====================
  const chartRef = useRef(null);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const navigate = useNavigate();

  // ==================== API DATA PROCESSING ====================

  const buildTree = useCallback((apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) return null;

    const nodeMap = {};
    let rootNode = null;

    apiData.forEach((item) => {
      nodeMap[item.regno] = {
        ...item,
        children: [],
        _children: [],
        name: item.Name || item.name || "Member",
        loginid: item.loginid || "",
        regno: item.regno,
        status: item.STATUS || item.BotStatus || "Active",
      };
    });

    apiData.forEach((item) => {
      const parentRegNo = item.introRegNo;
      const currentNode = nodeMap[item.regno];
      const parentNode = nodeMap[parentRegNo];

      if (parentRegNo && parentNode) {
        parentNode.children.push(currentNode);
        parentNode._children.push(currentNode);
      } else if (!rootNode && currentNode) {
        rootNode = currentNode;
      }
    });

    return rootNode;
  }, []);

  const fetchNodeChildren = useCallback(async (regno) => {
    try {
      const response = await apiClient.post("/Dashboard/tree-view", { mregNo: regno });
      const childrenData = response.data?.userTree || response.data?.data || response.data || [];
      return childrenData;
    } catch (error) {
      console.error("❌ Error fetching children for regno:", regno, error);
      return [];
    }
  }, []);

  // ==================== USER INTERACTION HANDLERS ====================

  const handleNodeClick = useCallback(async (event, d3Node) => {
    event.stopPropagation();
    const clickedRegNo = d3Node.data.regno;

    setExpandedNodes(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(clickedRegNo)) {
        newSet.delete(clickedRegNo);
        d3Node.data.children = [];
      } else {
        newSet.add(clickedRegNo);
        if (d3Node.data._children && d3Node.data._children.length > 0) {
          d3Node.data.children = d3Node.data._children;
        } else {
          d3Node.data.loading = true;
          setTreeData({ ...treeData });
          fetchNodeChildren(clickedRegNo).then(apiChildren => {
            if (apiChildren.length > 0) {
              const childNodes = {};
              apiChildren.forEach(child => {
                childNodes[child.regno] = {
                  ...child,
                  children: [],
                  _children: [],
                  name: child.Name || child.name || "Member",
                  loginid: child.loginid || child.regno,
                  regno: child.regno,
                  status: child.STATUS || child.BotStatus || "Active"
                };
              });
              apiChildren.forEach(child => {
                const childParentRegNo = child.introRegNo;
                if (childParentRegNo && childNodes[childParentRegNo] && childNodes[child.regno]) {
                  const exists = childNodes[childParentRegNo]._children.some(
                    existingChild => existingChild.regno === child.regno
                  );
                  if (!exists) {
                    childNodes[childParentRegNo]._children.push(childNodes[child.regno]);
                  }
                }
              });
              const directChildren = Object.values(childNodes).filter(
                node => node.introRegNo === clickedRegNo
              );
              d3Node.data._children = directChildren;
              d3Node.data.children = directChildren;
              d3Node.data.loading = false;
              setTreeData({ ...treeData });
            } else {
              d3Node.data.loading = false;
              setTreeData({ ...treeData });
            }
          });
        }
      }
      return newSet;
    });
  }, [treeData, fetchNodeChildren]);

  // ==================== INITIAL DATA FETCH ====================

  const fetchTreeData = useCallback(async (regno) => {
    if (!regno) {
      setError("Registration number not found");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setCurrentRegNo(regno);

      const response = await apiClient.post("/Dashboard/tree-view", { mregNo: regno });
      const flatData = response.data?.userTree || response.data?.data || response.data || [];
      if (!Array.isArray(flatData) || flatData.length === 0) {
        setTreeData(null);
        setError("No network members found");
        setLoading(false);
        return;
      }
      const tree = buildTree(flatData);
      if (tree) {
        setExpandedNodes(new Set([regno]));
        tree.children = tree._children || [];
      }
      setTreeData(tree);
    } catch (error) {
      console.error("❌ Tree Fetch Error:", error);
      setError(error.response?.data?.message || "Failed to load tree data");
    } finally {
      setLoading(false);
    }
  }, [buildTree]);

  useEffect(() => {
    const loadInitialData = () => {
      try {
        const userData = sessionStorage.getItem("user");
        if (!userData) {
          setError("User not found. Please login again.");
          setLoading(false);
          return;
        }
        const savedUser = JSON.parse(userData);
        const regno = savedUser.Regno || savedUser.regno;
        if (!regno) {
          setError("Registration number not found");
          setLoading(false);
          return;
        }
        fetchTreeData(regno);
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
        setError("Invalid user data format");
        setLoading(false);
      }
    };
    loadInitialData();
  }, [fetchTreeData]);

  // ==================== D3 TREE RENDERING ====================
  useEffect(() => {
    if (!treeData || !chartRef.current || loading) return;

    d3.select(chartRef.current).selectAll("*").remove();

    const containerWidth = chartRef.current.parentElement.clientWidth - 40;
    const width = Math.max(928, containerWidth);
    const root = d3.hierarchy(treeData);
    const dx = 40;
    const dy = width / (root.height + 1.5);
    const tree = d3.tree().nodeSize([dx, dy]);
    root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
    tree(root);

    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });
    const height = Math.max(600, x1 - x0 + dx * 2);

    const svg = d3.select(chartRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", [-dy / 3, x0 - dx, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("style", "width: 100%; font: 12px sans-serif; background: #fff; border-radius: 8px; cursor: grab;")
      .call(d3.zoom()
        .scaleExtent([0.3, 3])
        .filter(event => {
          if (event.type === 'wheel') return event.ctrlKey;
          return true;
        })
        .on("zoom", (event) => { g.attr("transform", event.transform); }));
    svgRef.current = svg;
    const g = svg.append("g").attr("class", "tree-group");
    gRef.current = g;

    // Links
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll()
      .data(root.links())
      .join("path")
      .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

    // Nodes
    const node = g.append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 2)
      .selectAll()
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .attr("class", "d3-node")
      .style("cursor", "pointer")
      .on("click", function (event, d) { handleNodeClick(event, d); })
      .on("mouseenter", function () {
        d3.select(this).select("circle")
          .attr("r", 8)
          .attr("stroke-width", 3);
      })
      .on("mouseleave", function () {
        d3.select(this).select("circle")
          .attr("r", 6)
          .attr("stroke-width", 2);
      });

    // Helper function to get color based on status (only RED, GREEN, BLUE)
    const getStatusColor = (status) => {
      if (!status) return "#2ecc71";
      const upperStatus = status.toUpperCase();
      if (upperStatus === "RED") return "#ef4444";
      if (upperStatus === "GREEN") return "#22c55e";
      if (upperStatus === "BLUE") return "#3b82f6";
      return "#2ecc71";
    };

    // Circles - color based solely on status
    node.append("circle")
      .attr("fill", d => {
        if (d.data.loading) return "#ff9800";
        const status = d.data.STATUS || d.data.BotStatus;
        return getStatusColor(status);
      })
      .attr("r", d => {
        if (d.data.loading) return 10;
        return 6;
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Expand/collapse indicators (+/-)
    node.filter(d => d.data._children && d.data._children.length > 0 && !d.data.loading)
      .append("text")
      .attr("dy", "-0.8em")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text(d => expandedNodes.has(d.data.regno) ? "−" : "+")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("stroke", "#333")
      .attr("stroke-width", "0.5");

    // Loading indicator
    node.filter(d => d.data.loading)
      .append("text")
      .attr("dy", "-0.8em")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text("⟳")
      .attr("fill", "#ff9800")
      .attr("font-size", "15px")
      .attr("font-weight", "bold")
      .style("animation", "spin 1s linear infinite");

    // Name labels
    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children && d.children.length > 0 ? -12 : 12)
      .attr("text-anchor", d => d.children && d.children.length > 0 ? "end" : "start")
      .text(d => {
        const name = d.data.name || d.data.Name || "Member";
        return name.length > 15 ? name.substring(0, 12) + "..." : name;
      })
      .attr("fill", "#1e293b")
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("paint-order", "stroke")
      .style("font-size", "20px")
      .style("font-weight", d => d.depth === 0 ? "bold" : "normal");

    // Login ID below name
    node.append("text")
      .attr("dy", "1.5em")
      .attr("x", d => d.children && d.children.length > 0 ? -12 : 12)
      .attr("text-anchor", d => d.children && d.children.length > 0 ? "end" : "start")
      .text(d => d.data.loginid || d.data.regno || "")
      .attr("fill", "#64748b")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("paint-order", "stroke")
      .style("font-size", "15px");

    // ==================== TOOLTIP EXACTLY LIKE YOUR IMAGE ====================
    node.append("title")
      .text(d => {
        const name = d.data.name || d.data.Name || "Member";
        const status = d.data.STATUS || d.data.BotStatus || "Active";
        const invest = d.data.kitPrice || d.data.KitPrice || "0.00";
        const totalBot = d.data.totalbusiness || d.data.TotalBusiness || "0.00";
        const investBusiness = d.data.RoyaltyBusiness || d.data.royaltyBusiness || "0.00";
        const thisMonthBusiness = d.data.PerMonthBusiness || d.data.perMonthBusiness || "0.00";
        const doj = d.data.regdate || d.data.RegDate || d.data.regDate || "N/A";

        return `Name: ${name}
Subscription: ${status}, Invest : $${invest}
Total Subscription : ${totalBot}
Invest Business : $${investBusiness}
This Month Business : $${thisMonthBusiness}

DOJ : ${doj}`;
      });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

  }, [treeData, loading, handleNodeClick, expandedNodes]);

  // ==================== UI RENDERING ====================
  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="tree-page">
      <div className="tree-header">
        <div>
          <h2>Tree View</h2>
        </div>
        <div className="header-actions">
          <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      </div>

      {error && !loading && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => currentRegNo && fetchTreeData(currentRegNo)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            backgroundColor: "#a09f9f",
            border: "1px solid #ffd700",
            borderRadius: "8px",
            padding: "10px 20px",
            margin: "10px 0 20px 0",
            display: "flex",
            alignItems: "center",
            color: "#ffffff",
            fontSize: "14px",
            fontFamily: "sans-serif",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          <span style={{ marginRight: "10px", fontSize: "16px" }}>🔍</span>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "#ffd700" }}>Note : </strong>
            Click on any node to expand/collapse its children |
            Hold <strong>Ctrl + Mouse Wheel</strong> to zoom
          </p>
        </div>
      )}

      <div className="tree-wrapper full-width">
        <div className="tree-container">
          {treeData ? (
            <svg ref={chartRef} className="d3-tree full-width-tree"></svg>
          ) : !loading && (
            <div className="no-data">
              <div className="no-data-icon">🌳</div>
              <h3>No Network Members Found</h3>
              <p>This member hasn't introduced anyone yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreeComponent;