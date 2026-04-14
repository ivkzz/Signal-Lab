'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ScenarioFormValues, ScenarioType, WorkspaceTab } from '@/features/home/types'
import { SCENARIO_TYPES } from '@/features/home/types'
import { scenarioDescription } from '@/features/home/utils'
import api from '@/lib/api'
import { dashboardQueryKeys } from '@/features/home/query-keys'
import { getUserFacingErrorMessage } from '@/lib/error-message'
import { cn } from '@/lib/utils'

type ScenarioFormCardProps = {
  workspaceTab: WorkspaceTab
  /** После успешного run (например переключить вкладку на мобиле). */
  onScenarioRan?: () => void
  className?: string
}

export function ScenarioFormCard({ workspaceTab, onScenarioRan, className }: ScenarioFormCardProps) {
  const queryClient = useQueryClient()

  const form = useForm<ScenarioFormValues>({
    defaultValues: {
      type: 'success',
      name: '',
    },
  })

  const selectedType = useWatch({
    control: form.control,
    name: 'type',
    defaultValue: 'success',
  }) as ScenarioType

  const runScenario = useMutation({
    mutationFn: async (payload: ScenarioFormValues) => {
      const { data } = await api.post('/scenarios/run', payload)
      return data
    },
    onSuccess: async (_data, variables) => {
      toast.success('Scenario completed', {
        description: `Type: ${variables.type}`,
      })
      form.reset({ ...form.getValues(), name: '' })
      onScenarioRan?.()
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 418) {
        const body = error.response.data as { message?: string; signal?: number } | undefined
        toast.info("I'm a teapot", {
          description:
            typeof body?.message === 'string'
              ? `${body.message}${typeof body.signal === 'number' ? ` (signal ${body.signal})` : ''}`
              : 'HTTP 418 — run saved with easter metadata.',
        })
        return
      }
      toast.error('Scenario request failed', {
        description: getUserFacingErrorMessage(error),
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.scenarioRuns })
    },
  })

  return (
    <Card
      className={cn(
        'flex min-h-0 w-full min-w-0 shrink-0 flex-col lg:min-h-0',
        workspaceTab !== 'form' && 'max-lg:hidden',
        className,
      )}
    >
      <CardHeader className="mb-0 pb-3">
        <CardTitle className="text-base">Run scenario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            runScenario.reset()
            runScenario.mutate(values)
          })}
        >
          <div className="space-y-1.5">
            <Label htmlFor="type" className="text-xs font-medium text-muted-foreground">
              Type
            </Label>
            <Controller
              control={form.control}
              name="type"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" aria-label="Scenario type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCENARIO_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <CardDescription>{scenarioDescription(selectedType)}</CardDescription>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
              Name <span className="font-normal opacity-70">optional</span>
            </Label>
            <Input id="name" placeholder="demo-run" autoComplete="off" {...form.register('name')} />
          </div>

          <Button className="w-full" type="submit" disabled={runScenario.isPending}>
            {runScenario.isPending ? 'Running…' : 'Run'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
