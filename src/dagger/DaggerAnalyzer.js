// Files
const FILE_HOUND = require('filehound');
const FILE_SNIFFER = require('filesniffer');
const FS = require('fs');
// Models
const DModule = require('./models/DModule.js');
const DComponent = require('./models/DComponent.js');

/**
 * Find and load the dagger components and modules
 * @param {*Path of the android project} projectRootPath 
 */
function findComponents(projectRootPath){
    return new Promise((resolve, reject) => {
        console.log('Analyzing dagger components and modules..');

        const searchCriteria = FILE_HOUND.create()
        .paths(projectRootPath)
        .discard("build")		
        .depth(20)
        .ignoreHiddenDirectories()
        .ignoreHiddenFiles()
        .ext('.java', '.kt');
    
        searchModules(searchCriteria)
        .then(modules => findAndAddInjections(modules, searchCriteria))
        .then(modules => searchComponents(modules, searchCriteria))
        .then(components => resolve(components))
        .catch(e => reject(e));
    });
}

function searchModules(searchCriteria){
    return new Promise((resolve, reject) => {
      const daggerModules = [];
      const fileSniffer = FILE_SNIFFER.create(searchCriteria);
  
      fileSniffer.on("match", (path) => {
        var module = new DModule();
        module.init(path);
        daggerModules.push(module);
      });
      fileSniffer.on("end", (files) => resolve(daggerModules));
      fileSniffer.on("error", reject);
      fileSniffer.find("@Module");
    });
  }
  
  function searchComponents(modules, searchCriteria){
    return new Promise((resolve, reject) => {
      const  daggerComponents = [];
      const fileSniffer = FILE_SNIFFER.create(searchCriteria);
  
      fileSniffer.on('match', (path) => {
        const component = new DComponent();
        component.init(path, modules);
        daggerComponents.push(component);
      });
      fileSniffer.on("end", (files) => resolve(daggerComponents));
      fileSniffer.on("error", reject);
      fileSniffer.find(/@Component|@Subcomponent/);
    });
  }

  function findAndAddInjections(modules, searchCriteria){
    return new Promise((resolve, reject) => {
        
        const injectionPathMap = [];

        // Find all the field injections for kotline and java (group 1 java only, group 2 kotlin only) 
        const injectRegex = /(?:(?:@Inject(?:\n|.)*?\s+(?:protected|public|lateinit|(\w+(?:\.\w+)*))?\s+(?:var(?:\n|.)*?:\s*)?)|(?:@field\s*:\s*\[(?:\n|.)*?Inject(?:\n|.)*?\]\s*(?:protected|public|lateinit)?\s*var\s*.+?\s*:\s*))(\w+(?:\.\w+)*)/g;
        const namedRegex = /@*Named\(\"(\w*)\"\)/;
        const fileSniffer = FILE_SNIFFER.create(searchCriteria);

        fileSniffer.on('match', (path) => {
          // Open file
          const file = FS.readFileSync(path, 'utf8');
          // Find injections
          while ((fullMatch = injectRegex.exec(file)) !== null) {

            var dep; // dep identifier
            if (fullMatch[1] !== undefined && fullMatch[1] !== null) dep = fullMatch[1];
            else dep = fullMatch[2];

            // Look for @Named in the full matcher and add it to the dep identifier
            const namedMatch = namedRegex.exec(fullMatch[0]);
            if(namedMatch !== null && namedMatch[1] !== undefined && namedMatch[1] !== null){
                dep = dep + "*" + namedMatch[1];
            }

            // If the array of paths for that dep is not initialised, init
            if (injectionPathMap[dep] === undefined) injectionPathMap[dep] = [];

            // If the path is not already in the list, add it
            if (!injectionPathMap[dep].includes(path)){
              injectionPathMap[dep].push(path);
            }
          }
        });
        fileSniffer.on("end", (files) => {
          addInjectionsToModules(injectionPathMap, modules);
          resolve(modules);
        });
        fileSniffer.on("error", reject);
        fileSniffer.find(/@Inject/i);

    });
  }

  function addInjectionsToModules(injectionPathMap, modules){
    modules.forEach(module => {
      module.dependencies.forEach(dep => {

        // Define the identifier base on the name and the named if present
        var depIndentifier = dep.name;
        if (dep.named !== undefined && dep.named !== null) depIndentifier = depIndentifier + "*" + dep.named;
        
        // If i have some injections for that dependency in the map, add them
        if(injectionPathMap[depIndentifier] !== undefined){
          injectionPathMap[depIndentifier].forEach(path => {
            dep.addInjectionPath(path);
          });
        }
      });
    });
  }

  exports.findComponents = findComponents;