#!/bin/sh
npm run build
cp -r dist/assets/* ../plugin/templates/assets/
cp dist/dashboard.html ../plugin/templates/
cp dist/logo.jpeg ../plugin/templates/
cd ../plugin
sh ./local_development.sh
