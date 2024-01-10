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
                domain: 'https://webhook.site',
                hookPath: '11559d76-d04d-4635-ab6e-b5b625f759d5',
              },
            }
          }),
    ],
    providers:[TelegramBotService,UserService,WeatherService]
})
export class TelegramBotModule {}
