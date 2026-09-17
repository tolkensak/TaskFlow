// backend/src/modules/auth/guards/jwt-auth.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

/**
 * Custom JWT Guard — bypasses Passport entirely
 *
 * Why not use AuthGuard('jwt')?
 * Passport's AuthGuard calls req.logIn() internally,
 * which requires session middleware. For a pure JWT API,
 * we don't need sessions at all.
 *
 * This guard does 3 things:
 * 1. Extracts the JWT from the Authorization header
 * 2. Verifies the signature and expiration
 * 3. Loads the user from the database and attaches to req.user
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;

        console.log('🛡️ JwtAuthGuard: Checking request');

        // Step 1: Get the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ JwtAuthGuard: No Bearer token found');
            throw new UnauthorizedException('No token provided');
        }

        // Step 2: Extract the token
        const token = authHeader.substring(7);
        console.log(
            '🔑 JwtAuthGuard: Token found (first 20 chars):',
            token.slice(0, 20) + '...',
        );

        try {
            // Step 3: Verify the token
            const payload = this.jwtService.verify(token);
            console.log('✅ JwtAuthGuard: Token verified. Payload:', payload);

            // Step 4: Load the user from the database
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                console.log(
                    '❌ JwtAuthGuard: User not found for ID:',
                    payload.sub,
                );
                throw new UnauthorizedException('User not found');
            }

            console.log('✅ JwtAuthGuard: User found:', user.email);

            // Step 5: Attach the user to the request
            req.user = user;
            return true;
        } catch (error) {
            console.log('❌ JwtAuthGuard: Token verification failed:', error);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
