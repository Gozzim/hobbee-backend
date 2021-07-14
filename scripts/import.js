const inquirer = require('inquirer');
const { exec } = require('child_process');

inquirer
  .prompt([
    {
      type: 'rawlist',
      name: 'importScript',
      message: 'Please enter your choice:',
      choices: [
        { key: 0, value: "all" },
        { key: 1, value: "tags" },
        { key: 2, value: "groups" },
        { key: 3, value: "example-images" }
      ],
    },
  ])
  .then(answer => {
    switch (answer.importScript) {
      case "all":
        exec("node scripts/import-tags.js && node scripts/importStandardGroups.js && node scripts/import-example-images.js");
        break;
      case "tags":
        exec("node scripts/import-tags.js");
        break
      case "groups":
        exec("node scripts/importStandardGroups.js")
        break;
      case "example-images":
        exec("node scripts/import-example-images.js")
        break;
      default:
        console.log("Invalid Input")
        break;
    }
  });