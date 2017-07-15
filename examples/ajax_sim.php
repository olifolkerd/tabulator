<?php

//simulated server for ajax lookup

// sleep(2); //simulate load time

//build data awrray
$data = [
	[id=>1, name=>"Billy Bob", age=>"12", gender=>"male", height=>1, col=>"red", dob=>"", cheese=>1],
	[id=>2, name=>"Mary May", age=>"1", gender=>"female", height=>2, col=>"blue", dob=>"14/05/1982", cheese=>true],
	[id=>3, name=>"Christine Lobowski", age=>"42", height=>0, col=>"green", dob=>"22/05/1982", cheese=>"true"],
	[id=>4, name=>"Brendon Philips", age=>"125", gender=>"male", height=>1, col=>"orange", dob=>"01/08/1980"],
	[id=>5, name=>"Margret Marmajuke", age=>"16", gender=>"female", height=>5, col=>"yellow", dob=>"31/01/1999"],
	];

//return JSON formatted data
echo(json_encode($data));



