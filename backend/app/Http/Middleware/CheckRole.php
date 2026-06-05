<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
// Remplace la ligne par celle-ci (on ajoute string avant ...$roles)
public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // 1. Est-ce que l'utilisateur est au moins connecté ?
        if (!Auth::check()) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        // 2. On récupère son rôle (ex: 4 pour Admin)
        $userRole = (string) Auth::user()->role_id;

        // 3. Est-ce que son rôle est permis pour cette route ?
        if (!in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'Accès refusé. Vous n\'avez pas les droits nécessaires.'
            ], 403);
        }

        return $next($request);
    }
}