<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tache;
use Illuminate\Support\Facades\Auth;

class TacheController extends Controller
{
    // Changer le statut (À faire -> En cours -> Terminée)
    public function updateStatut(Request $request, int $id)
    {
        $request->validate([
            'statut' => 'required|in:À faire,En cours,Terminée'
        ]);

        $tache = Tache::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $tache->update(['statut' => $request->statut]);

        return response()->json(['message' => 'Statut de la tâche mis à jour : ' . $request->statut]);
    }

    public function mesTaches()
    {
        return Tache::where('user_id', Auth::id())->orderBy('date_echeance', 'asc')->get();
    }
}