<?php

namespace srag\ActiveRecordConfig\VerDatAsDsh\Config;

use srag\DIC\VerDatAsDsh\DICTrait;

/**
 * Class AbstractFactory
 *
 * @package srag\ActiveRecordConfig\VerDatAsDsh\Config
 */
abstract class AbstractFactory
{

    use DICTrait;

    /**
     * AbstractFactory constructor
     */
    protected function __construct()
    {

    }


    /**
     * @return Config
     */
    public function newInstance() : Config
    {
        $config = new Config();

        return $config;
    }
}
