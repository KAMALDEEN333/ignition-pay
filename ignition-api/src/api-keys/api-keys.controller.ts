import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

interface JwtUser {
  sub: string;
  walletAddress: string;
  role: string;
}

@ApiTags('api-keys')
@ApiBearerAuth('JWT-auth')
@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key successfully created' })
  async create(@Req() req: Request & { user: JwtUser }) {
    const rawKey = `sk_${randomBytes(32).toString('hex')}`;
    const prefix = rawKey.slice(0, 12);
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId: req.user.sub,
        name: `API Key ${new Date().toISOString().slice(0, 10)}`,
        keyHash,
        prefix,
        scope: 'read',
      },
    });

    // Return the raw key only once — it cannot be recovered after this response
    return {
      id: apiKey.id,
      key: rawKey,
      prefix: apiKey.prefix,
      scope: apiKey.scope,
      createdAt: apiKey.createdAt,
    };
  }

  @Delete(':id')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 200, description: 'API key successfully revoked' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to revoke this key' })
  async revoke(
    @Param('id') id: string,
    @Req() req: Request & { user: JwtUser },
  ) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    if (apiKey.userId !== req.user.sub) {
      throw new ForbiddenException('You do not own this API key');
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'API key revoked successfully' };
  }
}
