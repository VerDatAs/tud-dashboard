#!/bin/bash

if [ "$1" == "ilias" ]; then
    npm i
    npm run build
    cp dist/assets/main.js ../verdatasdsh/templates/main.js
    cp dist/assets/vendor.LICENSE.txt ../verdatasdsh/templates/vendor.LICENSE.txt
    cp dist/logo.jpg ../verdatasdsh/templates/logo.jpg
    cp dist/tpl.content.html ../verdatasdsh/templates/tpl.content.html
    cd ../ilias-dev && sh reload_directories_without_composer_du.sh
elif [ "$1" == "moodle" ]; then
    npm i
    npm run build
    docker cp ./dist/assets/main.js moodle-php-apache-1:/var/www/html/lib/editor/tiny/plugins/vdsh/amd/src/vdsh.js
    docker cp ./dist/assets/main.js moodle-php-apache-1:/var/www/html/lib/editor/tiny/plugins/vdsh/amd/build/vdsh.min.js
else
    echo "Invalid argument. Please use either 'ilias' or 'moodle'."
fi