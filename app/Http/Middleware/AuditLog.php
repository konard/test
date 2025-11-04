<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditLog
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log authenticated user actions
        if (Auth::check() && config('app.audit_log_enabled', true)) {
            $this->logAction($request, $response);
        }

        return $response;
    }

    /**
     * Log the action to audit log
     */
    private function logAction(Request $request, Response $response): void
    {
        $user = Auth::user();
        $method = $request->method();
        $path = $request->path();
        $ip = $request->ip();

        // Only log important actions (POST, PUT, DELETE)
        if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return;
        }

        $action = $this->determineAction($method, $path, $request);

        if ($action) {
            $logMessage = sprintf(
                '[%s] USER:%s (ID:%d) ACTION:%s PATH:%s IP:%s STATUS:%d',
                now()->format('Y-m-d H:i:s'),
                $user->email,
                $user->id,
                $action,
                $path,
                $ip,
                $response->getStatusCode()
            );

            // Log to dedicated audit log file
            Log::channel('audit')->info($logMessage);
        }
    }

    /**
     * Determine the action being performed
     */
    private function determineAction(string $method, string $path, Request $request): ?string
    {
        // Map routes to actions
        if (str_contains($path, 'import')) {
            return 'imported_data';
        }

        if (str_contains($path, 'corruption-cases')) {
            if ($method === 'POST') return 'created_case';
            if ($method === 'PUT' || $method === 'PATCH') return 'updated_case';
            if ($method === 'DELETE') return 'deleted_case';
        }

        if (str_contains($path, 'users')) {
            if ($method === 'POST') return 'created_user';
            if ($method === 'PUT' || $method === 'PATCH') return 'updated_user';
            if ($method === 'DELETE') return 'deleted_user';
        }

        return null;
    }
}
