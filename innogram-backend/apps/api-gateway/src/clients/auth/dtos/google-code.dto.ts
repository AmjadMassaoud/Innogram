import { IsNotEmpty, IsString } from "class-validator";

export default class GoogleCodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
