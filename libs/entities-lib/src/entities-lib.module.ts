import { Module } from '@nestjs/common';
import { EntitiesLibService } from './entities-lib.service';

@Module({
  providers: [EntitiesLibService],
  exports: [EntitiesLibService],
})
export class EntitiesLibModule {}
