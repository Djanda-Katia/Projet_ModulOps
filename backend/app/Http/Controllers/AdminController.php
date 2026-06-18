<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Traits\LogsAudit;

class AdminController extends Controller
{
    use LogsAudit;

    public function index()
    {
        return User::orderBy('created_at', 'desc')->get();
    }

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

        $this->logAudit("Création du compte utilisateur : {$user->nom} {$user->prenom} ({$user->email}) — Rôle ID : {$user->role_id}");

        return response()->json(['message' => 'Utilisateur créé avec succès', 'user' => $user], 201);
    }

    // ✅ Nouvelle méthode pour modifier le nom, prénom et fonction
    public function updateInfos(Request $request, int $id)
    {
        $request->validate([
            'nom'      => 'sometimes|string|max:255',
            'prenom'   => 'sometimes|string|max:255',
            'fonction' => 'sometimes|string|max:255',
        ]);

        $user = User::findOrFail($id);

        $user->update($request->only(['nom', 'prenom', 'fonction']));

        $this->logAudit("Modification des informations de {$user->nom} {$user->prenom} par l'administrateur.");

        return response()->json(['message' => 'Informations mises à jour avec succès', 'user' => $user]);
    }

    public function destroy(int $id)
    {
        $user = User::findOrFail($id);
        $nomComplet = "{$user->nom} {$user->prenom}";
        $email = $user->email;

        $user->delete();

        $this->logAudit("Suppression du compte utilisateur : {$nomComplet} ({$email})");

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }

    public function exporterAudit()
    {
        $audits = \App\Models\Audit::orderBy('created_at', 'desc')->get();

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