<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta name="description" content="Smart Cart 2 - a javascript jQuery shopping cart plugin" />  
  <title>Smart Cart 2 - a javascript jQuery shopping cart plugin</title>
  <link href="styles/demo_style.css" rel="stylesheet" type="text/css">

  <link href="styles/smart_cart.css" rel="stylesheet" type="text/css">
  
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-18629864-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>  
  
</head>
<body>
<div class="demoHead">   
  <h1>Smart Cart 2 - a javascript jQuery shopping cart plugin</h1>
  <h2>Basic Example</h2>
  <br />
    <script type="text/javascript"><!--
    google_ad_client = "pub-8226185437441708";
    /* TechDemoTop 728x90 */
    google_ad_slot = "7531608375";
    google_ad_width = 728;
    google_ad_height = 90;
    //-->
    </script>
    <script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
    </script>
  <br />&nbsp;
  <br />
  <a href="index.htm" class="selected">Basic Example</a>
  <a href="SmartCart2-Events.htm" class="btn">Example with Events</a>
  <a href="SmartCart2-MultipleCart.htm" class="btn">Multiple Cart Example</a>
  <a href="http://techlaboratory.net/products.php?product=scat" class="btn">Go to Home</a>
</div>
<table align="center" border="0" cellpadding="0" cellspacing="0">
<tr><td>                    
<div class="scMain">  
<?php
// creating product array, can be from database
$product_array = array(
  "100" =>array('product_id'=>'100', 'product_name'=>'Apple MacBook Pro MA464LL/A 15.4" Notebook PC','product_desc'=>'The Intel Core Duo powering MacBook Pro is actually two processors built into a single chip.', 'product_price'=>'2299.99', 'product_img'=>'products/product1.jpg'),
  "101" =>array('product_id'=>'101', 'product_name'=>'Sony VAIO 11.1" Notebook PC','product_desc'=>'Weighing in at just an amazing 2.84 pounds and offering a sleek, durable carbon-fiber case in charcoal black. And with 4 to 10 hours of standard battery life, it has the stamina to power you through your most demanding applications.', 'product_price'=>'2699.99', 'product_img'=>'products/product6.jpg'),
  "102" =>array('product_id'=>'102', 'product_name'=>'Canon Digital Rebel XT 8MP Digital SLR Camera','product_desc'=>'Canon EOS Digital Rebel XT SLR adds resolution, speed, extra creative control, and enhanced comfort in the hand to one of the smallest and lightest digital cameras in its class.', 'product_price'=>'550.00', 'product_img'=>'products/product3.jpg'),
  "103" =>array('product_id'=>'103', 'product_name'=>'HTC Touch Diamond','product_desc'=>'Re-defining the perception of advanced mobile phones… the HTC Touch Diamond™ signals a giant leap forward in combining hi-tech prowess with intuitive usability and exhilarating design.', 'product_price'=>'750.00', 'product_img'=>'products/product4.jpg'),
  "104" =>array('product_id'=>'104', 'product_name'=>'Apple iMac G5 Desktop','product_desc'=>'IMAC G5/1.8 256MB 160GB SD 20IN OS10.3', 'product_price'=>'1600.00', 'product_img'=>'products/product2.jpg'),
  "105" =>array('product_id'=>'105', 'product_name'=>'Blackberry 8900','product_desc'=>'', 'product_price'=>'1150.00', 'product_img'=>'products/product5.jpg'),
  "106" =>array('product_id'=>'106', 'product_name'=>'Headphone with mic','product_desc'=>'', 'product_price'=>'148.85', 'product_img'=>'products/product8.jpg')
  );
// get the selected product array
// here we get the selected product_id/quantity combination asa an array
$product_list = $_REQUEST['products_selected'];
echo "<strong>Selected products result:</strong><br />";
var_dump($product_list);
echo "<br /><br />";
if(!empty($product_list)) {
?>             
<div class="scCartHeader">
  <label class="scCartTitle scCartTitle1">Products</label>
  <label class="scCartTitle scCartTitle2">Price</label>
  <label class="scCartTitle scCartTitle3">Quantity</label>
  <label class="scCartTitle scCartTitle4">Total</label>
  <label class="scCartTitle scCartTitle5"></label>
</div>	 
 <div class="scCartList">
<?  
    $sub_total = 0;
    foreach($product_list as $product){
      $chunks = explode('|',$product);
      $product_id = $chunks[0];
      $product_qty = $chunks[1];
      $product_name = $product_array[$product_id]['product_name'];
      $product_desc = $product_array[$product_id]['product_desc'];
      $product_img = $product_array[$product_id]['product_img'];
      $product_price = $product_array[$product_id]['product_price'];
      $product_amount = $product_price*$product_qty;
      // calculate the subtotal
      $sub_total = $sub_total + $product_amount;
     // echo "Product Id: ".$product_id." Quantity: ".$product_qty."<br>";
?>

   <div id="divCartItem2" class="scCartItem">
      <div class="scCartItemTitle scCartItemTitle1">
        <img src="<? echo $product_img; ?>" class="scProductImageSmall">
      <div>
        <strong><? echo $product_name; ?></strong>

      </div>
   </div>
   <label class="scCartItemTitle scCartItemTitle2"><? echo $product_price; ?></label>
   <label id="lblQuantity2" class="scCartItemTitle scCartItemTitle3"><? echo $product_qty; ?></label>
   <label id="lblTotal2" class="scCartItemTitle scCartItemTitle4"><? echo $product_amount; ?></label>
   </div>
<? } ?>
 </div>
 
<div style="border:0px;" class="scBottomBar">
<form action="./index.php" method="post">
<?
    // set the request for continue shopping
    if(isset($product_list)){
      foreach($product_list as $p_list){
        $prod_options .='<input type="hidden" name="products_selected[]" value="'.$p_list.'">';
      }
      echo $prod_options;
    }
?>
 <input style="width:200px;height:32px;float:left;padding-top:0px;" type="submit" class="scCheckoutButton" value="Continue Shopping">
</form>

<label class="scLabelSubtotalValue"><? echo $sub_total; ?></label>
<label class="scLabelSubtotalText">Subtotal: </label>
</div>          
<?    
} else {	
	echo "<strong>Cart is Empty</strong>";
	?>
	<form action="./index.php" method="post">
    <input style="width:200px;height:32px;float:left;padding-top:0px;" type="submit" class="scCheckoutButton" value="Back to Cart">
  </form>
  <?
}
?>
</div>

  <br /><br />
  <script type="text/javascript"><!--
  google_ad_client = "pub-8226185437441708";
  /* TechDemoBottom 728x90 */
  google_ad_slot = "4801936038";
  google_ad_width = 728;
  google_ad_height = 90;
  //-->
  </script>
  <script type="text/javascript"
  src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
  </script>
  <br />&nbsp;

</td></tr>
</table>

</body>
</html>