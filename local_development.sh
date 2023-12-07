#!/bin/sh
npm i
npm run build:ilias
cp dist/assets/main.js ../verdatasdsh/templates/assets/main.js
cp dist/logo.jpeg ../verdatasdsh/templates/logo.jpeg
cp dist/tpl.content.html ../verdatasdsh/templates/tpl.content.html

cd ../ilias-dev && sh reload_directories.sh