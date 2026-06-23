<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Traits\LogsAudit;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    use LogsAudit;

    public function index()
    {
        return User::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'nom'      => 'required|string|max:255',
                'prenom'   => 'required|string|max:255',
                'email'    => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
                'fonction' => 'nullable|string|max:255',
                'role_id'  => 'required|integer|in:1,2,3'
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

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Si c'est une erreur de validation (ex: email déjà pris), on renvoie un JSON propre
            return response()->json([
                'message' => $e->validator->errors()->first(),
                'errors'  => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // Pour toute autre erreur, on renvoie un message générique
            return response()->json(['message' => 'Une erreur est survenue lors de la création du compte.'], 500);
        }
    }

    public function updateInfos(Request $request, int $id)
    {
        try {
            $request->validate([
                'nom'      => 'sometimes|string|max:255',
                'prenom'   => 'sometimes|string|max:255',
                'fonction' => 'sometimes|string|max:255',
            ]);

            $user = User::findOrFail($id);

            $user->update($request->only(['nom', 'prenom', 'fonction']));

            $this->logAudit("Modification des informations de {$user->nom} {$user->prenom} par l'administrateur.");

            return response()->json(['message' => 'Informations mises à jour avec succès', 'user' => $user]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->validator->errors()->first()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de la modification.'], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $user = User::findOrFail($id);

            // EMPÊCHER LA SUPPRESSION DE L'ADMIN (Rôle 4)
            if ($user->role_id === 4) {
                return response()->json(['message' => 'Impossible de supprimer le compte Administrateur.'], 403);
            }

            $nomComplet = "{$user->nom} {$user->prenom}";
            $email = $user->email;

            $user->delete();

            $this->logAudit("Suppression du compte utilisateur : {$nomComplet} ({$email})");

            return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Impossible de supprimer l\'utilisateur.'], 500);
        }
    }

    public function exporterAudit()
    {
        try {
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
        } catch (\Exception $e) {
            return response()->json(['message' => 'Impossible d\'exporter l\'audit.'], 500);
        }
    }

    // ============================================================
    // AJOUT : Le responsable enregistre la config congés
    // ============================================================
    public function updateConfigConges(Request $request, int $id)
    {
        try {
            $user = Auth::user();
            if ($user->role_id !== 2 && $user->role_id !== 4) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            $request->validate([
                'solde_conges_annuels' => 'nullable|integer|min:0',
                'periode_conges_annuels' => 'nullable|string|max:255',
            ]);

            $employe = User::findOrFail($id);
            $employe->update($request->only(['solde_conges_annuels', 'periode_conges_annuels']));

            $this->logAudit("Configuration des congés annuels mise à jour pour {$employe->nom} {$employe->prenom} par {$user->nom} {$user->prenom}.");

            return response()->json(['message' => 'Configuration des congés enregistrée avec succès']);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->validator->errors()->first()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Une erreur est survenue lors de la configuration.'], 500);
        }
    }
}