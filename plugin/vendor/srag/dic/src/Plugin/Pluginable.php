<?php

namespace srag\DIC\VerDatAsDsh\Plugin;

/**
 * Interface Pluginable
 *
 * @package srag\DIC\VerDatAsDsh\Plugin
 */
interface Pluginable
{

    /**
     * @return PluginInterface
     */
    public function getPlugin() : PluginInterface;


    /**
     * @param PluginInterface $plugin
     *
     * @return static
     */
    public function withPlugin(PluginInterface $plugin)/*: static*/ ;
}
