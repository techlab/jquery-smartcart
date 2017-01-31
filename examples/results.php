<!DOCTYPE html>
<html>
<head>
    <title>Smart Cart - jQuery Shopping Cart Plugin</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Include Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <!-- Optional Bootstrap theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous">

    <!-- Include SmartCart CSS -->
    <link href="../css/smart_cart.css" rel="stylesheet" type="text/css" />
</head>
<body>

<?php
// Get the results as JSON string
$product_list = filter_input(INPUT_POST, 'cart_list');
// Convert JSON to array
$product_list = json_decode($product_list);
if($product_list) {
    foreach($product_list as $p){
        foreach($p as $key=>$value) {
            //var_dump($key, $value);
            echo $key, ": ", $value, "<br />";
        }
        echo '------------------------------------------<br />';
    }
} else {	
	echo "<strong>Cart is Empty</strong>";
}
?>
</body>
</html>