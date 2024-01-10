import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramBotService } from './telegram-bot.service';
import { UserService } from 'src/user/user.service';
import { WeatherService } from 'src/weather/weather.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
    imports:[
        // TelegrafModule.forRoot({
        //     token: '6559691270:AAEN2AwtYSIIkWa0_l6iYAy-r8XhqWkS3Dg',
        //   }),
          MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
          TelegrafModule.forRoot({
            token: '6559691270:AAEN2AwtYSIIkWa0_l6iYAy-r8XhqWkS3Dg',
            launchOptions: {
              dropPendingUpdates: true,
              webhook: {
                domain: 'https://ast-nest-backend.vercel.app/',
                hookPath: 'api/telegram-webhook',
              },
            }
          }),
    ],
    providers:[TelegramBotService,UserService,WeatherService]
})
export class TelegramBotModule {}
