# verdatas-dashboard-vue

This project contains the template used within the `VerDatAsDsh`-plugin.

## Project Setup

You can install and switch to the node version used in the project (specified in `.nvmrc`) by running:

```sh
nvm use
```

Install the dependencies:

```sh
npm install
```

Compile and hot-reload for development:

```sh
npm run dev
```

Type-check, compile and minify for production:

```sh
npm run build
```

Lint with [ESLint](https://eslint.org/):

```sh
npm run lint
```

Format the code using Prettier:

```sh
npm run format
```

## Information on the metamodel

The metamodel is specified in the folder `src/util/KnowledgeGraph/moddle/resources`:

* `verDatAs.json` for the general element and attributes definition as well as
* `verDatAsDi.json` for the visual part.

### Options for properties

For the metamodel, the following options for properties can be distinguished:

* `"isAbstract": true` allows to define inheritance.
* `"isMany": true` allows nesting elements. The children contain the complete elements, i.e., tags as well as attributes.
* `"isBody": true` allows nesting attributes within element tags.
* `"isAttr": true` allows defining attributes in String format (similar to values of HTML attributes).

### Options for creating elements

The following objects have to be retrieved to execute the described functions.

```js
const canvas = this.diagram.get('canvas')
const moddle = this.diagram.get('moddle')
const modeling = this.diagram.get('modeling')
const elementFactory = this.diagram.get('elementFactory')
```

Create elements as children of the `<verDatAs:knowledgeGraph />` and automatically add a graphical representation of them.

```js
const moduleType = 'verDatAs:Chapter'
const modulePosition = { x: 100, y: 200 }
const rootElement = canvas.getRootElement()
const moduleShape = modeling.createShape(moduleType, modulePosition, rootElement)
```

Create graphical representations of elements and add them as children of other elements.

```js
const moduleDimensions = { width: 70, height: 70 }
const moduleAttributes = { ...modulePosition, ...moduleDimensions, ...moduleType }
const moduleShape = elementFactory.create('shape', moduleAttributes)
canvas.addShape(moduleShape)

// the Topic has defined a property "modules" with "isMany": true
const existingModules = knowledgeGraphTopic.businessObject?.modules ?? []
existingModules.push(moduleShape.businessObject)
modeling.updateProperties(knowledgeGraphTopic, { modules: existingModules })
```

Create elements as children of other elements.

```js
// chapterShape was created using "elementFactory.createShape"
const element = moddle.create('verDatAs:ContentPage', pageProperties)
contentPages.push(element)
chapterProperties['contentPages'] = contentPages
modeling.updateProperties(chapterShape, chapterProperties)
```

Update properties that have defined a `"isMany": true` relation in combination with `"isBody": true`.

```js
const priorKnowledgeElements = []
this.priorKnowledgeValue.forEach((elem) => {
  const element = this.diagram.get('moddle').create('verDatAs:PriorKnowledge', {
    elementId: elem.businessObject.id
  })
  priorKnowledgeElements.push(element)
})
const propertyToDefine = {}
propertyToDefine['priorKnowledgeElements'] = priorKnowledgeElements
// "elementToUpdate" is the element for whose the property should be defined
this.diagram.get('modeling').updateProperties(elementToUpdate, propertyToDefine)
```
