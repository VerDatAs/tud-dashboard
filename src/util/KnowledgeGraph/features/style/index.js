/**
 * A module that changes the default diagram look.
 */
export default {
  __init__: [
    [
      'defaultRenderer',
      function (defaultRenderer) {
        // override default styles
        defaultRenderer.CONNECTION_STYLE = { fill: 'none', stroke: '#000', strokeWidth: 2 }
        defaultRenderer.SHAPE_STYLE = { fill: 'white', stroke: '#000', strokeWidth: 2 }
      }
    ]
  ]
}
