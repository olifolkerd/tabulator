<?php

//simulated server for ajax lookup

sleep(1); //simulate load time

//build data array
$data = [
	[id=>1 * $_GET["page"], name=>"Billy Bob", age=>"12", gender=>"male", height=>1, col=>"red", dob=>"", cheese=>1],
	[id=>2 * $_GET["page"], name=>"Mary May", age=>"1", gender=>"female", height=>2, col=>"blue", dob=>"14/05/1982", cheese=>true],
	[id=>3 * $_GET["page"], name=>"Christine Lobowski", age=>"42", height=>0, col=>"green", dob=>"22/05/1982", cheese=>"true"],
	[id=>4 * $_GET["page"], name=>"Brendon Philips", age=>"125", gender=>"male", height=>1, col=>"orange", dob=>"01/08/1980"],
	[id=>5 * $_GET["page"], name=>"Margret Marmajuke", age=>"16", gender=>"female", height=>5, col=>"yellow", dob=>"31/01/1999"],
	];


$output = [
	"last_page"=>10,
	"data"=>$data,
];

//return JSON formatted data
echo(json_encode($output));



