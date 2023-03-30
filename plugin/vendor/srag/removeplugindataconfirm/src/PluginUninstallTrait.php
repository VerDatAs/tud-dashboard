<?php

namespace srag\RemovePluginDataConfirm\VerDatAsDsh;

/**
 * Trait PluginUninstallTrait
 *
 * @package srag\RemovePluginDataConfirm\VerDatAsDsh
 */
trait PluginUninstallTrait
{

    use BasePluginUninstallTrait;

    /**
     * @internal
     */
    protected final function afterUninstall() : void
    {

    }


    /**
     * @return bool
     *
     * @internal
     */
    protected final function beforeUninstall() : bool
    {
        return $this->pluginUninstall();
    }
}
