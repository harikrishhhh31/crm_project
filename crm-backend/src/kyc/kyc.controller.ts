import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { KycService } from './kyc.service.js';

const uploadConfig = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
};

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kyc')
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', uploadConfig))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('customerId') customerId: string | undefined,
    @CurrentUser() user: { id: string },
  ) {
    return this.kyc.processUpload(file, user.id, customerId);
  }

  @Get()
  list(@Query('customerId') customerId?: string) {
    return this.kyc.findAll(customerId);
  }

  @Get(':id')
  one(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.kyc.findOne(id, user.id, user.role);
  }

  @Roles('MANAGER', 'ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: { role: string },
  ) {
    return this.kyc.updateStatus(id, status, user.role);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { role: string }) {
    return this.kyc.remove(id, user.role);
  }
}
