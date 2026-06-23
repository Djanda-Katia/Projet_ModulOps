import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function ManagerLeaveConfig() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour la modale
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [configData, setConfigData] = useState({ 
    solde_conges_annuels: 0, 
    periode_conges_annuels: [] 
  });

  // États pour les dates (au format ISO yyyy-mm-dd pour le Backend)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // États pour l'affichage (au format jj/mm/aaaa)
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  // ============================================================
  // FONCTIONS DE CONVERSION DE DATES (EXACTEMENT CE QUE TU AS ÉCRIT)
  // ============================================================
  const parseFrenchDate = (str) => {
    const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  };

  const toFrenchDate = (str) => {
    if (!str) return "";
    const [year, month, day] = str.split("-");
    return `${day}/${month}/${year}`;
  };

  // Date du jour au format yyyy-mm-dd, sur le fuseau du Cameroun (UTC+1, pas de DST)
  const getTodayCameroon = () => {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const cameroonDate = new Date(utcMs + 1 * 60 * 60 * 1000);
    const year = cameroonDate.getFullYear();
    const month = String(cameroonDate.getMonth() + 1).padStart(2, '0');
    const day = String(cameroonDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // ============================================================

  // 1. Charger la liste des employés actifs
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/employes`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        toast.error("Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [token]);

  // 2. Ajouter une période et recalculer le solde
  const addPeriod = () => {
    if (!startDate || !endDate) {
      toast.error("Veuillez saisir les deux dates.");
      return;
    }

    const today = getTodayCameroon();
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const todayDate = new Date(today + "T00:00:00");

    if (start < todayDate) {
      toast.error(`Date de début déjà passée (aujourd'hui : ${toFrenchDate(today)}).`);
      return;
    }

    if (end < start) {
      toast.error("La date de fin doit suivre la date de début.");
      return;
    }

    const overlaps = configData.periode_conges_annuels.some((p) => {
      const pStart = new Date(p.start + "T00:00:00");
      const pEnd = new Date(p.end + "T00:00:00");
      return start <= pEnd && end >= pStart;
    });

    if (overlaps) {
      toast.error("Cette période chevauche une autre.");
      return;
    }

    const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const newPeriod = { start: startDate, end: endDate };
    const updatedPeriods = [...configData.periode_conges_annuels, newPeriod];
    const newTotalDays = configData.solde_conges_annuels + days;

    setConfigData({
      ...configData,
      periode_conges_annuels: updatedPeriods,
      solde_conges_annuels: newTotalDays
    });

    setStartDate("");
    setEndDate("");
    setStartDateInput("");
    setEndDateInput("");
  };

  // 3. Supprimer une période et recalculer le solde
  const removePeriod = (index) => {
    const periodToRemove = configData.periode_conges_annuels[index];
    const start = new Date(periodToRemove.start);
    const end = new Date(periodToRemove.end);
    const daysToRemove = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const updatedPeriods = configData.periode_conges_annuels.filter((_, i) => i !== index);
    const newTotalDays = configData.solde_conges_annuels - daysToRemove;

    setConfigData({
      ...configData,
      periode_conges_annuels: updatedPeriods,
      solde_conges_annuels: newTotalDays >= 0 ? newTotalDays : 0
    });
  };

  // 4. Enregistrer la configuration
  const handleSaveConfig = async () => {
    if (!token || !selectedEmployee) return;

    // On bloque l'enregistrement si aucune période n'est présente, que ce soit un nouvel
    // employé ou un employé dont on vient de retirer toutes les périodes : il doit en rester au moins une.
    if (configData.periode_conges_annuels.length === 0) {
      toast.error("Ajoutez au moins une période.");
      return;
    }

    const finalPeriods = configData.periode_conges_annuels;

    try {
      const res = await fetch(`${API_BASE}/api/manager/employes/${selectedEmployee.id}/config-conges`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          periode_conges_annuels: finalPeriods,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Erreur lors de la configuration");
      }

      toast.success("Configuration enregistrée.");

      // On fait confiance à la réponse du backend (source de vérité pour le solde calculé).
      setEmployees(prev => prev.map(emp =>
        emp.id === selectedEmployee.id
          ? {
              ...emp,
              solde_conge: result.solde_conge ?? configData.solde_conges_annuels,
              periode_conges_annuels: result.periode_conges_annuels ?? finalPeriods
            }
          : emp
      ));

      setShowConfigModal(false);
      setSelectedEmployee(null);
      setConfigData({ solde_conges_annuels: 0, periode_conges_annuels: [] });
      setStartDate("");
      setEndDate("");
      setStartDateInput("");
      setEndDateInput("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement des employés...</div>;

  // Helper pour formater l'affichage des dates dans le tableau
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString + "T00:00:00");
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des congés annuels</h1>
          <p className="text-gray-500 text-sm">Configurez les droits aux congés annuels de vos employés.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Employé</th>
                <th className="px-6 py-3">Fonction</th>
                <th className="px-6 py-3 text-center">Jours annuels autorisés</th>
                <th className="px-6 py-3">Périodes autorisées</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">Aucun employé actif trouvé.</td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{emp.prenom} {emp.nom}</td>
                    <td className="px-6 py-3 text-gray-500">{emp.fonction || "-"}</td>
                    <td className="px-6 py-3 text-center font-medium">
                      {Array.isArray(emp.periode_conges_annuels) && emp.periode_conges_annuels.length > 0 ? (
                        <span className="text-blue-600">{emp.solde_conge ?? 0} jours</span>
                      ) : (
                        <span className="text-red-500 italic">Non configuré</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {emp.periode_conges_annuels && Array.isArray(emp.periode_conges_annuels) && emp.periode_conges_annuels.length > 0 ? (
                        <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                          {emp.periode_conges_annuels.map((p, index) => (
                            <span key={index} className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md whitespace-nowrap">
                              {formatDisplayDate(p.start)} → {formatDisplayDate(p.end)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-red-500 italic">Non configuré</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setConfigData({
                            solde_conges_annuels: emp.solde_conge || 0,
                            periode_conges_annuels: Array.isArray(emp.periode_conges_annuels) ? emp.periode_conges_annuels : []
                          });
                          setStartDate("");
                          setEndDate("");
                          setStartDateInput("");
                          setEndDateInput("");
                          setShowConfigModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">settings</span>
                        Configurer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          MODALE DE CONFIGURATION (AVEC SAISIE FRANÇAISE jj/mm/aaaa)
          ============================================================ */}
      {showConfigModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Configurer les congés annuels</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-gray-600">
                Configurer les congés annuels pour <span className="font-bold">{selectedEmployee.prenom} {selectedEmployee.nom}</span>.
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Jours annuels autorisés</label>
                <div className="text-xl font-bold text-blue-600">
                  {configData.solde_conges_annuels} jours
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Périodes annuelles autorisées</label>
                <p className="text-xs text-gray-400 mb-3">Ajoutez une ou plusieurs plages de dates autorisées.</p>
                
                {configData.periode_conges_annuels.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {configData.periode_conges_annuels.map((p, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-blue-700">
                          Du {formatDisplayDate(p.start)} au {formatDisplayDate(p.end)}
                        </span>
                        <button
                          onClick={() => removePeriod(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ajout d'une nouvelle période avec saisie en jj/mm/aaaa */}
                <div className="flex gap-2 items-end mt-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Du</label>
                    <input
                      type="text"
                      value={startDateInput}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d]/g, "");
                        if (val.length > 8) val = val.slice(0, 8);
                        let formatted = val;
                        if (val.length > 4) formatted = `${val.slice(0,2)}/${val.slice(2,4)}/${val.slice(4)}`;
                        else if (val.length > 2) formatted = `${val.slice(0,2)}/${val.slice(2)}`;
                        setStartDateInput(formatted);

                        const parsed = parseFrenchDate(formatted);
                        setStartDate(parsed || "");
                      }}
                      placeholder="jj/mm/aaaa"
                      maxLength={10}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Au</label>
                    <input
                      type="text"
                      value={endDateInput}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^\d]/g, "");
                        if (val.length > 8) val = val.slice(0, 8);
                        let formatted = val;
                        if (val.length > 4) formatted = `${val.slice(0,2)}/${val.slice(2,4)}/${val.slice(4)}`;
                        else if (val.length > 2) formatted = `${val.slice(0,2)}/${val.slice(2)}`;
                        setEndDateInput(formatted);

                        const parsed = parseFrenchDate(formatted);
                        setEndDate(parsed || "");
                      }}
                      placeholder="jj/mm/aaaa"
                      maxLength={10}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addPeriod}
                    className="h-10 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors uppercase"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors uppercase"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}