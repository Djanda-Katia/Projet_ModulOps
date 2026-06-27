<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$start = microtime(true);
$query = App\Models\Tache::with(['employes', 'responsable'])->orderBy('created_at', 'desc');
$tasks = $query->paginate(10);
$time = microtime(true) - $start;
echo "Taches time: " . number_format($time * 1000, 2) . " ms\n";

$start = microtime(true);
$count = App\Models\Notification::where('destinataire_id', 2)->where('lu', false)->count();
$time = microtime(true) - $start;
echo "Notifs time: " . number_format($time * 1000, 2) . " ms\n";

$start = microtime(true);
$tickets = App\Models\Ticket::with('technicien')->where('user_id', 2)->orderBy('created_at', 'desc')->paginate(10);
$time = microtime(true) - $start;
echo "Tickets time: " . number_format($time * 1000, 2) . " ms\n";
