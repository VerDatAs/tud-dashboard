/**
 * This is a modified version of the original file from https://github.com/pinussilvestrus/postit-js (MIT).
 *
 * Copyright 2020 Niklas Kiefer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * -----
 *
 * Adjustments for Dashboard of the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2022-2024 TU Dresden (Tommy Kubica)
 *
 * In addition to the terms of the MIT license, this file is distributed under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import BaseViewer from '@/util/KnowledgeGraph/BaseViewer'
import CoreModule from '@/util/KnowledgeGraph/core'
import VerDatAsDiOrdering from '@/util/KnowledgeGraph/features/di-ordering'
import EditorActionsModule from '@/util/KnowledgeGraph/features/editor-actions'
import CustomModeling from '@/util/KnowledgeGraph/features/modeling'
import ElementStyleModule from '@/util/KnowledgeGraph/features/style'
import ModelingModule from 'diagram-js/lib/features/modeling'
import OverlaysModule from 'diagram-js/lib/features/overlays'
import TranslateModule from 'diagram-js/lib/i18n/translate'
import inherits from 'inherits-browser'

/**
 * A viewer for VerDatAs diagrams.
 *
 * @param options
 */
export default function Viewer(options) {
  BaseViewer.call(this, options)
}

inherits(Viewer, BaseViewer)

// Modules the viewer is composed of (drilldown module is not necessary unless we have sub processes)
// NOTE: The order of elements is key! (the ModelingModule has to be loaded before CustomModeling is loaded)
Viewer.prototype._modules = [
  CoreModule,
  ElementStyleModule,
  ModelingModule,
  CustomModeling,
  TranslateModule,
  OverlaysModule,
  VerDatAsDiOrdering,
  EditorActionsModule
]

// Default moddle extensions the viewer is composed of
Viewer.prototype._moddleExtensions = {}
