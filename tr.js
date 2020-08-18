	var bank 	= null;
	var ttyp 	= null;
	var tid 	= null;
	var tkn 	= null;
	function GoTrxItem(i, _bank, amount){
		ReGenerateConfirmButton();
	
			
			bank = _bank;
			i = i.split("_");
			var t = i[1];
			var data = "t="+t;
			
			$("#trxModalTitle").html("# " + bank + " - " + amount + ".00 TRY");
			$("#trxModal").modal();
			Http.Call("application/gateway/agent/service/trx.pool.open.php", "POST", data, null, function(rsp){
				var rsp = JSON.parse(rsp);
				if(rsp.status == "success"){
					console.log(rsp.message.amount);
					var i 	= rsp.message.id;
					var b 	= rsp.message.bank;
					var tty	= rsp.message.type;
					var tk 	= rsp.message.token;
					var a 	= rsp.message.amount;
					var c 	= rsp.message.created;
					
					if(tty == "qr"){
						bank  	= b;
						tid	 	= t;
						tkn		= tk;
						ttyp	= tty;
						AtmSelection("city");	
						GetNearestAtms();				
					}else if(tty == "cepbank"){
						bank  	= b;
						tid	 	= t;
						tkn		= tk;
						ttyp	= tty;
						console.log("cepbank");
						var str_desc = "Bu işlem bir CEP BANK işlemidir.<br>Bu işlemde ATM seçimi ve QR kod okuyucu olmayacaktır.<br>DEVAM ET butonuna bastığınızda işlemi üstünüze alacaksınız.<br>Müşteri SMS taleplerinizi Müşteriye Sor kısmından yapınız..";
						$("#trxModalContent").html(str_desc);
						$("#trxModalBtnCnt").show();
					}
				}else{
					$("#trxModalContent").html(rsp.message);
				}
			});
			
			}
