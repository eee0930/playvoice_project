/**
 * 결제 관련 기능들
 * 
 * 준비: <script src="https://cdn.iamport.kr/js/iamport.payment-1.1.5.js"
	type="text/javascript"></script>
 */

// 결제 모듈 초기화
IMP.init("imp70988479");
/**
 * 전달 받은 데이터로 결제 금액을 서버에서 계산 후 결제를 준비.<br>
 * 결제 준비가 성공하면 결제 모듈창을 호출한다.<br>
 * 
 * <b>payCommand</b>={<br>
 *		itemId(아이템 ID)<br>
 *		gold(쿠폰 적용 금액. TBD)<br>
 *		payMethod(결제 수단)<br>
 *		memberId(멤버ID)<br>
 *		alias(멤버 별명)<br>
 *		name(주문자 이름)<br>
 *		phone(주문자 연락처)<br>
 *		district(주소의 시~구까지 정보)<br>
 *		address1(주소)<br>
 *		address2(나머지 상세 주소)<br>
 *		postalCode(우편 번호)<br>
 *	}<br>
 * <b>regular</b>: 정기 결제 여부
 */
function processMembershipPayment(payCommand, regular) {
	$.ajax({
		type: "post",
		url: "/payment/open",
		data: payCommand,
		success: function(orderData){
			var params = {
					pg: "html5_inicis",
					pay_method : payCommand.payMethod, 			// 결제 수단(카드(card),계좌이체(trans),무통장입금(vbank))
					merchant_uid: orderData.order.orderNum,		// 서버에서 생성한 주문번호
					name: orderData.order.item.alias,	// 주문 상품명
					digital: true,						// 휴대폰 결제 시 반드시 필요 항목(실물 상품이면 false)
					buyer_name: payCommand.name,		// 주문자 이름
					amount: orderData.order.totalAmount,// 주문 금액
					buyer_tel: payCommand.phone,		// 주문자 연락처
					custom_data: orderData				// 사용자 정의 데이터
			};
			if(regular){
				params["pg"] += ".INIBillTst";					// 정기 결제용 pg 
				params["customer_uid"] = merchantId + "Bill";	// INIBillTst 테스트아이디의 경우는 국민카드 테스트 결제가 불가능
				params["amount"] = 0;							// 정기 결제 키 발급을 위해 결제 금액은 0원으로.
			}
			if(payCommand.payMethod == "vbank"){
				if(orderData.dueDate != undefined){
					var dueDate = orderData.dueDate;
					params["vbank_due"] = dueDate.format("yyyyMMddhhmm");
				}else{
					var now = new Date();
					params["vbank_due"] = now.getFullYear().toString()
								 			 .concat((now.getMonth()+1).zf(2))
								 			 .concat(now.getDate().zf(2))
								 			 .concat(now.getHours().zf(2))
								 			 .concat((now.getUTCMinutes()+5).zf(2));
				}
			}
			//---------------------------------
			openMembershipPaymentModule(params);
			//---------------------------------
		},
		error: function(xhr){
			alert("결제창을 호출하지 못했습니다.\n잠시 후 다시 시도해 주세요.");
		}
	})
};

/**
 * 결제 준비를 서버쪽에서 성공적으로 마치고 결제 모듈창을 띄움 <br>
 * 결제 진행이 완료되어 결제 모듈창이 닫히면 서버의 완료 페이지로 리다이렉트<br>
 * 리다이렉트 시 전달되는 파라미터:<br>
 * 		imp_uid(아임포트 거래 번호)<br>
 * 		merchant_uid(주문 번호)<br>
 * 		imp_success(거래 성공 여부)<br><br>
 * 
 * payParams={<br>
 * 		pay_method([필수]결제수단),<br>
 * 		amount([필수]최종결제금액),<br>
 * 		buyer_tel([필수]주문자 연락처),<br>
 * 		name([선택]주문명),<br><br>
 * 		tax_free([선택]면세공급가액),<br>
 * 		buyer_name([선택]주문자명),<br>
 * 		buyer_email([선택]주문자 이메일),<br>
 * 		buyer_addr([선택]주문자 주소)<br>
 * 		vbank_due([가상계좌일 시 필수]입금 기한)<br>
 * 		custom_data([선택]사용자정의 정보)<br>
 * 	}	
 */
function openMembershipPaymentModule(payParams) {
	if(payParams.m_redirect_url === undefined){
		// 모바일은 결제 모듈이 닫히면서 이어지는 페이지를 따로 지정해야 한다.
		// 실제 클라이언트 위치에서 접속 가능한 주소면 된다.(로컬에서 테스트할 경우 https://localhost/payment/complete도 가능)
		payParams["m_redirect_url"] = location.origin + "/payment/complete";
	}
	IMP.request_pay(payParams, function(rsp){
		if(rsp.success){
			location.href = "/payment/complete"
						+ "?imp_uid=" + rsp.imp_uid
						+ "&merchant_uid=" + rsp.merchant_uid
						+ "&imp_success=" + rsp.success;
		}else{
			alert(rsp.error_msg);
		}
	});
}