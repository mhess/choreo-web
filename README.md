# CHOREO

Annotate time points in an audio track. Use those time points to seek through
the track.

The idea for this app was born out of the frustrating experience of trying to
compose a dance choreography using UI from typical music streaming services.

The app can consume audio from a Spotify premium account, a YouTube video, or a
local audio file on disk.

Check out the live demo at https://choreo-web.vercel.app.

## FEATURES

- Manually mark specific timestamps during audio playback with "entries" via
  button press.
- Annotate entries with notes and/or meter counts.
- Easily seek through an audio track using the timestamps of entries.
- Real-time highlighting of most recent entry to current time during audio
  playback.
- Automatic meter/count generation based on intervals between existing entries.
- Save entries to a CSV file.
- Load entries from a CSV file.
- Responsive design
- Light/dark color schemes

## ARCHITECTURE

Choreo is a client-side-rendered, single-page web app built with

- [Typescript](https://www.typescriptlang.org/) for type-safe javascript
- [React](https://react.dev/) for declarative HTML rendering
- [Jotai](https://jotai.org/) for state management
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)
  for robust accessible interaction
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Papa Parse](https://www.papaparse.com/) for CSV generation and parsing

Although the app is a client-side-rendered SPA, server-side logic is required
for Spotify authentication. This is implemented with a "serverless" edge
function for the live demo that is served by [Vercel](https://vercel.com/).
