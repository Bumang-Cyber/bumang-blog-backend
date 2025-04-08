import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    return await this.tagsService.createTag(createTagDto);
  }

  @Get()
  async findAllTag() {
    return await this.tagsService.findAllTag();
  }

  @Get(':id')
  async findOneTag(@Param('id', ParseIntPipe) id: number) {
    return await this.tagsService.findOneTag(id);
  }

  @Patch(':id')
  async updateOneTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return await this.tagsService.updateOneTag(id, updateTagDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async removeOneTag(@Param('id', ParseIntPipe) id: number) {
    return await this.tagsService.removeOneTag(id);
  }
}
