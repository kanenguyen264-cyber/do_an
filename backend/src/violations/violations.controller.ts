import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ViolationsService } from './violations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Violations')
@Controller('violations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  async findAll() {
    return this.violationsService.findAll();
  }

  @Put(':id/resolve')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  async resolve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.violationsService.resolve(id, user.id);
  }
}
