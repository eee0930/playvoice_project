
/**
 * common/comment.html 내의 요소들에 대한 이벤트 처리 함수들.
 * comment.html는 댓글을 조회할 때에만 끼워져 들어가는 페이지이므로
 * comment.html 안에 이 함수를 넣게 되면 댓글이 들어가는 부분마다 스크립트가 중복되어 생성될 수밖에 없다.
 */
$(document).ready(function() {
	//[댓글 더보기 버튼 클릭]----------------------------------------------------------
	$(document).on("click", ".more_replies_btn", function(e){
		var appContentId = $(this).closest("#commentDiv").find(".appContentId").val();
		var appDomain = $(this).closest("#commentDiv").find(".appDomain").val();
		var replyType = $(this).closest(".commentList").find(".replyType").val();
		var pageNum = parseInt($(this).val());		//다음 페이지 번호 
		// 다음 페이지 댓글 목록 로드
		var nextCommentListDiv = create("div");
		$(this).closest(".commentPage").last().append(nextCommentListDiv);
		$(this).parent().siblings(".loadingMoreReplies").show();
		$(this).parent().hide();	//현재 페이지(ex. 1페이지의 list_replies.html)안의 댓글 더보기 버튼 없애기
		//-----------------------------------------------------------------------
		loadNextReplies(nextCommentListDiv, appContentId, replyType, pageNum, appDomain);
		//-----------------------------------------------------------------------
		//각 페이지의 list_replies마다 각각의 더보기 버튼이 보이도록함.
	});
	
	// [댓글 텍스트폼 엔터처리]--------------------------------------------------------
	$(document).on("change keyup keydown", ".controlComment", function(){
		if($(this).val().length > 0){
			$(this).closest(".comment-form").find(".releaseBtn").prop("disabled", false); 
			$(this).height(0).height($(this).prop('scrollHeight')-6);
		} else {
			$(this).closest(".comment-form").find(".releaseBtn").prop("disabled", true);
			$(this).css("height", "36px");
		}
	});
	
	// [댓글 입력란 선택 시 댓글 버튼 활성화]---------------------------------------------------------
	$(document).on("click", ".comment-textarea", function(){
		$(this).closest(".comment-form").find(".comment_button_section").show();
	});
	
	// [댓글 취소, 등록버튼 비활성화]----------------------------------------------------
	$(document).on("click", ".cancelCommentBtn", function(){
		$(this).closest(".comment-form").find(".comment-textarea").css("height", "36px");
		$(this).closest(".comment_button_section").hide();
		$(this).siblings(".addCommentBtn").prop("disabled", true);
	});
	
	// [대댓글 취소]----------------------------------------------------------------
	$(document).on("click", ".cancelCommentBtn2", function(){
		$(this).closest(".re-form").hide();
		$(this).closest(".comment-form").find(".re-comment-copy").remove();
	});
	
	// [댓글 등록 버튼 클릭]-----------------------------------------------------------
	$(document).on("click", ".addCommentBtn", function(e){
		e.preventDefault();
		var $commentDiv = $(this).closest("#commentDiv");
		
		var replyResource = {
			appResourceId: $commentDiv.find('.parentContentId').val(),
			appContentId : $commentDiv.find(".appContentId").val(),
			comment : $(this).closest(".comment-form").find(".comment-textarea").val(), 
			personaconId : $commentDiv.find(".yourId").val(),  
			personaconAlias : $commentDiv.find(".yourAlias").val(),
			replyType : $commentDiv.find(".replyType").val(), 
			recipient : $commentDiv.find(".appContentWriter").val().trim()
		};
		
		//comment.html안에 있는 .commentPage아래에 list_replies가 끼워지도록 함
		var selector = $commentDiv.find(".commentPage");
		var appDomain = $commentDiv.find(".appDomain").val();
		//--------------------------
		if(! isEmpty(replyResource.comment)){
			//--------------------------------------------
			addComment(selector, replyResource, appDomain);
			//--------------------------------------------
			$(this).siblings(".cancelCommentBtn").click();
		}else{
			alert("내용을 입력해 주세요.");
		}
	});
	
	// [대댓글 등록 버튼 클릭]---------------------------------------------------------
	$(document).on("click", ".addCommentBtn2", function(e){
		e.preventDefault();
		var $commentDiv = $(this).closest("#commentDiv");
		var $parent = $(this).closest(".comment-cover");
		var replyType = $commentDiv.find(".replyType").val();
		
		var replyResource = {
			appResourceId: $commentDiv.find('.parentContentId').val(),
			appContentId : $commentDiv.find(".appContentId").val(),
			parentId : $parent.find(".parentId").val(), // 부모댓글id
			recipient : $parent.find(".alias:eq(0)").text().trim(), // 부모댓글 작성자 별명
			comment : $(this).closest(".comment-form").find(".recomment-textarea").val(), 
			personaconId : $commentDiv.find(".yourId").val(),
			personaconAlias : $commentDiv.find(".yourAlias").val(),
			replyType : replyType != undefined && 
						replyType.toLowerCase() == 'q'? 'q':'c'
		};
		//selector를 찾아 넣어주도록함.

		var selector = '#children' + replyResource.parentId;
		var appDomain = $commentDiv.find(".appDomain").val();
		//--------------------------
		if(! isEmpty(replyResource.comment)){//댓글 입력내용이 있는지 확인후 댓글 추가
			//--------------------------------------------
			addComment(selector, replyResource, appDomain);
			//--------------------------------------------
			$(this).siblings(".cancelCommentBtn2").click();
		}else{
			alert("내용을 입력해 주세요.");
		}
	});
	
	//[댓글 좋아요 처리]--------------------------------------------------------------
	$(document).on("click",'.comment-button .like-comment', function(e) {
		e.preventDefault();
		e.stopPropagation();
		
  	   if($("#loginStatus").text() != 'true'){
	      if(confirm("로그인 페이지로 이동합니다.")){
	         self.location = "/auth/login?destPage=" + location.href;
	      }
	      return;
	   }
		
		if($(this).is(":not(.active)")){
			var $commentDiv = $(this).closest("#commentDiv");
			var appDomain = $commentDiv.find(".appDomain").val();
			var rid = $(this).attr("data-rid");//${reply.rid}
			var mid = $commentDiv.find(".yourId").val();
			var obj = {
				contentId : rid,
				memberId : mid,
				recommend: true
			}
			//--------------------------------
			handleCommentLike(obj, $(this), appDomain);
			//--------------------------------
		}else{
			alert("이미 처리 되었습니다.");
			return;
		}
	});
	
	//[댓글 싫어요 처리]-------------------------------------------------------------
	$(document).on("click",'.comment-button .dislike-comment', function(e) {
		e.preventDefault();
		e.stopPropagation();
		
 	   if($("#loginStatus").text() != 'true'){
	      if(confirm("로그인 페이지로 이동합니다.")){
	         self.location = "/auth/login?destPage=" + location.href;
	      }
	      return;
	   }
 	   
		if($(this).is(":not(.active)")){
			var $commentDiv = $(this).closest("#commentDiv");
			var appDomain = $commentDiv.find(".appDomain").val();
			var rid = $(this).attr("data-rid");//${reply.rid}
			var mid = $commentDiv.find(".yourId").val();
			
			var obj = {
				contentId : rid,
				memberId : mid,
				recommend : false
			}
			//--------------------------------
			handleCommentDislike(obj, $(this), appDomain);
			//--------------------------------
		}else{
			alert("이미 처리 되었습니다.");
			return;
		}
	});
	
	//[댓글 삭제]------------------------------------------------------------------
	$(document).on("click", '.delete-reply', function(e){
		e.preventDefault();
		e.stopPropagation();
		
		var appDomain = $(this).closest("#commentDiv").find(".appDomain").val();
		var rid = $(this).attr('value');
		
		//--------------------------------
		handleCommentDelete(rid, appDomain);
		//--------------------------------
	});
	
	// [댓글 우선순위 변경]-----------------------------------------------------------
	$(document).on("click", '.edit-priority', function(e){
		e.preventDefault();
		e.stopPropagation();
		
		$(this).siblings().show();
	}); 
	$(document).on("click", '.edit-priority-btn', function(e){
		e.preventDefault();
		e.stopPropagation();
		
		var appDomain = $(this).closest("#commentDiv").find(".appDomain").val();
		var priorityValue = $(this).siblings('.priority-value').val();	
		var rid = $(this).siblings('.edit-priority').attr('value');
		var parentId = $(this).val();
		
		//--------------------------------
		handleCommentPriority(rid, priorityValue, parentId, appDomain);
		//--------------------------------
		
	});
	
}); /* end of ready */
/*------------------------------------------------------------------------------
 * 							ajax handler
 -----------------------------------------------------------------------------*/



/**
 * 댓글 및 대댓글을 등록한다.
 * 
 * 댓글 정보는 각 앱마다 페이지에서 $(document).on("click", ".addCommentBtn" 연결된다.
 * 	ex) PlayvoiceBook - play_playvoicebook.html
 * 		Digest 		  - list_digest.html
 * 대댓글 정보는 각 앱마다 페이지에서 $(document).on("click", ".addCommentBtn2" 로부터 구한다.
 * 
 * @param selector 끼워넣고자 하는 위치. .commentPage아래
 * @param replyResource
 * @param appDomain 각 앱의 이름(ex. playvoiceBook, digest ..)
 * @returns
 */
function addComment(selector, replyResource, appDomain){
	replyResource.appContentUri = location.href.split(location.hostname)[1];
	
	var appContentId;
	if(replyResource.appResourceId != null && replyResource.appResourceId != ""){
		appContentId = replyResource.appResourceId;
		//replyResource.appResourceId = atob(replyResource.appResourceId);
	}else{
		appContentId = replyResource.appContentId;
		replyResource.appResourceId = 0;
	}
	$.ajax({
		type:'post',
		url: '/reply/'+ appDomain +'/add/' + appContentId,
		data:JSON.stringify(replyResource), 
		dataType:'json',
		contentType: "application/json",
		success:function(result){
			//---------------------------------------------------
			sucessAddComment(selector, replyResource, appDomain);
			//---------------------------------------------------
		},
		error: function(e){
			alert("댓글 등록 중 오류가 발생하였습니다.");
			return;
		}
	});
}

/**
 * 댓글/대댓글 등록 성공 후 화면처리
 * (댓글/대댓글 목록 reload, 코멘트 입력부분 초기화, 대댓글 입력 폼 지우기, 등록확인 모달창 띄우기)
 * 
 * addComment()의 댓글 등록 성공 후 호출
 * 
 * @param selector
 * @param replyResource
 * @param appDomain
 * @returns
 */
function sucessAddComment(selector, replyResource, appDomain){
	var url = "/reply/"+appDomain+"/list/" + replyResource.appContentId;
	
	// 모든 앱에 공통으로 들어가야할 부분.
	// 부모댓글인지 대댓들인지 파악하여 각각의 url과 입력칸 초기화 분기
	if (replyResource.parentId == null) {
		//코멘트 입력부분 초기화
		$('.comment-textarea').val('');
	}else{
		//ex) /reply/digest/list/{articleId}/{replyResource.parentId}
		url += "/"+replyResource.parentId;
		// 다른 대댓글 폼 지우기
		$(".re-form").html("");
		$(".re-form").hide();
	}
	// 대댓글을 입력한 경우가 아니면 입력한 댓글과 동일 타입의 댓글을 불러온다.
	if (replyResource.parentId == null) {
		url += "?replyType=" + replyResource.replyType;
	}
	/* 댓글 수 갱신하기
	 * (페이지마다 댓글 수를 표시하는 위치가 다르기 때문에 
	 * updateReplyCount 함수는 
	 * /js/app/comment.js를 코드로 포함하거나 reloadAll을 호출하는 페이지에 있음)
	 */
	if(typeof updateReplyCount == "function"){
		//----------------------------
		updateReplyCount(selector, 1);
		//----------------------------
	}
	//----------------------------
	reloadAll(url, selector, true);
	//----------------------------
}

/**
 * [대댓글 불러오기]
 * 
 */
 function displayChild(parentId){
 	var appDomain = $("#comment_"+parentId).closest("#commentDiv").find(".appDomain").val();
 	var appContentId = $("#comment_"+parentId).closest("#commentDiv").find(".appContentId").val();
 	var url = "/reply/" + appDomain + "/list/" + appContentId + "/" + parentId;
 	//---------------------------------
 	reloadChildrenReply(parentId, url);
 	//---------------------------------
 }

/**
 * 다음 페이지의 댓글 목록 조회
 * 
 * 각 앱마다의 페이지에서 $(document).on("click", ".more_replies_btn", function(e) 로 호출
 * 	ex) PlayvoiceBook - play_playvoicebook.html
 * 		Digest 		  - list_digest.html
 * 
 */
function loadNextReplies(selector, appContentId, replyType, pageNum, appDomain){
	var next = "/reply/"+appDomain+"/list/" + appContentId 
	+ "?replyType=" + replyType+"&pageNum=" + pageNum;
	//---------------------
	reload(next, selector);  
	//---------------------
} 

/**
 * 페이지를 load할때 스크립트를 제외하고 .commentList부분만 다시 load함
 * 다음 페이지의 댓글 목록 조회하는 comment.js의 loadNextReplies()에서 호출
 * 
 * @param url
 * @param selector
 * @returns
 */
function reload(url, selector){
	$(selector).load(url+' .commentList', function(){
		$(".loadingMoreReplies:visible").hide();
		if($(selector).find('.replyType').val() == 'p' 
			&& (typeof changeNoneEngComment == "function")){
			//----------------------------
			changeNoneEngComment($(this));
			//----------------------------
		}
	}); //.앞에 공백추가
}

/**
 * 스크립트까지 포함해 페이지의 전체를 load하는 경우 호출.
 * 댓글 입력 후 불려지는 경우(popModal=true) 모달창을 띄우는 함수 호출.
 * 
 * @param url
 * @param selector
 * @returns
 */
function reloadAll(url, selector, popModal){
	$.ajax({
		type: 'get',
		url: url,
		success: function(listRepliesPage){
			
			//--------------------------------------
			displayReplies(listRepliesPage, selector);
			//--------------------------------------
			if(popModal){
				//-------------------------
				successReplyModal(selector);
				//-------------------------
			}
		},
		error: function(xhr){
			alert("댓글 불러오기에 실패했습니다." + xhr.responseText);
		}
	});
}

/**
 * 대댓글(자식댓글) 목록을 가져옴
 * 
 */
function reloadChildrenReply(parentId, url) {
	
 	$("#loading_" + parentId).show();
 	
 	//대댓글 부르기 버튼
 	$("#display_" + parentId).hide();
 	$("#disappear_" + parentId).show();
 	
	$('#children'+parentId).load(url, function(){
		//대댓글 보이기
		$("#children"+parentId).show();
		$("#loading_" + parentId).hide();
	});
}

/**
 * 댓글 및 대댓글에 대한 '좋아요'처리
 * 
 */
function handleCommentLike(likeInfo, thisObj, appDomain){
	$.ajax({
		type:'post',
		url: '/reply/'+appDomain+'/like/'+ likeInfo.contentId,	//reply.rid
		data:JSON.stringify(likeInfo), 
		dataType:'json',
		contentType: "application/json",
		success: function(result){
			var count = result;
			if(count == -1){
				alert("이미 처리 되었습니다.");
				return;
			}
			//해당 '좋아요'의 좋아요수, 아이콘표시 갱신
			//------------------------
			sucessLike(thisObj, count);
			//------------------------
		},
		error: function(xhr){
			alert("댓글 불러오기에 실패했습니다." + xhr.responseText);
		}
	});
}

/**
 * 댓글 및 대댓글에 대한 '싫어요'처리
 * 
 */
function handleCommentDislike(dislikeInfo, thisObj, appDomain){
	$.ajax({
		type:'post',
		url: '/reply/'+appDomain+'/dislike/'+ dislikeInfo.contentId,	//reply.rid
		data:JSON.stringify(dislikeInfo), 
		dataType:'json',
		contentType: "application/json",
		success: function(result){
			var count = result;
			if(count == -1){
				alert("이미 처리 되었습니다.");
				return;
			}
			//해당 '싫어요'의 싫어요수, 아이콘표시 갱신
			//---------------------------
			sucessDislike(thisObj, count);
			//---------------------------
		},
		error: function(xhr){
			alert("처리중 에러가 발생하였습니다.\n" + xhr.responseText);
		}
	});
}

/**
 * 댓글 및 대댓글에 대한 '우선 순위'처리
 * 
 * list_replies.html의 '.edit-priority-btn'버튼과 연결
 */
function handleCommentPriority(rid, priorityValue, parentId, appDomain){
	$.ajax({
		type:'post',
		url: '/reply/'+appDomain+'/priority/'+ rid,	//reply.rid
		data: priorityValue, 
		dataType:'json',
		contentType: "application/json",
		success: function(result){
			if(appDomain == 'playvoiceBook'){
				sucessPlayvoiceBookPriority(result, parentId);
			}
		},
		error: function(xhr){
			alert("처리중 에러가 발생하였습니다.\n" + xhr.responseText);
		}
	});
}

/**
 * 댓글 및 대댓글에 대한 '삭제'처리
 * 
 */
function handleCommentDelete(rid, appDomain){
	$.ajax({
		type:'post',
		url: '/reply/'+appDomain+'/del/'+ rid,	//reply.rid
		
		success: function(result){
			alert("댓글이 삭제되었습니다.");
			$('#comment_' + rid).hide();
			$('#displayBtn_' + rid).hide();
			$('.child_' + rid).hide();
		},
		error: function(xhr){
			alert("처리중 에러가 발생하였습니다.\n" + xhr.responseText);
		}
	});
}
/*------------------------------------------------------------------------------
 * 							view process handler
 -----------------------------------------------------------------------------*/

/**
 * 댓글 표시하기
 * 가져온 댓글 내용을 표시하고 댓글의 replyType(p냐 아니냐)에 따라 댓글 탭을 선택(댓글 탭이 2개로 분리될 경우)
 * ※ 댓글탭은 꼭 클래스명이 patternCommentDiv 혹은 qnaCommentDiv이어야 한다.
 * div 클래스명 구조:
 * 		└ .nav.nav-tabs (댓글 탭메뉴)
 * 			└ .nav-item
 * 				└ <a></a>
 * 		└ .tab-content (댓글 탭내용)
 * 			└ .patternCommentDiv.tab-pane
 * 			└ .qnaCommentDiv.tab-pane
 */
function displayReplies(listRepliesPage, selector){
		// 댓글이 [패턴댓글,QnA댓글] 탭으로 나뉜 경우
	if($(selector).is(":not([id^='children'])") && 
			$(selector).closest(".patternCommentDiv,.qnaCommentDiv").length > 0){
		
		var $replyTab = $(selector).closest(".patternCommentDiv,.qnaCommentDiv");
		var $navTabs = $replyTab.closest(".tab-content").siblings(".nav-tabs");
		var listedReplyType = $(listRepliesPage).find('.replyType').val();
		listedReplyType = listedReplyType != undefined? listedReplyType.toLowerCase():null;
		var requestedReplyType = null;
		var $patternTab; 
		var $qnaTab;
		var navOrder;
		
		// 댓글이 뿌려지도록 열려 있는 댓글 div에 따라 댓글 탭 선택
		if($replyTab.is(".patternCommentDiv")){
			requestedReplyType = 'p';
			$patternTab = $replyTab;
			$qnaTab = $replyTab.siblings(".qnaCommentDiv");
		}else{
			$patternTab = $replyTab.siblings(".patternCommentDiv");
			$qnaTab = $replyTab;
		}
		
		// 실제 조회한 댓글의 댓글 타입(p냐 아니냐)에 따른 댓글 탭 아이콘 선택
		if(listedReplyType == 'p'){
			$patternTab.find(".commentPage").html(listRepliesPage);
			
			// 패턴댓글에 특별한 처리가 필요한 경우 이 페이지를 포함하는 곳에서 함수 정의(예: play_playvoice_book.html)
			if(typeof changeNoneEngComment == "function"){
				//-------------------------------
				changeNoneEngComment($patternTab);
				//-------------------------------
			}
			$patternTab.addClass("show active replyLoaded");
			$qnaTab.removeClass("show active");
			navOrder = $patternTab.closest(".tab-content").find('.tab-pane').index($patternTab);
			
		}else{
			$qnaTab.find(".commentPage").html(listRepliesPage);
			
			$qnaTab.addClass("show active replyLoaded");
			$patternTab.removeClass("show active");
			navOrder = $qnaTab.closest(".tab-content").find('.tab-pane').index($qnaTab);
		}
		
		// 댓글 탭 선택
		$navTabs.find(".nav-item a").each(function(i, element) {
			if(i == navOrder){
				$(element).addClass("active");
			}else{
				$(element).removeClass("active");
			}
		});
	
	}else{ // 댓글이 단일 탭인 경우 바로 댓글 표시
		$(selector).html(listRepliesPage);
	}
}

/**
 * 댓글 입력에 필요한 값들을 commentDiv의 #replyForm에 할당 
 * params={
 * 		appContentWriter -- 원글 작성자
 * 		appDomain		 -- 댓글이 작성되는 앱
 * 		appContentId	 -- 원글 아이디
 * }
 * commentDiv 값을 할당할 #replyForm이 포함된 div
 */
function fillRequiredInfo(params, $commentDiv) {
	$commentDiv.find(".appContentWriter").val(params.appContentWriter);
	$commentDiv.find(".appDomain").val(params.appDomain);
	$commentDiv.find(".appContentId").val(params.appContentId);
}

/**
 * 대댓글 입력 폼 생성
 * parentId: 부모댓글id
 * obj: 대댓글이 달릴 댓글 요소
 */
function displayReplyForm(parentId, obj) {
	var $pasteArea = $(obj).closest(".comment-cover").find(".re-form");
	var alias = $(obj).closest(".comment-cover").find(".alias").text(); // 별명
	$(".re-form").html(""); // 다른 대댓글 폼 지우기
	$(".re-form").hide();
	var $input = $("#re_comment_copy").clone();
	$input.appendTo($pasteArea); //end copy
	
	$input.find(".hidden_parentId").attr("id", "parentId");
	$input.find(".hidden_parentId").val(parentId); 
	$input.find(".recomment-textarea").attr("id", "comment2");
	
	$pasteArea.show();
	$input.show();
	$input.find(".recomment-textarea").focus();
	$input.find(".re-alias").text(alias); // 답글을 받는 사람 별명 보여주기
}

/**
 * 댓글 입력,수정,삭제 처리 완료 모달 표시
 */
function successReplyModal(selector) {
	$(selector).closest("#commentDiv").parent()
			   .find("#successAddComment_modal")
			   .modal("show");
}

/**
 * [대댓글 숨기기]
 * 
 * list_replies.html의 Hide replies에 버튼으로 th:onclick="'disappearChild(로 호출함.
 * 
 */
function disappearChild(parentId){
 	//대댓글 폼 지우기
 	$("#children"+parentId).find(".re-form").html(""); 
 	$("#children"+parentId).find(".re-form").hide();
 	
 	$("#children"+parentId).hide();
 	//대댓글 부르기 버튼
 	$("#display_" + parentId).show();
 	$("#disappear_" + parentId).hide();	
}

/**
 * 좋아요를 누른 다음 화면 처리
 */
function sucessLike(thisObj, count){
	//'좋아요' 갱신
	thisObj.children('span').text(count);	//좋아요 수 갱신
	thisObj.children('i').addClass("active");//좋아요 아이콘 활성화
}

/**
 * 싫어요를 누른 다음 화면 처리 메소드
 */
function sucessDislike(thisObj, count){
	//'싫어요' 갱신
	thisObj.children('span').text(count);	//싫어요 수 갱신
	thisObj.children('i').addClass("active");//싫어요 아이콘 활성화
}
