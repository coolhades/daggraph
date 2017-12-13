const FS = require('fs');
const DDependency = require('./DDependency.js');
const Utils = require('./../../utils/utils');

function DModule(){
    this.dependencies = [];
}

DModule.prototype.init = function(filePath){
    // Load name
    this.name = Utils.getFilenameFromPath(filePath);
    //Load provided dependencies
    this.dependencies = getProvidedDependencies(filePath);
};

function getProvidedDependencies(path){
    let file = FS.readFileSync(path, 'utf8');
  
    // Match all the dependencies of the module using a regex
    const fullDependencyRegex = /@Provides(?:(?:\n|.)*?\s+fun\s+.+?\(\s*\)\s*:\s*(\w+(?:\.\w+)*)(?:\s+|=)|(?:\n|.)*?\s+(?:protected|public)?\s+(\w*)\s+\w+\s*\()/;    
    const paramRegex = /\s*(\w+)\s*\w+\s*,?\s*/;
 
    const deps = [];
    while ((fullMatch = fullDependencyRegex.exec(file)) !== null) {
        
        // Get dependency name
        file = file.replace(fullDependencyRegex, "");
        const moduleDep = new DDependency(fullMatch[1]);
        
        // Get sub-depepndencies
        let params = fullMatch[2];
        if (params !== undefined) {
            while ((paramMatch = paramRegex.exec(params)) !== null) {
                params = params.replace(paramRegex, "");
                moduleDep.addDependency(new DDependency(paramMatch[1]));
            }
        }
        deps.push(moduleDep);
    }

    return deps;
}

module.exports = DModule;