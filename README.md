# ICS4U 24-25 #4: Are We There Yet?

A voice-activated real-time navigation app. For an accessibility project.

To run client:

1. Install `npm`, a JavaScript package manager
2. `cd` into `client` and run `npm install`
3. Configure `SERVER_API_PATH` in `utils.js` depending on how you'd like to host backend
4. Run `npm run dev`

To run server:

1. Install `npm`, a JavaScript package manager
2. `cd` into `server` and run `npm install`
3. Create a `.env` file with your own `API_KEY`
4. Use `mkcert` to create a key-cert pair in the same directory
5. Run `node main.js --https`
