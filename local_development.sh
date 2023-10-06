#!/bin/sh
npm i
npm run build
cp dist/assets/app.js ../ilias/Customizing/global/plugins/Services/COPage/PageComponent/VerDatAsDsh/templates/assets/app.js
cp dist/assets/index.css ../ilias/Customizing/global/plugins/Services/COPage/PageComponent/VerDatAsDsh/templates/assets/index.css
