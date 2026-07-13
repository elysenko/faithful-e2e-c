import { PartialType } from '@nestjs/swagger';
import { CreateRecipeDto } from './create-recipe.dto';

// All fields optional, but when present they keep the @IsNotEmpty rule from
// CreateRecipeDto — so clearing a required field on update returns 400.
export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}
