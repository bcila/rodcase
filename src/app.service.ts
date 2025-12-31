import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Simple health check response
  getHealth(): string {
    return 'OK';
  }
}
