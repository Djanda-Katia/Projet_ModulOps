<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Traits\LogsAudit;

class AdminController extends Controller
{
    // AJOUT : on importe le trait d'audit
    use LogsAudit;

    // L'Admin liste tous les utilisateurs
    public function index()
    {
        return User::orderBy('created_at', 'desc')->get();
    }

    // L'Admin crée un compte utilisateur
    public function store(Request $request)
    {
        $request->validate([
            'nom'      => 'required|string|max:255',
            'prenom'   => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'fonction' => 'nullable|string|max:255',
            'role_id'  => 'required|integer|in:1,2,3,4'
        ]);

        $user = User::create([
            'nom'      => $request->nom,
            'prenom'   => $request->prenom,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'fonction' => $request->fonction,
            'role_id'  => $request->role_id,
        ]);

        // AUDIT : création de compte
        $this->logAudit("Création du compte utilisateur : {$user->nom} {$user->prenom} ({$user->email}) — Rôle ID : {$user->role_id}");

        return response()->json(['message' => 'Utilisateur créé avec succès', 'user' => $user], 201);
    }

    // L'Admin modifie le rôle d'un utilisateur
    public function modifierRole(Request $request, int $id)
    {
        $request->validate([
            'role_id' => 'required|integer|in:1,2,3,4'
        ]);

        $user = User::findOrFail($id);
        $ancienRole = $user->role_id;
        $user->update(['role_id' => $request->role_id]);

        // AUDIT : modification de rôle
        $this->logAudit("Modification du rôle de {$user->nom} {$user->prenom} : Rôle {$ancienRole} → Rôle {$request->role_id}");

        return response()->json(['message' => 'Rôle mis à jour avec succès', 'user' => $user]);
    }

    // Exporter le Journal d'Audit Global en CSV
    public function exporterAudit()
    {
        $audits = \App\Models\Audit::orderBy('created_at', 'desc')->get();

        // AUDIT : export du journal
        $this->logAudit("Export du journal d'audit global en CSV");

        $filename = "journal_audit_" . date('Y-m-d') . ".csv";
        $headers  = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Action', 'Utilisateur', 'Date'];

        $callback = function () use ($audits, $columns) {
            $file = fopen('php://output', 'w');
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