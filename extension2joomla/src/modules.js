const { task, parallel } = require("gulp");
const Modulo = require("./Modulo");
const { hasModules, getModules } = require("./utils");

if (hasModules) {
    const clients = getModules();
    let cleanModules = [],
        copyModules = [],
        watchModules = [],
        releaseModules = []

    for (let client in clients) {
        clients[client].forEach(name => {
            let module = new Modulo(name, client)

            cleanModules.push(module.cleanTask)
            copyModules.push(module.copyTask)
            watchModules.push(module.watchTask)
            releaseModules.push(module.releaseTask)
        })
    }

    task(`cleanModules`, parallel(...cleanModules));
    task(`copyModules`, parallel(...copyModules));
    task(`watchModules`, parallel(...watchModules));
    task(`releaseModules`, parallel(...releaseModules));    
}