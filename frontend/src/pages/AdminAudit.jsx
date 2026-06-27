import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FilterBar from "../components/FilterBar";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function AdminAudit() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});

  const fetchAudits = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page });
      
      if (currentFilters.dates) params.append('dates', currentFilters.dates);

      const res = await fetch(`${API_BASE}/api/admin/audit?${params}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || []);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
      } else {
        throw new Error('Erreur de chargement');
      }
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger les audits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAudits();
  }, [token]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchAudits(1, newFilters);
  };

  // Formateur de date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  };

  // Export CSV
  const handleExportCSV = async () => {
    if (logs.length === 0) {
      toast.error("Aucune donnée à exporter.");
      return;
    }
    
    const toastId = toast.loading("Préparation de l'export CSV...");
    try {
      const res = await fetch(`${API_BASE}/api/admin/audit?export=true`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const allLogs = data.data || [];

      const headers = ["ID", "Action", "Utilisateur", "Date"];
      const rows = allLogs.map(log => [log.id, log.action, log.utilisateur || "Système", formatDate(log.created_at)]);
      const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", `audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export CSV réussi", { id: toastId });
    } catch (err) {
      toast.error("Erreur lors de l'exportation", { id: toastId });
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (logs.length === 0) {
      toast.error("Aucune donnée à exporter.");
      return;
    }
    
    const toastId = toast.loading("Préparation de l'export PDF...");
    try {
      const res = await fetch(`${API_BASE}/api/admin/audit?export=true`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const allLogs = data.data || [];

      const doc = new jsPDF();
      doc.text("Journal d'Audit - ModulOps", 14, 15);
      
      const tableColumn = ["ID", "Action", "Utilisateur", "Date"];
      const tableRows = [];

      allLogs.forEach(log => {
        const logData = [
          log.id,
          log.action,
          log.utilisateur || "Système",
          formatDate(log.created_at),
        ];
        tableRows.push(logData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.save(`audit_logs_${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success("Export PDF réussi", { id: toastId });
    } catch (err) {
      toast.error("Erreur lors de l'exportation", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-9xl">history_edu</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Journal d'Audit</h1>
          <p className="text-teal-50 text-sm font-medium">Consultez l'historique des actions importantes de la plateforme.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="shrink-0 bg-white text-teal-800 hover:bg-teal-50 px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 relative z-10"
          >
            <span className="material-symbols-outlined text-[20px]">description</span>
            CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="shrink-0 bg-teal-800 text-white hover:bg-teal-900 border border-teal-600 px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 relative z-10"
          >
            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            PDF
          </button>
        </div>
      </div>

      <FilterBar onFilterChange={handleFilterChange} filters={filters} hideSearch hideStatus hideCategories hidePriority />

      {/* PREMIUM LIST LAYOUT */}
      <div className="overflow-x-auto pb-4">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-teal-500">autorenew</span>
            <p className="mt-2 text-gray-500 font-medium">Chargement du journal d'audit...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>visibility_off</span>
            <h3 className="text-xl font-bold text-gray-700 mb-1">Aucune action enregistrée</h3>
            <p className="text-gray-400 text-sm">Le journal est actuellement vide.</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[800px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold px-4">
                <th className="px-6 py-2 font-semibold w-20">ID</th>
                <th className="px-6 py-2 font-semibold">Action</th>
                <th className="px-6 py-2 font-semibold w-64">Utilisateur</th>
                <th className="px-6 py-2 font-semibold w-48 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="bg-white group hover:shadow-md transition-all duration-300">
                  <td className="p-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-teal-200 text-center">
                    <span className="inline-block px-3 py-1 bg-gray-50 text-gray-400 font-mono text-xs font-bold rounded-lg border border-gray-100">
                      #{log.id}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-teal-200">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-teal-600 bg-teal-50 p-2 rounded-xl">article</span>
                      <span className="font-bold text-gray-800 text-[15px]">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-teal-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600 shadow-inner border border-white shrink-0">
                        {getInitials(log.utilisateur || "Système")}
                      </div>
                      <span className="font-semibold text-gray-700 text-sm">{log.utilisateur || "Système"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-teal-200 text-right pr-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{formatDate(log.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={(page) => fetchAudits(page, filters)} />
    </div>
  );
}