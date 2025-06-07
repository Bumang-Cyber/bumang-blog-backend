import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1749273873041 implements MigrationInterface {
  name = 'InitSchema1749273873041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tags_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "groupId" integer, CONSTRAINT "UQ_9f4ef6d929e09165503a46b1dae" UNIQUE ("title"), CONSTRAINT "PK_f94608c6a96e0ae32c6fe4a5a9a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_entity" ("id" SERIAL NOT NULL, "label" character varying NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_50461fa7f1a084e5012d29a268c" UNIQUE ("label"), CONSTRAINT "PK_d074114199e1996b57b04ac77ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category_entity" ("id" SERIAL NOT NULL, "label" character varying NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "groupId" integer, CONSTRAINT "UQ_8524fe389b3180534b9730807de" UNIQUE ("label"), CONSTRAINT "UQ_2faa23220e768bac55bb6b9a4a1" UNIQUE ("groupId", "order"), CONSTRAINT "PK_1a38b9007ed8afab85026703a53" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_entity" ("id" SERIAL NOT NULL, "content" character varying(200) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer NOT NULL, "postId" integer NOT NULL, CONSTRAINT "PK_5a439a16c76d63e046765cdb84f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_entity_readpermission_enum" AS ENUM('admin', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" character varying NOT NULL, "previewText" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "readPermission" "public"."post_entity_readpermission_enum", "likes" integer NOT NULL DEFAULT '0', "view" integer NOT NULL DEFAULT '0', "authorId" integer, "categoryId" integer, CONSTRAINT "PK_58a149c4e88bf49036bc4c8c79f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_entity_role_enum" AS ENUM('admin', 'user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_entity" ("id" SERIAL NOT NULL, "nickname" character varying(20) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_entity_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "refreshToken" character varying, CONSTRAINT "UQ_70a1af4dcafe328ae2fb2dc9690" UNIQUE ("nickname"), CONSTRAINT "UQ_415c35b9b3b6fe45a3b065030f5" UNIQUE ("email"), CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_entity_tags_tags_entity" ("postEntityId" integer NOT NULL, "tagsEntityId" integer NOT NULL, CONSTRAINT "PK_bfaa8a92dab3fc04e0d48e1b89f" PRIMARY KEY ("postEntityId", "tagsEntityId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb2ba8370341e8bf7f11287bca" ON "post_entity_tags_tags_entity" ("postEntityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6858cf442e16993d779a5ba199" ON "post_entity_tags_tags_entity" ("tagsEntityId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_entity" ADD CONSTRAINT "FK_0839f712dfdb46be23dfc06f542" FOREIGN KEY ("groupId") REFERENCES "group_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_entity" ADD CONSTRAINT "FK_a64aac533d1822bbece338a9061" FOREIGN KEY ("groupId") REFERENCES "group_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_entity" ADD CONSTRAINT "FK_31f70669b3ae650b3335cc02417" FOREIGN KEY ("authorId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_entity" ADD CONSTRAINT "FK_8149ef6edc077bb121ae704e3a8" FOREIGN KEY ("postId") REFERENCES "post_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_entity" ADD CONSTRAINT "FK_6fbc92fc8a38f75ffe91acd93a8" FOREIGN KEY ("authorId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_entity" ADD CONSTRAINT "FK_3c52725851bf5373a7285426c7c" FOREIGN KEY ("categoryId") REFERENCES "category_entity"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_entity_tags_tags_entity" ADD CONSTRAINT "FK_cb2ba8370341e8bf7f11287bca8" FOREIGN KEY ("postEntityId") REFERENCES "post_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_entity_tags_tags_entity" ADD CONSTRAINT "FK_6858cf442e16993d779a5ba1993" FOREIGN KEY ("tagsEntityId") REFERENCES "tags_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_entity_tags_tags_entity" DROP CONSTRAINT "FK_6858cf442e16993d779a5ba1993"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_entity_tags_tags_entity" DROP CONSTRAINT "FK_cb2ba8370341e8bf7f11287bca8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_entity" DROP CONSTRAINT "FK_3c52725851bf5373a7285426c7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post_entity" DROP CONSTRAINT "FK_6fbc92fc8a38f75ffe91acd93a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_entity" DROP CONSTRAINT "FK_8149ef6edc077bb121ae704e3a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment_entity" DROP CONSTRAINT "FK_31f70669b3ae650b3335cc02417"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_entity" DROP CONSTRAINT "FK_a64aac533d1822bbece338a9061"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags_entity" DROP CONSTRAINT "FK_0839f712dfdb46be23dfc06f542"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6858cf442e16993d779a5ba199"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb2ba8370341e8bf7f11287bca"`,
    );
    await queryRunner.query(`DROP TABLE "post_entity_tags_tags_entity"`);
    await queryRunner.query(`DROP TABLE "user_entity"`);
    await queryRunner.query(`DROP TYPE "public"."user_entity_role_enum"`);
    await queryRunner.query(`DROP TABLE "post_entity"`);
    await queryRunner.query(
      `DROP TYPE "public"."post_entity_readpermission_enum"`,
    );
    await queryRunner.query(`DROP TABLE "comment_entity"`);
    await queryRunner.query(`DROP TABLE "category_entity"`);
    await queryRunner.query(`DROP TABLE "group_entity"`);
    await queryRunner.query(`DROP TABLE "tags_entity"`);
  }
}
