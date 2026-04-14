import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { SCENARIO_TYPES, type ScenarioType } from '../scenario.types';

export class RunScenarioDto {
  @ApiProperty({ enum: SCENARIO_TYPES, example: 'success' })
  @IsIn(SCENARIO_TYPES)
  type!: ScenarioType;

  @ApiPropertyOptional({ example: 'smoke-check' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
