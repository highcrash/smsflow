import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';

/**
 * Accepts either a JWT access token or an sf_ API key in the Authorization header.
 * Attaches the resolved user to request.user in both cases.
 */
@Injectable()
export class CombinedAuthGuard implements CanActivate {
  private jwtGuard: CanActivate;

  constructor(private readonly apiKeysService: ApiKeysService) {
    // Instantiate the Passport JWT guard (stateless, no DI needed)
    this.jwtGuard = new (AuthGuard('jwt'))();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');

    // Route to API key validation if the token looks like an API key
    if (token.startsWith('sf_')) {
      const result = await this.apiKeysService.validate(token);
      request.user = {
        id: result.userId,
        ...result.user,
        apiKeyPermissions: result.permissions,
      };
      return true;
    }

    // Otherwise fall through to JWT validation
    try {
      return (await (this.jwtGuard as any).canActivate(context)) as boolean;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
