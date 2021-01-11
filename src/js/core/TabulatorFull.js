//tabulator with all modules installed
import {default as Tabulator} from './Tabulator.js';
import * as modules from '../modules.js';
import ModuleBinder from './ModuleBinder.js';

class TabulatorFull extends Tabulator {};

//bind modules and static functionality
new ModuleBinder(TabulatorFull, modules);

export default TabulatorFull;