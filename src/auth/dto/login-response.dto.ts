import { ApiProperty } from '@nestjs/swagger';

class AuthenticatedUserDto {
  @ApiProperty({ example: 'a3f538f1-3f0f-4a31-9a27-7f9fa0dfc2a5' })
  id!: string;

  @ApiProperty({ example: 'franco@pandektes.com' })
  email!: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token to use as a Bearer token.' })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer', default: 'Bearer' })
  tokenType!: 'Bearer';

  @ApiProperty({
    description: 'Lifetime of the access token in seconds.',
    example: 900,
  })
  expiresIn!: number;

  @ApiProperty({ type: AuthenticatedUserDto })
  user!: AuthenticatedUserDto;
}
