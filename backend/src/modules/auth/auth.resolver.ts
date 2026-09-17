// backend/src/modules/auth/auth.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth.payload';
import { RegisterInput, LoginInput } from './dto/auth.input';
import { User } from '../users/entities/user.entity';
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

    // ✅ Re-enable the guard on logout
    @Mutation(() => Boolean)
    @UseGuards(AuthGuard('jwt'))
    async logout(@CurrentUser() user: User): Promise<boolean> {
        return true;
    }

    // ✅ Re-enable the guard on me
    @Query(() => User)
    @UseGuards(AuthGuard('jwt'))
    async me(@CurrentUser() user: User): Promise<User> {
        return user;
    }
}
