import { Injectable } from '@nestjs/common';
import { CreatePoetryListDto } from './dto/create-poetry-list.dto';
import { UpdatePoetryListDto } from './dto/update-poetry-list.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PoetryListService {
  constructor(private readonly prisma: PrismaService) {}

  private SELECT_POETRY_LIST_BASE = {
    id: true,
    title: true,
    description: true,
    creator: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    isPublic: true,
    createdAt: true,
    updatedAt: true,
  };

  private SELECT_POETRY_LIST_FULL = {
    ...this.SELECT_POETRY_LIST_BASE,
    items: {
      select: {
        poetry: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            type: true,
            tags: true,
            source: true,
            dynasty: true,
            submitter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    },
  };

  create(createPoetryListDto: CreatePoetryListDto) {
    return this.prisma.poetryList.create({
      data: {
        ...createPoetryListDto,
        creatorId: Number(createPoetryListDto.creatorId),
      },
    });
  }

  findAll() {
    return this.prisma.poetryList.findMany({
      select: this.SELECT_POETRY_LIST_BASE,
    });
  }

  findOne(id: number) {
    return this.prisma.poetryList.findUnique({ where: { id }, select: this.SELECT_POETRY_LIST_FULL });
  }

  update(id: number, updatePoetryListDto: UpdatePoetryListDto) {
    return this.prisma.poetryList.update({ where: { id }, data: {
      ...updatePoetryListDto,
      creatorId: Number(updatePoetryListDto.creatorId),
    } });
  }

  remove(id: number) {
    return this.prisma.poetryList.delete({ where: { id } });
  }
}
