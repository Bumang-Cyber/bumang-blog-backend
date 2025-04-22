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

  constructor(
    pageSize: number,
    totalCount: number,
    currentPage: number,
    data: T[],
  ) {
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.currentPage = currentPage;
    this.data = data;
  }
}
