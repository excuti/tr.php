
	
	$(document).ready(function(){
		Custom.SetPage("trx-pool");
		startTrxPool();
	});
	
	$(".select-tabs").click(function(){
		var data_tab	= $(this).attr("data-tab");
		$(".select-tabs").addClass("selection-tab-link").removeClass("selection-tab-selected");
		$(this).addClass("selection-tab-selected");
		
		$('.tab-container').hide();
		$('.tab-container[data-tab-area="'+data_tab+'"]').show();
		
		if(data_tab == "location"){ 
			$("#trxModalBtnCnt").hide();
			GetNearestAtms(); 
		}else{
			$("#trxModalBtnCnt").show();
		}
		$('#trxModal').attr("data-id", "0");
	})

	function startTrxPool(){
		trxPool();
		trxPoolInterval = setInterval(function(){ 
			trxPool(); 
		}, 10000);
	}

	var pool_inp = 0;
	function trxPool(){
		if(pool_inp == 0){
			pool_inp = 1;
			Http.Call("application/gateway/agent/service/trx.pool.php", "POST", $("#trx-pool-form").serialize(), null, function(rsp){
				var rsp = JSON.parse(rsp);
				
				if(rsp.length > 0){
					//New Itens
					var newItems = [];
					$.each(rsp, function(n, t){ newItems.push(t.i); });
					
					$('#trx-pool-table > tbody  > tr').each(function() {
						var id = $(this).attr("id");
						if(newItems.indexOf(id) == -1){
							$(this).remove();
						}
					});
					
					$.each(rsp, function(n, t){
						var ti = t.i;
						var tb = t.b;
						var ta = t.a;

						var content = "<tr id=\""+ti+"\">"+
											"<td>"+tb+"</td>"+
											"<td>"+ta+".00</td>"+
											"<td><button onclick=\"GoTrxItem('"+ti+"','"+tb+"','"+ta+"')\" class=\"btn-sm btn-success start-pool-item\" style=\"padding:3px 5px; font-size:11px; border:1x solid #ccc;\">başlat</button></td>"+
										"</tr>";
						if(!$("#"+ti).length){
							$("#trx-pool-tbody").append(content);
						}
					});
				}else{
					var content = '<tr id="0"><td colspan="3">işlem bulunamadı.</td></tr>';
					$("#trx-pool-tbody").html(content);
				}
				
				pool_inp = 0;
			});
		}else{
			console.log("wr");
		}
	}
	
	var bank 	= null;
	var ttyp 	= null;
	var tid 	= null;
	var tkn 	= null;
	function GoTrxItem(i, _bank, amount){
		ReGenerateConfirmButton();
		/*
		var sayi1 	= Math.floor(Math.random() * 10) + 1;
		var sayi2 	= Math.floor(Math.random() * 10) + 1;
		var toplam 	= sayi1 + sayi2;
		
					var cevap 	= prompt(sayi1 + " + " + sayi2 + " işleminin sonucu kaçtır?");
				if(cevap == toplam){
			
		*/
			
			bank = _bank;
			i = i.split("_");
			var t = i[1];
			var data = "t="+t;
			
			$("#trxModalTitle").html("# " + bank + " - " + amount + ".00 TRY");
			$("#trxModal").modal();
			Http.Call("application/gateway/agent/service/trx.pool.open.php", "POST", data, null, function(rsp){
				var rsp = JSON.parse(rsp);
				if(rsp.status == "success"){
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
		
		/*
		}else if(cevap == null || cevap == ""){
			alert("Doğrulama sorusuna cevap vermediniz! İşleme devam edilemez!");
		}else{
			alert("Doğrulama sorusu yanlış cevaplandı. Doğru cevap " + toplam + " olmalıydı. Siz cevap olarak " + cevap + " yazdınız !");
		}
		*/
		
	}
	
	function InitSelect2(){
		$('select[name="atm_city"]').select2({
			placeholder: "Şehir Seçiniz",
			language: "tr",
			width: "100%"
		});	
		
		$('select[name="atm_town"]').select2({
			placeholder: "İlçe Seçiniz",
			language: "tr",
			width: "100%"
		});
		
		$('select[name="atm_atm"]').select2({
			placeholder: "Bankmatik Seçiniz",
			language: "tr",
			width: "100%"
		});
	}
	
	function AtmSelection(prefix){	
		if(prefix == "city"){
			var data 	= "bank="+bank+"&prefix=city";
			var target 	= $('select[name="atm_city"]');
			var cnt 	= "<option value='0'>Şehir Seçiniz</option>";
		}else if(prefix == "town"){
			var data 	= "bank="+bank+"&prefix=town&atm_city="+$("#atm_city").val();
			var target 	= $('select[name="atm_town"]');
			
			$('#atm_town').html("<option value='0'>İlçe Seçiniz</option>");
			$('#atm_atm').html("<option value='0'>Bankamatik Seçiniz</option>");
			var cnt 	= "<option value='0'>İlçe Seçiniz</option>";
		}else if(prefix == "atm"){
			var data 	= "bank="+bank+"&prefix=atm&atm_city="+$("#atm_city").val()+"&atm_town="+$('select[name="atm_town"]').val();
			var target 	= $('select[name="atm_atm"]');
			var cnt 	= "<option value='0'>Bankamatik Seçiniz</option>";
		}
		
		Http.Call("application/gateway/agent/service/atm.data.select.php", "POST", data, null, function(rsp){
			var rsp = JSON.parse(rsp);
			
			$.each(rsp.results, function(n, i){
				var i_id 	= i.id;
				var i_name 	= i.text;
				
				cnt			+= "<option value='"+i_id+"'>"+i_name+"</option>";
			})
			
			target.html(cnt);
		});
		
		InitSelect2();
	}	
	
	function CepbankSelection(){	
		$("#cepbankModal").modal();
	}
	
	
	$("#see-on-map-btn").click(function(){
		var data_atm	= $('select[name="atm_atm"]').val();
		showATM(data_atm, "list");
	})
	
	$(".trxModalBtnCnt").click(function(){
		var id = $("#trxModal").attr("data-id");
		TrxAssign(id);
	})	
	
	$(".trxModalBtnCnt2").click(function(){
		var id = $('#atm_atm').val();
		TrxAssign(id);
	})
	
	function trxModalBtnCnt2(){
		var id = $('#atm_atm').val();
		TrxAssign(id);
	}
	
	function TrxAssign(atm_id){
		if(ttyp=="cepbank"){atm_id=1;}
		$("#trxModal").modal("hide");
		$("#atmModal").modal("hide");
		if(atm_id > 0){
			$.post("application/gateway/agent/service/trx.pool.assign.php", "atm="+atm_id+"&id="+tid+"&token="+tkn+"&a=a", function(r){
				if(r.status == "success"){
					var t = r.params.t;
					var u = r.params.u;
					
					OpenMyTrx(t, u);
					//SetTrxFrame(t, u);
				}else{
					alert(r.message);
				}
			});
		}else{
			alert("Bankamatik Seçiniz..!");
		}
	}
	
	is_atm_show = 0;
	function showATM(id, type){
		if(is_atm_show == 0){
			is_atm_show = 1;
			if(type == "list"){ $(".trxModalBtnCnt").hide(); }else{ $(".trxModalBtnCnt").show(); }
			if(id > 0){
				$("#atmModal.modal-body").html("<img src='application/gateway/agent/assets/img/location.gif' width='100%'>");
				$("#atmModal").modal();
				$.post("application/gateway/agent/service/atm.data.show.php", "id="+id, function(r){
					if(r.s == "success"){
						var content = "<img src='"+r.p.i+"' style='width:100%'><br>"+
										"<div style='background:#f7f3fc; padding:10px; border-radius:5px; color:#270424; font-size:15px; margin-top:15px; font-size:12px;'>"+
											"<b>ATM Adı : </b>"+r.p.n+" <br>"+
											"<b>ATM Adresi : </b>"+r.p.a
										"</div>";
										
						$('#trxModal').attr("data-id", id);
					}else{
						var content = r.m;
					}
					$("#atmModalContent").html(content);
					
					is_atm_show = 0;
				});	
			}else{
				alert("Lütfen Bankmatik Seçiniz!");
				is_atm_show = 0;
			}	
		}		
	}

	$('#atmModal').on('hidden.bs.modal', function () {
		$('#trxModal').attr("data-id", "0");
	})
	
	$('#trxModal').on('hidden.bs.modal', function () {
		$('#trxModal').attr("data-id", "0");
		$('#atm_city').html("<option>Şehir Seçiniz</option>");
		$('#atm_town').html("<option>İlçe Seçiniz</option>");
		$('#atm_atm').html("<option>Bankamatik Seçiniz</option>");
	})
	
	function GetNearestAtms(){
		$("#atm-list-nearest").html('<div class="atm-item-no"><div style="float:left; width:100%; margin-top:2px; line-height:18px; text-align:center;">çevrenizdeki bankamatikler aranıyor...</div></div>');
		
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(function(position){
				var my_lat = position.coords.latitude;
				var my_lng = position.coords.longitude;

				//fake location
				//my_lat 			= "39.934143";
				//my_lng 			= "32.854905";

				$.post("application/gateway/agent/service/atm.data.nearest.php", "bank="+bank+"&lat="+my_lat+"&lng="+my_lng, function(r){
					var content = "";
					
					if(r.length > 0){
						$.each(r, function(n,i){
							content += "<div onclick=\"showATM('"+i.id+"', 'location')\" class=\"atm-item\" style=\"cursor:pointer; float:left; background:#fff; width:100%; padding:5px; margin-bottom:5px; border-radius:5px; font-size:13px;\">"+
											"<div style=\"float:left; width:67%; margin-right:1%; margin-top:2px; line-height:18px;\">"+i.address+"</div>"+
											"<div style=\"float:left; width:32%; text-align:right; padding-top:5px; padding-bottom:7px;\">"+
												"<span style=\"background:#9b6bed; color:#fff; padding:5px 10px; border-radius:5px; font-size:11px; margin-bottom:5px;\">"+i.distance+" mt</span>"+
											"</div>"+
										"</div>";
						})
					}else{
						var content = '<div class="atm-item-no" style="float:left; margin:5px 10px; background:#ffecf1; color:#d05173; border:1px solid #f8b7c8;">'+
										'<div style="float:left; width:100%; margin-top:2px; line-height:18px;  padding:10px 15px;">Konumuza yakın bankamatik bulunamıyor. Konum servislerinizin açık olduğundan ve konum izinlerinin verildiğinden emin olunuz.</div>'+
									'</div>';
					}
					
					$("#atm-list-nearest").html(content);
				});		
			});
		}else{
			alert("Konumunuz Alınamaıyor..");
		}
	}

	function OpenMyTrx(t, u){
		Custom.elBlock("body");

		var f = '<iframe onload="frameload()" class="trx-iframe" token="'+t+'" src="'+u+'" style="width:100%; height:1000px;" scrolling="no" frameborder="0"></iframe>';
		$("#agent-trx-content-container").html(f);
	}
	
	function frameload(){
		Custom.elUnblock("body");
		$("#agent-main-content").slideUp();
		$("#agent-trx-content").slideDown();
	}
	
	
	$(function(){
	$('#btnConfirm')
		.bind('mousedown', function() {
			if ($(this).attr('disabled')) return !1;
			return $.data(this, 'sliding', 1), !1;
		})
		.bind('mouseup mouseleave', function(e) {
			e.preventDefault();

			if ($.data(this, 'sliding')) {
				$.data(this, 'sliding', 0);

				var pct = (parseInt($(this).find('> confirm').css('right')) / $(this).outerWidth() * 100);

				if (pct <= 25)
					$(this).find('> confirm').animate({
						right: '0'
					}, 500, 'easeOutSine', function() {
						$(this).closest('button').trigger('change').attr('disabled', !0);
					});
				else
					$(this).find('> confirm').animate({
						right: '100%'
					}, 500, 'easeOutBounce');
			}

			return false;
		})
		.bind('mousemove', function(e) {
			var sliding = $.data(this, 'sliding') ? !0 : !1,
				pos;

			if (sliding) {
				pos = (e.pageX - $(this).offset().left) / $(this).outerWidth() * 100;
				$(this).find('> confirm').css('right', (100 - pos) + '%');
			}
		});
	});
	
	function ReGenerateConfirmButton(){
		$('#btnConfirm').attr("disabled", false)
		$('#btnConfirm confirm').css('right', '100%');
	}
