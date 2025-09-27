import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { LoginInput } from './login-input';
import { LoginResponseModel } from './login-response.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponseModel)
  async login(@Args('input') input: LoginInput): Promise<LoginResponseModel> {
    const user = await this.authService.validateUser(
      input.email,
      input.password,
    );
    const response = await this.authService.login(user);
    return LoginResponseModel.fromDto(response);
  }
}
