import { Field, ID, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class AuthenticatedUserModel {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  static fromAuthenticatedUser(user: {
    id: string;
    email: string;
  }): AuthenticatedUserModel {
    const model = new AuthenticatedUserModel();
    model.id = user.id;
    model.email = user.email;
    return model;
  }
}
