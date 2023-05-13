/*------------------------------------------------------------------------------
 * 							list_babel_kor.html
 * 							list_babel_eng.html
 -----------------------------------------------------------------------------*/

/**
 * 입력받은 단어로 제시어 가져오기
 */
function getSuggestionList(keyword, element, stackType) {
	$.ajax({
		type:'GET',
		url: '/square/babel/suggest/' + stackType + '/' + keyword,
		success: function(sentenceList){
			if(sentenceList != null && sentenceList.length > 0){
				//----------------------------------------------
				displayGetSuggestionList(sentenceList, element, stackType);
				//----------------------------------------------
			}
		},
		error: function(xhr){
			
		}
	});
};

/** 
 * 검색폼을 통한 예문 검색.
 * 검색어 타입, 검색어, 페이지를 입력하여 예문을 검색.
*/
function searchSentence(searchType, keyword, page){
	$("#searchKeyword").val(keyword);
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchType').val();
	}
	var params = {
			searchType : sType,
			keyword : keyword.trim(),
			page : page,
			size : 10
		};
	if(sType == 'writer'){
		params.stackType = $("#searchStackType").val();
	}
	
	$.ajax({
		type: "GET",
		url : '/square/babel/search',
		data : params,
		success : function(makers){
			$("#defaultStackList, #defaultStackPagination").hide();
			//------------------------------------------------------------------
			var result = makers[0];
			var page = result.result;
			displaySentenceList(page.content, result.currentPageNum, page.totalElements, 0);
			displayPageNavigationForSearch(result, sType, 0);
			result = makers[1];
			if(typeof result != "undefined"){
				page = result.result;
				displaySentenceList(page.content, result.currentPageNum, page.totalElements, 1);
				displayPageNavigationForSearch(result, sType, 1);
			}
			//------------------------------------------------------------------
			$(".result-search-section").show();
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

        }
	});
};

function searchPartialSentence(searchType, keyword, page, order) {
	$("#searchKeyword").val(keyword);
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchType').val();
	}
	var url = '/square/babel/search/';
	if(order == 0){
		url += 'jungle';
	}else{
		url += 'play';
	}
	var params = {
			searchType : sType,
			keyword : keyword.trim(),
			page : page,
			size : 10
		};
	if(sType == 'writer'){
		params.stackType = $("#searchStackType").val();
	}
	$.ajax({
		type: "GET",
		url : url,
		data : params,
		success : function(maker){
			var page = maker.result;
			displaySentenceList(page.content, maker.currentPageNum, page.totalElements, order);
			displayPageNavigationForSearch(maker, sType, order);

			$(".result-search-section").show();
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

        }
	});	
}

/**
 * 검색된 예문들을 목록에 표시
 * order: 두 개의 페이지 중 첫 번째 것인지(0), 두 번째 것인지(1)
 */
function displaySentenceList(jungleSentenceList, currentPageNum, total, order){
	
	$('.result-search-section .trans-list-page:eq(' + order + ')').siblings('.trans-list').remove();
	
	var num=1;	
	var fetchSize = 10;
	
	$.each(jungleSentenceList, function(index, jungleSentence){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		
		var row;
		// 정글센텐스
		if(order == 0){
			// 아이콘 표시
			row = $("#divForCopy .unregisteredSentence").clone();
			row.find(".jid56").val(jungleSentence.id56)
			row.find(".jid").val(jungleSentence.jid)
			if(jungleSentence.personacon.iconPath != null && jungleSentence.personacon.iconPath != ""){
				row.find(".personacon-profile")
				   .css("background","url('/resource/profile/" + jungleSentence.personacon.iconPath +"') no-repeat")
				   .css("background-position","center")
				   .css("background-size","cover");
			}else{
				row.find(".personacon-profile").addClass("profile-default");
			}
			row.find(".personacon-frame").addClass("frame-" + jungleSentence.personacon.memberType);
			row.find(".alias:lt(2)").text(jungleSentence.personacon.alias);
			// 날짜
			var date = new Date(jungleSentence.regDate);
			var dateString = date.getFullYear() 
					 + "-" + parseInt(date.getMonth() + 1).zf(2)
					 + "-" + date.getDate().zf(2);
			row.find(".date").text(dateString);
			// 코멘트는 기본으로
		// 센텐스북
		}else{
			row = $("#divForCopy .registeredSentence").clone();
			// 한글
			row.find(".kor").text(jungleSentence.kor);
			row.find(".toggleTransCover").removeClass("toggleTransCover");
			row.find(".jid").remove();
		}
		
		// 질문
		row.find("[class$='-sent'] :not(i)").empty();
		var sentence = row.find("[class$='-sent']");
		if(sentence.is("[class^='eng']")){
			sentence.find(".fa-quote-left").after(" " + jungleSentence.eng);
		}else{
			sentence.find(".fa-quote-left").after(" " + jungleSentence.kor);
		}
		
		
		$('.result-search-section .trans-list-page:eq(' + order + ')').before(row);
	});
}

/**
 * 검색된 예문의 페이지 네비게이션을 표시.
 * order: 두 개의 페이지 중 첫 번째 것인지(0), 두 번째 것인지(1)
 */
function displayPageNavigationForSearch(pageMaker, sType, order){
	
	var prevPage = pageMaker.prevPage;
	var nextPage = pageMaker.nextPage;
	var currentPage = pageMaker.currentPage;
	var pageList = pageMaker.pageList;
	var currentPageNum = parseInt(pageMaker.currentPageNum);
	
	var ul = $('.result-search-section .trans-list-page:eq(' + order + ') ul');
	ul.empty();
	
	if(prevPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' )
						.html('PREV'+parseInt(prevPage.pageNumber+1));
		link.attr('onclick','searchPartialSentence("'
								+ sType+ '","'+ $("#searchKeyword").val() 
								+ '",' +parseInt(prevPage.pageNumber+1) 
								+ ',' + order +')');
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
		link.attr('onclick','searchPartialSentence("'+sType+ '","'+ $("#searchKeyword").val() + '",' +parseInt(page.pageNumber+1)+ ',' + order +')');
		link.html(parseInt(page.pageNumber + 1));
		
		li.append(link);
		li.appendTo(ul);
	});
	
	if(nextPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchPartialSentence("'+sType+ '","'+ $("#searchKeyword").val() + '",' +parseInt(nextPage.pageNumber+1)+ ',' + order +')');
		
		link.appendTo(li);
		li.appendTo(ul);
	}
}
/**
 * 기능: 해당 예문의 댓글 수와 번역 답글 리스트를 조회.
 * 		댓글 수: .replyCount
 * 		답글 리스트: .answerList
 */
function getAnswerList(target, bOrJ, id, element) {
	var url = '/square/babel/answer/';
	if(bOrJ == 'babel'){
		url +=  id;
	}else{
		url += 'search/' + id + '?target=' + target;
	}
	$.ajax({
		type:'GET',
		url: url,
		success: function(answerModel){
			// 댓글수 표시
			element.find(".openCommentList span").text(answerModel.replyCount);
			var answerList = answerModel.answerList;
			if(answerList != null && answerList.length > 0){
				//----------------------------------------------
				displayGetAnswerList(answerList, element);
				//----------------------------------------------
			}
		},
		error: function(xhr){
			
		}
	});
}

/**
 * 기능: 번역 댓글을 등록.
 */
function addStackAnswer(jqForm, parentDiv) {
	$(jqForm).find(":input").each(function(index, element) {
		element.value = element.value.trim();
	});
	$.ajax({
		type: 'POST',
		url: $(jqForm)[0].action,
		data: $(jqForm).serialize(),
		success: function(answerList){
			$(jqForm).find(".cancelMemberTransBtn").click();
			$('#modalMsg').text('번역 답변이 등록되었습니다.');
			$("#successAdd_modal").modal({
				show: true
			});
			//----------------------------------------------
			displayGetAnswerList(answerList, $(jqForm).closest(".member-trans-cover"));
			//----------------------------------------------
		},
		error: function(xhr){
			
		}
	});
};

/**
 * 기능: 번역 댓글을 수정.
 */
function editStackAnswer(jqForm, selfDiv) {
	$(jqForm).find(":input").each(function(index, element) {
		element.value = element.value.trim();
	});
	$.ajax({
		type: 'POST',
		url: $(jqForm)[0].action,
		data: $(jqForm).serialize(),
		success: function(answerList){
			$('#modalMsg').text('번역 답변이 수정되었습니다.');
			$("#successAdd_modal").modal({
				show: true
			});
			//----------------------------------------------
			displayGetAnswerList(answerList, $(jqForm).closest(".member-trans-cover"));
			//----------------------------------------------
		},
		error: function(xhr){
			
		}
	});
};

/**
 * 답글에 대한 좋아요 처리
 */
function handleAnswerLike(obj, thisObj){
	$.ajax({
		type:'post',
		url: '/square/babel/answer/like/'+ obj.contentId,	//reply.rid
		data:JSON.stringify(obj), 
		dataType:'json',
		contentType: "application/json;charset=UTF-8",
		success: function(result){
			var count = result;
			if(count == -1){
				alert("이미 처리 되었습니다.");
				thisObj.find('i').css("opacity","1");
				return;
			}
			//'좋아요' 갱신
			thisObj.find('.num').text(count);
			thisObj.find('i').css("opacity","1");
		},
		error: function(e){
			alert("처리중 에러가 발생하였습니다.\n"+JSON.stringify(e));
			return;
		}
	});
}

/**
 * 기능: 질문에 대한 팔로업 처리
 */
function followStack(obj, thisObj){
	$.ajax({
		type:'post',
		url: '/square/babel/answer/suspend/'+ obj.contentId,
		data:JSON.stringify(obj), 
		dataType:'json',
		contentType: "application/json;charset=UTF-8",
		success: function(result){
			var count = result;
			if(count == -1){
				alert("이미 처리 되었습니다.");
				$(thisObj).addClass("active");
				return;
			}
			// 갱신
			$(thisObj).addClass("active");
			thisObj.find('span.difficultyNum').text(count);
			alert('팔로업 목록에 추가되었습니다.');
		},
		error: function(e){
			alert("처리중 에러가 발생하였습니다.\n"+e.responseText);
			return;
		}
	});
}

/* -----------------------------------------------------------------------------
 * 							list_digests.html
   ---------------------------------------------------------------------------*/

/**
 * 다이제스트 아티클 리스트 불러오기
 */
function getDigestArticleList(digestId56, $resultTarget) {	
	var next = '/square/digest/view/' + digestId56;
	$resultTarget.load(next + ' .viewDigest>*', function(response,status,xhr){
		if(xhr.status == 200){
			//----------------------------------------------------
			successGetDigestArticleList($resultTarget);
			//----------------------------------------------------
		} else if(xhr.status == 406){
			location.href = '/pointBook/policy/playpoint';
		}
	});
};

/**
 * 입력받은 단어로 다이제스트 제시어 가져오기
 */
function getDigestTitleSuggestionList(searchType, keyword, element) {
	$.ajax({
		type:'GET',
		url: '/square/digest/suggest/' + keyword + '?searchType=' + searchType,
		success: function(titleList){
			if(titleList != null && titleList.length > 0){
				//----------------------------------------------
				displayGetSuggestionList(titleList, element);
				//----------------------------------------------
			}
		},
		error: function(xhr){
			
		}
	});
};

/** 
 * 검색폼을 통한 주제 검색.
 * 검색어 타입, 검색어, 페이지를 입력하여 주제를 검색.
*/
function searchDigest(searchType, keyword, page){
	$("#searchKeyword").val(keyword);
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchType').val();
	}
	
	$.ajax({
		type: "GET",
		url : '/square/digest/search',
		data : {
			searchType : sType,
			keyword : keyword.trim(),
			page : page,
			size : 10
		},
		success : function(maker){
			// 기본 다이제스트 목록 숨기기
			$("#defaultDigestList,#defaultDigestPagination").hide();
			//------------------------------------------------------------------
			result = maker;
			page = result.result;
			displayDigestList(page.content, result.currentPageNum, page.totalElements);
			displayDigestPageNavigationForSearch(result, sType);
			//------------------------------------------------------------------
			$(".result-search-section").show();
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

        }
	});
};

/**
 * 검색된 주제들을 화면에 표시
 */
function displayDigestList(digestList, currentPageNum, total){
	
	$('.result-search-section .trans-list-page').siblings('.trans-list').remove();
	
	var num=1;	
	var fetchSize = 10;
	
	$.each(digestList, function(index, digest){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		
		var row = $("#divsForCopy .trans-list").clone();
		row.find(".digestId").val(digest.did)
		row.find(".digestId56").val(digest.id56)
		row.find(".title-sent span").text(digest.title);
		row.find(".titleInput").val(digest.title);
		row.find(".view span").text(digest.hits);
		var date = new Date(digest.regDate);
		var dateString = date.getFullYear() 
						+ "-" + parseInt(date.getMonth() + 1).zf(2)
						+ "-" + date.getDate().zf(2);
		row.find(".date").text(dateString);
		if(digest.articleCount > 3){
			row.find(".personal-other").text("+ " + (digest.articleCount - 3));
		}else{
			row.find(".personal-other").parent().remove();
		}
		row.find(".content-writers span").text(digest.articleCount);
		
		// 다이제스트 소유자도 아니면서 관리자도 아니면 타이틀 수정 불가
		var memberId = row.find("li.editTitle").attr("viewer");
		if((digest.personaconList.length > 1 || digest.personaconList[0].pid != memberId)
			&& row.find("li.editTitle").attr('data-admin') == 'false'){
			row.find("li.editTitle").remove();
		}else{
			row.find("li.editTitle").removeAttr('data-admin');
		}
		digest.personaconList.forEach(function(personacon,index){
			if(index < 3){
				var slice = $("#divsForCopy").children(".personal-cover").clone();
				if(personacon.iconPath != null && personacon.iconPath != ""){
					slice.find("img")
					.css("background","url('/resource/profile/" + personacon.iconPath +"') no-repeat")
					.css("background-position","center")
					.css("background-size","cover");
				}
				row.find(".contentWritersProf").before(slice);
			}
		});
		
		$('.result-search-section .trans-list-page').before(row);
	});
}

/**
 * 검색된 주제의 페이징 표시
 */
function displayDigestPageNavigationForSearch(pageMaker, sType){
	
	var prevPage = pageMaker.prevPage;
	var nextPage = pageMaker.nextPage;
	var currentPage = pageMaker.currentPage;
	var pageList = pageMaker.pageList;
	var currentPageNum = parseInt(pageMaker.currentPageNum);
	
	var ul = $('.result-search-section .trans-list-page ul');
	ul.empty();
	
	if(prevPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' )
						.html('PREV'+parseInt(prevPage.pageNumber+1));
		link.attr('onclick','searchDigest("'
								+ sType+ '","'+ $("#searchKeyword").val() 
								+ '",' +parseInt(prevPage.pageNumber+1) 
								+ ')');
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
		link.attr('onclick','searchDigest("'+sType+ '","'+ $("#searchKeyword").val() + '",' +parseInt(page.pageNumber+1)+ ')');
		link.html(parseInt(page.pageNumber + 1));
		
		li.append(link);
		li.appendTo(ul);
	});
	
	if(nextPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchDigest("'+sType+ '","'+ $("#searchKeyword").val() + '",' +parseInt(nextPage.pageNumber+1)+ ')');
		
		link.appendTo(li);
		li.appendTo(ul);
	}
}

/**
 * 다이제스트 주제 수정
 */
function editDigestTitle(obj, titleSpan) {
	$.ajax({
		type: 'post',
		url: '/square/digest/title/edit',
		data: obj,
		success: function(result){
			//----------------------------------------
			successEditDigestTitle(obj.title, titleSpan);
			//----------------------------------------
			popupModal("주제가 변경되었습니다.");
		},
		error: function(xhr){
			alert(xhr.responseText);
			location.href = "/error";
		}
	});
}

/**
 * 다이제스트 아티클 추가
 */
function appendDigest(jqForm, resultTarget) {
	$.ajax({
		type: 'post',
		url: '/square/digest/append',
		data: $(jqForm).serialize(),
		success: function(articlePage){
			//---------------------------------------------
			successAppendDigest(resultTarget, articlePage);
			//---------------------------------------------
			
		},
		error: function(xhr){
			//-----------------------------------
			popupModal(xhr.responseJSON.message);
			//-----------------------------------
		}
	});
};

/**
 * 다이제스트 아티클 수정
 */
function editDigestArticle(jqForm, resultTarget) {
	$.ajax({
		type: 'post',
		url: '/square/digest/article/edit',
		data: $(jqForm).serialize(),
		success: function(articlePage){
			if(typeof successEditDigestArticle == 'function'){
				//--------------------------------------------------
				successEditDigestArticle(resultTarget, articlePage);
				//--------------------------------------------------
			}
		},
		error: function(xhr){
			//-----------------------------------
			popupModal(xhr.responseJSON.message);
			//-----------------------------------
		}
	});	
}

/**
 * 기능:다이제스트 아티클 좋아요 추가
 */
function handleDigestArticleLike(obj, thisObj) {
	$.ajax({
		type:'post',
		url: '/square/digest/like/'+ obj.contentId,
		data:JSON.stringify(obj), 
		dataType:'json',
		contentType: "application/json;charset=UTF-8",
		success: function(result){
			var count = result;
			if(count == -1){
				alert("이미 처리 되었습니다.");
				thisObj.addClass("active");
				return;
			}
			//'좋아요' 갱신
			thisObj.closest('.articleView').find(".articleLikeCount").text(count);
			thisObj.addClass("active");
		},
		error: function(xhr){
			//-----------------------------------
			popupModal(xhr.responseJSON.message);
			//-----------------------------------
		}
	});
}


/* -----------------------------------------------------------------------------
 * 							list_grammars.html
   ---------------------------------------------------------------------------*/

/**
 * 그래머 아티클 리스트 불러오기
 */
function getGrammarArticleList(grammarId56, $resultTarget) {	
	var next = '/square/grammarBook/view/' + grammarId56;
	$resultTarget.load(next + ' .viewGrammar>*', function(response,status,xhr){
		if(xhr.status == 200){
			//-----------------------------------------
			successGetGrammarArticleList($resultTarget);
			//-----------------------------------------
		}else if(xhr.status == 406){
			location.href = '/pointBook/policy/playpoint';
		}
	});
};

/**
 * 입력받은 단어로 그래머 제시어 가져오기
 */
function getGrammarTitleSuggestionList(searchType, keyword, element) {
	$.ajax({
		type:'GET',
		url: '/square/grammarBook/suggest/' + keyword + '?searchType=' + searchType,
		success: function(titleList){
			if(titleList != null && titleList.length > 0){
				//----------------------------------------------
				displayGetSuggestionList(titleList, element);
				//----------------------------------------------
			}
		},
		error: function(xhr){
			
		}
	});
};

/** 
 * 검색폼을 통한 주제 검색.
 * 검색어 타입, 검색어, 페이지를 입력하여 주제를 검색.
*/
function searchGrammar(searchType, keyword, page){
	$("#searchKeyword").val(keyword);
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchType').val();
	}
	
	$.ajax({
		type: "GET",
		url : '/square/grammarBook/search',
		data : {
			searchType : sType,
			keyword : keyword.trim(),
			page : page,
			size : 10
		},
		success : function(maker){
			// 기본 그래머 목록 숨기기
			$("#defaultGrammarList,#defaultGrammarPagination").hide();
			//------------------------------------------------------------------
			result = maker;
			page = result.result;
			displayGrammarList(page.content, result.currentPageNum, page.totalElements);
			displayGrammarPageNavigationForSearch(result, sType);
			//------------------------------------------------------------------
			$(".result-search-section").show();
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

        }
	});
};

/**
 * 검색된 주제들을 화면에 표시
 */
function displayGrammarList(grammarList, currentPageNum, total){
	
	$('.result-search-section .trans-list-page').siblings('.trans-list').remove();
	
	var num=1;	
	var fetchSize = 10;
	
	$.each(grammarList, function(index, grammar){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		
		var row = $("#divsForCopy .trans-list").clone();
		row.find(".grammarId").val(grammar.gid)
		row.find(".grammarId56").val(grammar.id56)
		row.find(".title-sent span").text(grammar.title);
		row.find(".titleInput").val(grammar.title);
		row.find(".view span").text(grammar.hits);
		var date = new Date(grammar.regDate);
		var dateString = date.getFullYear() 
						+ "-" + parseInt(date.getMonth() + 1).zf(2)
						+ "-" + date.getDate().zf(2);
		row.find(".date").text(dateString);
		if(grammar.articleCount > 3){
			row.find(".personal-other").text("+ " + (grammar.articleCount - 3));
		}else{
			row.find(".personal-other").parent().remove();
		}
		row.find(".content-writers span").text(grammar.articleCount);
		var memberId = row.find("li.editTitle").attr("viewer");
		if((grammar.personaconList.length > 1 || grammar.personaconList[0].pid != memberId)
			&& row.find("li.editTitle").attr('data-admin')=='false'){
			row.find("li.editTitle").remove();
		}else{
			row.find("li.editTitle").removeAttr('data-admin');
		}
		grammar.personaconList.forEach(function(personacon,index){
			if(index < 3){
				var slice = $("#divsForCopy").children(".personal-cover").clone();
				if(personacon.iconPath != null && personacon.iconPath != ""){
					slice.find("img")
					.css("background","url('/resource/profile/" + personacon.iconPath +"') no-repeat")
					.css("background-position","center")
					.css("background-size","cover");
				}
				row.find(".contentWritersProf").before(slice);
			}
		});
		
		$('.result-search-section .trans-list-page').before(row);
	});
}

/**
 * 검색된 주제의 페이징 표시
 */
function displayGrammarPageNavigationForSearch(pageMaker, sType){
	
	var prevPage = pageMaker.prevPage;
	var nextPage = pageMaker.nextPage;
	var currentPage = pageMaker.currentPage;
	var pageList = pageMaker.pageList;
	var currentPageNum = parseInt(pageMaker.currentPageNum);
	
	var ul = $('.result-search-section .trans-list-page ul');
	ul.empty();
	
	if(prevPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' )
						.html('PREV'+parseInt(prevPage.pageNumber+1));
		link.attr('onclick','searchGrammar("'
								+ sType+ '","'+ $("#searchKeyword").val() 
								+ '",' +parseInt(prevPage.pageNumber+1) 
								+ ')');
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
		link.attr('onclick','searchGrammar("'+sType+ '","'+ $("#searchKeyword").val() + '",' +parseInt(page.pageNumber+1)+ ')');
		link.html(parseInt(page.pageNumber + 1));
		
		li.append(link);
		li.appendTo(ul);
	});
	
	if(nextPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchGrammar("'+sType+ '","'+ $("#searchKeyword").val() + '",' +parseInt(nextPage.pageNumber+1)+ ')');
		
		link.appendTo(li);
		li.appendTo(ul);
	}
}

/**
 * 그래머 주제 수정
 */
function editGrammarTitle(obj, titleSpan) {
	$.ajax({
		type: 'post',
		url: '/square/grammarBook/title/edit',
		data: obj,
		success: function(result){
			//----------------------------------------
			successEditGrammarTitle(obj.title, titleSpan);
			//----------------------------------------
			popupModal("주제가 변경되었습니다.");
		},
		error: function(xhr){
			alert(xhr.responseText);
			location.href = "/error";
		}
	});
}

/**
 * 그래머 아티클 추가
 */
function appendGrammar(jqForm, resultTarget) {
	$.ajax({
		type: 'post',
		url: '/square/grammarBook/append',
		data: $(jqForm).serialize(),
		success: function(articlePage){
			//----------------------------------------------
			successAppendGrammar(resultTarget, articlePage);
			//----------------------------------------------
		},
		error: function(xhr){
			//-----------------------------------
			popupModal(xhr.responseJSON.message);
			//-----------------------------------
		}
	});
};

/**
 * 그래머 아티클 수정
 */
function editGrammarArticle(jqForm, resultTarget) {
	$.ajax({
		type: 'post',
		url: '/square/grammarBook/article/edit',
		data: $(jqForm).serialize(),
		success: function(articlePage){
			if(typeof successEditGrammar == 'function'){
				successEditGrammar(resultTarget, articlePage);
			}
		},
		error: function(xhr){
			//-----------------------------------
			popupModal(xhr.responseJSON.message);
			//-----------------------------------
		}
	});	
}

/**
 * 기능:그래머 아티클 좋아요 추가
 */
function handleGrammarArticleLike(obj, thisObj) {
	$.ajax({
		type:'post',
		url: '/square/grammarBook/like/'+ obj.contentId,
		data:JSON.stringify(obj), 
		dataType:'json',
		contentType: "application/json;charset=UTF-8",
		success: function(result){
			var count = result;
			if(count == -1){
				alert("이미 처리 되었습니다.");
				thisObj.addClass("active");
				return;
			}
			//'좋아요' 갱신
			thisObj.closest('.articleView').find(".articleLikeCount").text(count);
			thisObj.addClass("active");
		},
		error: function(xhr){
			//-----------------------------------
			popupModal(xhr.responseJSON.message);
			//-----------------------------------
		}
	});
}

/*------------------------------------------------------------------------------
 *					Summernote Editor
------------------------------------------------------------------------------*/
/**
 * Summernote 에디터 삽입
 * width, height값을 추가로 전달하여 에디터의 가로,세로 길이 지정 가능
 */
function insertSummernoteEditor($editor, width, height) {
	var editorOptions = {
			height: height || 500,
			width: width || $editor.parent().width(),
			callbacks: {
				onImageUpload: function(files) {
					if(files.length == 1){
						if(!files[0].type.match('image.*')){
							alert('이미지 파일만 올려 주세요.');
							return;
						}else{
							//---------------------------------
							uploadAttachment(files[0], $editor);
							//---------------------------------
						}
					}else {
						alert('이미지를 하나만 선택해 주세요.');
					}
				}
			}
		};
	$editor.summernote(editorOptions);
	if($editor.val().trim().length == 0){
		$editor.summernote(editorOptions).summernote('code',null);
	}
}
/**
 * 그래머북용 Summernote 에디터 삽입.
 * width, height값을 추가로 전달하여 에디터의 가로,세로 길이 지정 가능.
 * 기본 써머노트 툴바에 문장 성분 표시 버튼을 추가한다.
 */
function insertGrammarEditor($editor, width, height) {
	var editorOptions = {
			height: height || 500,
			width: width || $editor.parent().width(),
			toolbar: [
				  ['style'	, ['style']],
				  ['font'	, ['bold','underline','strikethrough','superscript','subscript']],
				  ['font2'	, ['fontsize','forecolor']],
				  ['para'	, ['ul','ol','paragraph']],
				  ['insert'	, ['table','hr','link','picture','video']],
				  ['view'	, ['fullscreen','codeview']],
				  ['grammar', ['subjectrole','actionrole','objectrole','empMod-f','empMod-b','empAdv','hinteraser']]
			  ],
			callbacks: {
				onImageUpload: function(files) {
					if(files.length == 1){
						if(!files[0].type.match('image.*')){
							alert('이미지 파일만 올려 주세요.');
							return;
						}else{
							//---------------------------------
							uploadAttachment(files[0], $editor);
							//---------------------------------
						}
					}else {
						alert('이미지를 하나만 선택해 주세요.');
					}
				}
			}
		};
	$editor.summernote(editorOptions);
	if($editor.val().trim().length == 0){
		$editor.summernote(editorOptions).summernote('code',null);
	}
}

/**
 * Summernote의 본문을 등록하기에 앞서 줄바꿈을 위해 삽입된 '\u200B', '&nbsp;'를 제거
 */
function filterSummernoteContent(editor) {
	var content = $(editor).summernote('code').replace(/\u200B/gi,"").replace(/&nbsp;/gi," ");
	// String.endsWith를 쓰지 않는 이유는 IE 미지원 메소드이기 때문
	while(content.substr(-"<p><br></p>".length) === "<p><br></p>"){
		var cutIndex = content.lastIndexOf("<p><br></p>");
		content = content.substring(0,cutIndex);
	}
	return content;
}

/**
 * Summernote의 본문에 텍스트 내용이 없는 줄(<p></p>단위)을 <p><br></p>로 변환
 */
function simplifyEmptyParagraph(editor) {
	var $container = $("<div></div>").html($(editor).val());
	$container.find("p").each(function(i, element) {
		if($(element).text().trim().length == 0){
			$(element).replaceWith($("<p><br></p>"));
		}
	});
	$(editor).summernote('code', $container.html());
}

/**
 * Summernote 에디터에 첨부할 이미지를 업로드
 */
function uploadAttachment(file, editor) {
	var formData = new FormData(create("form"));
	formData.append("file", file);
	$.ajax({
        type: 'POST',
        url: '/sn/fileUpload',
        data: formData,
        cache: false,
        processData: false,
        contentType: false,
        success: function (resourceUrl) {
        	if(resourceUrl == null || resourceUrl.startsWith('NOT_ALLOWED')){
        		alert('허용되지 않는 형식의 파일입니다.');
        	}else{
        		//-----------------------------------
        		successUploadAttachment(resourceUrl, editor, file.name);
        		//-----------------------------------
        	}
        },
        error: function (xhr) {
			//-----------------------------------
			alert(xhr.responseJSON.message);
			//-----------------------------------
        }
    });
}

/**
 * 업로드된 이미지를 Summernote 에디터에 첨부
 */
function successUploadAttachment(resourceUrl, editor, fileName) {
	editor.summernote('editor.insertImage', resourceUrl, fileName);
}

/* -----------------------------------------------------------------------------
 *                      view_smalltalk.html
   ---------------------------------------------------------------------------*/

/**
 * 스몰톡용 Summernote 에디터 삽입.
 * width, height값을 추가로 전달하여 에디터의 가로,세로 길이 지정 가능.
 * 기본 써머노트 툴바에 힌트(메인동사,수식어구,비수식어구) 표시 버튼을 추가한다.
 * @author LGM
 */
function insertSmalltalkEditor($editor, width, height) {
	var editorOptions = {
			height: height || 500,
			width: width || $editor.parent().width(),
			toolbar: [
				  ['style'	, ['style']],
				  ['font'	, ['bold','underline','strikethrough','superscript','subscript']],
				  ['font2'	, ['fontsize','forecolor']],
				  ['para'	, ['ul','ol','paragraph']],
				  ['insert'	, ['table','link','picture','video']],
				  ['view'	, ['fullscreen','codeview']],
				  ['hr2'	, ['hr2']],
				  ['grammar', ['empVerb','empMod-f','empMod-b','empAdv','hinteraser']]
			  ],
			callbacks: {
				onImageUpload: function(files) {
					//---------------------------------
					uploadAttachment(files[0], $editor);
					//---------------------------------
				}
			}
		};
	$editor.summernote(editorOptions);
	if($editor.val().trim().length == 0){
		$editor.summernote(editorOptions).summernote('code',null);
	}
}
/**
 * 스몰톡을 삭제한다.
 * @author LGM
 */
function delSmallTalk(storyId) {
	$.ajax({
		type: 'post',
		url: '/square/smalltalk/del/' + storyId,
		success: function(){
			alert('스몰톡이 삭제되었습니다.');
			if(typeof deleteContentDiv == 'function'){
				//상세보기 화면을 지움----
				deleteContentDiv();
				//-----------------
			}
			if(typeof successDelSmallTalk == 'function'){
				//목록에서 지움------------------
				successDelSmallTalk(storyId);
				//---------------------------
			}
		},
		error: function(xhr){
			alert('삭제에 실패했습니다. 관리자에게 문의해 주세요.');
		}
	})
}

/**
 * 문단 내용 수정
 * 
 * $(.editParaBtn).click 으로 호출
 * 
 * @author LGM
 */
function editParagraphContent(paragraphResource, $selector) {
	$.ajax({
		type: 'post',
		url: '/square/smalltalk/edit',
		data: JSON.stringify(paragraphResource),
	    dataType:'json',
	    contentType: "application/json;charset=UTF-8",	
	    success: function(){
	    	//--------------------------------------
	    	successEditParagraphContent(paragraphResource, $selector);
	    	//--------------------------------------
	    },
	    error: function(xhr){
	    	alert('문단 내용을 수정하지 못했습니다. 수정내용을 다시 확인해 주세요.');
	    }
	})
}

/**
 * 회원의 해석 등록
 * 
 * .addMemberTransBtn click으로 발생
 * 
 * @param StoryTranslationForm
 * @param selector
 * @returns
 * @author 강한별
 */
function addStoryTranslation(storyTranslationForm, selector){
   $.ajax({
      type:'post',
      url: '/square/smalltalk/translation',
      data:JSON.stringify(storyTranslationForm), 
      dataType:'json',
      contentType: "application/json;charset=UTF-8",
      success:function(result){
    	  
         //---------------------------------------------------
    	  successAddStoryTranslation(selector, 
               storyTranslationForm.storyId, storyTranslationForm.paraNum);
         //---------------------------------------------------
      },
      error: function(e){
         alert("해석 등록 중 오류가 발생하였습니다.");
         return;
      }
   });
}


/**
 * 특정 문단의 회원 번역 목록 가져오기
 * 
 * 호출되는 경우는 아래 2가지 경우
 * 1. .showTransFormBtn click. 
 *       번역하기 버튼을 클릭한 경우
 * 2. addStoryTranslation() success
 *       회원이 해석을 등록에 성공한 다음 목록 조회 
 * 
 * @param StoryTranslationForm
 * @param selector
 * @returns
 * @author 강한별
 */
function loadTranslations(selector, storyId, paraNum){
   var url = "/square/smalltalk/translation/list/" 
      + storyId + "?paraNum=" + paraNum;
   
   $.ajax({
      type: 'get',
      url: url,
      success: function(translations){
         
         $(selector).html(translations);//번역 목록 출력
      },
      error: function(xhr){
         alert("해석 불러오기에 실패했습니다." + xhr.responseText);
      }
   });
}

/**
 * .editTranslationBtn 클릭으로 호출됨
 * 
 * @author 강한별
 */
function editTranslation(storyTranslationForm, selector){
	$.ajax({
		type:'post',
		url: '/square/smalltalk/translation/edit',
		data:JSON.stringify(storyTranslationForm), 
		dataType:'text',
		contentType: "application/json;charset=UTF-8",
		success:function(result){
			//------------------------------------------
			successEditStoryTranslation(selector, storyTranslationForm.content);
			//------------------------------------------
		},
		error: function(e){
			alert("해석 수정 중 오류가 발생하였습니다.");
			return;
		}
	});
}


/**
 * 뜻이 없는 단어에 뜻을 등록.
 * 
 * @author LGM
 */
function addNewSense(senseResource, wordSequence) {
	$.ajax({
		url: '/dictionary/sense/add',
		type: 'post',
		data: senseResource,
		success: function(senseAndSound){
			//----------------------------------------------------
			successAddNewSense(wordSequence, senseAndSound.senseText, senseAndSound.voicePath);
			//----------------------------------------------------
		},
		error: function(xhr){
			alert('뜻 등록에 실패했습니다.\n화면 새로고침 후 다시 시도해 주세요.');
		}
	});
}
/**
 * 뜻이 있는 단어에 뜻을 수정
 * 
 * @author LGM
 */
function editSense(senseResource, wordSequence) {
	$.ajax({
		url: '/dictionary/sense/edit',
		type: 'post',
		data: senseResource,
		success: function(){
			//----------------------------------------------------
			successAddNewSense(wordSequence, senseResource.senseText);
			//----------------------------------------------------
		},
		error: function(xhr){
			alert('뜻 수정에 실패했습니다.\n화면 새로고침 후 다시 시도해 주세요.');
		}
	});
}

/**
 * 단어 뜻 리스트 조회
 */
function getWordSenses(paraWordId, $obj) {
	$.ajax({
		url: '/square/smalltalk/paraword/senses/' + paraWordId,
		type: 'get',
		success: function(senseList){
			//-------------------------
			refreshSenseList($obj, senseList);
			//-------------------------
			openWordMeaningModal($obj);
			//-------------------------
		},
		error: function(xhr){
			alert('단어의 뜻을 조회하지 못했습니다.\n화면 새로고침 후 다시 시도해 주세요.');
		}
	});
}
/**
 * 단어의 문맥에 맞는 품사 선택
 * $('.editPart').clcik 으로 호출
 * @author LGM
 */
function editContextPart(partResource, wordSequence) {
	$.ajax({
		url: '/square/smalltalk/paraword/part/edit',
		type: 'post',
		data: JSON.stringify(partResource),
		contentType: 'application/json;charset=UTF-8',
		success: function(paraWord){
			//-------------------------------------
			contextPartChanged(wordSequence, paraWord);
			//-------------------------------------
		},
		error: function(xhr){
			alert('품사를 변경하지 못했습니다. 화면 새로고침 후 다시 시도해 주세요.')
		}
	});
}
/**
 * 단어의 문맥에 맞는 뜻 선정
 * @author LGM
 */
function editContextSense(paraWordResource, wordSequence) {
	$.ajax({
		url: '/square/smalltalk/paraword/edit',
		type: 'post',
		data: JSON.stringify(paraWordResource),
		contentType: 'application/json;charset=UTF-8',
		success: function(){
			//--------------------------------------------------------
			contextSenseChanged(wordSequence, paraWordResource.senseId, paraWordResource.senseText);
			//--------------------------------------------------------
		},
		error: function(xhr){
			alert('대표 뜻 선정 중 오류가 발생했습니다.\n화면 새로고침 후 다시 시도해 주세요.');
		}
	});
}
/**
 * 단어의 뜻을 추가(현재 표시된 품사 내에서)
 * @author LGM
 */
function appendSense(senseResource, wordSequence) {
	$.ajax({
		url: '/square/smalltalk/paraword/append',
		type: 'post',
		data: senseResource,
		success: function(resultSense){
			//-----------------------------------------------------
			contextSenseChanged(wordSequence, resultSense.sid, senseResource.senseText);
			//-----------------------------------------------------
		},
		error: function(xhr){
			alert('뜻 등록에 실패했습니다.\n화면 새로고침 후 다시 시도해 주세요.');
		}
	});
}
/**
 * 스몰톡에 '좋아요' 표시
 * @author LGM
 */
function addStoryLike(voteResource, element) {
	$.ajax({
		url: '/square/smalltalk/like/' + voteResource.contentId,
		type: 'post',
		data:JSON.stringify(voteResource), 
		dataType:'json',
		contentType: "application/json;charset=UTF-8",
		success: function(result){
			var count = result;
			if(count == -1){
				alert("이미 처리 되었습니다.");
				element.addClass("heart-blast");
				return;
			}
			//'좋아요' 갱신-----------
			updateLikeCount(count);
			//---------------------
			element.addClass("heart-blast");
		},
		error: function(xhr){
			//-----------------------------------
			if(typeof popupModal == 'function'){
				popupModal(xhr.responseJSON.message);
			}else{
				alert('추천을 처리하던 중 오류가 발생했습니다.\n화면 새로고침 후 다시 시도해 주세요.');
			}
			//-----------------------------------
		}
	});
}
/**
 * 스몰톡을 '담기' 리스트에 추가
 * @author LGM
 */
function addStoryPlate(plateResource, element) {
	$.ajax({
		url: '/plate/add',
		type: 'post',
		data:JSON.stringify(plateResource), 
		contentType: "application/json;charset=UTF-8",
		success: function(result){
			var count = result;
			if(count == -1){
				alert("이미 처리 되었습니다.");
				element.addClass("active");
				return;
			}
			//'좋아요' 갱신
			element.addClass("active");
			// '추천'도 같이 실행
			$.ajax({
				url: '/square/smalltalk/like/' + plateResource.resourceId,
				type: 'post',
				data:JSON.stringify({
					memberId: plateResource.memberId,
					contentId: plateResource.resourceId,
					appCode: plateResource.appCode,
					likeCount: plateResource.likeCount
				}), 
				dataType:'json',
				contentType: "application/json;charset=UTF-8",
				success: function(result){
					var count = result;
					if(count == -1){
						return;
					}
					//'좋아요' 갱신-----------
					updateLikeCount(count);
					//---------------------
				},
				complete: function(xhr){
					alert('\'스토리 보관함\'에 스토리를 담으며\n작성자에게 추천을 선물합니다')
				}
			});
		},
		error: function(xhr){
			//-----------------------------------
			if(typeof popupModal == 'function'){
				popupModal(xhr.responseJSON.message);
			}else{
				alert('스토리를 담는 중 오류가 발생했습니다.\n화면 새로고침 후 다시 시도해 주세요.');
			}
			//-----------------------------------
		}
	});
	
}