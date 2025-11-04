<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('corruption_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained('regions')->onDelete('cascade');
            $table->string('position_hash', 64)->comment('SHA256 хеш должности для анонимизации');
            $table->enum('violation_type', [
                'взятка',
                'злоупотребление',
                'растрата',
                'мошенничество',
                'превышение полномочий',
                'коммерческий подкуп',
                'другое'
            ])->comment('Тип нарушения');
            $table->date('date')->comment('Дата нарушения');
            $table->enum('status', [
                'расследуется',
                'завершено',
                'приостановлено',
                'прекращено'
            ])->default('расследуется')->comment('Статус дела');
            $table->text('description_anon')->nullable()->comment('Анонимизированное описание');
            $table->text('original_data')->nullable()->comment('Зашифрованные исходные данные');
            $table->timestamps();

            $table->index('region_id');
            $table->index('date');
            $table->index('violation_type');
            $table->index(['region_id', 'date']);
        });

        // Create trigger for auto-anonymization
        DB::unprepared('
            CREATE TRIGGER anon_description BEFORE INSERT ON corruption_cases
            FOR EACH ROW
            BEGIN
                IF NEW.description_anon IS NOT NULL THEN
                    SET NEW.description_anon = REGEXP_REPLACE(
                        NEW.description_anon,
                        "[А-ЯЁ][а-яё]+\\\\s+[А-ЯЁ]\\\\.[А-ЯЁ]\\\\.",
                        "Должностное лицо"
                    );
                END IF;
            END
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS anon_description');
        Schema::dropIfExists('corruption_cases');
    }
};
