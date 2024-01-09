import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document } from 'mongoose';


export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  telegram_id: string;

  @Prop()
  subscribed:boolean

  @Prop()
  location: string
  
}

export const UserSchema = SchemaFactory.createForClass(User);

export interface IUser extends Document{
    readonly name: string;
    readonly telegram_id: string;
}