<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    // L'Admin liste tous les utilisateurs
    public function index()
    {
        return User::orderBy('created_at', 'desc')->get();
    }

    // L'Admin crée un compte utilisateur (Point 1.1 / Cahier des charges)
    public function store(Request $request)
    {
        // Correction : Modification de 'name' pour concorder avec 'nom' et 'prenom' de la migration users
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'fonction' => 'nullable|string|max:255', // Permet d'ajouter son poste directement
            'role_id' => 'required|integer|in:1,2,3,4' // 1:Employé, 2:Responsable, 3:Technicien, 4:Admin
        ]);

        // Insertion avec les bonnes clés de colonnes de base de données
        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'fonction' => $request->fonction,
            'role_id' => $request->role_id,
        ]);

        return response()->json(['message' => 'Utilisateur créé avec succès', 'user' => $user], 201);
    }

    // L'Admin modifie le rôle d'un utilisateur (Point 1.1)
    public function modifierRole(Request $request, int $id) 
    {
        $request->validate([
            'role_id' => 'required|integer|in:1,2,3,4'
        ]);

        $user = User::findOrFail($id);
        $user->update(['role_id' => $request->role_id]);

        return response()->json(['message' => 'Rôle mis à jour avec succès', 'user' => $user]);
    }

    // Consulter et exporter le Journal d'Audit Global en CSV (Point 1.1)
    public function exporterAudit()
    {
        $audits = \App\Models\Audit::orderBy('created_at', 'desc')->get();
        
        $filename = "journal_audit_" . date('Y-m-d') . ".csv";
        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Action', 'Utilisateur', 'Date'];

        $callback = function() use($audits, $columns) {
            $file = fopen('php://output', 'w');
            // Ajouter la ligne d'en-tête du CSV
            fputcsv($file, $columns, ';');

            foreach ($audits as $audit) {
                fputcsv($file, [
                    $audit->id,
                    $audit->action,
                    $audit->utilisateur,
                    $audit->created_at
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}