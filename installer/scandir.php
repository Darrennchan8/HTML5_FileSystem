<?php
	if(isset($_POST["dir"])){
		$path=htmlspecialchars($_POST["dir"]);
	} else {
		$path="";
	}
	if(strpos($path,"../")!==false){
		$path="";
	}
	if(isset($_POST["listDir"])){
		$list=htmlspecialchars($_POST["listDir"]);
	} else {
		$list=true;
	}
	$path = ["/xampp/htdocs/".$path];
	function scan($directory,$listDir){
		$seperator = "|";
		$result = [];
		for($x=0; $x!=count($directory); $x++){
			if(!is_dir($directory[$x])){
				throw new Exception();
			}
			$results = scandir($directory[$x]);
			$results = array_diff($results, ["..","."]);
			$results = array_values($results);
			for($temp=0; $temp!=count($results); $temp++){
				if(is_dir($directory[$x]."/".$results[$temp])){
					if($listDir==true){
						$results[$temp]=$results[$temp]."/";
					} else {
						array_push($directory, $directory[$x]."/".$results[$temp]);
					}
				}
			}
			$result[$x] = $seperator.implode("|",$results);
		}
		$seperator = "";
		for($x=0; $x!=count($directory); $x++){
			echo $seperator;
			echo substr($directory[$x], 13);
			echo "/";
			$seperator = ":";
			echo $result[$x];
		}
	}
	try{
		scan($path,$list);
	}catch(Exception $e){
		echo "<script verified id='remotePHP'>";
		echo '
			localStorage.setItem("currentPath","");
			location.reload();
		';
		echo "</script>";
	}
?>