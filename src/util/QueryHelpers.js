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
 * Copyright (C) 2022-2024 TU Dresden (Niklas Harbig, Tommy Kubica)
 *
 * In addition to the terms of the MIT license, this file is distributed under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// The currently supported comparison operators
export const comparisonOperators = [
  { displayName: 'gleich (==)', value: '$eq' },
  { displayName: 'nicht gleich (!=)', value: '$ne' },
  { displayName: 'größer (>)', value: '$gt' },
  { displayName: 'größer gleich (>=)', value: '$gte' },
  { displayName: 'kleiner (<)', value: '$lt' },
  { displayName: 'kleiner gleich (<=)', value: '$lte' },
  { displayName: 'in ([])', value: '$in' },
  { displayName: 'nicht in ([])', value: '$nin' }
]

// The currently supported aggregation operations
export const aggregationOperators = [
  { displayName: 'min', value: '$min' },
  { displayName: 'max', value: '$max' },
  { displayName: 'avg', value: '$avg' },
  { displayName: 'sum', value: '$sum' }
]

// The currently supported connections for filter
export const Connections = {
  AND: '$and',
  OR: '$or'
}

// The currently available examples for the Code Editor
export const codeQueryExamples = [
  {
    name: 'Einfaches Filterbeispiel 1',
    query: {
      search: { 'verb.display.en-US': 'answered' },
      operations: []
    }
  },
  {
    name: 'Einfaches Filterbeispiel 2',
    query: {
      search: {
        'verb.display.en-US': {
          $in: ['answered', 'experienced']
        }
      },
      operations: []
    }
  },
  {
    name: 'Filterbeispiel mit AND-Verknüpfung',
    query: {
      search: {
        $and: [{ timestamp: { $gte: '2023-06-27T07:47' } }, { timestamp: { $lte: '2023-06-27T07:48' } }]
      },
      operations: []
    }
  },
  {
    name: 'Filterbeispiel mit verschachtelten Verknüpfungen',
    query: {
      search: {
        $and: [
          { $or: [{ 'verb.display.en-US': 'answered' }, { 'verb.display.en-US': 'experienced' }] },
          { $or: [{ 'result.score.raw': 5 }, { 'result.score.raw': 6 }] }
        ]
      },
      operations: []
    }
  },
  {
    name: 'Einfaches Operationenbeispiel 1',
    query: {
      search: {},
      operations: [
        {
          $group: {
            _id: '',
            maxValue: { $max: '$result.score.raw' }
          }
        }
      ]
    }
  },
  {
    name: 'Einfaches Operationenbeispiel 2',
    query: {
      search: {},
      operations: [
        {
          $group: {
            _id: '$object.definition.name.en-US',
            maxValue: { $avg: '$result.score.raw' }
          }
        }
      ]
    }
  },
  {
    name: 'Berechnungsbeispiel 1',
    query: {
      search: {},
      operations: [
        {
          subtract: [
            {
              filter: {
                $and: [
                  {
                    'actor.account.name':
                      '3d6576141ffa1c88af0ebacd3b8575514cd9bc2fec14cacd4fb7f0f3bcd01287@f269323f-fa99-4102-81fa-2e6ee79d13e8.ilias'
                  },
                  { 'verb.display.en-US': 'completed' },
                  {
                    'object.id':
                      'http://stars-project.com/goto.php?target=pg_579_185&client_id=default&h5p_object_id=6&obj_id_lrs=638'
                  }
                ]
              },
              select: 'timestamp'
            },
            {
              filter: {
                $and: [
                  {
                    'actor.account.name':
                      '3d6576141ffa1c88af0ebacd3b8575514cd9bc2fec14cacd4fb7f0f3bcd01287@f269323f-fa99-4102-81fa-2e6ee79d13e8.ilias'
                  },
                  { 'verb.display.en-US': 'interacted' },
                  {
                    'object.id':
                      'http://stars-project.com/goto.php?target=pg_579_185&client_id=default&h5p_object_id=6&obj_id_lrs=638'
                  }
                ]
              },
              select: 'timestamp'
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Berechnungsbeispiel 2',
    query: {
      search: {},
      operations: [
        {
          multiply: [
            {
              filter: {
                $and: [
                  {
                    'object.id':
                      'http://stars-project.com/goto.php?target=pg_615_193&client_id=default&h5p_object_id=12&obj_id_lrs=646'
                  }
                ]
              },
              operation: '$max',
              select: 'result.score.raw'
            },
            {
              filter: {
                $and: [
                  {
                    'object.id':
                      'http://stars-project.com/goto.php?target=pg_591_185&client_id=default&h5p_object_id=5&obj_id_lrs=638'
                  },
                  { 'result.score.raw': { $exists: true, $ne: null } }
                ]
              },
              operation: '',
              select: 'result.score.raw'
            },
            {
              filter: {
                $and: [{ 'verb.display.en-US': 'answered' }]
              },
              operation: '$count',
              select: ''
            }
          ]
        }
      ]
    }
  },
  {
    name: 'Berechnungsbeispiel 3',
    query: {
      search: {},
      operations: [
        {
          divide: [
            {
              filter: {
                $and: [
                  {
                    'object.id':
                      'http://stars-project.com/goto.php?target=pg_579_185&client_id=default&h5p_object_id=6&obj_id_lrs=638'
                  },
                  { 'verb.display.en-US': 'completed' }
                ]
              },
              operation: '$count'
            },
            {
              filter: {
                $and: [
                  {
                    'object.id':
                      'http://stars-project.com/goto.php?target=pg_579_185&client_id=default&h5p_object_id=6&obj_id_lrs=638'
                  },
                  { 'verb.display.en-US': 'interacted' }
                ]
              },
              operation: '$count'
            }
          ]
        }
      ]
    }
  }
]
