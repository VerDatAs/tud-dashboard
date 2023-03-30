#!/bin/sh
npm run build
cp -r dist/assets/* ../plugin/templates/assets/
cp dist/dashboard.html ../plugin/templates/
cp dist/logo.jpeg ../plugin/templates/
cp -r ../plugin/templates/* ../../ilias/Customizing/global/plugins/Services/COPage/PageComponent/VerDatAsDsh/templates/
