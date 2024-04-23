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
import BaseLayouter from 'diagram-js/lib/layout/BaseLayouter'
import { getMid } from 'diagram-js/lib/layout/LayoutUtil'
import { repairConnection, withoutRedundantPoints } from 'diagram-js/lib/layout/ManhattanLayout'
import inherits from 'inherits-browser'
import { assign } from 'min-dash'

export default function VerDatAsLayouter() {}

inherits(VerDatAsLayouter, BaseLayouter)

/**
 * Add additional waypoints for creating so-called Manhattan connections.
 *
 * @param connection
 * @param hints
 */
VerDatAsLayouter.prototype.layoutConnection = function (connection, hints) {
  if (!hints) {
    hints = {}
  }

  const source = hints.source || connection.source
  const target = hints.target || connection.target
  const waypoints = hints.waypoints || connection.waypoints
  let connectionStart = hints.connectionStart
  let connectionEnd = hints.connectionEnd

  let manhattanOptions
  let updatedWaypoints

  if (!connectionStart) {
    connectionStart = getConnectionDocking(waypoints && waypoints[0], source)
  }

  if (!connectionEnd) {
    connectionEnd = getConnectionDocking(waypoints && waypoints[waypoints.length - 1], target)
  }

  // Use Manhattan rules to draw connections
  manhattanOptions = getMessageFlowManhattanOptions()

  if (manhattanOptions) {
    manhattanOptions = assign(manhattanOptions, hints)

    updatedWaypoints = withoutRedundantPoints(
      repairConnection(source, target, connectionStart, connectionEnd, waypoints, manhattanOptions)
    )
  }

  return updatedWaypoints || [connectionStart, connectionEnd]
}

/**
 * Helper function to retrieve the message flow manhattan options.
 */
function getMessageFlowManhattanOptions() {
  return {
    preferredLayouts: ['straight', 'v:v']
  }
}

/**
 * Helper function to retrieve the connection docking.
 *
 * @param point
 * @param shape
 */
function getConnectionDocking(point, shape) {
  return point ? point.original || point : getMid(shape)
}
