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
import { isFunction } from 'min-dash'

/**
 * Wraps APIs to check, if a callback is passed and if Promise class is implemented in current environment.
 */
export function wrapForCompatibility(api) {
  return function () {
    if (!window.Promise) {
      throw new Error('Promises is not supported in this environment. Please polyfill Promise.')
    }

    const argLen = arguments.length
    if (argLen >= 1 && isFunction(arguments[argLen - 1])) {
      const callback = arguments[argLen - 1]

      console.warn(
        new Error('Passing callbacks to ' + api.name + ' is deprecated and will be removed in a future major release.')
      )

      const argsWithoutCallback = Array.prototype.slice.call(arguments, 0, -1)

      api.apply(this, argsWithoutCallback).then(
        function (result) {
          const firstKey = Object.keys(result)[0]

          // The APIs we are wrapping all resolve a single item depending on the API.
          // For instance, importXML resolves { warnings } and saveXML returns { xml }.
          // That's why we can call the callback with the first item of result.
          return callback(null, result[firstKey])

          // Passing a second parameter instead of catch because we don't want to
          // catch errors thrown by callback().
        },
        function (err) {
          return callback(err, err.warnings)
        }
      )
    } else {
      return api.apply(this, arguments)
    }
  }
}
