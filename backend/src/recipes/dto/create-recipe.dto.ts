import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Recipe title',
    nullable: false,
    required: true,
    type: 'string',
    example: 'Grandma’s Apple Pie',
  })
  @IsString()
  @Transform(trim)
  @IsNotEmpty({ message: 'title should not be empty' })
  title: string;

  @ApiProperty({
    description: 'Free-text list of ingredients',
    nullable: false,
    required: true,
    type: 'string',
    example: '2 cups flour\n1 cup sugar\n4 apples',
  })
  @IsString()
  @Transform(trim)
  @IsNotEmpty({ message: 'ingredients should not be empty' })
  ingredients: string;

  @ApiProperty({
    description: 'Free-text preparation steps',
    nullable: false,
    required: true,
    type: 'string',
    example: '1. Preheat oven\n2. Mix ingredients\n3. Bake',
  })
  @IsString()
  @Transform(trim)
  @IsNotEmpty({ message: 'steps should not be empty' })
  steps: string;
}
