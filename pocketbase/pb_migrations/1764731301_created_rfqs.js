/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text724990059",
        "max": 0,
        "min": 0,
        "name": "title",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select1542800728",
        "maxSelect": 1,
        "name": "field",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "draft",
          "open",
          "in_review",
          "mached",
          "closed"
        ]
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation2224054195",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "buyer",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3866053794",
        "hidden": false,
        "id": "relation4011040825",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "buyer_company",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select1300520098",
        "maxSelect": 1,
        "name": "primary_process",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "Extrusion line",
          "Cut-to-length",
          "Warehouse automation",
          "Racking / ASRS",
          "Robotics & cells",
          "Other"
        ]
      },
      {
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
          "General metal fabrication (CNC, press, welding)",
          "Warehouse systems & automation (racking, AS/RS, conveyors)",
          "Food & beverage production lines",
          "Pharma & medical devices manufacturing",
          "Nutraceuticals & supplements (health foods, diet pills,etc)",
          "Cosmetics / personal care manufacturing",
          "Electronics / EV & battery lines",
          "Packaging & end-of-line integration",
          "Other industrial manufacturing"
        ]
      },
      {
        "hidden": false,
        "id": "select2089714866",
        "maxSelect": 1,
        "name": "region_preference",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "South Korea",
          "Japan",
          "Taiwan",
          "EU",
          "US",
          "SE Asia",
          "Middle East",
          "Other",
          "No preference"
        ]
      },
      {
        "hidden": false,
        "id": "select4170633151",
        "maxSelect": 1,
        "name": "budget_range",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "< 100k",
          "100k-500k",
          "500k-3M",
          "3M+"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3083070511",
        "max": 0,
        "min": 0,
        "name": "throughput_target",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "convertURLs": false,
        "hidden": false,
        "id": "editor1843675174",
        "maxSize": 0,
        "name": "description",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "editor"
      },
      {
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
      },
      {
        "hidden": false,
        "id": "date3866337329",
        "max": "",
        "min": "",
        "name": "due_date",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1368277760",
        "max": 0,
        "min": 0,
        "name": "visibility",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_1947012888",
    "indexes": [],
    "listRule": null,
    "name": "rfqs",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1947012888");

  return app.delete(collection);
})
