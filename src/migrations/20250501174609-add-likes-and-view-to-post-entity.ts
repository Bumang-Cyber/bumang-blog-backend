import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLikesAndViewToPostEntity1680000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'post_entity',
      new TableColumn({
        name: 'likes',
        type: 'integer',
        isNullable: false,
        default: 0,
      }),
    );

    await queryRunner.addColumn(
      'post_entity',
      new TableColumn({
        name: 'view',
        type: 'integer',
        isNullable: false,
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('post_entity', 'likes');
    await queryRunner.dropColumn('post_entity', 'view');
  }
}
