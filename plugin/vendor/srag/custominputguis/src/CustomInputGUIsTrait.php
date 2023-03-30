<?php

namespace srag\CustomInputGUIs\VerDatAsDsh;

/**
 * Trait CustomInputGUIsTrait
 *
 * @package srag\CustomInputGUIs\VerDatAsDsh
 */
trait CustomInputGUIsTrait
{

    /**
     * @return CustomInputGUIs
     */
    protected static final function customInputGUIs() : CustomInputGUIs
    {
        return CustomInputGUIs::getInstance();
    }
}
