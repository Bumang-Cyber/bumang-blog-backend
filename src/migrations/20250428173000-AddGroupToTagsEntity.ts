import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupToTagsEntity20250428173000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tags_entity"
      ADD COLUMN "groupId" integer NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tags_entity"
      ADD CONSTRAINT "FK_tags_group" FOREIGN KEY ("groupId") REFERENCES "group_entity"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tags_entity"
      DROP CONSTRAINT "FK_tags_group"
    `);

    await queryRunner.query(`
      ALTER TABLE "tags_entity"
      DROP COLUMN "groupId"
    `);
  }
}
