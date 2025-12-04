/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3355664324")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3866053794",
    "hidden": false,
    "id": "relation1337919823",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "company",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select990738133",
    "maxSelect": 1,
    "name": "certifications",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "ISO 9001",
      "ISO 14001",
      "fda",
      "gmp",
      "ISO 45001",
      "Other"
    ]
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "select3795943866",
    "maxSelect": 1,
    "name": "regions_served",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "south korea",
      "japan",
      "SE Asia",
      "US",
      "EU",
      "Middle East",
      "other"
    ]
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number885310711",
    "max": null,
    "min": null,
    "name": "min_project_size",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3910259274",
    "max": 0,
    "min": 0,
    "name": "preferred_project_size",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "file1964367131",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "install_photos",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor1744133794",
    "maxSize": 0,
    "name": "notes_internal",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3355664324")

  // remove field
  collection.fields.removeById("relation1337919823")

  // remove field
  collection.fields.removeById("select990738133")

  // remove field
  collection.fields.removeById("select3795943866")

  // remove field
  collection.fields.removeById("number885310711")

  // remove field
  collection.fields.removeById("text3910259274")

  // remove field
  collection.fields.removeById("file1964367131")

  // remove field
  collection.fields.removeById("editor1744133794")

  return app.save(collection)
})
