import { Field, Int, ObjectType } from '@nestjs/graphql';
import { LoginResponseDto } from '../dto/login-response.dto';
import { AuthenticatedUserModel } from './authenticated-user.model';

@ObjectType()
export class LoginResponseModel {
  @Field()
  accessToken!: string;

  @Field()
  tokenType!: 'Bearer';

  @Field(() => Int)
  expiresIn!: number;

  @Field(() => AuthenticatedUserModel)
  user!: AuthenticatedUserModel;

  static fromDto(dto: LoginResponseDto): LoginResponseModel {
    const model = new LoginResponseModel();
    model.accessToken = dto.accessToken;
    model.tokenType = dto.tokenType;
    model.expiresIn = dto.expiresIn;
    model.user = AuthenticatedUserModel.fromAuthenticatedUser({
      id: dto.user.id,
      email: dto.user.email,
    });
    return model;
  }
}
