import { Injectable } from '@nestjs/common';
import {
  Update,
} from 'nestjs-telegraf';

@Update()
@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Welcome to server!' };
  }
}
