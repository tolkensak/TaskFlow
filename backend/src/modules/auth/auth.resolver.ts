// backend/src/modules/auth/auth.resolver.ts

import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth.payload';
import { RegisterInput, LoginInput } from './dto/auth.input';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayload)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
  ): Promise<AuthPayload> {
    return this.authService.refreshToken(refreshToken);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User): Promise<boolean> {
    // In a real app, you might want to blacklist the token here
    return true;
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
