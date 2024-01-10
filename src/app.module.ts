import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
    UserModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService, WeatherService,TelegramBotService],
  exports:[MongooseModule]
})
export class AppModule {}
