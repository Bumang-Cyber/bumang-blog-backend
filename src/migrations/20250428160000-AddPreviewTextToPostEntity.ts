import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreviewTextToPostEntity20250428160000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       ALTER TABLE "post_entity"
       ADD COLUMN "preview_text" character varying NULL
     `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
       ALTER TABLE "post_entity"
       DROP COLUMN "preview_text"
     `);
  }
}
