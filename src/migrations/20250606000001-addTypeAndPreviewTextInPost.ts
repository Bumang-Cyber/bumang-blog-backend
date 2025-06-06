import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePostType1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // previewText 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE post_entity 
      ADD COLUMN previewText VARCHAR(500)
    `);

    // type 컬럼 추가/수정
    await queryRunner.query(`
      ALTER TABLE post_entity 
      ADD COLUMN type enum('dev', 'life') DEFAULT 'dev'
    `);

    // group label이 'Life'인 경우 type을 'life'로 설정
    await queryRunner.query(`
      UPDATE post_entity pe
      INNER JOIN category_entity ce ON pe.categoryId = ce.id
      INNER JOIN group_entity ge ON ce.groupId = ge.id
      SET pe.type = 'life'
      WHERE ge.label = 'Life'
    `);

    // 나머지는 'dev'로 설정 (NULL인 경우)
    await queryRunner.query(`
      UPDATE post_entity 
      SET type = 'dev' 
      WHERE type IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백 시 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE post_entity 
      DROP COLUMN type
    `);
  }
}
