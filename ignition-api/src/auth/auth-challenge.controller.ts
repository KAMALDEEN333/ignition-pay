import { Controller, Get, Query } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChallengeQueryDto } from './dto/challenge-query.dto';

interface ChallengeResponse {
  challenge: string;
}

@ApiTags('auth')
@Controller('auth')
@Throttle({ strict: { limit: 5, ttl: 60_000 } })
export class AuthChallengeController {
  @Get('challenge')
  @ApiOperation({ summary: 'Get authentication challenge for wallet address' })
  @ApiResponse({ status: 200, description: 'Returns challenge string' })
  @ApiResponse({ status: 400, description: 'Invalid Stellar wallet address' })
  getChallenge(
    @Query() query: ChallengeQueryDto,
  ): ChallengeResponse {
    const { walletAddress } = query;

    const nonce = randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000);
    const challenge = `stellaraid:login:${nonce}:${timestamp}`;

    return { challenge };
  }
}
