import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  FaClipboardList,
  FaSearch,
  FaSync,
  FaDownload,
  FaUserShield,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./AuditLogs.css";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalActivities: 0,
    adminActionsCount: 0,
    systemEventsCount: 0,
  });

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchLogs();
  }, [roleFilter]);

  const fetchLogs = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const res = await api.get(`/admin/audit-logs?role=${roleFilter}`);
      if (res.data && res.data.success) {
        setLogs(res.data.logs || []);
        setStats({
          totalActivities: res.data.totalActivities || 0,
          adminActionsCount: res.data.adminActionsCount || 0,
          systemEventsCount: res.data.systemEventsCount || 0,
        });
      } else {
        setError("Failed to fetch audit logs.");
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const query = searchQuery.toLowerCase();
      const userMatch = (log.user || "").toLowerCase().includes(query);
      const actionMatch = (log.action || "").toLowerCase().includes(query);
      const moduleMatch = (log.module || "").toLowerCase().includes(query);

      return userMatch || actionMatch || moduleMatch;
    });
  }, [logs, searchQuery]);

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;

  // Export to CSV
  const exportLogsCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["User", "Role", "Module", "Action Details", "IP Address", "Status", "Date & Time"];
    const rows = filteredLogs.map((l) => [
      `"${l.user || "-"}"`,
      `"${l.role || "-"}"`,
      `"${l.module || "-"}"`,
      `"${l.action || "-"}"`,
      `"${l.ipAddress || "127.0.0.1"}"`,
      `"${l.status || "SUCCESS"}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Badge Styling according to Action
  const getActionBadgeStyle = (action = "") => {
    const act = action.toLowerCase();
    if (act.includes("delete") || act.includes("reject") || act.includes("block")) {
      return { bg: "#fee2e2", text: "#991b1b" };
    }
    if (act.includes("create") || act.includes("approve") || act.includes("generate")) {
      return { bg: "#dcfce7", text: "#166534" };
    }
    if (act.includes("update") || act.includes("change")) {
      return { bg: "#e0f2fe", text: "#0369a1" };
    }
    return { bg: "#f1f5f9", text: "#334155" };
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="audit-loading">
          <div className="audit-spinner"></div>
          <p>Retrieving Security & System Audit Trail...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="audit-logs-container">

        {/* HEADER SECTION */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <FaClipboardList className="header-icon" /> Platform Audit Trail & System Logs
            </h1>
            <p className="page-subtitle">
              Comprehensive audit trail of administrator activities, merchant changes, and system operations
            </p>
          </div>

          <div className="header-actions">
            <button
              onClick={() => fetchLogs(true)}
              className="refresh-btn"
              disabled={isRefreshing}
            >
              <FaSync className={isRefreshing ? "spin-icon" : ""} />
              {isRefreshing ? "Refreshing..." : "Refresh Audit Trail"}
            </button>

            <button onClick={exportLogsCSV} className="export-btn">
              <FaDownload />
              Export CSV
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* KPI SUMMARY CARDS */}
        <div className="kpi-grid">
          
          <div className="kpi-card card-blue">
            <div className="kpi-icon"><FaClipboardList /></div>
            <div className="kpi-info">
              <span className="kpi-label">Total Audit Events</span>
              <h3 className="kpi-value">{stats.totalActivities}</h3>
              <span className="kpi-sub blue-sub">Recorded log entries</span>
            </div>
          </div>

          <div className="kpi-card card-emerald">
            <div className="kpi-icon"><FaUserShield /></div>
            <div className="kpi-info">
              <span className="kpi-label">Admin & SuperAdmin Actions</span>
              <h3 className="kpi-value">{stats.adminActionsCount}</h3>
              <span className="kpi-sub emerald-sub">Administrative Operations</span>
            </div>
          </div>

          <div className="kpi-card card-purple">
            <div className="kpi-icon"><FaLock /></div>
            <div className="kpi-info">
              <span className="kpi-label">System & Security Events</span>
              <h3 className="kpi-value">{stats.systemEventsCount}</h3>
              <span className="kpi-sub purple-sub">Automated Log Trail</span>
            </div>
          </div>

        </div>

        {/* TABLE CARD & CONTROLS */}
        <div className="table-card">
          <div className="table-header-flex">
            <h2 className="table-title">Audit Activity Log</h2>

            <div className="table-filters">
              {/* Search Bar */}
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search user, action, module..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="search-input"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="role-select"
              >
                <option value="ALL">All User Roles</option>
                <option value="SUPER_ADMIN">Super Admin Only</option>
                <option value="ADMIN">Admin Only</option>
                <option value="MERCHANT">Merchant Only</option>
              </select>
            </div>
          </div>

          {/* DATAGRID */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User & Initiator</th>
                  <th>Role</th>
                  <th>Module</th>
                  <th>Operation / Action</th>
                  <th>IP Address</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log, index) => {
                    const badgeStyle = getActionBadgeStyle(log.action);
                    return (
                      <tr key={log._id || index}>
                        <td className="font-semibold text-slate-800">
                          {log.user || "System"}
                        </td>
                        <td>
                          <span className="role-tag">{log.role || "ADMIN"}</span>
                        </td>
                        <td>
                          <span className="module-tag">{log.module || "SYSTEM"}</span>
                        </td>
                        <td>
                          <span
                            className="action-pill"
                            style={{
                              background: badgeStyle.bg,
                              color: badgeStyle.text,
                            }}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="text-slate-500 font-mono text-xs">
                          {log.ipAddress || "127.0.0.1"}
                        </td>
                        <td className="text-center">
                          <span
                            className={`status-pill ${
                              log.status === "SUCCESS"
                                ? "pill-success"
                                : log.status === "FAILED"
                                ? "pill-failed"
                                : "pill-warning"
                            }`}
                          >
                            {log.status === "SUCCESS" ? (
                              <FaCheckCircle size={10} />
                            ) : (
                              <FaExclamationCircle size={10} />
                            )}
                            {log.status || "SUCCESS"}
                          </span>
                        </td>
                        <td className="text-right text-slate-500 text-xs">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="table-empty">
                      No audit activities match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > itemsPerPage && (
            <div className="pagination-wrapper">
              <span className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} audit logs
              </span>

              <div className="pagination-actions">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="page-btn"
                >
                  <FaChevronLeft size={12} /> Prev
                </button>
                <span className="page-current">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="page-btn"
                >
                  Next <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </SuperAdminLayout>
  );
};

export default AuditLogs;