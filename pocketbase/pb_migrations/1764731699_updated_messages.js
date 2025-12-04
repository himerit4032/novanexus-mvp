/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_728114816",
    "hidden": false,
    "id": "relation2324571881",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "conversation",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1593854671",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "sender",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "convertURLs": false,
    "hidden": false,
    "id": "editor3685223346",
    "maxSize": 0,
    "name": "body",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "file1204091606",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "attachments",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // remove field
  collection.fields.removeById("relation2324571881")

  // remove field
  collection.fields.removeById("relation1593854671")

  // remove field
  collection.fields.removeById("editor3685223346")

  // remove field
  collection.fields.removeById("file1204091606")

  return app.save(collection)
})
