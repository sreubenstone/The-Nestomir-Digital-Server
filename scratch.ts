require("dotenv").config();
const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base("appQKUzFWlztO4l1E");

/*
Function: {
    title: "Function",
    pron: "fuhngk•shuhn",
    description:
      "A function is a set of instructions written with code. It is often used to repeat a commonly used set of instructions so they do not need to be written more than once. We define a function in Python using the def keyword. To actually trigger a function, we use the function name, then two parentheses after the function name. e.g., add( ).",
    ldshab: "Known as The Holy Reusable Root in Naronian culture. Known to be the essence of all programming.",
    snippit: "def add(x,y):\n   return x + y",
    suggested: [
      { title: "Defining Your Own Python Function", url: "https://realpython.com/defining-your-own-python-function/" },
      { title: "w3schools: Creating a Python Function", url: "https://www.w3schools.com/python/python_functions.asp" },
    ],
    recommended: ["Write a Python function that calculates the average return of your investment over a period of time.", "Write a Python function that calculates your average velocity on a run."],
  },

*/

async function generate_glossary() {
  let glossary: any = {};

  base("Entries")
    .select({
      // Selecting the first 3 records in Grid view:
      maxRecords: 1,
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
            console.log("ERROR:", error);
          }
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
        console.log("GLOSSARY ARRAY:", glossary);
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
