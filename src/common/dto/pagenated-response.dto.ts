import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty()
  subject: string;

  constructor(
    totalCount: number,
    pageSize: number,
    currentPage: number,
    data: T[],
    subject?: string,
  ) {
    this.totalCount = totalCount;
    this.pageSize = pageSize; //
    this.currentPage = currentPage;
    this.data = data;
    this.subject = subject;
  }
}
