import { useState } from "react";

export default function ManagerDashboard() {
  const [pendingLeaves] = useState([
    { id: 1, name: "Marc Lefebvre", type: "Congé Payé", start: "12 Mai", end: "15 Mai", days: 4 },
    { id: 2, name: "Sophie Dubois", type: "Maladie", start: "10 Mai", end: "11 Mai", days: 2 },
    { id: 3, name: "Julien Thomas", type: "RTT", start: "20 Mai", end: "20 Mai", days: 1 },
  ]);

  const [team] = useState([
    { initials: "AM", name: "Alexandre Moreau", role: "Développeur Senior", tasks: { todo: 2, ongoing: 3, done: 1 }, daysOff: 12 },
    { initials: "EG", name: "Élodie Girard", role: "UX Designer", tasks: { todo: 0, ongoing: 1, done: 3 }, daysOff: 8 },
    { initials: "TB", name: "Thomas Bernard", role: "Analyste Data", tasks: { todo: 3, ongoing: 4, done: 0 }, daysOff: 5 },
    { initials: "CP", name: "Camille Petit", role: "Marketing Lead", tasks: { todo: 1, ongoing: 2, done: 2 }, daysOff: 15 },
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Bonjour, DJANDA Katia !</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Congés en attente</p>
          <h3 className="text-3xl font-bold text-gray-900">{pendingLeaves.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Employés actifs</p>
          <h3 className="text-3xl font-bold text-gray-900">{team.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Tâches en cours</p>
          <h3 className="text-3xl font-bold text-gray-900">
            {team.reduce((sum, t) => sum + t.tasks.ongoing, 0)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Tâches terminées</p>
          <h3 className="text-3xl font-bold text-gray-900">
            {team.reduce((sum, t) => sum + t.tasks.done, 0)}
          </h3>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Leave Requests */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between">
            <h3 className="font-bold text-gray-900">Demandes de congé en attente</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employé</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Jours</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{req.name}</td>
                    <td className="px-4 py-3 text-gray-500">{req.type}</td>
                    <td className="px-4 py-3 text-gray-500">{req.start} - {req.end}</td>
                    <td className="px-4 py-3 font-bold text-center">{req.days}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold uppercase">APPROUVER</button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase">REJETER</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Team Follow-up */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">Suivi de l'équipe</h3>
          <div className="space-y-4">
            {team.map((member) => (
              <div key={member.initials} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs">{member.initials}</div>
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{member.tasks.todo} À faire</span>
                  <span className="px-2 py-0.5 bg-blue-100 rounded-full text-xs">{member.tasks.ongoing} En cours</span>
                  <span className="px-2 py-0.5 bg-green-100 rounded-full text-xs">{member.tasks.done} Terminée</span>
                  <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">{member.daysOff} j. congés</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}