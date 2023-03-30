#!/bin/sh
npm run build
cp -r dist/assets/* ../../verdatas-dashboard/Services/COPage/PageComponent/VerDatAsDsh/templates/assets/
cp dist/dashboard.html ../../verdatas-dashboard/Services/COPage/PageComponent/VerDatAsDsh/templates/
cp dist/logo.jpeg ../../verdatas-dashboard/Services/COPage/PageComponent/VerDatAsDsh/templates/
cp -r ../../verdatas-dashboard/Services/COPage/PageComponent/VerDatAsDsh/templates/* ../../ilias/Customizing/global/plugins/Services/COPage/PageComponent/VerDatAsDsh/templates/
