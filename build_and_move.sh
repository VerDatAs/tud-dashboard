#!/bin/bash

# Dashboard for the assistance system developed as part of the VerDatAs project
# Copyright (C) 2022-2024 TU Dresden (Max Schaible)

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

if [ "$1" == "ilias" ]; then
    npm i
    npm run build
    cp dist/assets/main.js ../verdatasdsh/templates/main.js
    cp dist/THIRD-PARTY-tud-dashboard.md ../verdatasdsh/templates/THIRD-PARTY-tud-dashboard.md
    cp dist/logo.jpg ../verdatasdsh/templates/logo.jpg
    cp dist/tpl.content.html ../verdatasdsh/templates/tpl.content.html
elif [ "$1" == "moodle" ]; then
    npm i
    npm run build
    docker cp ./dist/assets/main.js moodle-php-apache-1:/var/www/html/lib/editor/tiny/plugins/vdsh/amd/src/vdsh.js
    docker cp ./dist/assets/main.js moodle-php-apache-1:/var/www/html/lib/editor/tiny/plugins/vdsh/amd/build/vdsh.min.js
else
    echo "Invalid argument. Please use either 'ilias' or 'moodle'."
fi