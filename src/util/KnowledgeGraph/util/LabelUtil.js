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
import { is } from '@/util/KnowledgeGraph/util/ModelUtil'
import { assign } from 'min-dash'

/**
 * Specify the default size of a label.
 */
export var DEFAULT_LABEL_SIZE = {
  width: 90,
  height: 20
}

/**
 * Specify the indent of a flow label.
 */
export var FLOW_LABEL_INDENT = 15

/**
 * Return, whether the given semantic is an external label.
 *
 * @param semantic
 */
export function isLabelExternal(semantic) {
  return is(semantic, 'verDatAs:GraphElement')
}

/**
 * Return, whether the given element has an external label.
 *
 * @param element
 */
export function hasExternalLabel(element) {
  return isLabel(element.label)
}

/**
 * Retrieve the position for sequence flow labels.
 *
 * @param waypoints
 */
export function getFlowLabelPosition(waypoints) {
  // Get the waypoints mid
  const mid = waypoints.length / 2 - 1

  const first = waypoints[Math.floor(mid)]
  const second = waypoints[Math.ceil(mid + 0.01)]

  // Get position
  const position = getWaypointsMid(waypoints)

  // Calculate angle
  const angle = Math.atan((second.y - first.y) / (second.x - first.x))

  let x = position.x
  let y = position.y

  if (Math.abs(angle) < Math.PI / 2) {
    y -= FLOW_LABEL_INDENT
  } else {
    x += FLOW_LABEL_INDENT
  }

  return { x: x, y: y }
}

/**
 * Retrieve the middle of a number of waypoints.
 *
 * @param waypoints
 */
export function getWaypointsMid(waypoints) {
  const mid = waypoints.length / 2 - 1

  const first = waypoints[Math.floor(mid)]
  const second = waypoints[Math.ceil(mid + 0.01)]

  return {
    x: first.x + (second.x - first.x) / 2,
    y: first.y + (second.y - first.y) / 2
  }
}

/**
 * Retrieve the middle of an external label.
 *
 * @param element
 */
export function getExternalLabelMid(element) {
  if (element.waypoints) {
    return getFlowLabelPosition(element.waypoints)
  } else {
    return {
      x: element.x + element.width / 2,
      y: element.y + element.height + DEFAULT_LABEL_SIZE.height / 2
    }
  }
}

/**
 * Return the bounds of an element's label, parsed from the elements DI or generated from its bounds.
 *
 * @param di
 * @param element
 */
export function getExternalLabelBounds(di, element) {
  let mid
  let size
  let bounds
  const label = di.label

  if (label && label.bounds) {
    bounds = label.bounds

    size = {
      width: Math.max(DEFAULT_LABEL_SIZE.width, bounds.width),
      height: bounds.height
    }

    mid = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    }
  } else {
    mid = getExternalLabelMid(element)

    size = DEFAULT_LABEL_SIZE
  }

  return assign(
    {
      x: mid.x - size.width / 2,
      y: mid.y - size.height / 2
    },
    size
  )
}

/**
 * Check, whether a given element is a label.
 *
 * @param element
 */
export function isLabel(element) {
  return element && !!element.labelTarget
}
