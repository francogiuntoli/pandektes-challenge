import { Field, InputType } from '@nestjs/graphql';
import { LoginDto } from '../dto/login.dto';

@InputType()
export class LoginInput extends LoginDto {
  @Field()
  override email: string = '';

  @Field()
  override password: string = '';
}
