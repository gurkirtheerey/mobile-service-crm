import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Cron job endpoint to check weather for upcoming appointments
// Should be called daily (e.g., via Vercel Cron or external cron service)
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Get appointments for the next 24-48 hours that are weather-dependent
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_start,
        client:clients(lat, lng),
        service:services(weather_dependent)
      `)
      .gte('scheduled_start', tomorrow.toISOString())
      .lt('scheduled_start', dayAfterTomorrow.toISOString())
      .in('status', ['scheduled', 'confirmed']);

    if (error) {
      throw error;
    }

    const weatherFlagged: string[] = [];

    for (const appointment of appointments || []) {
      // Skip non-weather-dependent services
      const service = appointment.service as { weather_dependent?: boolean } | null;
      if (!service?.weather_dependent) continue;

      const client = appointment.client as { lat?: number; lng?: number } | null;
      if (!client?.lat || !client?.lng) continue;

      // Check weather (mock implementation - would use real weather API)
      const shouldFlag = await checkWeatherConditions(
        client.lat,
        client.lng,
        new Date(appointment.scheduled_start)
      );

      if (shouldFlag) {
        weatherFlagged.push(appointment.id);
      }
    }

    // Update flagged appointments
    if (weatherFlagged.length > 0) {
      await supabase
        .from('appointments')
        .update({ weather_flagged: true })
        .in('id', weatherFlagged);
    }

    return NextResponse.json({
      checked: appointments?.length || 0,
      flagged: weatherFlagged.length,
    });
  } catch (error) {
    console.error('Weather check failed:', error);
    return NextResponse.json(
      { error: 'Weather check failed' },
      { status: 500 }
    );
  }
}

async function checkWeatherConditions(
  lat: number,
  lng: number,
  date: Date
): Promise<boolean> {
  // In production, this would call OpenWeatherMap or similar API
  // const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  // const response = await fetch(
  //   `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}`
  // );

  // Mock implementation - randomly flag ~10% of appointments
  return Math.random() < 0.1;
}
