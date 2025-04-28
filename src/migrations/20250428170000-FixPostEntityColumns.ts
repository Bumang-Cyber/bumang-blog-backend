import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPostEntityColumns20250428170000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 기존 잘못된 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE "post_entity"
      DROP COLUMN IF EXISTS "read_permission"
    `);

    await queryRunner.query(`
      ALTER TABLE "post_entity"
      DROP COLUMN IF EXISTS "preview_text"
    `);

    // 2. ENUM 타입이 없다면 새로 생성 (보통 별도 migration에서 먼저 했어야 하지만, 여기에 포함할게)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_entity_readpermission_enum') THEN
          CREATE TYPE "post_entity_readpermission_enum" AS ENUM ('ADMIN', 'USER', 'GUEST');
        END IF;
      END$$;
    `);

    // 3. 새 컬럼 camelCase로 추가
    await queryRunner.query(`
      ALTER TABLE "post_entity"
      ADD COLUMN "readPermission" "post_entity_readpermission_enum" NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "post_entity"
      ADD COLUMN "previewText" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. 새로 추가한 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE "post_entity"
      DROP COLUMN IF EXISTS "readPermission"
    `);

    await queryRunner.query(`
      ALTER TABLE "post_entity"
      DROP COLUMN IF EXISTS "previewText"
    `);

    // 2. ENUM 타입도 삭제 (주의: 다른 테이블에서도 이 ENUM을 쓰고 있으면 DROP TYPE은 에러 남)
    await queryRunner.query(`
      DROP TYPE IF EXISTS "post_entity_readpermission_enum"
    `);
  }
}
