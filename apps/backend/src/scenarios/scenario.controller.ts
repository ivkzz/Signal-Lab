import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScenarioService } from './scenario.service';
import { RunScenarioDto } from './dto/run-scenario.dto';

type ScenarioRunView = {
  id: string;
  type: string;
  status: string;
  duration: number | null;
  error: string | null;
  metadata: unknown;
  createdAt: Date;
};

@ApiTags('Scenarios')
@Controller('scenarios')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent scenario runs' })
  findAll(): Promise<ScenarioRunView[]> {
    return this.scenarioService.findAll();
  }

  @Post('run')
  @ApiOperation({ summary: 'Run a specific scenario' })
  run(@Body() body: RunScenarioDto): Promise<ScenarioRunView> {
    return this.scenarioService.run(body.type, body.name);
  }
}
