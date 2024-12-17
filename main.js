// Variablen initialisieren
const video = document.querySelector('#video');
const startButton = document.querySelector('#startScan');
const stopButton = document.querySelector('#stopScan');
let stream = null;        // Für die Videostream-Referenz
let scanInterval = null;  // Für das Scan-Interval
let barcodeDetector;      // Für den Barcode-Detector

// Barcode-Detector initialisieren (mit Polyfill-Unterstützung)
async function initBarcodeDetector() {
    try {
        if ('BarcodeDetector' in window) {
            console.log('Barcode Detection API verfügbar');
        } else {
            window['BarcodeDetector'] = barcodeDetectorPolyfill.BarcodeDetectorPolyfill;
            console.log('Polyfill für Barcode Detection verwendet');
        }

        const formats = await BarcodeDetector.getSupportedFormats();
        barcodeDetector = new BarcodeDetector({ formats });
    } catch (error) {
        console.error('BarcodeDetector konnte nicht initialisiert werden:', error);
        alert('Barcode Detector konnte nicht initialisiert werden.');
    }
}

// Kamera-Stream starten
async function startCamera() {
    try {
        const constraints = { video: { facingMode: 'environment' }, audio: false };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.style.display = 'block';
        stopButton.classList.remove('hidden');
        startButton.classList.add('hidden');
        startScanning();
    } catch (error) {
        console.error('Fehler beim Zugriff auf die Kamera:', error);
        alert('Fehler beim Zugriff auf die Kamera.');
    }
}

// Scan-Vorgang starten
function startScanning() {
    scanInterval = setInterval(async () => {
        try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes.length > 0) {
                console.log('Barcode erkannt:', barcodes);
                stopScanning();
                alert(`Erkannt: ${barcodes[0].rawValue}`);
            }
        } catch (error) {
            console.error('Fehler beim Barcode-Scan:', error);
        }
    }, 100); // Alle 100ms prüfen
}

// Scan-Vorgang stoppen
function stopScanning() {
    if (scanInterval) clearInterval(scanInterval);
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    video.style.display = 'none';
    stopButton.classList.add('hidden');
    startButton.classList.remove('hidden');
    console.log('Scan-Vorgang beendet');
}

// Event-Listener
startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopScanning);

// Initialisierung des Barcode Detectors
initBarcodeDetector();