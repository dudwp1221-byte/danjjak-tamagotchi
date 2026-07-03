export interface WeatherInfo {
  emoji: string
  label: string
  temp: number
}

const WMO_MAP: [number[], string, string][] = [
  [[0], '☀️', '맑음'],
  [[1, 2], '🌤️', '구름조금'],
  [[3], '☁️', '흐림'],
  [[45, 48], '🌫️', '안개'],
  [[51, 53, 55, 61, 63, 65], '🌧️', '비'],
  [[66, 67, 71, 73, 75, 77], '❄️', '눈'],
  [[80, 81, 82], '🌦️', '소나기'],
  [[85, 86], '🌨️', '눈소나기'],
  [[95, 96, 99], '⛈️', '천둥번개'],
]

function wmoToMeta(code: number): { emoji: string; label: string } {
  for (const [codes, emoji, label] of WMO_MAP) {
    if (codes.includes(code)) return { emoji, label }
  }
  return { emoji: '🌡️', label: '알 수 없음' }
}

export async function fetchWeather(): Promise<WeatherInfo | null> {
  try {
    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }),
    )
    const { latitude: lat, longitude: lon } = pos.coords
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&current=temperature_2m,weather_code&timezone=auto`
    const data = await fetch(url).then((r) => r.json()) as {
      current: { temperature_2m: number; weather_code: number }
    }
    const { temperature_2m: temp, weather_code: code } = data.current
    const { emoji, label } = wmoToMeta(code)
    return { emoji, label, temp: Math.round(temp) }
  } catch {
    return null
  }
}
