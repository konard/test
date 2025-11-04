<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CorruptionCaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testCases = [
            [
                'region_id' => 1, // Москва
                'position_hash' => hash_hmac('sha256', 'Начальник отдела закупок', config('app.anon_salt', 'default_salt')),
                'violation_type' => 'взятка',
                'date' => '2023-05-15',
                'status' => 'завершено',
                'description_anon' => 'Должностное лицо получило денежные средства за предоставление преференций при проведении закупок.',
                'original_data' => 'Encrypted test data'
            ],
            [
                'region_id' => 1, // Москва
                'position_hash' => hash_hmac('sha256', 'Директор департамента', config('app.anon_salt', 'default_salt')),
                'violation_type' => 'злоупотребление',
                'date' => '2023-08-22',
                'status' => 'расследуется',
                'description_anon' => 'Выявлено превышение должностных полномочий при распределении бюджетных средств.',
                'original_data' => 'Encrypted test data'
            ],
            [
                'region_id' => 2, // Санкт-Петербург
                'position_hash' => hash_hmac('sha256', 'Главный инженер', config('app.anon_salt', 'default_salt')),
                'violation_type' => 'растрата',
                'date' => '2023-03-10',
                'status' => 'завершено',
                'description_anon' => 'Обнаружено нецелевое использование бюджетных средств на сумму более 5 млн рублей.',
                'original_data' => 'Encrypted test data'
            ],
            [
                'region_id' => 3, // Татарстан
                'position_hash' => hash_hmac('sha256', 'Заместитель министра', config('app.anon_salt', 'default_salt')),
                'violation_type' => 'коммерческий подкуп',
                'date' => '2023-11-05',
                'status' => 'расследуется',
                'description_anon' => 'Должностное лицо получило незаконное вознаграждение за совершение действий в пользу коммерческой организации.',
                'original_data' => 'Encrypted test data'
            ],
        ];

        foreach ($testCases as $case) {
            DB::table('corruption_cases')->insert($case);
        }
    }
}
