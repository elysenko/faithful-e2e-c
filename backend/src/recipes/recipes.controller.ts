import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/user/entities/user.entity';

import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@ApiBearerAuth()
@ApiTags('Recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @ApiOperation({
    summary: 'LIST RECIPES',
    description:
      'List the authenticated user’s recipes. Optional `q` filters by title (case-insensitive substring); `favorite=1` limits to favorites.',
  })
  @ApiResponse({ status: 200, description: 'Ok' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth()
  findAll(
    @GetUser() user: User,
    @Query('q') q?: string,
    @Query('favorite') favorite?: string,
  ) {
    const onlyFavorites = favorite === '1' || favorite === 'true';
    return this.recipesService.findAll(user.id, q, onlyFavorites);
  }

  @Post()
  @ApiOperation({
    summary: 'CREATE RECIPE',
    description: 'Create a recipe owned by the authenticated user.',
  })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Auth()
  create(@GetUser() user: User, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(user.id, createRecipeDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET RECIPE',
    description: 'Get full detail for one owned recipe.',
  })
  @ApiResponse({ status: 200, description: 'Ok' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Auth()
  findOne(@GetUser() user: User, @Param('id') id: string) {
    return this.recipesService.findOne(user.id, id);
  }

  @Patch(':id/favorite')
  @ApiOperation({
    summary: 'TOGGLE FAVORITE',
    description: 'Toggle the favorite flag on an owned recipe and return the new state.',
  })
  @ApiResponse({ status: 200, description: 'Ok' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Auth()
  toggleFavorite(@GetUser() user: User, @Param('id') id: string) {
    return this.recipesService.toggleFavorite(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'UPDATE RECIPE',
    description:
      'Update an owned recipe. Required fields, when provided, must be non-empty (else 400).',
  })
  @ApiResponse({ status: 200, description: 'Ok' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Auth()
  update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(user.id, id, updateRecipeDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'DELETE RECIPE',
    description: 'Hard-delete an owned recipe.',
  })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.recipesService.remove(user.id, id);
  }
}
