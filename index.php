<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="description" content="Smart Cart 2 - a javascript jQuery shopping cart plugin" />
<title>Smart Cart 2 - a javascript jQuery shopping cart plugin</title>

<!-- Smart Cart Files Include -->
<link href="styles/smart_cart.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="js/jquery-1.3.2.min.js"></script>
<script type="text/javascript" src="js/jquery.smartCart-2.0.js"></script>

<?
$product_array = array(
  "100" =>array('product_id'=>'100', 'product_catgegory'=>'Computers', 'product_name'=>'Apple MacBook Pro MA464LL/A 15.4" Notebook PC','product_desc'=>'The Intel Core Duo powering MacBook Pro is actually two processors built into a single chip.', 'product_price'=>'2299.99', 'product_img'=>'products/product1.jpg'),
  "101" =>array('product_id'=>'101', 'product_catgegory'=>'Computers', 'product_name'=>'Sony VAIO 11.1" Notebook PC','product_desc'=>'Weighing in at just an amazing 2.84 pounds and offering a sleek, durable carbon-fiber case in charcoal black. And with 4 to 10 hours of standard battery life, it has the stamina to power you through your most demanding applications.', 'product_price'=>'2699.99', 'product_img'=>'products/product6.jpg'),
  "102" =>array('product_id'=>'102', 'product_catgegory'=>'Cameras', 'product_name'=>'Canon Digital Rebel XT 8MP Digital SLR Camera','product_desc'=>'Canon EOS Digital Rebel XT SLR adds resolution, speed, extra creative control, and enhanced comfort in the hand to one of the smallest and lightest digital cameras in its class.', 'product_price'=>'550.00', 'product_img'=>'products/product3.jpg'),
  "103" =>array('product_id'=>'103', 'product_catgegory'=>'Mobile Phones', 'product_name'=>'HTC Touch Diamond','product_desc'=>'Re-defining the perception of advanced mobile phones… the HTC Touch Diamond™ signals a giant leap forward in combining hi-tech prowess with intuitive usability and exhilarating design.', 'product_price'=>'750.00', 'product_img'=>'products/product4.jpg'),
  "104" =>array('product_id'=>'104', 'product_catgegory'=>'Computers', 'product_name'=>'Apple iMac G5 Desktop','product_desc'=>'IMAC G5/1.8 256MB 160GB SD 20IN OS10.3', 'product_price'=>'1600.00', 'product_img'=>'products/product2.jpg'),
  "105" =>array('product_id'=>'105', 'product_catgegory'=>'Mobile Phones', 'product_name'=>'Blackberry 8900','product_desc'=>'', 'product_price'=>'1150.00', 'product_img'=>'products/product5.jpg'),
  "106" =>array('product_id'=>'106', 'product_catgegory'=>'Accessories', 'product_name'=>'Headphone with mic','product_desc'=>'', 'product_price'=>'148.85', 'product_img'=>'products/product8.jpg')
  );

$product_list = $_REQUEST['products_selected'];

$selected = 0;
if(isset($product_list)){
$selected = 1; // let us display the cart first
}

?>

<script type="text/javascript">
    $(document).ready(function(){
    	// Call Smart Cart    	
  		$('#SmartCart').smartCart({selected:<? echo $selected; ?>});
		});
</script>
</head>
<body>
 
<table align="center" border="0" cellpadding="0" cellspacing="0">
<tr><td>
    <form action="results.php" method="post">
    <!-- Smart Cart HTML Starts -->
    <div id="SmartCart" class="scMain">
    
    <?
        foreach($product_array as $product){
          $product_id = $product["product_id"];
          $product_name = $product['product_name'];
          $product_desc = $product['product_desc'];
          $product_img = $product['product_img'];
          $product_price = $product['product_price'];
          $product_category = $product['product_catgegory'];
          
          echo '<input type="hidden" pid="'.$product_id.'" pname=\''.$product_name.'\' 
                pcategory="'.$product_category.'" pdesc="'.$product_desc.'" pprice="'.$product_price.'" pimage="'.$product_img.'">';
        }
    ?>
      <select name="products_selected[]" style="display:none;" multiple="multiple">
    <?
        foreach($product_list as $product_value){      
          echo '<option value="'.$product_value.'"></option>';
        }
    ?>      
      </select>                    
    </div>
    <!-- Smart Cart HTML Ends -->
    </form>
</td></tr>
</table>

</body>
</html>