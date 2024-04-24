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
export default function UpdateSemanticParentHandler(verDatAsUpdater) {
  this._verDatAsUpdater = verDatAsUpdater
}

UpdateSemanticParentHandler.$inject = ['verDatAsUpdater']

/**
 * Action to execute during update of a semantic parent.
 *
 * @param context
 */
UpdateSemanticParentHandler.prototype.execute = function (context) {
  const dataStoreBo = context.dataStoreBo
  const dataStoreDi = context.dataStoreDi
  const newSemanticParent = context.newSemanticParent
  const newDiParent = context.newDiParent

  context.oldSemanticParent = dataStoreBo.$parent
  context.oldDiParent = dataStoreDi.$parent

  // Update the semantic parent
  this._verDatAsUpdater.updateSemanticParent(dataStoreBo, newSemanticParent)

  // Update the DI parent
  this._verDatAsUpdater.updateDiParent(dataStoreDi, newDiParent)
}

/**
 * Action to execute during the revert of an update of a semantic parent.
 *
 * @param context
 */
UpdateSemanticParentHandler.prototype.revert = function (context) {
  const dataStoreBo = context.dataStoreBo
  const dataStoreDi = context.dataStoreDi
  const oldSemanticParent = context.oldSemanticParent
  const oldDiParent = context.oldDiParent

  // Update the semantic parent
  this._verDatAsUpdater.updateSemanticParent(dataStoreBo, oldSemanticParent)

  // Update the DI parent
  this._verDatAsUpdater.updateDiParent(dataStoreDi, oldDiParent)
}
