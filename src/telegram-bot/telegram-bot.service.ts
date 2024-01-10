import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
const { message } = require('telegraf/filters');
import { User } from '../schemas/user.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WeatherService } from '../weather/weather.service';
import {
    Update,
    Ctx,
    Start,
    Help,
    On,
    Hears,
    Command,
  } from 'nestjs-telegraf';
  import { Context } from 'telegraf';
import { UserService } from 'src/user/user.service';
  


@Update()
@Injectable()
export class TelegramBotService {
  constructor(
    private readonly userService: UserService,
    private readonly weatherUpdateService: WeatherService,
  ) {}

  


  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Welcome');
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async on(@Ctx() ctx: Context) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hears(@Ctx() ctx: Context) {
    await ctx.reply('Hey there');
  }

  @Command('unsubscribe')
  async unsubscribeUser(ctx: Context) {
    const telegramId = ctx.from.id;
    try {
      // Check if the user is already subscribed
      const existingUser = await this.userService.getUserByTelegramId(telegramId)
      if (existingUser) {
        await this.userService.findUserAndUpdateByTelegramId(telegramId,{
          subscribed: false,
        })
        await ctx.reply(
          'Bye bye! You have been un-subscribed for daily weather updates.',
        );
      } else {
        await ctx.reply('You are not subscribed for daily weather updates.');
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await ctx.reply(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }

  @Command('updatelocation')
  async updateLocation(ctx:any){
    const telegramId = ctx.from.id;
    try {
      // Check if the user is present and subscribed
      const existingUser = await this.userService.getUserByTelegramId(telegramId);
      if (!existingUser || !existingUser.subscribed) {
        await ctx.reply('You are not subscribed for daily weather updates.');
      }else{
        const regex = /^\/updatelocation\s(.+)$/;
        const match = ctx.message.text.match(regex);
        if(match){
          const location = match[1];
          await this.userService.findUserAndUpdateByTelegramId(telegramId,{
            location:location
          });
          await ctx.reply(
            `You will now receive location updates from ${location}`,
          );
          return
        }else{
          ctx.reply('Please provide a location to subscribe.');
          return;
        }
      }
    }catch(error){
      console.error('Error subscribing user:', error);
      await ctx.reply(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }
  @Command('subscribe')
  async subscribeUser(ctx:any) {
    const telegramId = ctx.from.id;
    try {
      // Check if the user is already subscribed
      const existingUser = await this.userService.getUserByTelegramId(telegramId);
      if (existingUser && existingUser.subscribed) {
        await ctx.reply(
          'You are already subscribed for daily weather updates.',
        );
      } else {
        const regex = /^\/subscribe\s(.+)$/;
        const match = ctx.message.text.match(regex);
        if(match){
          const location = ctx.message.text.split(' ')[1];
        // If the user is not subscribed, create a new user and save to MongoDB
        if (existingUser && !existingUser.subscribed) {
          await this.userService.findUserAndUpdateByTelegramId(telegramId,{
            subscribed: true,
            location:location
          });
        } else {
          await this.userService.createuser({
            name: ctx.from.first_name.concat(' ').concat(ctx.from.last_name),
            telegram_id: telegramId,
            subscribed: true,
            location: location,
          })
        }
        await ctx.reply(
          `Welcome! You have been subscribed for daily weather updates. Your location has been set to ${location}`,
        );
        }else{
          ctx.reply('Please provide a location to subscribe.');
          return;
        }
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await ctx.reply(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }
  @Command('getweatherupdate')
  async getUpdate(ctx: Context) {
    const telegramId = ctx.from.id;
    try {
      // Check if the user is already subscribed
      const existingUser = await this.userService.getUserByTelegramId(telegramId);
      if (existingUser && existingUser.subscribed) {
        const weatherUpdate =
          await this.weatherUpdateService.getWeatherUpdate(existingUser.location);
        await ctx.reply(weatherUpdate);
      } else {
        await ctx.reply('You are not subscribed for daily weather updates.');
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await ctx.reply(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }

  // Every day at 6 am and 6 pm
  @Cron('0 6,18 * * *')
  async sendPeriodicUpdates() {
    const subscribedUsers = await this.userService.findUser({ subscribed: true });
    subscribedUsers.forEach(async (user) => {
      const weatherUpdate = await this.weatherUpdateService.getWeatherUpdate(user.location);
    //   this.bot.telegram.sendMessage(user.telegram_id,weatherUpdate)
    });
  }
}
