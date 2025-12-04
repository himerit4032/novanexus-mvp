/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3355664324")

  // update collection data
  unmarshal({
    "name": "suppliers_factory"
  }, collection)

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select968261471",
    "maxSelect": 1,
    "name": "machine_tags",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Extrusion lines",
      "CNC / machining centers",
      "Cutting & sawing systems",
      "Mixing & blending systems",
      "Filling & dosing (liquid/powder)",
      "Capping / sealing / closing",
      "Labeling & coding",
      "Blister / pouch / stick-pack lines",
      "Tablet / capsule lines (press, coating 등)",
      "Food processing lines (baking, frying, cooking, cooling…)",
      "Bottling & canning lines",
      "Warehouse racking & AS/RS",
      "Conveyors & sortation",
      "Palletizing / depalletizing / robotics",
      "Cleanroom & sterile systems",
      "Inspection / vision / testing equipment",
      "Dust / fume / oil-mist collectors",
      "Other custom machinery"
    ]
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1243330237",
    "max": 0,
    "min": 0,
    "name": "machines_notes",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3355664324")

  // update collection data
  unmarshal({
    "name": "suppliers"
  }, collection)

  // remove field
  collection.fields.removeById("select968261471")

  // remove field
  collection.fields.removeById("text1243330237")

  return app.save(collection)
})
