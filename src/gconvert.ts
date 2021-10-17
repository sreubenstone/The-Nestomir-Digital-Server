require("dotenv").config();
const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base("appQKUzFWlztO4l1E");
var ncp = require("copy-paste");

async function generate_glossary() {
  let glossary: any = {};

  base("Entries")
    .select({
      // Selecting the first 3 records in Grid view:
      maxRecords: 200,
      view: "Ready",
    })
    .eachPage(
      function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function (record, i) {
          try {
            glossary[record.fields.Key] = record.fields;
            glossary[record.fields.Key].suggested = JSON.parse(glossary[record.fields.Key].suggested);
            glossary[record.fields.Key].recommended = JSON.parse(glossary[record.fields.Key].recommended);
          } catch (error) {
            // console.log("item:", record.fields.Key);
            // console.log("ERROR:", error);
          }
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
        // console.log(glossary);
        ncp.copy(JSON.stringify(glossary), function () {
          console.log("copied json to clipboard");
        });
      },

      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

generate_glossary();
