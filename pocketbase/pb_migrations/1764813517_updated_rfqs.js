/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1947012888")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\"\n",
    "listRule": "buyer = @request.auth.id\n",
    "updateRule": "buyer = @request.auth.id\n",
    "viewRule": "buyer = @request.auth.id\n"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1947012888")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
