/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3866053794")

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "select3968139601",
    "maxSelect": 1,
    "name": "primary_industry",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Aluminum extrusion & finishing",
      "CNC machining & fabrication",
      "Press lines & forming",
      "Industrial robotics & cells",
      "Material handling & conveyors",
      "Warehouse systems & AS/RS",
      "Packaging & end-of-line",
      "Injection molding & plastics",
      "Steel processing & coil lines",
      "Food & beverage automation",
      "Pharma & medical devices",
      "EV & battery production lines",
      "Other"
    ]
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1843675174",
    "max": 0,
    "min": 0,
    "name": "description",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select4156564586",
    "maxSelect": 1,
    "name": "size",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "1-49",
      "50-199",
      "200-499",
      "500+"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3866053794")

  // remove field
  collection.fields.removeById("select3968139601")

  // remove field
  collection.fields.removeById("text1843675174")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "select4156564586",
    "maxSelect": 1,
    "name": "size",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "small",
      "medium",
      "enterprise"
    ]
  }))

  return app.save(collection)
})
