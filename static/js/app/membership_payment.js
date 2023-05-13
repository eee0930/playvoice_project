/*------------------------------------------------------------------------------
 *						/admin/payment/list_payments.html
 -----------------------------------------------------------------------------*/

function searchPayment2(searchType, page, suffix){
	
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchFormHidden_'+suffix+' #searchType').val();
	}
	
	console.log('page ' + page);
	console.log('sType ' + sType);
	console.log('keyword ' + $('#keyword').val().trim());
	var keyword =  $('#keyword').val().trim();
	if(sType == 'method'){ 
		keyword = $('#methodDiv #keyword').val().trim();
	}
	else if(sType == 'status'){ 
		keyword = $('#statusDiv #keyword').val().trim();
	}
	
	
	$.getJSON({
		//type: "GET", 
		url : '/admin/payment/search',
		data : {
			searchType : sType,
			keyword : keyword,
			fromDate : $('#fromDate').val(),
			toDate : $('#toDate').val(),
			page : page,
			sortName : $('#searchFormHidden_'+suffix+' #sortName').val(),
			asc : $('#searchFormHidden_'+suffix+' #asc').val()
		},
		success : function(result){
			//resetDefault();
			
			var page = result.result;
			displayPaymentList(page.content, result.currentPageNum, page.totalElements, suffix);		
			displayPageNavigation2(result, sType, 'list'); 

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#paymentListDiv').css("display",'none');
			//신규 테이블 show
			$('#searchResult_'+suffix).css("display",'block');
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
} 





/*------------------------------------------------------------------------------
 *						/admin/payment/incl/search_payment.html
 -----------------------------------------------------------------------------*/
function searchPayment(searchType, page, suffix){
	
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchFormHidden_'+suffix+' #searchType').val();
	}
	
	console.log('page ' + page);
	console.log('sType ' + sType);
	console.log('keyword ' + $('#keyword').val().trim());
	var keyword =  $('#keyword').val().trim();
	if(sType == 'method'){ 
		keyword = $('#methodDiv #keyword').val().trim();
	}
	else if(sType == 'status'){ 
		keyword = $('#statusDiv #keyword').val().trim();
	}
	
	
	$.getJSON({
		//type: "GET", 
		url : '/admin/payment/search',
		data : {
			searchType : sType,
			keyword : keyword,
			fromDate : $('#fromDate').val(),
			toDate : $('#toDate').val(),
			page : page,
			sortName : $('#searchFormHidden_'+suffix+' #sortName').val(),
			asc : $('#searchFormHidden_'+suffix+' #asc').val()
		},
		success : function(result){
			//resetDefault();
			
			var page = result.result;
			displayPaymentList(page.content, result.currentPageNum, page.totalElements, suffix);		
			displayPageNavigation(result, sType, 'list'); 

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#paymentListDiv').css("display",'none');
			//신규 테이블 show
			$('#searchResult_'+suffix).css("display",'block');
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
} 



function displayPaymentList(paymentList, currentPageNum, total, suffix){
	$('#searchResultTable_'+suffix).children('tbody').children("tr").remove();

	var page = $("#page").val();
	var output = ''
	var num=1;	
	var fetchSize = 20;
	
	$.each(paymentList, function(index, payment){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		var txDate = new Date(payment.txDate);
		var endDate = new Date(payment.order.endDate);
		output += '<tr>';
		output += '<td>'+num+'</td>';
		output += '<td class="paymentDetail jsAction">'+payment.pid+'</td>'; 
		output += '<td>'+payment.order.oid+'</td>';
		output += '<td>'+payment.amount+'</a></td>'; 
		output += '<td>'+payment.method+'</td>';
		output += '<td>'+payment.status+'</td>';
		output += '<td>'+endDate.getFullYear()+"-"
					+parseInt(endDate.getMonth() +1)+"-"+endDate.getDate()+'</td>';
		output += '<td>'+txDate.getFullYear()+"-"
					+parseInt(txDate.getMonth() +1)+"-"+txDate.getDate()+'</td>';
		output += '</tr>'; 
 
		$('#searchResultTable_'+suffix+' > tbody:last').append(output)
		output =''; 
	});
}



function displayPageNavigation(pageMaker, sType, suffix){
	console.log('displayPageNavigation');
	console.log("pageMaker="+JSON.stringify(pageMaker));
	console.log('sType ' + sType);
	
	var prevPage = pageMaker.prevPage;
	var nextPage = pageMaker.nextPage;
	var currentPage = pageMaker.currentPage;
	var pageList = pageMaker.pageList;
	var currentPageNum = parseInt(pageMaker.currentPageNum);
	
	var ul = $('#searchResultPageNavi ul');
	ul.empty();
	
	if(prevPage != null){
		//ul.add('li').addClass('page-item');
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
			html('PREV'+parseInt(prevPage.pageNumber+1));
		link.attr('onclick','searchPayment("'+sType+'",'+parseInt(prevPage.pageNumber+1)+',"'+suffix+'")');
		link.appendTo(li);
		li.appendTo(ul);
		
	}
	
	$.each(pageList, function(index, page){
		var li = $('<li class="page-item"></li>');
		if(parseInt(page.pageNumber) == (currentPageNum-1)){
			li.addClass("active");
		}
		var link = $('<a class="page-link"></a>');
		link.attr('href', 'javascript:void(0)');
		link.attr('onclick','searchPayment("'+sType+'",'+parseInt(page.pageNumber+1)+',"'+suffix+'")');
		link.html(parseInt(page.pageNumber + 1));
		
		li.append(link);
		li.appendTo(ul);
	});
	
	if(nextPage != null){
		//ul.add('li').addClass('page-item');
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchPayment("'+sType+'",'+parseInt(nextPage.pageNumber+1)+',"'+suffix+'")');
		
		link.appendTo(li);
		li.appendTo(ul);
	}
}


/*------------------------------------------------------------------------------
 *						/mypage/membership_history.html
 -----------------------------------------------------------------------------*/


/**
 * 환불신청 접수/저장 
 * 환불신청 접수 모달창의 환불신청 버튼(#submitRefundRequestBtn) 클릭시 호출
 * 
 * @returns RefundRequest 
 */
function addRefundRequest(refundRequest){
	$.ajax({
		type : "post",
		url : "/membership/refund/request/add",
		data : refundRequest,
		success : function(refundRequest){
			//성공시 환불신청 완료 등 화면처리 
			successAddRefundRequest(refundRequest);
		},
		error : function(e){
			// 환불신청 실패 
			$('#refundRequestFailDiv').show();
			$('#refundRequestFailMsg').text(e.responseText);
		}
	});
}


/**
 * 특정 주문에 대해 접수된 환불요청 조회
 * 환불 접수 정보 타이틀(#refundRequestTitle) 클릭시 호출 
 * 
 * 성공 : 조회한 환불요청 정보 출력
 * 실패 : 환불신청이 없음 알림 
 */
function getRefundRequest(orderId){
	$.ajax({
		type : "get",
		url : "/membership/refund/request/view/" + orderId,
		success : function(refundRequest){
			
			successGetRefundRequest(refundRequest);
		},
		error : function(){
			// 접수된 환불신청 없음
			//alert('해당 주문에 접수된 환불신청이 없습니다.');
			$('#refundRequestTitle').addClass("isEmpty");
			$('#refundRequestTitle').hide();
		}
	});
}

/**
 * 
 */
function checkRefundRequest(orderId){
	$.ajax({
		type : "get",
		url : "/membership/refund/request/view/" + orderId,
		success : function(refundRequest){
			$('#viewDetailMembershipSection .refundRequestBtn').hide();
			displayRefundRequest(refundRequest);
		},
		error : function(){
			// 접수된 환불신청 없음
			displayRefundRequestModal();
		}
	});
}



/**
 * 환불계좌로 입력한 정보가 유효한지 체크 
 * $("#checkRefundAccountBtn").click 에서 호출
 * 
 */
function checkRefundAccount(bankInfo){
	$.ajax({
		type : "post",
		url : "/refund/account/check/",
		data : bankInfo,
		success : function(){
			alert('계좌확인에 성공하였습니다.');
			
			successCheckRefundAccount();
		},
		error : function(){
			// 계좌확인 실패 
			alert('계좌확인에 실패하였습니다.<br>계좌정보를 정확히 입력해주세요.');
			$('#submitRefundRequestBtn').prop("disabled", true);
		}
	});
}



/**
 * 특정 주문에 대해 접수된 환불요청 취소 
 * 환불 취소 버튼 (#refundCancelBtn) 클릭시 호출 
 * 
 */
function cancelRefundRequest(refundRequestId){
	$.ajax({
		type : "get",
		url : "/refund/request/cancel/" + refundRequestId,
		success : function(){
			successCancelRefundRequest();
		},
		error : function(){
			
		}
	});
}




/*------------------------------------------------------------------------------
 *						/admin/refund/list_requests.html
 -----------------------------------------------------------------------------*/

/**
 * 특정 주문에 접수된 환불요청 조회
 *  목록 테이블에서 환불요청ID 클릭시 (.refundRequestDetail) 호출
 * 
 */
function getPointEventHistory(orderId, $selector){
		
	$.ajax({
		type : "get",
		url : "/admin/refund/request/view/"+orderId,
		success : function(pointEventList){
			
			successGetRefundRequest(pointEventList, $selector);
		},
		error : function(e){
			// 환불신청 실패 
			$('#refundRequestFailDiv').show();
			$('#refundRequestFailMsg').text(e.responseText);
		}
	});
}


/**
 * 환불 
 */
function addRefund(refundCommand){
	$.ajax({
		type : "post",
		url : "/refund/add",
		data : refundCommand,
		success : function(orderNum){
			//성공시 환불 완료 등 화면처리 
			successAddRefund(orderNum);
		},
		error : function(e){
			// 환불 실패 
			$('#refundRequestFailDiv').show();
			$('#refundRequestFailMsg').text(e.responseText);
		}
	});
}







