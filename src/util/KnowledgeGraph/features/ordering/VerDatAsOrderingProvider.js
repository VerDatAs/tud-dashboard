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
import { isAny } from '@/util/KnowledgeGraph/features/modeling/util/ModelingUtil'
import OrderingProvider from 'diagram-js/lib/features/ordering/OrderingProvider'
import inherits from 'inherits'
import { findIndex, find } from 'min-dash'

/**
 * A simple ordering provider that makes sure that the labels and elements are ordered correctly.
 */
export default function VerDatAsOrderingProvider(eventBus, canvas) {
  OrderingProvider.call(this, eventBus)

  // Specify a specific order of the elements
  const orders = [
    {
      type: 'label',
      order: {
        level: 3
      }
    },
    {
      type: 'verDatAs:SequenceFlow',
      order: {
        level: 3
      }
    },
    {
      type: 'verDatAs:Course',
      order: {
        level: 5
      }
    },
    {
      type: 'verDatAs:Module',
      order: {
        level: 5
      }
    },
    {
      type: 'verDatAs:Chapter',
      order: {
        level: 5
      }
    },
    {
      type: 'verDatAs:InteractiveTask',
      order: {
        level: 5
      }
    },
    {
      type: 'verDatAs:DocumentationTool',
      order: {
        level: 5
      }
    }
  ]

  /**
   * Compute the element order into a specific format.
   *
   * @param element
   */
  function computeOrder(element) {
    if (element.labelTarget) {
      return { level: 10 }
    }

    const entry = find(orders, function (o) {
      return isAny(element, [o.type])
    })

    return (entry && entry.order) || { level: 1 }
  }

  /**
   * Retrieve the order of the elements.
   *
   * @param element
   */
  function getOrder(element) {
    let order = element.order

    if (!order) {
      element.order = order = computeOrder(element)
    }

    if (!order) {
      throw new Error('no order for <' + element.id + '>')
    }

    return order
  }

  /**
   * Find the actual parent of an element.
   *
   * @param element
   * @param newParent
   * @param containers
   */
  function findActualParent(element, newParent, containers) {
    let actualParent = newParent

    while (actualParent) {
      if (isAny(actualParent, containers)) {
        break
      }

      actualParent = actualParent.parent
    }

    if (!actualParent) {
      throw new Error('no parent for <' + element.id + '> in <' + (newParent && newParent.id) + '>')
    }

    return actualParent
  }

  /**
   * Retrieve both the parent and the index of a given element.
   *
   * @param element
   * @param newParent
   */
  this.getOrdering = function (element, newParent) {
    // Render labels always on top
    if (element.labelTarget) {
      return {
        parent: canvas.findRoot(element.labelTarget) || canvas.getRootElement(),
        index: -1
      }
    }

    const elementOrder = getOrder(element)

    if (elementOrder.containers) {
      newParent = findActualParent(element, newParent, elementOrder.containers)
    }

    const currentIndex = newParent.children.indexOf(element)

    let insertIndex = findIndex(newParent.children, function (child) {
      // Do not compare with labels, they are created in the wrong order (right after elements)
      // during import and mess up the positioning.
      if (!element.labelTarget && child.labelTarget) {
        return false
      }

      return elementOrder.level < getOrder(child).level
    })

    // If the element is already in the child list at a smaller index, we need to adjust the insert index.
    // This takes into account that the element is being removed before being re-inserted
    if (insertIndex !== -1) {
      if (currentIndex !== -1 && currentIndex < insertIndex) {
        insertIndex -= 1
      }
    }

    return {
      index: insertIndex,
      parent: newParent
    }
  }
}

VerDatAsOrderingProvider.$inject = ['eventBus', 'canvas', 'translate']

inherits(VerDatAsOrderingProvider, OrderingProvider)
