import csv from './downloaders/csv.js';
import json from './downloaders/json.js';
import pdf from './downloaders/pdf.js';
import xlsx from './downloaders/xlsx.js';
import html from './downloaders/html.js';
import jsonLines from './downloaders/jsonLines.js';

export default {
	csv:csv,
	json:json,
	jsonLines:jsonLines,
	pdf:pdf,
	xlsx:xlsx,
	html:html,
};