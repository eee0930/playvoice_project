
/**
 * 붙여넣기시 text만 입력되도록 처리
 * contentEditable=true인 div에 붙여넣기를 하면 태그가 그대로 입력됨.
 * 데이터는 text만 받을 것이므로 이를 방지한다.
 */
function pasteFilter(e) {
	e.preventDefault();//붙여넣기를 취소
	var nod = document.createTextNode(e.clipboardData.getData('Text'));//클립보드 내용을 저장
	window.getSelection().getRangeAt(0).deleteContents();//커서위치 내용을 지움.(블록지정했을 경우)
	window.getSelection().getRangeAt(0).insertNode(nod);//클립보드 내용 붙여넣기
}

/**
 * contentEditable=true인 div에 타이핑하면서 엔터키를 입력하면 div가 생성되며 줄이 넘어감.
 * 데이터는 text만 받을 것이므로 이를 방지한다.
 */
function enkeyup(obj){
	$(obj).children('div').replaceWith('');
}

 


/**
 * 단어 뜻을 품사와 뜻으로 나눠 텍스트 상자에 뿌림.
 * 각 텍스트 상자는 meaning00, meaning01 과 같은 아이디를 가지며
 * meaning 뒤의 첫번째 숫자는 텍스트 상자의 행 번호, 두번째 숫자는 열 번호를 나타낸다.
 */
function parseMeanings(meaningString) {
	//단어 뜻 파싱
	var meanings = JSON.parse(meaningString);
	//	meanings는 1차배열 [품사,뜻]이 한 쌍으로 이루어진 2차배열이다.
	for(var i = 0; i < meanings.length; i++) {
		var category = meanings[i][0];	//	품사
		var meaning = meanings[i][1];	//	뜻
		$("#meaning" + i + "0").html("[" + category + "]");
		$("#meaning" + i + "0xs").html("[" + category + "]");
		$("#meaning" + i + "1").html(meaning);
		$("#meaning" + i + "1xs").html(meaning);
	}
}

/**
 * add_pictionary에서 단어 중복 검사
 * 중복된 단어를 등록하려는 경우 픽션을 추가하러 가도록 유도
 */
function checkWord(word) {
	$.ajax({
		type: 'GET',
		url: '/pictionary/word/check/' + word,
		success: function(resultData, status, xhr){
			if(typeof resultData == "string"){	// 등록됨->등록된 단어의 아이디(base64)
				checkWordResult(resultData);
				return;
			}else if(status != "nocontent"){	// 미등록->단어의 발음기호
				fillPhonetics(resultData);
				checkWordResult(null);
			}else{								// 미등록->발음기호 검색결과 없음
				alert("단어 스펠링 또는 대소문자를 다시 확인해 주세요.");
				$("#phonetic").val("");
				checkWordResult(null);
			}
		},
		error: function(xhr){
			alert(xhr.responseText);
		}
	}); //end ajax   
};

/**
 * add_pictionary에서 단어 등록
 */
function addWord(obj) {
	$.ajax({
		type : "post",
		url : "/pictionary/word/add",
		data : obj,
		success : function(wordId){
			// 추가로 등록할 픽션이 가질 픽셔너리아이디 = wordId
			activeAddPictionForm(wordId);
		},
		error : function(e){
			// 단어 등록 실패
			$('#add_fail_div').show();
			$('#add_fail_msg').text(e.responseText);
		}
	});
};

/**
 * 해당 단어가 픽셔너리에 등록됐는지 확인하고
 * 등록된 단어면 해당 단어 상세보기로 이동, 미등록된 단어면 단어 등록으로 이동
 */
function checkRelatedWord(url, title) {
	$.ajax({
		type: "get",
		url: url,
		success: function(result, status){
			if(status != "nocontent"){
				location.href = result;
			}else{
				location.href = "/pictionary/word/add?title=" + encodeURI(title);
			}
		},
		error: function(xhr){
			alert("요청을 처리 중 오류가 발생했습니다.");
		}
	});
}

/*------------------------------------------------------------------------------
 * 							view_pictionary.html
 -----------------------------------------------------------------------------*/

/**
 * 단어 수정폼 요청
 */
function getEditWordForm(wordId) {
	$.ajax({
		type: 'get',
		url: '/pictionary/word/request/edit/' + wordId,
		success: function(meaningList, status, xhr){
			if(xhr.status == 202){	//	Not Editable
				alert("현재 다른 회원에 의해 단어 수정이 진행 중입니다.");
				
				$("#reportWord_btn,#reportWord_btn_xs")
				.append('<i class="report-count fa fa-exclamation-circle text-danger"></i>');
			}else{
				//---------------------------------
				successGetEditWordForm(meaningList)
				//---------------------------------
			}
		},
		error: function(xhr){
			alert("요청을 처리 중 오류가 발생했습니다.");
		}
	})
}

/**
 * 단어 수정 요청 전송
 */
function requestEditWord(obj){
	$.ajax({
		type:'post',
		url: '/pictionary/word/request/edit',
		data: obj, 
		success: function(result){
			alert("성공적으로 수정을 요청했습니다.")
		},
		error: function(xhr){
			alert("요청을 처리 중 오류가 발생했습니다.");
		}
	});
}

/**
 * 예문 좋아요 Ajax 전송
 */
function likeSentenceAjax(sentenceId, obj, pictionIndex, sentenceIndex){
	$.ajax({
		type:'post',
		url: '/pictionary/sentence/like/'+ sentenceId,
		data:JSON.stringify(obj), 
		dataType:'json',
		contentType: "application/json",
		success: function(result){
			if(typeof changeLikeSentenceBtn == "function"){
				changeLikeSentenceBtn(pictionIndex, sentenceIndex, result);
			}
		},
		error: function(xhr){
			alert("요청을 처리 중 오류가 발생했습니다.");
		}
	});
};

/**
 * 픽션 사진 수정 내용 ajax 전송
 */
function editPiction(obj, pictionCover) {
	$.ajax({
		type: "post",
		url: "/pictionary/piction/edit",
		data: obj,
		contentType: false,
		processData: false,
		success: function(result){
			alert("성공적으로 수정되었습니다.");
			if(obj.get("xrateEditOnly") == "true"){
				//---------------------------------------
				changePictionFrame(result, pictionCover);
				//---------------------------------------
			}else{
				//---------------------------------------
				successEditPiction(result, pictionCover);
				//---------------------------------------
			}
		},
		error: function(xhr){
			alert("사진 수정에 실패했습니다.");
		}
	});
}

/**
 * 예문 등록 내용 ajax 전송
 */
function addSentenceAjax(obj, pictionIndex, sentenceNum) {
	$.ajax({
		type: 'POST',
		url: '/pictionary/sentence/add',
		data: obj,
		contentType:false,
		processData:false,
		success: function(sentence) {
			appendAddedSentence(sentence, pictionIndex, sentenceNum);
			alert("예문이 등록되었습니다.");
			cancelForm(pictionIndex); // 등록폼 닫기
		},
		error : function (xhr){
			if(xhr.status==401){
				location.href='/auth/login';
			}else{
				alert(xhr.responseText);
			}
		}
	});
};

/**
 * 예문 수정 내용 ajax로 전송
 */
function editSentenceAjax(obj, pictionIndex, sentenceIndex) {
	$.ajax({
		type: 'POST',
		url: '/pictionary/sentence/edit',
		data: obj,
		contentType:false,
		processData:false,
		success: function(sentence) {
			alert("예문이 수정되었습니다.")
			replaceEditedSentence(sentence, pictionIndex, sentenceIndex);
			cancelForm(pictionIndex); // 수정폼 닫기
		},
		error : function (xhr){
			alert(xhr.responseText);
		}
	}); //end ajax   
};

/**
 * 예문 삭제 요청 ajax 전송
 */
function deleteSentenceAjax(sentenceId, pictionIndex, sentenceIndex) {
	$.ajax({
		type: 'POST',
		url: '/pictionary/sentence/del/' + sentenceId,
		success: function() {
			removeSentenceArea(pictionIndex, sentenceIndex);
		},
		error : function (xhr){
			if(xhr.status==401){
				location.href='/auth/login';
			}else{
				alert(xhr.responseText);
			}
		}
	});
};

/**
 * 연관 단어 등록
 */
function addRelatedWord(obj) {
	$.ajax({
		type: "post",
		url: "/pictionary/relatedword/add",
		data: obj,
		success: function(relatedWords){
			alert("성공적으로 등록했습니다.");
			//----------------------------------------------------
			successAddRelatedWord(obj.relatedTitle, relatedWords);
			//----------------------------------------------------
		},
		error: function(xhr){
			alert("연관 단어 등록 중 오류가 발생했습니다.");
		}
	});
}
/* -----------------------------------------------------------------------------
 *						list_mytracer.html
----------------------------------------------------------------------------- */
/**
 * 해당 단어의 대표 이미지 경로 리스트 조회
 * 각 단어별로 1회씩 실행되어 
 * 해당 단어를 누를 때마다 교체되며 보여 줄 이미지를 셋팅 
 */
function getReviewImages(div, wordId) {
	$.ajax({
		type: 'get',
		url: "/pictionary/tracer/images/" + wordId,
		success: function(pathList){
			//-------------------------------
			successGetReviewImages(div, pathList);
			//-------------------------------
		},
		error: function(xhr){
			alert("이미지 불러오기에 실패했습니다");
		}
	});
}
/* -----------------------------------------------------------------------------
 * 						tracer_quiz.html
 -----------------------------------------------------------------------------*/
/**
 * wordId 4개를 인자로 하여 퀴즈로 표시할 항목을 가져온다.
 * wordIds: wordId1_wordId2_wordId3_wordId4
 */
function getQuiz(wordIds, xrateGold) {
	$.ajax({
		type: "post",
		url: "/pictionary/tracer/quiz/player"
			+ "?quizIds=" + wordIds + "&xrateGold=" + xrateGold,
		success: function(pictionList){
			//-------------------------
			successGetQuiz(pictionList)
			//-------------------------
		},
		error: function(xhr){
			alert("문제를 가져오지 못했습니다.");
		}
	});
};

/**
 * 픽셔너리 센텐스에 정답/오답 기록 추가
 * sentenceId: 픽셔너리센텐스 아이디 (long)
 * result: 정답결과 (boolean)
 */
function addSentenceQuizResult(sentenceId, result) {
	$.ajax({
		type: "post",
		url: "/pictionary/tracer/quiz/extra",
		data: {sentenceId: sentenceId,
			   result: result
			   },
		success: function(tracerQuizRecord){
			//-------------------------------
			showQuizRecord(tracerQuizRecord);
			//-------------------------------
		}
	});
}

/*------------------------------------------------------------------------------
 *							incl/edit_word.html
 -----------------------------------------------------------------------------*/

/**
 * 단어작성자가 단어수정요청을 승인,거부함.
 * status: 승인(A), 거부(R)
 * rid: 요청id
 * comment: 거부 시 작성한 거부 사유
 */
function confirmWordEditRequest(status, rid, rejectMsg) {
	$.ajax({
		type: "post",
		url: "/pictionary/word/request/edit/confirm/" + status + "/" + rid,
		data: {rejectMsg},
		success: function(result){
			if(status == 'A'){
				alert("요청을 반영했습니다.");
			}else if(status == 'R'){
				alert("요청을 거부했습니다.");
			}
			//-------------------------
			closeRequestConfirmModal();
			removeRequest(rid);
			//-------------------------
		},
		error: function(xhr){
			alert("요청을 처리 중 오류가 발생했습니다.");
		}
	});
}


/*------------------------------------------------------------------------------
 *						/admin/list_word_meaning_edit_request.html
 -----------------------------------------------------------------------------*/
/** 
 *  수정요청 목록에서 수정요청id 클릭 시 상세보기 정보를 보여줌
 *  WordMeaningEditRequest, PictionaryWord를 조회 
 *  
 *  list_list_wordmeaning_editrequest.html의 
 *   $('.resultWrapper').on('click', '.editRequestDetail)에서 호출
*/
function displayWordMeaningEditRequest(editRequestId, title){
	var next = "/admin/pictionary/word/request/edit/view/" + editRequestId;
	$('.editRequestSection').load(next, function(){
		$('#editWordDiv .word').text(title);
	});
}


/**
 * 페이지 내 이동
 * 
 * ex) window.scroll(0, getOffsetTop(document.getElementById("editSentenceForm")));
 * @param el
 * @returns
 */
function getOffsetTop(el) { 
	var top = 0; 
	if (el.offsetParent) { 
		do { 
			top += el.offsetTop; 
		} while (el = el.offsetParent); 
		return [top]; 
	} 
}

function searchEditRequest(searchType, page, suffix){
	
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
	
	
	$.getJSON({
		//type: "GET", 
		url : '/admin/pictionary/report/word/search',
		data : {
			searchType : sType,
			keyword : keyword,
			fromDate : $('#fromDate').val(),
			toDate : $('#toDate').val(),
			page : page,
			size : 10,
			sortName : $('#searchFormHidden_'+suffix+' #sortName').val(),
			asc : $('#searchFormHidden_'+suffix+' #asc').val()
		},
		success : function(result){
			//resetDefault();
			console.log(result);
			var page = result.result;
			displsyEditRequestList(page.content, result.currentPageNum, page.totalElements, suffix);		
			displayPageNavigation2(result, sType, 'list'); 

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#editRequestListDiv').css("display",'none');
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

function displayPageNavigation2(pageMaker, sType, suffix){
	
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
		link.attr('onclick','searchEditRequest("'+sType+'",'+parseInt(prevPage.pageNumber+1)+',"'+suffix+'")');
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
		link.attr('onclick','searchEditRequest("'+sType+'",'+parseInt(page.pageNumber+1)+',"'+suffix+'")');
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
		link.attr('onclick','searchEditRequest("'+sType+'",'+parseInt(nextPage.pageNumber+1)+',"'+suffix+'")');
		
		link.appendTo(li);
		li.appendTo(ul);
	}
}

/*------------------------------------------------------------------------------
 *						/admin/incl/edit_word.html
 -----------------------------------------------------------------------------*/


/**
 * 관리자가 수정요청 정보를 전송
 * 
 * edit_word.html의 #applyReportButton이나 #refuseReportBtn 클릭 시 호출됨
 * 
 * @param	status	'A':수정요청 수락, 'R':수정요청 거절
 */
function updateEditRequest(status, searchType, page, suffix){
	var wordMeaningEditCommand = $('#editWordMeaningForm').serialize();
	$.ajax({
		type: 'POST',
		url: '/admin/pictionary/word/request/edit/' + status,
		data:wordMeaningEditCommand,
		success: function () {
			alert("changed.");
			
			var url = '/admin/pictionary/word/request/edit/list';
			location.href=url+"?page="+page;
			
			//searchEditRequest(searchType, page, suffix);
		},
		error: function(xhr){
			alert("요청을 처리 중 오류가 발생했습니다.");
		}
	});
}


function displsyEditRequestList(editRequestList, currentPageNum, total, suffix){
	$('#searchResultTable_'+suffix).children('tbody').children("tr").remove();

	var page = $("#page").val();
	var output = ''
	var num=1;	
	var fetchSize = 10;
	
	var statusMap = {'H':'작성자 미확인','A':'수정 채택','R':'수정 거부'};
	
	$.each(editRequestList, function(index, editRequest){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		var regDate = new Date(editRequest.regDate);
		output += '<tr>';
		output += '<td>'+num+'</td>';
		output += '<td>'+editRequest.rid+'</td>'; 
		output += '<td>'+editRequest.wordId+'</td>';
		output += '<td><a href="javascript:void(0)" class="editRequestDetail">'
			+editRequest.title+'</a></td>'; 
		output += '<td>'+editRequest.alias+'</td>';
		output += '<td>'+statusMap[editRequest.status]+'</td>';
		output += '<td>'+regDate.getFullYear()+"-"
					+parseInt(regDate.getMonth() +1)+"-"+regDate.getDate()+'</td>';
		output += '</tr>'; 
 
		$('#searchResultTable_'+suffix+' > tbody:last').append(output)
		output =''; 
	});
}


/* ----------------------------------------------------------------------------
 * 				admin/pictionary/stats_pictionary.html
 * ---------------------------------------------------------------------------*/

/** 
 * 통계폼을 통한 통계 전송시 ajax 를 통해 결과 목록을 json으로 전달받는다.
*/
function statsPictionary(type){
	
	if(type == 'groupByTopMember'){
		var size =  $('#size').val(); 
	} 
	
	$.getJSON({
		type: "POST", 
		url : '/admin/pictionary/stats',
		data : {
			searchType : type,
			//keyword : keyword, 
			size : size, 
			fromDate : $('#fromDate').val(),
			toDate : $('#toDate').val(),
		},
		success : function(result){
			//resetDefault();
			if(type == 'groupByTopMember'){
				//이 경우에는 PageMaker로 오기때문에 page로 받도록 해줘야함
				result = result.result;
			} 
			displayStatsList(type, result); 
			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
}


/**
 * 통계 결과를 출력하는 함수.
 * 각 통계마다 출력해야하는 곳이 모두 다름.
 *  id = type'Box'형식으로 ex) #newWordBox, #memberCountOnAddBox
 * 그리고 통계의 결과가 1개인 경우(특정기간동안 js등록갯수/등록한 회원수) 와
 * 여러건인 경우(app별 js등록갯수/등급별/상위멤버별) 로 나뉘어짐. 
 * 여러건인 경우 테이블로 나타냄.
 *  
 * @param type
 * @param result
 * @returns
 */
function displayStatsList(type, result){
	var output = '';
	  
	//결과목록이 List가 아닌 단일, 1개의 경우. 
	//span태그에 통계 결과값을 뿌려주기때문에 span 안의 값을 교체함.
	if(type == 'newWord' || type == 'newPiction'){
		$('#'+ type + 'Box div span').eq(0).empty(); 
		$('#'+ type + 'Box div span').eq(0).text(result);
		
	}
	else if(type == 'primeGroupByRoleName'){
		
		$.each(result, function(index, stats){
			// 각 등급별 출력위치가 지정되어있으므로 List로 받은 result를 등급에 맞게 count값을 넣어줘야함.
			// #groupByRolNameBox > div #SilverCount 와 같은 식으로 값을 넣어줌.
			$('#'+ type + 'Box div #' + stats.roleName + 'Count').empty(); 
			$('#'+ type + 'Box div #' + stats.roleName + 'Count')
															.text(stats.count);
		});
	}
	
	else{
		if(type == 'groupByTopMember'){
			result = result.content;
		}
		
		var total = 0;
		$.each(result, function(index, stats){
			total += stats.count;
		});
		
		$.each(result, function(index, stats){
			
			index++; 
			output += '<tr>';
			output += '<td>'+index+'</td>';
			if(type == 'groupByAppCode'){
				output += '<td>'+stats.appName+'</td>';
			} 
			if(type == 'groupByAlphabet'){
				output += '<td>'+stats.alphabet+'</td>';
			}
			output += '<td>'+stats.count+'</td>';
			
			if(type == 'groupByAppCode'){
				output += '<td>'+Math.round((stats.count/total)*100)+'</td>';
			}
			
			output += '</tr>'; 
			 
		});
		$('#'+ type + 'Box > table > tbody').empty();  
		$('#'+ type + 'Box > table > tbody').append(output);
		
	}

	$('#'+ type + 'Box .regDate').text($('#fromDate').val() + '~' 
													+ $('#toDate').val());
	output ='';  
}
