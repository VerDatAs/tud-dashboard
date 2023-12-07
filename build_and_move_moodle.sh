#! /bin/bash
npm i
npm run build
docker cp ./dist/assets/moodle.js moodle-php-apache-1:/var/www/html/lib/editor/tiny/plugins/vdsh/amd/src/vdsh.js
docker cp ./dist/assets/moodle.js moodle-php-apache-1:/var/www/html/lib/editor/tiny/plugins/vdsh/amd/build/vdsh.min.js
