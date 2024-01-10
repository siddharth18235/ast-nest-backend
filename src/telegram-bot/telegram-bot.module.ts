import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';
import { UserSchema } from 'src/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from 'src/weather/weather.service';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      HttpModule.registerAsync({
        useFactory: () => ({
          timeout: 5000,
          maxRedirects: 5,
        })
      })
      ],
      providers:[TelegramBotService,WeatherService],
})
export class TelegramBotModule {}
