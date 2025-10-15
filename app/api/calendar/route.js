import { NextResponse } from 'next/server';
const adhan = require('adhan');
const ics = require('ics');
const axios = require('axios');

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        let lat = searchParams.get('lat');
        let lon = searchParams.get('lon');
        const cityQuery = searchParams.get('city');
        let cityName = 'Kalender'; // Ein Standardname, falls alles fehlschlägt

        if (cityQuery && (!lat || !lon)) {
            const geoResponse = await axios.get(`https://geocode.maps.co/search?q=${encodeURIComponent(cityQuery)}&limit=1`);
            if (geoResponse.data && geoResponse.data.length > 0) {
                lat = geoResponse.data[0].lat;
                lon = geoResponse.data[0].lon;
                // KORREKTE LOGIK FÜR DEN STADTNAMEN
                cityName = geoResponse.data[0].display_name.split(',')[0]; 
            } else {
                throw new Error('Stadt konnte nicht gefunden werden.');
            }
        } else if (lat && lon) {
            cityName = `Koordinaten (${lat}, ${lon})`;
        }

        const params = { fajrAngle: 12, ishaAngle: 12, madhab: adhan.Madhab.Shafi, highLatitudeRule: adhan.HighLatitudeRule.TwilightAngle };
        const calculationParameters = new adhan.CalculationParameters(null, params.fajrAngle, params.ishaAngle);
        calculationParameters.madhab = params.madhab;
        calculationParameters.highLatitudeRule = params.highLatitudeRule;

        const events = [];
        const startDate = new Date();
        for (let i = 0; i < 365; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const prayerTimes = new adhan.PrayerTimes(new adhan.Coordinates(parseFloat(lat), parseFloat(lon)), currentDate, calculationParameters);
            const gebetsNamen = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
            for (const [gebet, name] of Object.entries(gebetsNamen)) {
                const gebetsZeit = prayerTimes[gebet];
                
                // KORREKTE SICHERHEITSABFRAGE, UM ABSTÜRZE ZU VERHINDERN
                if (gebetsZeit) {
                    events.push({
                        title: name,
                        start: [gebetsZeit.getFullYear(), gebetsZeit.getMonth() + 1, gebetsZeit.getDate(), gebetsZeit.getHours(), gebetsZeit.getMinutes()],
                        duration: { minutes: 30 }
                    });
                }
            }
        }
        
        const { value } = await new Promise((resolve, reject) => {
            // KORREKTE LOGIK FÜR DEN KALENDERNAMEN
            ics.createEvents({
                calName: `${cityName} Gebetszeiten`,
                events: events
            }, (error, value) => {
                if (error) reject(error);
                resolve({ value });
            });
        });

        return new Response(value, {
            headers: {
                'Content-Type': 'text/calendar',
                'Content-Disposition': `attachment; filename="gebetszeiten.ics"`,
            },
        });

    } catch (error) {
        return new Response(`Ein Fehler ist aufgetreten: ${error.message}`, { status: 500 });
    }
}