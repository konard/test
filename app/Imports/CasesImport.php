<?php

namespace App\Imports;

use App\Models\CorruptionCase;
use App\Models\Region;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class CasesImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    public array $errors = [];
    public int $successCount = 0;
    public int $errorCount = 0;

    /**
     * Process the collection
     */
    public function collection(Collection $rows)
    {
        $validViolationTypes = ['взятка', 'злоупотребление', 'растрата', 'мошенничество', 'превышение полномочий', 'коммерческий подкуп', 'другое'];
        $validStatuses = ['расследуется', 'завершено', 'приостановлено', 'прекращено'];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2; // +2 because of 0-index and header row

            // Validate row
            $validator = Validator::make($row->toArray(), [
                'region' => ['required', 'string', Rule::exists('regions', 'name')],
                'position' => ['required', 'string', 'max:255'],
                'violation_type' => ['required', Rule::in($validViolationTypes)],
                'date' => ['required', 'date_format:Y-m-d', 'after:2000-01-01', 'before_or_equal:today'],
                'status' => ['nullable', Rule::in($validStatuses)],
                'description' => ['nullable', 'string'],
            ]);

            if ($validator->fails()) {
                $this->errorCount++;
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => $validator->errors()->all(),
                    'data' => $row->toArray(),
                ];
                continue;
            }

            try {
                // Find region
                $region = Region::where('name', $row['region'])->first();

                if (!$region) {
                    $this->errorCount++;
                    $this->errors[] = [
                        'row' => $rowNumber,
                        'errors' => ["Регион '{$row['region']}' не найден"],
                        'data' => $row->toArray(),
                    ];
                    continue;
                }

                // Create case
                CorruptionCase::create([
                    'region_id' => $region->id,
                    'position_hash' => CorruptionCase::hashPosition($row['position']),
                    'violation_type' => $row['violation_type'],
                    'date' => $row['date'],
                    'status' => $row['status'] ?? 'расследуется',
                    'description_anon' => CorruptionCase::anonymizeDescription($row['description'] ?? ''),
                    'original_data' => $row['description'] ?? '',
                ]);

                $this->successCount++;

            } catch (\Exception $e) {
                $this->errorCount++;
                $this->errors[] = [
                    'row' => $rowNumber,
                    'errors' => ['Ошибка при создании записи: ' . $e->getMessage()],
                    'data' => $row->toArray(),
                ];
            }
        }
    }

    /**
     * Chunk size for reading large files
     */
    public function chunkSize(): int
    {
        return 1000;
    }

    /**
     * Get errors as array for Excel export
     */
    public function getErrorsForExport(): array
    {
        $export = [];
        $export[] = ['Строка', 'Ошибка', 'Регион', 'Должность', 'Тип нарушения', 'Дата'];

        foreach ($this->errors as $error) {
            $errorMessages = implode('; ', $error['errors']);
            $data = $error['data'];

            $export[] = [
                $error['row'],
                $errorMessages,
                $data['region'] ?? '',
                $data['position'] ?? '',
                $data['violation_type'] ?? '',
                $data['date'] ?? '',
            ];
        }

        return $export;
    }
}
