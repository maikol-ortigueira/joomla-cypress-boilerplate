const Manifest = require("./Manifest");
const { limpiarRuta, getNotEmptyFolderNames, destPath, sourcePath, releasePath } = require("./utils");
const capitalize = require("capitalize");
const { task, src, dest, series, watch } = require("gulp");
const clean = require('gulp-clean');
const GulpZip = require("gulp-zip");
const path = require('path');

class Template {
    
    constructor(nombre, cliente = 'site') {
        this.cleanTemplate = [];
        this.copyTemplate = [];

        let ruta = limpiarRuta(sourcePath);
        nombre = nombre.toLowerCase();
        this.cliente = cliente.toLowerCase() === 'site' ? 'site' : 'admin';
        this.rutaDesde = `${ruta}templates/${this.cliente}/${nombre}/`;
        this.rutaLanguagesDesde = `${this.rutaDesde}language/`;
        this.rutaMediaDesde = `${this.rutaDesde}media/`;
        this.nombre = nombre;
        this.cNombre = capitalize(nombre);
        
        let manifest = new Manifest(ruta, 'template', nombre, this.cliente);
        this.manifiesto = manifest.manifiesto;
        this.version = this.manifiesto.version;
        
        var rutaJoomla = limpiarRuta(destPath);
        this.rutaCliente = cliente.toLowerCase() === 'site' ? '' : 'administrator/';
        this.rutaMediaCliente = cliente.toLowerCase() === 'site' ? 'site/' : 'administrator/';
        this.rutaJoomlaTmp = `${rutaJoomla}${this.rutaCliente}templates/${this.nombre}/`
        this.rutaJoomlaMedia = `${rutaJoomla}media/templates/${this.rutaMediaCliente}${this.nombre}/`
        this.rutaJoomlaLanguage = `${rutaJoomla}${this.rutaCliente}language/`;

        let destinoRelease = limpiarRuta(releasePath);
        this.releaseDest = `${destinoRelease}templates/${this.cliente}/${this.nombre}/`;
    }
    get zipFileName() {
        return `tpl_${this.cliente}_${this.nombre}.v${this.version}.zip`;
    }

    get languageFileNames() {
        let languages = getNotEmptyFolderNames(this.rutaLanguagesDesde)
        let langFiles = [];
        languages.forEach(l => {
            langFiles.push(`${l}/tpl_${this.nombre}.ini`);    
            langFiles.push(`${l}/tpl_${this.nombre}.sys.ini`);    
        })

        return langFiles;
    }

    // clean tasks
    get cleanTask() {
        this.cleanMediaTask;
        this.cleanLanguageTask;
        this.cleanTemplateFilesTask;
        this.cleanManifestFileTask;

        task(`cleanTemplate${this.cNombre}`, series(...this.cleanTemplate));

        return `cleanTemplate${this.cNombre}`;
    }

    get cleanMediaTask(){
        let cleanPath = this.rutaJoomlaMedia;
        task(`cleanTemplate${this.cNombre}Media`, () =>{
            return src(cleanPath, { read:false, allowEmpty:true })
                .pipe(clean({ force:true }))
        })

        this.cleanTemplate.push(`cleanTemplate${this.cNombre}Media`)
    }

    get cleanLanguageTask(){
        let cleanPath = this.languageFileNames.map(l => `${this.rutaJoomlaLanguage}${l}`);
        task(`cleanTemplate${this.cNombre}Language`, () =>{
            return src(cleanPath, { read:false, allowEmpty:true })
                .pipe(clean({ force:true }))
        })

        this.cleanTemplate.push(`cleanTemplate${this.cNombre}Language`)
    }

    get cleanTemplateFilesTask() {
        let cleanPath = this.rutaJoomlaTmp;
        task(`cleanTemplate${this.cNombre}Files`, () =>{
            return src(cleanPath, { read:false, allowEmpty:true })
                .pipe(clean({ force:true }))
        })

        this.cleanTemplate.push(`cleanTemplate${this.cNombre}Files`)
    }

    get cleanManifestFileTask() {
        let cleanPath = `${this.rutaJoomlaTmp}templateDetails.xml`;
        task(`cleanTemplate${this.cNombre}Manifest`, () =>{
            return src(cleanPath, { read:false, allowEmpty:true })
                .pipe(clean({ force:true }))
        })

        this.cleanTemplate.push(`cleanTemplate${this.cNombre}Manifest`)
    }

    // copy tasks
    get copyTask() {
        this.copyMediaTask;
        this.copyLanguageTask;
        this.copyTemplateFilesTask;
        this.copyManifestFileTask;

        task(`copyTemplate${this.cNombre}`, series(...this.copyTemplate));

        return `copyTemplate${this.cNombre}`;
    }

    get copyMediaTask() {
        let destino = this.rutaJoomlaMedia;
        let origen = `${this.rutaMediaDesde}**/*.*`

        task(`copyTemplate${this.cNombre}Media`, series(`cleanTemplate${this.cNombre}Media`, () => {
            return src(origen, { allowEmpty: true })
            .pipe(dest(destino))
        }))

        this.copyTemplate.push(`copyTemplate${this.cNombre}Media`);
    }

    get copyLanguageTask() {
        let destinoBase = this.rutaJoomlaLanguage;
        let origen = this.languageFileNames.map(l => `${this.rutaLanguagesDesde}${l}`)

        task(`copyTemplate${this.cNombre}Language`, series(`cleanTemplate${this.cNombre}Language`, () => {
            return src(origen, { allowEmpty: true })
                .pipe(dest(file => {
                    let filename = path.basename(path.dirname(file.path));
                    return path.join(destinoBase, filename);
                }));
        }));

        this.copyTemplate.push(`copyTemplate${this.cNombre}Language`);
    }

    get copyTemplateFilesTask() {
        let destino = this.rutaJoomlaTmp;
        let origen = [
            `${this.rutaDesde}**/*.*`,
            `!${this.rutaMediaDesde}**`,
            `!${this.rutaLanguagesDesde}**`,
        ]

        task(`copyTemplate${this.cNombre}Files`, series(`cleanTemplate${this.cNombre}Files`, () => {
            return src(origen, { allowEmpty: true })
            .pipe(dest(destino))
        }))

        this.copyTemplate.push(`copyTemplate${this.cNombre}Files`);
    }

    get copyManifestFileTask() {
        let destino = this.rutaJoomlaTmp;
        let origen = `${this.rutaDesde}templateDetails.xml`

        task(`copyTemplate${this.cNombre}Manifest`, series(`cleanTemplate${this.cNombre}Manifest`, () => {
            return src(origen, { allowEmpty: true })
            .pipe(dest(destino))
        }))

        this.copyTemplate.push(`copyTemplate${this.cNombre}Manifest`);
    }

    // watch task
    get watchTask() {
        let watchPath = `${this.rutaDesde}**/*`
        task(`watchTemplate${this.cNombre}`, () => {
            watch([watchPath], series(`copyTemplate${this.cNombre}`));
        });

        return `watchTemplate${this.cNombre}`;
    }

    // release task
    get releaseTask() {
        let desde = `${this.rutaDesde}**`;
        let destino = this.releaseDest;
        let filename = this.zipFileName;

        task(`releaseTemplate${this.cNombre}`, function(cb) {
            return src(desde)
                .pipe(GulpZip(filename))
                .pipe(dest(destino))
        })

        return `releaseTemplate${this.cNombre}`;        
    }
}

module.exports = Template;