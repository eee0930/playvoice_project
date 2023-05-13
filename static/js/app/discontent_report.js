/**
 * <h1>컨텐츠 신고 모듈.</h1> 
 * <br>각 앱별 게시글 혹은 댓글을 신고하기 위한 기능으로,
 * <br>이를 사용하는 페이지에서 다음과 같은 내용을 구성하여 전달하여야 한다.<br>
 * <br>reportReadyResource = {
 * 	<br>	appResourceId,	// 신고 대상 리소스 아이디
 *	<br>	appContentId,	// 신고 대상과 컨텐츠가 다를 경우 컨텐츠 아이디(예: 다이제스트, 그래머북, 픽셔너리 등)
 *	<br>	appCode,		// 신고 대상 리소스 앱코드
 *	<br>	reporterId,		// 신고자 아이디
 *	<br>	repAlias,		// 신고자 별명
 *	<br>	posAlias		// 리소스 작성자 별명
 * 	<br>}
 * 
 * @author LGM
 */
window.displayReportModal = function(reportReadyResource) {
	var modal = null;
	if(document.getElementById('modal_reportjs') != null) {
		modal = document.getElementById('modal_reportjs');
	}else{
		modal = document.createElement('DIV');
		modal.setAttribute('id', 'modal_reportjs');
		modal.className = "report-modal-section";
	}
	
	// appCode 리소스 로드
	if(typeof PointApp == 'undefined'){
		$.getScript('/js/app/pointApp.js', displayReportModalSafe());
	}else{
		displayReportModalSafe();
	}
	
	function displayReportModalSafe(){
		var innerString = '<div class="closeReportModal report-modal-back"></div>'
			+ '<div class="report-modal-content">'
			+ '<h5>Report <i class="fa fa-exclamation-triangle fa-fw"></i>'
			+ '<i class="closeReportModal fa fa-times fa-lg text-white float-right jsAction" title="닫기"></i></h5>'
			+ '<div class="report-from">신고 대상자 : <span class="alias">' + reportReadyResource.posAlias + '</span></div>'
			+ '<div class="report-select-section">'
			+ '<div class="guide">신고 사유를 선택해 주세요.<br>여러 사유에 해당되는 경우, 대표적인 사유 1개를 선택해 주세요.</div>'
			+ '<div class="select-section">';
		var reportType = [['A',' 욕설 및 비방'], 
			['B',' 부적절한 컨텐츠 <br class="d-md-none"><span>(앱 성격에 맞지 않는 글, 음란물 등)</span>'],
			['C',' 부적절한 홍보나 광고'],
			['D',' 저작권 및 명예훼손'],
			['E',' 기타 ']];
		for(var i=0;i<reportType.length;i++){
			innerString += '<label><input type="radio" name="report" '
				+ 'class="option-input radio" value="' + reportType[i][0] + '"/>'
				+ reportType[i][1] + '<br>'
				+ '<textarea class="etc-text form-control playvoice-form"'
				+ 'placeholder="신고 내용을 상세히 입력해 주세요 (선택 사항)"></textarea></label><br>';
		}
		innerString += '</div></div><div class="report-button-section">'
			+ '<button id="submitReportBtn" class="btn btn-sm btn-main-submit" disabled type="button">신고하기</button>'
			+ '<button class="closeReportModal btn btn-sm btn-main" type="button">취소</button>'
			+ '</div></div>';
		modal.innerHTML = innerString;
		
		// 신고 유형 선택 시 신고버튼 활성화
		$(modal).off('change', ':input[name="report"]')
		.one('change', ':input[name="report"]', function(){
			$(modal).find('#submitReportBtn').prop('disabled', false);
		});
		
		// 신고 보내기
		$(modal).off('click', '#submitReportBtn')
		.one('click', '#submitReportBtn', function(){
			var reportResource = {
					appResourceId: reportReadyResource.appResourceId,
					appContentId: reportReadyResource.appContentId,
					reporterId: reportReadyResource.reporterId,
					repAlias: reportReadyResource.repAlias,
					posAlias: reportReadyResource.posAlias,
					reportType: $(modal).find(':input[name="report"]:checked').val(),
					comment: $(modal).find('textarea:visible').val().trim()
			}
			//-----------------------
			addReport(reportResource);
			//-----------------------
		})
		
		// 신고 내용 ajax 전송
		function addReport(reportResource){
			$.ajax({
				type: 'post',
				url: '/report/' + PointApp[reportReadyResource.appCodeName] + '/add',
				data:JSON.stringify(reportResource), 
				contentType: "application/json;charset=UTF-8",
				success:function(){
					alert('신고가 접수되었습니다. 관리자의 확인 후 처리됩니다.');
					$(modal).hide(function(){
						$('html').removeClass('modalOpen');
					})
				},
				error: function(e){
					alert("신고 접수 중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.");
					$(modal).hide(function(){
						$('html').removeClass('modalOpen');
					})
					return;
				}
			})
		}
		
		// 신고창 닫기
		$(modal).off('click', '.closeReportModal')
		.one('click', '.closeReportModal', function(){
			$(modal).hide(function(){
				$('html').removeClass('modalOpen');
			})
		});
		modal.style.display = 'none';
		document.body.appendChild(modal);
		
		$(modal).fadeIn(100);
		$('html').addClass('modalOpen');
		
	}
	
}

/**-----------------------------------------------------------------------------
 * 						admin/report/list_reports.html
 -----------------------------------------------------------------------------*/
/**
 * 신고 게시글의 상세 정보를 가져와서 표시한다.
 */
window.viewReportDetail = function(reportId){
	$.ajax({
		url: '/admin/report/view/' + reportId,
		type: 'get',
		success: function(report){
			if(typeof displayReportDetail == 'function'){
				//-------------------------------
				displayReportDetail(report);
				//-------------------------------
			}
		},
		error: function(xhr){
			alert(xhr.responseText);
		}
	})
}

/**
 * 신고에 대한 처리 코멘트를 남긴다.
 */
window.answerReport = function(reportId, answerResource){
	$.ajax({
		url: '/admin/report/answer',
		type: 'post',
		data: JSON.stringify(answerResource), 
		contentType: "application/json;charset=UTF-8",
		success: function(){
			alert('처리되었습니다.');
			//--------------------
			successAnswerReport(reportId, answerResource.status);
			//--------------------
		},
		error: function(xhr){
			alert(xhr.responseText);
		}
	})
}