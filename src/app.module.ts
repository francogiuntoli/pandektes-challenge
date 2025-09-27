import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { CasesModule } from './cases/cases.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      introspection: true,
      playground: false,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    PrismaModule,
    CasesModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
