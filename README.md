# CHOREO

The **Choreo** web app allows you to annote time points in audio tracks and use those annotations to seek through the track.

The idea was born out of the frustrating experience of trying to compose a dance choreography using the UI from typical music streaming services.

The app can consume audio from a Spotify premium account, YouTube, or a local audio file on disk.

Check out the live demo at https://choreo-web.vercel.app.

Currently architected for deployment on Vercel. The app is a client-side rendered single-page web app, but has a server-side edge function required for Spotify authentication. If you want to use/test the edge function integration in development, you must install the vercel CLI and run the `vercel dev` command.
