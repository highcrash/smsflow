import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');

    // API keys start with sf_
    if (!token.startsWith('sf_')) {
      throw new UnauthorizedException('Invalid API key format');
    }

    const result = await this.apiKeysService.validate(token);

    // Attach user to request so controllers work the same way
    request.user = { id: result.userId, ...result.user, apiKeyPermissions: result.permissions };
    return true;
  }
}
