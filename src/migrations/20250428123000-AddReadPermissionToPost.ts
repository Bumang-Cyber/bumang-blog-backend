import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReadPermissionToPost20250428123000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "post"
      ADD COLUMN "read_permission" "roles_enum" NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "post"
      DROP COLUMN "read_permission"
    `);
  }
}
