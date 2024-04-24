# TUD Dashboard

The dashboard for the assistance system developed as part of the VerDatAs project.

## Project setup and development

### Prerequisites

```sh
nvm use
npm install
```

### Local development

Create a `.env.development` file in order to specify values for the following variables:

```
VITE_BACKEND_URL=TAS_BACKEND_URL # the URL of the tud-tas-backend
VITE_PSEUDO_ID=LMS_PSEUDO_ID # the user identification specified by the LMS that is used within the statements
VITE_COURSE_ID=LMS_COURSE_OBJECT_ID # the objectId of the LMS course
VITE_CAN_VIEW_ONLY=true|false # the decision, whether the student or the lecturer view should be displayed
VITE_PREVIEW_MODE=true|false # the decision, whether the preview of the dashboard should be shown (locally, use false)
```

In order to modify the generic course format that is used for redrawing the knowledge graph, navigate into `./src/utl/InitialEvent.js`.

Start compile and hot-reload for development:

```sh
npm run dev
```

### Compile and minify for production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Type checking

```sh
npm run type-check
```

### Development information on the metamodel

The metamodel is specified in the folder `src/util/KnowledgeGraph/moddle/resources` using the [moddle-library](https://github.com/bpmn-io/moddle):

* `verDatAs.json` for the general element and attributes definition as well as
* `verDatAsDi.json` for the visual part.

#### Options for properties

In our metamodel, the following options for properties are used:

* `"isAbstract": true` allows to define inheritance.
* `"isMany": true` allows nesting elements. The children contain the complete elements, i.e., tags as well as attributes.
* `"isBody": true` allows nesting attributes within element tags.
* `"isAttr": true` allows defining attributes in String format (similar to values of HTML attributes).

#### Options for creating elements

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

### Local development with ILIAS

* The folder of the `tud-dashboard` should be located within the same folder such as [tud-dashboard-plugin](https://github.com/VerDatAs/tud-dashboard-plugin).
* In order to build the application and move it into the plugin, run the following command:

```sh
npm run build-move ilias
```

## License

This plugin is licensed under the GPL v3 License (for further information, see [LICENSE](LICENSE)).

## Libraries used

The libraries used in this project are listed in the following table. This information can also be requested by:

```
npm run extract-licenses
```

After that the list of libraries used can be found in `dist/THIRD-PARTY-tud-dashboard.md`.

|    Name    |   Version  |   License  |     URL    |
| ---------- | ---------- | ---------- | ---------- |
| @babel/parser | 7.22.7 | MIT | https://github.com/babel/babel |
| @bpmn-io/diagram-js-ui | 0.2.2 | MIT | https://github.com/bpmn-io/diagram-js-ui |
| @fortawesome/fontawesome-common-types | 6.4.2 | MIT | https://github.com/FortAwesome/Font-Awesome |
| @fortawesome/fontawesome-svg-core | 6.4.2 | MIT | https://github.com/FortAwesome/Font-Awesome |
| @fortawesome/free-solid-svg-icons | 6.4.2 | (CC-BY-4.0 AND MIT) | https://github.com/FortAwesome/Font-Awesome |
| @fortawesome/vue-fontawesome | 3.0.3 | MIT | https://github.com/FortAwesome/vue-fontawesome |
| @jridgewell/sourcemap-codec | 1.4.15 | MIT | https://github.com/jridgewell/sourcemap-codec |
| @types/web-bluetooth | 0.0.18 | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @vue/compiler-core | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/compiler-dom | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/compiler-sfc | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/compiler-ssr | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/devtools-api | 6.5.0 | MIT | https://github.com/vuejs/vue-devtools |
| @vue/reactivity-transform | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/reactivity | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/runtime-core | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/runtime-dom | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/server-renderer | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vue/shared | 3.3.4 | MIT | https://github.com/vuejs/core |
| @vueuse/core | 10.5.0 | MIT | https://github.com/vueuse/vueuse |
| @vueuse/core | 7.7.1 | MIT | https://github.com/vueuse/vueuse |
| @vueuse/metadata | 10.5.0 | MIT | https://github.com/vueuse/vueuse |
| @vueuse/shared | 10.5.0 | MIT | https://github.com/vueuse/vueuse |
| @vueuse/shared | 7.7.1 | MIT | https://github.com/vueuse/vueuse |
| asynckit | 0.4.0 | MIT | https://github.com/alexindigo/asynckit |
| axios | 1.4.0 | MIT | https://github.com/axios/axios |
| clsx | 1.2.1 | MIT | https://github.com/lukeed/clsx |
| combined-stream | 1.0.8 | MIT | https://github.com/felixge/node-combined-stream |
| component-event | 0.2.1 | MIT | https://github.com/component/event |
| csstype | 3.1.2 | MIT | https://github.com/frenic/csstype |
| de-indent | 1.0.2 | MIT | https://github.com/yyx990803/de-indent |
| delayed-stream | 1.0.0 | MIT | https://github.com/felixge/node-delayed-stream |
| diagram-js-direct-editing | 2.0.0 | MIT | https://github.com/bpmn-io/diagram-js-direct-editing |
| diagram-js | 11.13.1 | MIT | https://github.com/bpmn-io/diagram-js |
| didi | 9.0.2 | MIT | https://github.com/nikku/didi |
| domify | 1.4.1 | MIT | https://github.com/component/domify |
| estree-walker | 2.0.2 | MIT | https://github.com/Rich-Harris/estree-walker |
| follow-redirects | 1.15.2 | MIT | https://github.com/follow-redirects/follow-redirects |
| form-data | 4.0.0 | MIT | https://github.com/form-data/form-data |
| hammerjs | 2.0.8 | MIT | https://github.com/hammerjs/hammer.js |
| he | 1.2.0 | MIT | https://github.com/mathiasbynens/he |
| htm | 3.1.1 | Apache-2.0 | https://github.com/developit/htm |
| ids | 1.0.5 | MIT | https://github.com/bpmn-io/ids |
| inherits-browser | 0.1.0 | ISC | https://github.com/nikku/inherits-browser |
| inherits | 2.0.4 | ISC | https://github.com/isaacs/inherits |
| js-base64 | 3.7.5 | BSD-3-Clause | https://github.com/dankogai/js-base64 |
| magic-string | 0.30.1 | MIT | https://github.com/rich-harris/magic-string |
| mime-db | 1.52.0 | MIT | https://github.com/jshttp/mime-db |
| mime-types | 2.1.35 | MIT | https://github.com/jshttp/mime-types |
| min-dash | 4.1.1 | MIT | https://github.com/bpmn-io/min-dash |
| min-dom | 4.1.0 | MIT | https://github.com/bpmn-io/min-dom |
| moddle-xml | 10.1.0 | MIT | https://github.com/bpmn-io/moddle-xml |
| moddle | 6.2.3 | MIT | https://github.com/bpmn-io/moddle |
| nanoid | 3.3.6 | MIT | https://github.com/ai/nanoid |
| object-refs | 0.3.0 | MIT | https://github.com/bpmn-io/object-refs |
| path-intersection | 2.2.1 | MIT | https://github.com/bpmn-io/path-intersection |
| picocolors | 1.0.0 | ISC | https://github.com/alexeyraspopov/picocolors |
| pinia-plugin-persistedstate | 3.2.0 | MIT | https://github.com/prazdevs/pinia-plugin-persistedstate |
| pinia | 2.1.6 | MIT | https://github.com/vuejs/pinia |
| postcss | 8.4.27 | MIT | https://github.com/postcss/postcss |
| postit-js-core | 1.1.0 | MIT | https://github.com/pinussilvestrus/postit-js |
| preact | 10.16.0 | MIT | https://github.com/preactjs/preact |
| proxy-from-env | 1.1.0 | MIT | https://github.com/Rob--W/proxy-from-env |
| saxen | 8.1.2 | MIT | https://github.com/nikku/saxen |
| source-map-js | 1.0.2 | BSD-3-Clause | https://github.com/7rulnik/source-map-js |
| tiny-svg | 3.0.1 | MIT | https://github.com/bpmn-io/tiny-svg |
| typescript | 4.8.4 | Apache-2.0 | https://github.com/Microsoft/TypeScript |
| vue-demi | 0.13.11 | MIT | https://github.com/antfu/vue-demi |
| vue-demi | 0.14.5 | MIT | https://github.com/antfu/vue-demi |
| vue-demi | 0.14.6 | MIT | https://github.com/antfu/vue-demi |
| vue-multiselect | 3.0.0-beta.2 | MIT | https://github.com/suadelabs/vue-multiselect |
| vue-template-compiler | 2.7.14 | MIT | https://github.com/vuejs/vue |
| vue | 3.3.4 | MIT | https://github.com/vuejs/core |
| vuejs-confirm-dialog | 0.5.1 | MIT | https://github.com/harmyderoman/vuejs-confirm-dialog |
