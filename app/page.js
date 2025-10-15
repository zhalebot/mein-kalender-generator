'use client'; // Wichtig, damit die Seite interaktiv wird

import { useState } from 'react';
import styles from './page.module.css'; // Wir nutzen einfache CSS-Styles

export default function Home() {
  // "Gedächtnis" für unsere Webseite
  const [city, setCity] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateUrl = () => {
    if (!city) {
      alert('Bitte gib einen Stadtnamen ein.');
      return;
    }
    setIsLoading(true);
    setGeneratedUrl('');
    setCopied(false);

    // Erstelle die URL basierend auf der Benutzereingabe
    const baseUrl = window.location.origin;
    const finalUrl = `${baseUrl}/api/calendar?city=${encodeURIComponent(city)}`;
    setGeneratedUrl(finalUrl);
    setIsLoading(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // "Kopiert!"-Nachricht nach 2s ausblenden
    });
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Dein persönlicher Gebetszeiten-Kalender</h1>
        <p className={styles.description}>
          Gib deine Stadt ein, um einen Kalender-Link zu generieren. Dieser Link kann in Google Kalender, Apple Kalender etc. abonniert werden und zeigt die Gebetszeiten für ein ganzes Jahr.
        </p>

        <div className={styles.inputGroup}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="z.B. Ravensburg"
            className={styles.input}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateUrl()}
          />
          <button onClick={handleGenerateUrl} disabled={isLoading} className={styles.button}>
            {isLoading ? 'Generiere...' : 'Link generieren'}
          </button>
        </div>

        {generatedUrl && (
          <div className={styles.resultBox}>
            <p>Dein persönlicher Kalender-Link:</p>
            <div className={styles.urlContainer}>
                <input type="text" readOnly value={generatedUrl} className={styles.urlInput} />
                <button onClick={handleCopyToClipboard} className={styles.copyButton}>
                {copied ? 'Kopiert!' : 'Kopieren'}
                </button>
            </div>
          </div>
        )}

        <footer className={styles.footer}>
          <p>
            <strong>Berechnungsmethode:</strong> Union of Islamic Organizations of France (UOIF)
            <br />
            Fajr: 12°, Isha: 12°, Asr: Standard (nicht Hanafi), High-Latitude: Angle Based
          </p>
        </footer>
      </div>
    </main>
  );
}