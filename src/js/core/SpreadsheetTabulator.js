//tabulator with all modules installed
import {default as Tabulator} from './Tabulator.js';
import * as _modules from '../core/modules/optional.js';
import ModuleBinder from './tools/ModuleBinder.js';

var { SelectRowModule, ...modules } = _modules;

class SpreadsheetTabulator extends Tabulator {}

//bind modules and static functionality
new ModuleBinder(SpreadsheetTabulator, modules);

export default SpreadsheetTabulator;
