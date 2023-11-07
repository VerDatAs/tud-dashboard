#!/bin/sh
npm i
npm run build
cp dist/assets/app.js ../verdatasdsh/templates/assets/app.js
cp dist/assets/index.css ../verdatasdsh/templates/assets/index.css
