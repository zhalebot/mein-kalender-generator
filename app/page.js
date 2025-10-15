'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [city, setCity] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(''); // NEU: Ein "Gedächtnis" für Fehlermeldungen

  // Die Funktion wird jetzt "async", damit sie auf den Test warten kann
  const handleGenerateUrl = async () => {
    if (!city) {
      alert('Bitte gib einen Stadtnamen ein.');
      return;
    }
    setIsLoading(true);
    setGeneratedUrl('');
    setError(''); // NEU: Alte Fehler zurücksetzen
    setCopied(false);

    const baseUrl = window.location.origin;
    const finalUrl = `${baseUrl}/api/calendar?city=${encodeURIComponent(city)}`;

    try {
      // NEU: Wir testen den Link, bevor wir ihn anzeigen
      const response = await fetch(finalUrl);

      if (!response.ok) {
        // Wenn der Server einen Fehler meldet (z.B. Stadt nicht gefunden)
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      // Nur wenn der Test erfolgreich war, zeigen wir den Link an
      setGeneratedUrl(finalUrl);

    } catch (err) {
      // Wenn etwas schiefgeht, zeigen wir eine Fehlermeldung an
      setError('Stadt konnte nicht gefunden werden. Bitte überprüfe die Schreibweise.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Dein persönlicher Gebetszeiten-Kalender</h1>
        <p className={styles.description}>
          Gib deine Stadt ein, um einen Kalender-Link zu generieren...
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
            {isLoading ? 'Prüfe...' : 'Link generieren'}
          </button>
        </div>

        {/* NEU: Zeigt entweder das Ergebnis ODER die Fehlermeldung an */}
        {error && <p className={styles.error}>{error}</p>}

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
          ...
        </footer>
      </div>
    </main>
  );
}