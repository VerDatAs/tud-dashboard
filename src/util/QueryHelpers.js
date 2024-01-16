//Currently supported comparison operators
export const comparisonOperators = [
  { displayName: 'equal', value: '$eq' },
  { displayName: 'not equal', value: '$ne' },
  { displayName: 'greater than', value: '$gt' },
  { displayName: 'greater than or equal', value: '$gte' },
  { displayName: 'less than', value: '$lt' },
  { displayName: 'less than or equal', value: '$lte' },
  { displayName: 'in', value: '$in' },
  { displayName: 'not in', value: '$nin' }
]

//Currently supported aggregation operations
export const aggregationOperators = [
  { displayName: 'min', value: '$min' },
  { displayName: 'max', value: '$max' },
  { displayName: 'avg', value: '$avg' },
  { displayName: 'sum', value: '$sum' }
]

export const Connections = {
  AND: '$and',
  OR: '$or'
}

export const queryExamples = [
  {
    name: 'Test',
    query: {
      search: {},
      operations: [
        {
          $skip: 10
        },
        {
          $limit: 100
        },
        {
          $group: {
            _id: '',
            maxValue: { $max: '$result.score.raw' }
          }
        },
        {
          $sort: {
            'verb.display.en-US': 1
          }
        }
      ]
    }
  },
  {
    name: 'Test2',
    query: {
      search: { 'verb.display.en-US': 'answered' },
      operations: []
    }
  },
  {
    name: 'Test3',
    query: {
      search: {
        timestamp: {
          $eq: '2023-06-27T07:47'
        }
      },
      operations: [
        {
          $project: { _id: 0, result: { $subtract: [3, 2] } }
        }
      ]
    }
  },
  {
    name: 'Einfaches Filter Beispiel',
    query: {
      search: {
        'verb.display.en-US': {
          $eq: 'answered'
        }
      },
      operations: []
    }
  },
  {
    name: 'Filter Beispiel mit AND-Verknüpfung',
    query: {
      search: {
        $and: [{ timestamp: { $gte: '2023-06-27T07:47' } }, { timestamp: { $lte: '2023-06-27T07:48' } }]
      },
      operations: []
    }
  },
  {
    name: 'Filter Beispiel mit komplexerer Verknüpfung',
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
    name: 'Einfaches Operationen Beispiel',
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
  }
]
