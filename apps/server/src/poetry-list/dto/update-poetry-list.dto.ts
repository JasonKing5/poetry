import { PartialType } from '@nestjs/mapped-types';
import { CreatePoetryListDto } from './create-poetry-list.dto';

export class UpdatePoetryListDto extends PartialType(CreatePoetryListDto) {}
