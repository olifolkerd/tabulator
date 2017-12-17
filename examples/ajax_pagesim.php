<?php

//simulated server for ajax lookup

sleep(1); //simulate load time

//build data array
$data = [
	];


$output = [
	"last_page"=>10,
	"data"=>$data,
];

//return JSON formatted data
echo(json_encode($output));



