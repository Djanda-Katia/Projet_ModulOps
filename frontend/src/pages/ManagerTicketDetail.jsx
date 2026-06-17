import { Link } from "react-router-dom";

export default function ManagerTicketDetail() {
  return (
    <div className="space-y-6">
      <Link to="/manager-tickets" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-semibold">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Retour à mes tickets
      </Link>

      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <h3 className="font-bold text-green-900 text-base">Ce ticket a été marqué comme résolu par le technicien.</h3>
            <p className="text-green-700 text-sm">Confirmez-vous la résolution ?</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg uppercase">CONFIRMER</button>
          <button className="px-6 py-2 border border-red-200 text-red-600 text-sm font-bold rounded-lg uppercase">SIGNALER</button>
        </div>
      </div>
    </div>
  );
}