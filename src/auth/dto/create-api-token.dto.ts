import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateApiTokenDto {
  @ApiProperty({ example: 'My Browser Extension' })
  @IsString()
  name: string;
}
