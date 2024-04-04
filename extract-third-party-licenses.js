var checker = require('license-checker');
var fs = require('fs');

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
      console.log(packages);
      const packageKeys = Object.keys(packages);
      let markdownResult = '## The following libraries are used by [tud-dashboard](https://github.com/VerDatAs/tud-dashboard):\n\n';
      markdownResult += '|    Name    |   Version  |   License  |     URL    |\n';
      markdownResult += '| ---------- | ---------- | ---------- | ---------- |\n';
      packageKeys.forEach((packageKey) => {
        const packageInformation = packages[packageKey];
        const splitPackageKey = packageKey.split('@');
        // packages might begin with @
        const packageWithLeadingAt = packageKey.startsWith('@');
        const name = (packageWithLeadingAt && splitPackageKey.length > 2) ? '@' + splitPackageKey[1] : splitPackageKey[0];
        const version = (packageWithLeadingAt && splitPackageKey.length > 2) ? splitPackageKey[2] : splitPackageKey[1];
        const licenses = packageInformation.licenses;
        let url = packageInformation.repository || packageInformation.url || 'No URL provided on npm'
        if (name === 'vuejs-confirm-dialog') {
          url = 'https://github.com/harmyderoman/vuejs-confirm-dialog';
        }
        if (name !== 'tud-dashboard') {
          markdownResult += '| ' + name + ' | ' + version + ' | ' + licenses + ' | ' + url + ' |\n';
        }
      });
      fs.mkdirSync('dist', { recursive: true });
      fs.writeFileSync(
        'dist/THIRD-PARTY-tud-dashboard.md',
        markdownResult
      );
      console.log(markdownResult);
    }
  },
);
