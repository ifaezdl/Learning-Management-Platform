import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(data: any) {
    return {
      message: 'Register API works',
      data,
    };
  }
}
