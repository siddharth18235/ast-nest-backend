import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserSchema } from './schemas/user.schema';
import { WeatherService } from './weather/weather.service';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://Siddharth999:siddharth999@cluster0.wmel5.mongodb.net/?retryWrites=true&w=majority'),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    TelegrafModule.forRoot({
      token: '6559691270:AAEN2AwtYSIIkWa0_l6iYAy-r8XhqWkS3Dg',
    }),
    UserModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService, WeatherService,TelegramBotService],
  exports:[MongooseModule,TelegrafModule]
})
export class AppModule {}
