import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsString() @Length(1, 50) firstName!: string;
  @IsString() @Length(1, 50) lastName!: string;
  @IsEmail() email!: string;
  @IsString() @Length(8, 72) @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, { message: 'Password must contain a letter and a number' }) password!: string;
}
