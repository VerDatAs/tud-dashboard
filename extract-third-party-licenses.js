/**
 * Dashboard for the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2022-2024 TU Dresden (Tommy Kubica)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
const checker = require('license-checker');
const fs = require('fs');
const repositoryName = 'tud-dashboard';
const repositoryLink = 'https://github.com/VerDatAs/tud-dashboard';

checker.init(
  {
    start: './',
    production: true,
    direct: true,
  },
  function (err, packages) {
    if (err) {
      console.error(err);
    } else {
      // Manually add postit-js as it was used during development
      packages['postit-js-core@1.1.0'] = {
        licenses: 'MIT',
        repository: 'https://github.com/pinussilvestrus/postit-js'
      }
      console.log(packages);
      const packageKeys = Object.keys(packages).sort();
      let markdownResult = '## The following libraries are used by [' + repositoryName + '](' + repositoryLink + '):\n\n';
      markdownResult += '|    Name    |   Version  |   License  |     URL    |\n';
      markdownResult += '| ---------- | ---------- | ---------- | ---------- |\n';
      packageKeys.forEach((packageKey) => {
        const packageInformation = packages[packageKey];
        const splitPackageKey = packageKey.split('@');
        // Package names might begin with "@"
        const packageWithLeadingAt = packageKey.startsWith('@');
        const name = (packageWithLeadingAt && splitPackageKey.length > 2) ? '@' + splitPackageKey[1] : splitPackageKey[0];
        const version = (packageWithLeadingAt && splitPackageKey.length > 2) ? splitPackageKey[2] : splitPackageKey[1];
        const licenses = packageInformation.licenses;
        let url = packageInformation.repository || packageInformation.url || 'No URL provided on npm';
        // Quick fix for npm package that does not include its repository url
        if (name === 'vuejs-confirm-dialog') {
          url = 'https://github.com/harmyderoman/vuejs-confirm-dialog';
        }
        // Exclude own repository from the list of third-party libraries
        if (name !== repositoryName) {
          markdownResult += '| ' + name + ' | ' + version + ' | ' + licenses + ' | ' + url + ' |\n';
        }
      });
      fs.mkdirSync('dist', { recursive: true });
      fs.writeFileSync(
        'dist/THIRD-PARTY-' + repositoryName + '.md',
        markdownResult
      );
      console.log(markdownResult);
    }
  },
);
