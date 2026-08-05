export interface WeatherCondition {
  id: string
  city: string
  tempC: number
  condition: string
  highC: number
  lowC: number
  humidity: number
  windKph: number
}

export interface ForecastDay {
  day: string
  highC: number
  lowC: number
  condition: string
}
