import { z } from 'zod';

const ESP32_URL = import.meta.env.VITE_ESP32_URL;

// ============ Zod Schemas ============

export const StatusResponseSchema = z.object({
  currentTime: z.string(),
  alarmTime: z.string(),
  isAlarmSet: z.boolean(),
  isSunriseActive: z.boolean(),
  warmBrightness: z.number().min(0).max(1023),
  coolBrightness: z.number().min(0).max(1023),
});

export const AlarmRequestSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
});

export const GetAlarmResponseSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  isSet: z.boolean(),
});

export const BrightnessRequestSchema = z.object({
  warm: z.number().min(0).max(1023),
  cool: z.number().min(0).max(1023),
});

export const BrightnessResponseSchema = z.object({
  warm: z.number().min(0).max(1023),
  cool: z.number().min(0).max(1023),
});

export const ToggleAlarmRequestSchema = z.object({
  enabled: z.boolean(),
});

export const ToggleAlarmResponseSchema = z.object({
  isAlarmSet: z.boolean(),
  alarmTime: z.string(),
});

// ============ Type Inference ============

export type Status = z.infer<typeof StatusResponseSchema>;
export type AlarmRequest = z.infer<typeof AlarmRequestSchema>;
export type GetAlarmResponse = z.infer<typeof GetAlarmResponseSchema>;
export type BrightnessRequest = z.infer<typeof BrightnessRequestSchema>;
export type BrightnessResponse = z.infer<typeof BrightnessResponseSchema>;
export type ToggleAlarmRequest = z.infer<typeof ToggleAlarmRequestSchema>;
export type ToggleAlarmResponse = z.infer<typeof ToggleAlarmResponseSchema>;

// ============ API Functions ============

async function fetchWithValidation<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return schema.parse(data);
}

export async function getStatus(): Promise<Status> {
  const url = `${ESP32_URL}/status`;
  return fetchWithValidation(url, StatusResponseSchema);
}

export async function setAlarm(alarm: AlarmRequest): Promise<void> {
  const url = `${ESP32_URL}/set-alarm`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(AlarmRequestSchema.parse(alarm)),
  });

  if (!response.ok) {
    throw new Error(`Failed to set alarm: ${response.status} ${response.statusText}`);
  }
}

export async function getAlarm(): Promise<GetAlarmResponse> {
  const url = `${ESP32_URL}/get-alarm`;
  return fetchWithValidation(url, GetAlarmResponseSchema);
}

export async function turnLightsOn(): Promise<void> {
  const url = `${ESP32_URL}/manual-on`;
  const response = await fetch(url, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to turn lights on: ${response.status} ${response.statusText}`);
  }
}

export async function turnLightsOff(): Promise<void> {
  const url = `${ESP32_URL}/manual-off`;
  const response = await fetch(url, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to turn lights off: ${response.status} ${response.statusText}`);
  }
}

export async function setBrightness(brightness: BrightnessRequest): Promise<BrightnessResponse> {
  const url = `${ESP32_URL}/set-brightness`;
  const validated = BrightnessRequestSchema.parse(brightness);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validated),
  });

  if (!response.ok) {
    throw new Error(`Failed to set brightness: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return BrightnessResponseSchema.parse(data);
}

export async function toggleAlarm(enabled: boolean): Promise<ToggleAlarmResponse> {
  const url = `${ESP32_URL}/toggle-alarm`;
  const validated = ToggleAlarmRequestSchema.parse({ enabled });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validated),
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle alarm: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return ToggleAlarmResponseSchema.parse(data);
}
