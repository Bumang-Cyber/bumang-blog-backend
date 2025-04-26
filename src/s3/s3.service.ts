// src/s3/s3.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { sanitizeFileName } from 'src/common/util/sanitizeFileName';

@Injectable()
export class S3Service {
  // constructor 할당을 생략.
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async generatePresignedUrl(filename: string, mimetype: string) {
    const FOLDER_NAME = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

    const sanitizedFileName = sanitizeFileName(filename);
    // ✅ S3에 저장될 파일의 키 설정 (썸네일 폴더 + timestamp + 파일명)
    const key = `${FOLDER_NAME}/thumbnails/${Date.now()}_${sanitizedFileName}`;

    // ✅ S3에 업로드할 객체 정보 정의
    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME, // 사용할 S3 버킷 이름
      Key: key, // S3 객체 키 (파일 경로)
      ContentType: mimetype, // 파일 MIME 타입
    };

    // ✅ 파일 업로드를 위한 S3 명령 생성
    const command = new PutObjectCommand(params);

    // ✅ Presigned URL 발급 (60초 유효)
    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 });

    // ✅ 프론트로 보낼 presigned URL, S3 키, public URL 반환
    return {
      url, // PUT 요청 보낼 presigned URL
      key, // S3 저장 경로
      publicUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }
}
