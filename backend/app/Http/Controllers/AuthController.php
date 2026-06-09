<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }
    public function reinitialiserMotDePassse(Request $request)
{
    $request->validate(['email' => 'required|email']);
    
    // On vérifie juste si l'utilisateur existe
    $user = \App\Models\User::where('email', $request->email)->first();
    
    if (!$user) {
        return response()->json(['message' => 'Aucun utilisateur trouvé avec cet e-mail.'], 404);
    }

    // On simule l'envoi du lien/token
    return response()->json([
        'message' => 'Un e-mail de réinitialisation a été envoyé avec succès.',
        'token' => bin2hex(random_bytes(16)) // Faux jeton pour la forme
    ]);
}
}