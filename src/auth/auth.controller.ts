import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedUser } from './types/authenticated-user';

type LoginRequest = { user: AuthenticatedUser };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'Authenticate a user and obtain a JWT access token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials supplied.' })
  @ApiBadRequestResponse({
    description: 'Validation failed for the supplied request body.',
  })
  async login(
    @Body() _credentials: LoginDto,
    @Request() request: LoginRequest,
  ): Promise<LoginResponseDto> {
    return this.authService.login(request.user);
  }
}
