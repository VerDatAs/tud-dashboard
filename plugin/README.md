# VerDatAsDsh Plugin

A ILIAS plugin for including the VerDatAs dashboard.

## Local development

For developing locally, you can move the specific folders directly into your ilias directory, in which they are loaded in the volume (using the `docker-compose-plugin-dev.yml` setup of ilias). In case, the `VerDatAsDsh`-folder does not yet exist in the ilias `Customizing`-folder, adjust the `local_development.sh` script to your needs.

```bash
composer install
# make sure that the folder is located in the same folder as ilias
sh local_development.sh
```

The following requirements should be met:

* ILIAS 6.x
* PHP >= 7.2

## Installation

Locate to `Administration | Extending ILIAS | Plugins` and install the `VerDatAsDsh`.

## Configuration

Define the following configurations:

* Backend URL (e.g., `http://develop.verdatas.inf.tu-dresden.de:8062`)
* LRS-Type (i.e., an LRS type created in `Administration | Extending ILIAS | xAPI/cmi5`)
