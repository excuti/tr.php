
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

