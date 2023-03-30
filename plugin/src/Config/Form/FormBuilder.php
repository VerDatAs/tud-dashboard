<?php

namespace tud\Plugins\VerDatAsDsh\Config\Form;

use tud\Plugins\VerDatAsDsh\Config\ConfigCtrl;
use tud\Plugins\VerDatAsDsh\Utils\VerDatAsDshTrait;
use ilVerDatAsDshPlugin;
use srag\CustomInputGUIs\VerDatAsDsh\FormBuilder\AbstractFormBuilder;

/**
 * Class FormBuilder
 *
 * @package tud\Plugins\VerDatAsDsh\Config\Form
 *
 * @author tud <tommy.kubica@tu-dresden.de>
 * @author fluxlabs <support@fluxlabs.ch>
 */
class FormBuilder extends AbstractFormBuilder
{

    use VerDatAsDshTrait;

    const KEY_SOME = "some";
    const PLUGIN_CLASS_NAME = ilVerDatAsDshPlugin::class;


    /**
     * @inheritDoc
     *
     * @param ConfigCtrl $parent
     */
    public function __construct(ConfigCtrl $parent)
    {
        parent::__construct($parent);
    }


    /**
     * @inheritDoc
     */
    protected function getButtons() : array
    {
        $buttons = [
            ConfigCtrl::CMD_UPDATE_CONFIGURE => self::plugin()->translate("save", ConfigCtrl::LANG_MODULE)
        ];

        return $buttons;
    }


    /**
     * @inheritDoc
     */
    protected function getData() : array
    {
        $data = [
            self::KEY_SOME => self::verDatAsDsh()->config()->getValue(self::KEY_SOME)
        ];

        return $data;
    }


    /**
     * @inheritDoc
     */
    protected function getFields() : array
    {
        $fields = [
            self::KEY_SOME => self::dic()->ui()->factory()->input()->field()->text(self::plugin()->translate(self::KEY_SOME, ConfigCtrl::LANG_MODULE))->withRequired(true)
        ];

        return $fields;
    }


    /**
     * @inheritDoc
     */
    protected function getTitle() : string
    {
        return self::plugin()->translate("configuration", ConfigCtrl::LANG_MODULE);
    }


    /**
     * @inheritDoc
     */
    protected function storeData(array $data) : void
    {
        self::verDatAsDsh()->config()->setValue(self::KEY_SOME, strval($data[self::KEY_SOME]));
    }
}
