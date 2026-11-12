AgriSense - Windows 7 / old Node version
=========================================

WHAT THIS IS
  A pre-built copy of the AgriSense app plus a tiny web server that has
  ZERO dependencies. There is nothing to install and nothing to compile.

REQUIREMENTS
  * Node.js 12 or newer (Node 14.17.6 is the newest that runs on Windows 7)
  * A browser (Chrome/Firefox). On Windows 7 the newest Chrome is 109 - that
    is fine.

HOW TO RUN
  1. Install Node.js for Windows 7 if you have not already:
     https://nodejs.org/dist/latest-v14.x/   (pick the .msi, 64-bit)
  2. Double-click  start.bat
     ...or open a Command Prompt in this folder and type:  node server.js
  3. Your browser opens http://localhost:3000

  To use a different port:   set PORT=3001  then  node server.js

WHAT WORKS
  Dashboard, sensors, weather (live from the internet), soil & satellite,
  crop map of Karnataka's four divisions, crop advisor, plant protection with
  chemical formulas, marketplace, government updates, sharing, 10 languages,
  light/dark mode.

WHAT IS DIFFERENT FROM THE FULL VERSION
  This build has NO backend server. Everything runs inside the browser:
    * Accounts are stored in the browser (localStorage), not on a server.
    * Voice uses the browser's built-in speech, not ElevenLabs.
    * Data marked "Sample" is demo content, not real market or government data.

  For the full version with the real API, run the main project
  (see the README in the parent folder) on a machine with Node 18+.

TROUBLESHOOTING
  "node is not recognized"   -> Node.js is not installed, or reopen the window.
  "Port 3000 is already in use" -> set PORT=3001 then node server.js
  Blank page                 -> make sure the 'public' folder is next to
                                server.js, then hard-refresh (Ctrl+F5).
  Nothing at all             -> check the black window for an error message.
