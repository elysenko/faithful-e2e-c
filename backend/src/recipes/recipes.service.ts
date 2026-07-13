import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  private readonly logger = new Logger('RecipesService');

  constructor(private prisma: PrismaService) {}

  // GET /recipes?q=&favorite= — list the authenticated user's recipes as cards.
  async findAll(userId: string, q?: string, favorite?: boolean) {
    const where: Record<string, unknown> = { userId };

    if (q && q.trim().length > 0) {
      where.title = { contains: q.trim(), mode: 'insensitive' };
    }
    if (favorite === true) {
      where.isFavorite = true;
    }

    try {
      return await this.prisma.recipe.findMany({
        where,
        select: { id: true, title: true, isFavorite: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`GET: recipes: error: ${error}`);
      throw error;
    }
  }

  // GET /recipes/:id — full detail for an owned recipe, else 404.
  async findOne(userId: string, id: string) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id, userId },
    });

    if (!recipe) throw new NotFoundException('Recipe not found');

    return recipe;
  }

  // POST /recipes
  async create(userId: string, dto: CreateRecipeDto) {
    try {
      return await this.prisma.recipe.create({
        data: {
          userId,
          title: dto.title,
          ingredients: dto.ingredients,
          steps: dto.steps,
        },
      });
    } catch (error) {
      this.logger.error(`POST: recipes: error: ${error}`);
      throw error;
    }
  }

  // PATCH /recipes/:id
  async update(userId: string, id: string, dto: UpdateRecipeDto) {
    // Ownership / existence check first so unknown ids return 404, not 500.
    await this.findOne(userId, id);

    try {
      return await this.prisma.recipe.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.ingredients !== undefined && { ingredients: dto.ingredients }),
          ...(dto.steps !== undefined && { steps: dto.steps }),
        },
      });
    } catch (error) {
      this.logger.error(`PATCH: recipes/${id}: error: ${error}`);
      throw error;
    }
  }

  // PATCH /recipes/:id/favorite — toggle and return the new state.
  async toggleFavorite(userId: string, id: string) {
    const recipe = await this.findOne(userId, id);

    const updated = await this.prisma.recipe.update({
      where: { id },
      data: { isFavorite: !recipe.isFavorite },
      select: { id: true, isFavorite: true },
    });

    return updated;
  }

  // DELETE /recipes/:id
  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    try {
      await this.prisma.recipe.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`DELETE: recipes/${id}: error: ${error}`);
      throw error;
    }
  }
}
