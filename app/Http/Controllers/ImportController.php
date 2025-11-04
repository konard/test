<?php

namespace App\Http\Controllers;

use App\Imports\CasesImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class ImportController extends Controller
{
    /**
     * Show the import form
     */
    public function index()
    {
        return view('admin.import');
    }

    /**
     * Process the file upload
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:csv,xlsx,txt',
                'max:' . (int)(config('app.max_upload_size', 64) * 1024), // Convert MB to KB
            ],
        ]);

        try {
            $file = $request->file('file');
            $import = new CasesImport();

            // Import the file
            Excel::import($import, $file);

            // Generate error report if there are errors
            $errorReportPath = null;
            if ($import->errorCount > 0) {
                $timestamp = now()->format('Y-m-d_His');
                $errorReportPath = "errors/errors_{$timestamp}.xlsx";

                // Create errors directory if it doesn't exist
                Storage::makeDirectory('errors');

                // Export errors to Excel
                Excel::store(
                    new \Maatwebsite\Excel\Concerns\FromArray($import->getErrorsForExport()),
                    $errorReportPath,
                    'local'
                );
            }

            return back()->with([
                'success' => true,
                'message' => "Импорт завершен. Успешно: {$import->successCount}, Ошибок: {$import->errorCount}",
                'successCount' => $import->successCount,
                'errorCount' => $import->errorCount,
                'errorReportPath' => $errorReportPath,
            ]);

        } catch (\Exception $e) {
            return back()->with([
                'success' => false,
                'message' => 'Ошибка при импорте: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Download error report
     */
    public function downloadErrors(Request $request)
    {
        $path = $request->query('path');

        if (!$path || !Storage::exists($path)) {
            abort(404, 'Файл отчета не найден');
        }

        return Storage::download($path);
    }
}
