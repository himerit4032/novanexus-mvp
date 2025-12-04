/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select1466534506",
    "maxSelect": 1,
    "name": "role",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "buyer",
      "supplier",
      "admin"
    ]
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select46930042",
    "maxSelect": 1,
    "name": "Primary_Industry",
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
      "Food & beverage automation",
      "Pharma & medical devices",
      "EV & battery production lines",
      "Other"
    ]
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text491676904",
    "max": 0,
    "min": 0,
    "name": "company_name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1400097126",
    "max": 0,
    "min": 0,
    "name": "country",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "email3885137012",
    "name": "email",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": true,
    "type": "email"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select1466534506")

  // remove field
  collection.fields.removeById("select46930042")

  // remove field
  collection.fields.removeById("text491676904")

  // remove field
  collection.fields.removeById("text1400097126")

  // update field
  collection.fields.addAt(3, new Field({
    "exceptDomains": null,
    "hidden": false,
    "id": "email3885137012",
    "name": "email",
    "onlyDomains": null,
    "presentable": false,
    "required": true,
    "system": true,
    "type": "email"
  }))

  return app.save(collection)
})
