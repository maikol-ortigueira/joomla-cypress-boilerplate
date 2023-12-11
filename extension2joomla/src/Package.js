const {
    hasComponents,
    getComponentsNames,
    hasFiles,
    getFilesNames,
    hasPlugins,
    getPlugins,
    hasTemplates,
    getTemplates,
    limpiarRuta,
    hasModules,
    getModules,
    getPackageName,
    getDefault,
    getFecha,
    hasLibraries,
    getLibrariesNames,
    sourcePath,
    packagePath,
    releasePath } = require("./utils");
const Component = require("./Component");
const Archivo = require("./Archivo")
const Plugin = require('./Plugin');
const Template = require("./Template");
const Modulo = require("./Modulo");
const Library = require("./Library");
const js2xml = require('js2xmlparser');
const { writeFileSync } = require("fs");
const { task, src, series, dest } = require("gulp");
const gulpClean = require("gulp-clean");
const GulpZip = require("gulp-zip");
const fs = require("fs");


class Package {

    constructor() {
        this.package = getPackageName();
        this.xml2 = { "@": { "type": "package", "method": "upgrade" } };
        this.sourcePath = sourcePath.charAt(sourcePath.length - 1) == '/' ? sourcePath : sourcePath + '/';
        this.releasePath = releasePath.charAt(releasePath.length - 1) == '/' ? releasePath : releasePath + '/';
        this.destPath = packagePath.charAt(packagePath.length - 1) == '/' ? packagePath : packagePath + '/';
        this.tmpPath = `${this.destPath}tmp/`;
        this.setPackageData();

        // let destino = destPath.charAt(destPath.length - 1) == '/' ? destPath : destPath + '/';
        // this.destino = destino

        this.setExtensions();
        this.getUpdateServers();
    }

    setPackageData() {
        this.packagename = this.package.name.toLowerCase();
        // remove packageName spaces
        this.packagename = this.packagename.replace(/\s/g, '');
        this.xml2.name = `PKG_${this.packagename.toUpperCase()}`
        this.xml2.packagename = this.packagename;
        this.xml2.author = getDefault(this.package.author, 'Maikol Fustes')

        // creation date
        let fechaHoy = getFecha();
        let mesAnoHoy = `${fechaHoy.mes} ${fechaHoy.ano}`
        this.xml2.creationDate = getDefault(this.package.creationDate, mesAnoHoy);
        this.version = getDefault(this.package.version, '1.0.0');
        this.xml2.version = this.version;
        this.xml2.copyright = getDefault(this.package.copyRight, `Copyright (c) ${this.author}. All rights reserved.`);
        this.xml2.license = getDefault(this.package.license, 'https://www.gnu.org/copyleft/gpl.html GNU/GPL');
        this.xml2.description = `PKG_${this.packagename.toUpperCase()}_DESC`;
        // if hasScriptFile, add scriptfile to xml2
        if (this.hasScriptFile() !== false) {
            this.xml2.scriptfile = "script.php";
        }
    }

    setComponents() {
        if (hasComponents) {
            let components = getComponentsNames();

            components.forEach(name => {
                this.xml2.files.folder.push({
                    "@": {
                        type: 'component',
                        id: `com_${name}`
                    },
                    "#": `com_${name}`
                });

                // add component to extensions array
                this.extensions.push({
                    name: `com_${name}`,
                    from: `${this.sourcePath}components/${name}/`,
                });
            });
        }
    }

    setFiles() {
        if (hasFiles) {
            let archivos = getFilesNames();

            archivos.forEach(name => {
                let f = new Archivo(name);
                this.zipFiles.push(`${f.releaseDest}${f.zipFileName}`);
                this.files.push(this.parseElementFile('file', name, f.zipFileName));
            })
        }
    }

    setTemplates() {
        if (hasTemplates) {
            let templates = getTemplates();
            if (templates.length > 0) {
                templates.forEach(name => {
                    let template = new Template(name)
                    this.zipFiles.push(`${template.releaseDest}${template.zipFileName}`)
                    this.files.push(this.parseElementFile('template', `tmpl_${name}`, template.zipFileName))
                })
            }
        }
    }

    setLibraries() {
        if (hasLibraries()) {
            let libraries = getLibrariesNames();

            libraries.forEach(name => {
                let lib = new Library(name);
                this.zipFiles.push(`${lib.releaseDest}${lib.zipFileName}`)
                this.files.push(this.parseElementFile('library', `lib_${name}`, lib.zipFileName))
            })
        }
    }

    setPlugins() {
        if (hasPlugins) {
            let groups = getPlugins();

            for (const type in groups) {
                let plugins = groups[type];
                if (plugins.length > 0) {
                    plugins.forEach(name => {
                        this.xml2.files.folder.push(
                            {
                                "@": {
                                    type: 'plugin',
                                    id: `plg_${type}_${name}`,
                                    group: type
                                },
                                "#": `plg_${type}_${name}`
                            }
                        );

                        // add plugin to extensions array
                        this.extensions.push({
                            name: `plg_${type}_${name}`,
                            from: `${this.sourcePath}plugins/${type}/${name}/`,
                        });
                    })
                }
            }
        }
    }

    setModules() {
        if (hasModules) {
            let clients = getModules()

            for (const client in clients) {
                let modules = clients[client]
                if (modules.length > 0) {
                    modules.forEach(name => {
                        this.xml2.files.folder.push(
                            {
                                "@": {
                                    type: 'module',
                                    id: `mod_${name}`,
                                    client: client
                                },
                                "#": `mod_${name}`
                            }
                        )
                    })
                }
            }
        }
    }

    setExtensions() {
        this.xml2.files = {};
        this.xml2.files.folder = [];
        this.extensions = [];
        this.setComponents();
        // this.setFiles();
        // this.setLibraries();
        this.setPlugins();
        this.setModules();
        // this.setTemplates();
    }

    hasScriptFile() {
        // check if script.php exists in package folder
        let scriptFile = `${this.sourcePath}package/${this.packagename}/script.php`;
        if (fs.existsSync(scriptFile)) {
            return true;
        }
        return false;
    }

    getScriptFile() {
        // check if script.php exists in package folder
        let scriptFile = `${this.sourcePath}package/${this.packagename}/script.php`;
        if (fs.existsSync(scriptFile)) {
            return scriptFile;
        }
        return false;
    }

    getUpdateServers() {
        // check if updateservers exists & length > 0
        if (this.package.hasOwnProperty('updateServers') && this.package.updateServers.length > 0) {
            let priority = 1;
            // if package dlid prefix or suffix exists, add it to xml2
            if (this.package.hasOwnProperty('dlid')) {
                let prefix = "", suffix = "";
                // if prefix or suffix exists, add it to xml2
                if (this.package.dlid.hasOwnProperty('prefix')) {
                    prefix = this.package.dlid.prefix;
                }
                if (this.package.dlid.hasOwnProperty('suffix')) {
                    suffix = this.package.dlid.suffix;
                }

                if (prefix != "" || suffix != "") {
                    let content = {};
                    if (prefix !== "") {
                        content.prefix = prefix;
                    }

                    if (suffix !== "") {
                        content.suffix = suffix;
                    }

                    this.xml2.dlid = {"@": content};
                }
            }
                
            this.xml2.updateservers = {};
            this.xml2.updateservers.server = [];
            this.package.updateServers.forEach(s => {
                // add extra query if exists to url
                if (s.hasOwnProperty('extra_query')) {
                    s.url = `${s.url}?${s.extra_query}`;
                }

                let obj = {
                    "@": {
                        type: "extension",
                        priority: priority,
                        name: s.name,
                    },
                    "#": s.url,
                };
                this.xml2.updateservers.server.push(obj);
                priority++;
            });
        }
        return false;
    }

    get manifestData() {
        return js2xml.parse("extension", this.xml2);
    }

    get zipFileName() {
        return `pkg_${this.packagename}.v${this.version}.zip`;
    }

    // gulp tasks
    get cleanTask() {
        let destino = this.releasePath;

        task(`cleanPackage`, function () {
            return src(destino, { read: false, allowEmpty: true })
                .pipe(gulpClean({ force: true }))
        })

        return `cleanPackage`;
    }

    get copyTask() {
        this.copyTmpFilesTask;
        this.copyManifestFile;
        this.copyScriptFileTask;

        task(`copyPackage`, series(...this.copyPackageTmp, 'copyScriptFile'));
        return `copyPackage`;
    }

    get copyTmpFilesTask() {
        this.copyPackageTmp = [];
        if (this.extensions.length > 0) {
            this.extensions.forEach(e => {
                let desde = e.from + '**';
                let destino = this.tmpPath + e.name;

                task(`copyTmp${e.name}`, function () {
                    return src(desde)
                        .pipe(dest(destino))
                })
                this.copyPackageTmp.push(`copyTmp${e.name}`);
            })
        }
    }

    get copyScriptFileTask() {
        let scriptFile = this.getScriptFile();
        if (scriptFile !== false) {
            let desde = scriptFile;
            let destino = this.tmpPath;

            task(`copyScriptFile`, function () {
                return src(desde)
                    .pipe(dest(destino))
            })
        } else {
            // return empty task
            task(`copyScriptFile`, function (cb) { 
                cb();
            })
        }
        return 'copyScriptFile';
    }

    get copyManifestFile() {
        // if destination folder doesn't exist, create it
        if (!fs.existsSync(this.tmpPath)) {
            fs.mkdirSync(this.tmpPath, { recursive: true });
        }
        let destino = `${this.tmpPath}pkg_${this.packagename}.xml`;
        writeFileSync(destino, this.manifestData)
    }

    get releaseTask() {
        let desde = this.tmpPath + '**';
        let destino = this.destPath;
        let destino2 = `${this.releasePath}packages/${this.packagename}/`;
        let filename = this.zipFileName;
        task(`releaseTmpPackage`, function () {
            return src(desde)
                .pipe(GulpZip(filename))
                .pipe(dest(destino))
                .pipe(dest(destino2))
        })

        return `releaseTmpPackage`;
    }

    get cleanTmpFolderTask() {
        let destino = this.tmpPath;
        task(`cleanTmpFolder`, function () {
            return src(destino, { read: false, allowEmpty: true })
                .pipe(gulpClean({ force: true }))
        })

        return `cleanTmpFolder`;
    }
}

module.exports = Package;
