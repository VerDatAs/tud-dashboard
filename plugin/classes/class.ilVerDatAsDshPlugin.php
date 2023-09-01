<?php

/**
 * This file is part of ILIAS, a powerful learning management system
 * published by ILIAS open source e-Learning e.V.
 *
 * ILIAS is licensed with the GPL-3.0,
 * see https://www.gnu.org/licenses/gpl-3.0.en.html
 * You should have received a copy of said license along with the
 * source code, too.
 *
 * If this is not the case, or you just want to try ILIAS, you'll find
 * us at:
 * https://www.ilias.de
 * https://github.com/ILIAS-eLearning
 *
 *********************************************************************/

/**
 * Class ilVerDatAsDshPlugin
 * @author tud <tommy.kubica@tu-dresden.de>
 */
class ilVerDatAsDshPlugin extends ilPageComponentPlugin
{
    const PLUGIN_ID = "vdsh";
    
    public function getPluginName(): string
    {
        return "VerDatAsDsh";
    }
    public function isValidParentType(string $a_type): bool
    {
        // Allow for customizing course page (cont), but not for content page (copa) and learning module (lm)
        if ($a_type !== 'cont') {
            return false;
        }
        // TODO: Check, whether a VerDatAsDsh is already included on the course page
//        $tree = new \ilTree(1);
//        $courseNode = $tree->getNodeData($this->getCurrentRefId());
//        $containerPage = new \ilContainerPage($courseNode['obj_id']);
//        $containerPageXML = $containerPage->getXMLContent();
//        $pluginString = '<Plugged PluginName="VerDatAsDsh"';
//        $pluginAlreadyIncluded = str_contains($containerPageXML, $pluginString);
//        return !$pluginAlreadyIncluded;
        return true;
    }

    public function getCssFiles(string $a_mode): array
    {
        return [];
    }

    public function getJavascriptFiles(string $a_mode) : array
    {
        return [];
    }

    public function allowCopy() : bool
    {
        return false;
    }

}