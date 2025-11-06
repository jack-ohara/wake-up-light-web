import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  getStatus,
  setAlarm,
  setBrightness,
  toggleAlarm,
  turnLightsOn,
  turnLightsOff,
  type Status,
  type AlarmRequest,
  type BrightnessRequest,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Lightbulb } from 'lucide-react'

async function loadStatus() {
  return getStatus()
}

export const Route = createFileRoute('/')({
  component: App,
  loader: loadStatus,
})

function App() {
  const initialStatus = Route.useLoaderData();
  const queryClient = useQueryClient()

  // Parse initial alarm time for default values
  const [alarmHourStr, alarmMinuteStr] = initialStatus.alarmTime.split(':')

  const [hour, setHour] = useState(alarmHourStr.padStart(2, '0'))
  const [minute, setMinute] = useState(alarmMinuteStr)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [warmBrightness, setWarmBrightness] = useState(initialStatus.warmBrightness)
  const [coolBrightness, setCoolBrightness] = useState(initialStatus.coolBrightness)

  const { data: status, isLoading, error } = useQuery<Status>({
    queryKey: ['status'],
    queryFn: getStatus,
    refetchInterval: 1000,
    retry: 3,
    initialData: initialStatus,
  })

  const setAlarmMutation = useMutation({
    mutationFn: (alarm: AlarmRequest) => setAlarm(alarm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] })
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    },
    onError: (error) => {
      console.error('Failed to set alarm:', error)
    },
  })

  const turnOnMutation = useMutation({
    mutationFn: turnLightsOn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
    onError: (error) => {
      console.error('Failed to turn on lights:', error)
    },
  })

  const turnOffMutation = useMutation({
    mutationFn: turnLightsOff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
    onError: (error) => {
      console.error('Failed to turn off lights:', error)
    },
  })

  const setBrightnessMutation = useMutation({
    mutationFn: (brightness: BrightnessRequest) => setBrightness(brightness),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
    onError: (error) => {
      console.error('Failed to set brightness:', error)
    },
  })

  const toggleAlarmMutation = useMutation({
    mutationFn: (enabled: boolean) => toggleAlarm(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
    onError: (error) => {
      console.error('Failed to toggle alarm:', error)
    },
  })

  // Sync brightness sliders with status when it updates
  useEffect(() => {
    if (status) {
      setWarmBrightness(status.warmBrightness)
      setCoolBrightness(status.coolBrightness)
    }
  }, [status?.warmBrightness, status?.coolBrightness])

  const handleSetAlarm = () => {
    const alarmHour = parseInt(hour, 10)
    const alarmMinute = parseInt(minute, 10)

    if (isNaN(alarmHour) || isNaN(alarmMinute)) {
      alert('Please enter valid hour and minute')
      return
    }

    setAlarmMutation.mutate({
      hour: alarmHour,
      minute: alarmMinute,
    })
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
            <p className="text-gray-600 mb-4">
              Unable to connect to the wake-up light. Please check that the ESP32 is running and
              the URL is configured correctly in .env
            </p>
            <p className="text-sm text-gray-500 font-mono mb-4">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading status...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Display */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Current Status</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Current Time */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Current Time</p>
              <p className="text-2xl font-bold text-blue-600 font-mono">{status.currentTime}</p>
            </div>

            {/* Alarm Time */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Alarm Time</p>
              <p className="text-2xl font-bold text-purple-600 font-mono">{status.alarmTime}</p>
            </div>
          </div>

          {/* Brightness Levels */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Warm White Brightness</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{
                      width: `${(status.warmBrightness / 1023) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-mono w-12 text-right">{status.warmBrightness}</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Cool White Brightness</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-300 transition-all duration-300"
                    style={{
                      width: `${(status.coolBrightness / 1023) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-mono w-12 text-right">{status.coolBrightness}</span>
              </div>
            </div>
          </div>

          {/* Sunrise Status */}
          {status.isSunriseActive && (
            <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
              <p className="text-sm text-orange-800 font-medium">🌅 Sunrise is currently active</p>
            </div>
          )}

          {/* Alarm Toggle */}
          <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-base font-semibold">Alarm</Label>
              <p className="text-sm text-gray-600">
                {status.isAlarmSet ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <Switch
              checked={status.isAlarmSet}
              onCheckedChange={(checked) => {
                toggleAlarmMutation.mutate(checked)
              }}
              disabled={toggleAlarmMutation.isPending}
            />
          </div>
        </Card>

        {/* Alarm Configuration */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Configure Alarm</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hour" className="block mb-2">
                  Hour (00-23)
                </Label>
                <Input
                  id="hour"
                  type="number"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setHour(e.target.value.padStart(2, '0'))}
                  placeholder="06"
                  className="font-mono text-lg"
                />
              </div>

              <div>
                <Label htmlFor="minute" className="block mb-2">
                  Minute (00-59)
                </Label>
                <Input
                  id="minute"
                  type="number"
                  min="0"
                  max="59"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value.padStart(2, '0'))}
                  placeholder="30"
                  className="font-mono text-lg"
                />
              </div>
            </div>

            <Button
              onClick={handleSetAlarm}
              disabled={setAlarmMutation.isPending}
              className="w-full"
            >
              {setAlarmMutation.isPending ? 'Saving...' : 'Set Alarm'}
            </Button>

            {showSaveSuccess && (
              <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800 font-medium">✓ Alarm saved successfully</p>
              </div>
            )}

            {setAlarmMutation.error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  Error: {setAlarmMutation.error instanceof Error ? setAlarmMutation.error.message : 'Failed to save alarm'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Brightness Control */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb size={28} />
            Brightness Control
          </h2>

          {/* Color Temperature Presets */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Color Temperature</p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 0, cool: 0 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
              >
                Off
              </Button>
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 1023, cool: 0 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
                className="hover:bg-yellow-100"
              >
                Warm
              </Button>
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 820, cool: 820 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
              >
                Neutral
              </Button>
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 0, cool: 1023 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
                className="hover:bg-blue-100"
              >
                Cool
              </Button>
            </div>
          </div>

          {/* Time of Day Presets */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Time of Day</p>
            <div className="grid grid-cols-5 gap-2">
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 1023, cool: 410 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
              >
                Morning
              </Button>
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 615, cool: 1023 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
              >
                Day
              </Button>
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 820, cool: 205 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
              >
                Evening
              </Button>
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 205, cool: 0 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
              >
                Night
              </Button>
              <Button
                onClick={() =>
                  setBrightnessMutation.mutate({ warm: 500, cool: 0 })
                }
                disabled={setBrightnessMutation.isPending}
                variant="outline"
                size="sm"
              >
                Bedtime
              </Button>
            </div>
          </div>

          {/* Manual Sliders */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Warm White</Label>
                <span className="text-sm font-mono bg-yellow-100 px-2 py-1 rounded">
                  {warmBrightness}
                </span>
              </div>
              <Slider
                value={[warmBrightness]}
                onValueChange={(value) => {
                  setWarmBrightness(value[0])
                }}
                onValueCommit={(value) => {
                  setBrightnessMutation.mutate({
                    warm: value[0],
                    cool: coolBrightness,
                  })
                }}
                min={0}
                max={1023}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Cool White</Label>
                <span className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                  {coolBrightness}
                </span>
              </div>
              <Slider
                value={[coolBrightness]}
                onValueChange={(value) => {
                  setCoolBrightness(value[0])
                }}
                onValueCommit={(value) => {
                  setBrightnessMutation.mutate({
                    warm: warmBrightness,
                    cool: value[0],
                  })
                }}
                min={0}
                max={1023}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Quick On/Off Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200">
            <Button
              onClick={() => turnOnMutation.mutate()}
              disabled={turnOnMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {turnOnMutation.isPending ? 'Turning On...' : 'Max Brightness'}
            </Button>
            <Button
              onClick={() => turnOffMutation.mutate()}
              disabled={turnOffMutation.isPending}
              variant="destructive"
            >
              {turnOffMutation.isPending ? 'Turning Off...' : 'Off'}
            </Button>
          </div>

          {(setBrightnessMutation.error ||
            turnOnMutation.error ||
            turnOffMutation.error) && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                Error:{' '}
                {setBrightnessMutation.error instanceof Error
                  ? setBrightnessMutation.error.message
                  : turnOnMutation.error instanceof Error
                    ? turnOnMutation.error.message
                    : turnOffMutation.error instanceof Error
                      ? turnOffMutation.error.message
                      : 'Failed to control brightness'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
