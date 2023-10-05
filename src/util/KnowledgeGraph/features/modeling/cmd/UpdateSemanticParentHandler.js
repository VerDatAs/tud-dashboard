export default function UpdateSemanticParentHandler(verDatAsUpdater) {
  this._verDatAsUpdater = verDatAsUpdater
}

UpdateSemanticParentHandler.$inject = ['verDatAsUpdater']

UpdateSemanticParentHandler.prototype.execute = function (context) {
  var dataStoreBo = context.dataStoreBo,
    dataStoreDi = context.dataStoreDi,
    newSemanticParent = context.newSemanticParent,
    newDiParent = context.newDiParent

  context.oldSemanticParent = dataStoreBo.$parent
  context.oldDiParent = dataStoreDi.$parent

  // update semantic parent
  this._verDatAsUpdater.updateSemanticParent(dataStoreBo, newSemanticParent)

  // update DI parent
  this._verDatAsUpdater.updateDiParent(dataStoreDi, newDiParent)
}

UpdateSemanticParentHandler.prototype.revert = function (context) {
  var dataStoreBo = context.dataStoreBo,
    dataStoreDi = context.dataStoreDi,
    oldSemanticParent = context.oldSemanticParent,
    oldDiParent = context.oldDiParent

  // update semantic parent
  this._verDatAsUpdater.updateSemanticParent(dataStoreBo, oldSemanticParent)

  // update DI parent
  this._verDatAsUpdater.updateDiParent(dataStoreDi, oldDiParent)
}
