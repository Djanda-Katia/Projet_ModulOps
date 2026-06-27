<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::where('role_id', 2)->first();
\Illuminate\Support\Facades\Auth::login($user);

$req = \Illuminate\Http\Request::create('/api/dashboard', 'GET');
$req->setUserResolver(function() use ($user) { return $user; });

$start = microtime(true);
$response = app()->make('App\Http\Controllers\DashboardController')->getDashboard($req);
$time = microtime(true) - $start;
echo "Dashboard Time: " . number_format($time * 1000, 2) . " ms\n";
