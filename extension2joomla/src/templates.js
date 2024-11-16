const Template = require("./Template");
const { getTemplates } = require("./utils");
const { task, parallel } = require("gulp");

if (getTemplates !== false) {
    const templates = getTemplates();
    let cleanTemplates = [],
        copyTemplates = [],
        watchTemplates = [],
        releaseTemplates = [];

    for (let client in templates) {
        templates[client].forEach(name => {
            let temp = new Template(name, client)

            cleanTemplates.push(temp.cleanTask)
            copyTemplates.push(temp.copyTask)
            watchTemplates.push(temp.watchTask)
            releaseTemplates.push(temp.releaseTask)
        })
    }

    task(`cleanTemplates`, parallel(...cleanTemplates));
    task(`copyTemplates`, parallel(...copyTemplates));
    task(`watchTemplates`, parallel(...watchTemplates));
    task(`releaseTemplates`, parallel(...releaseTemplates));
}