import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTypeAndPreviewTextInPost implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "post_entity" 
      ADD COLUMN "previewText" VARCHAR(500)
    `);

    // type 컬럼 추가 (PostgreSQL enum 문법)
    await queryRunner.query(`
      CREATE TYPE post_type_enum AS ENUM ('dev', 'life')
    `);

    await queryRunner.query(`
      ALTER TABLE "post_entity" 
      ADD COLUMN "type" post_type_enum DEFAULT 'dev'
    `);

    await queryRunner.query(`
      UPDATE "post_entity" 
      SET "type" = 'life'
      FROM "category_entity" ce, "group_entity" ge
      WHERE "post_entity"."categoryId" = ce.id
        AND ce."groupId" = ge.id
        AND ge.label = 'Life'
    `);

    // 나머지는 'dev'로 설정
    await queryRunner.query(`
      UPDATE "post_entity" 
      SET "type" = 'dev' 
      WHERE "type" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "post_entity" 
      DROP COLUMN "type"
    `);

    await queryRunner.query(`
      DROP TYPE post_type_enum
    `);

    await queryRunner.query(`
      ALTER TABLE "post_entity" 
      DROP COLUMN "previewText"
    `);
  }
}
