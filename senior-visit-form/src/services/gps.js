// Wraps the browser Geolocation API in a promise with sane defaults
// and a friendly error message for the field-worker context.

export function captureLocation() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({ latitude: null, longitude: null, error: 'GPS not supported on this device.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
        });
      },
      (err) => {
        resolve({ latitude: null, longitude: null, error: err.message || 'Unable to get location.' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
