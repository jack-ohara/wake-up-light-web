import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  getStatus,
  setAlarm,
  turnLightsOn,
  turnLightsOff,
  type Status,
  type AlarmRequest,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Power } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const queryClient = useQueryClient()
  const [hour, setHour] = useState('06')
  const [minute, setMinute] = useState('30')
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  const { data: status, isLoading, error } = useQuery<Status>({
    queryKey: ['status'],
    queryFn: getStatus,
    refetchInterval: 1000,
    retry: 3,
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
              <div className="flex flex-col items-center justify-between">
                <p className="text-2xl font-bold text-purple-600 font-mono">{status.alarmTime}</p>
                <Badge variant={status.isAlarmSet ? 'default' : 'secondary'}>
                  {status.isAlarmSet ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
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
                      width: `${(status.warmBrightness / 255) * 100}%`,
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
                      width: `${(status.coolBrightness / 255) * 100}%`,
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

        {/* Manual Controls */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Manual Controls</h2>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => turnOnMutation.mutate()}
              disabled={turnOnMutation.isPending}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white h-20"
            >
              <div className="flex flex-col items-center gap-2">
                <Power size={32} />
                <span>{turnOnMutation.isPending ? 'Turning On...' : 'Lights On'}</span>
              </div>
            </Button>

            <Button
              onClick={() => turnOffMutation.mutate()}
              disabled={turnOffMutation.isPending}
              size="lg"
              variant="destructive"
              className="text-white h-20"
            >
              <div className="flex flex-col items-center gap-2">
                <Power size={32} />
                <span>{turnOffMutation.isPending ? 'Turning Off...' : 'Lights Off'}</span>
              </div>
            </Button>
          </div>

          {(turnOnMutation.error || turnOffMutation.error) && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                Error:{' '}
                {turnOnMutation.error instanceof Error
                  ? turnOnMutation.error.message
                  : turnOffMutation.error instanceof Error
                    ? turnOffMutation.error.message
                    : 'Failed to control lights'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
