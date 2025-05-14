import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixPostEntityContentFromJsonToString20250514218763
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 기존 데이터를 백업 (필요시)
    await queryRunner.query(
      `ALTER TABLE "post_entity" ADD COLUMN "content_backup" JSONB DEFAULT NULL`,
    );
    await queryRunner.query(
      `UPDATE "post_entity" SET "content_backup" = "content"`,
    );

    // 2. content 컬럼을 text로 변경
    await queryRunner.changeColumn(
      'post_entity',
      'content',
      new TableColumn({
        name: 'content',
        type: 'text', // string 대신 text 사용
        isNullable: false,
        default: `''`, // 빈 문자열 기본값 설정
      }),
    );

    // 3. JSON 데이터를 문자열로 변환 (필요시)
    await queryRunner.query(
      `UPDATE "post_entity" SET "content" = CAST("content_backup" AS TEXT) WHERE "content_backup" IS NOT NULL`,
    );

    // 4. 백업 컬럼 제거 (선택적)
    await queryRunner.query(
      `ALTER TABLE "post_entity" DROP COLUMN "content_backup"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 문자열 데이터를 JSON으로 변환할 수 있도록 백업
    await queryRunner.query(
      `ALTER TABLE "post_entity" ADD COLUMN "content_text_backup" TEXT DEFAULT NULL`,
    );
    await queryRunner.query(
      `UPDATE "post_entity" SET "content_text_backup" = "content"`,
    );

    // 2. content 컬럼을 다시 jsonB로 변경
    await queryRunner.changeColumn(
      'post_entity',
      'content',
      new TableColumn({
        name: 'content',
        type: 'jsonb', // 대소문자 주의 (jsonB -> jsonb)
        isNullable: false,
        default: `'{}'`, // 빈 JSON 객체 기본값 설정
      }),
    );

    // 3. 문자열 데이터를 JSON으로 변환 시도 (가능한 경우)
    await queryRunner.query(
      `UPDATE "post_entity" SET "content" = CAST("content_text_backup" AS JSONB) 
       WHERE "content_text_backup" IS NOT NULL AND "content_text_backup" ~ '^[{\\[].*[}\\]]$'`,
    );

    // 4. 백업 컬럼 제거
    await queryRunner.query(
      `ALTER TABLE "post_entity" DROP COLUMN "content_text_backup"`,
    );
  }
}
