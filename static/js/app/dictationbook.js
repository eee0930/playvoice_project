//----------------------------------------
//		add_theme.html & 
//		list_dictation_theme.html
//----------------------------------------


/**
 * 
 * list_dictationtheme.html에 incl된 add_dictationtheme.html에서
 * 	<form id="addDictationThemeForm" th:action="@{/admin/dictationBook/theme/add}" 
 * 	폼 안의 <input type="button" id="addBtn" 버튼.
 * 
 * 	$('#addBtn').click() 이벤트 안에서
 * 	addDictationTheme($('#appCodeSelect').val(), $('#title').val(), 
				$('#option').val(), $('#numOfQuestions').val());
	로 호출함.
 * 	
 * 
 * @param appCode
 * @param title
 * @param limit
 * @param numOfQuestions
 * @returns
 */
function addDictationTheme(appCode, themeType, title, description, limit, cutOffPoint, numOfQuestions){
	
	$.ajax({
		type: "POST", 
		url : '/admin/dictationBook/theme/add',
		data : {
			appCode : appCode,
			themeType : themeType,
			title : title,
			description : description,
			limit : limit,
			cutOffPoint : cutOffPoint, 
			numOfQuestions : numOfQuestions
		}, 
		success : function(pageMaker){
			console.log('success');
			var page = pageMaker.result;
			displayDictationThemeList(page.content, pageMaker.currentPageNum, page.totalElements, 'list');		
			displayPageNavigation(pageMaker, 'tid', 'list');

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#dictationThemeListDiv').css("display",'none');
			//신규 테이블 show
			$('#searchResult_'+'list').css("display",'block'); 
			
			$('#successDiv').css("display",'inline');
			$('#successDiv > pre').text(title);
			
			$('#addThemeFormContainer button[class="btn btn-info btn-xs"]').show();
		},
		error : function (e) {
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
}










/** 
 * 검색폼을 통한 검색 전송시 ajax 를 통해 결과 목록을 PageMaker:json로 전달받는다.
 * 	전송방식은 세가지 사용자 인터페이스를 갖는다.
 * 	1. 검색버튼을 이용한 최초 전송과 그 이후 
 * 	2. 목록 페이지를 선택하여 전송
 * 	3. 테이블에서 컬럼 정렬을 선택하여 전송
*/
function searchDictationTheme(searchType, page, suffix){
	
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchFormHidden_'+suffix+' #searchType').val();
	}
	
	var keyword =  $('#keyword').val().trim();
	
	if(searchType == 'appCode'){
		keyword = $('#appCodeSelect').val();
	}
	else if(searchType == 'themeType'){
		keyword = $('#themeTypeSelect').val();
	}
	console.log(keyword);
	console.log($('#themeTypeSelect').val());
	
	$.ajax({
		//type: "GET", 
		url : '/admin/dictationBook/theme/search',
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
			displayDictationThemeList(page.content, result.currentPageNum, page.totalElements, suffix);		
			displayPageNavigation(result, sType, suffix); 

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#dictationThemeListDiv').css("display",'none');
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


/** 
 * 검색폼을 통한 검색 전송시 ajax 를 통해 결과 목록을 PageMaker:json로 전달받는다.
 * 	전송방식은 세가지 사용자 인터페이스를 갖는다.
 * 	1. 검색버튼을 이용한 최초 전송과 그 이후 
 * 	2. 목록 페이지를 선택하여 전송
 * 	3. 테이블에서 컬럼 정렬을 선택하여 전송
*/
function searchSentence(searchType, page, suffix){

	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchFormHidden_'+suffix+' #searchType').val();
	}
	
	$.ajax({
		//type: "GET",
		url : '/admin/sentenceBook/search',
		data : {
			searchType : sType,
			keyword : $('#keyword').val().trim(),
			fromDate : $('#fromDate').val(),
			toDate : $('#toDate').val(),
			page : page,
			size : 10,
			sortName : $('#searchFormHidden_'+suffix+' #sortName').val(),
			asc : $('#searchFormHidden_'+suffix+' #asc').val()
		},
		success : function(result){

			var dictationThemeList = JSON.parse(
					sessionStorage.getItem('dictationThemeList'));
			var page = result.result;
			displayAddDictationTable2(page.content, result.currentPageNum, page.totalElements, suffix, dictationThemeList);
			displayPageNavigation2(result, sType, suffix);

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#sentenceListDiv').css("display",'none');
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




/**
 * 테마 목록에서 테이블 헤더를 통한 컬럼 정렬을 수행할 경우 ajax를 통해 전송받은
 * 딕테이션 테마 목록을 출력한다.
 * 
 * @param sentenceList
 * @param currentPageNum
 * @param total
 * @returns
 */
//ajax로 전송한 요청에 대한 결과셋 테이블 표시
function displayDictationThemeList(dictationThemeList, currentPageNum, total, suffix){
	
	$('#searchResultTable_'+suffix+' tbody > tr').remove();
	 
	var page = $("#page").val();
	var output = ''
	var num=1;	
	var fetchSize = 20;//$('#h_size').val();
	$.each(dictationThemeList, function(index, dictationTheme){
		num = (total-index)-(currentPageNum-1)*fetchSize; 

		var regDate = new Date(dictationTheme.regDate);
		output += '<tr>';
		output += '<td><input type="checkbox" id="'+dictationTheme.tid+'" name="chkList"></td>';
		output += '<td>'+num+'</td>';
		output += '<td>'+dictationTheme.tid+'</a></td>'; 
		output += '<td class="text-left">'+dictationTheme.appCode;
		output += '<td class="text-left" ><a href="javascript:void(0)" class="dictationThemeDetail">'
			+dictationTheme.title+'</td>';
		output += '<td>'+dictationTheme.themeType +'</td>';
		output += '<td>'+dictationTheme.limit +'</td>';
		output += '<td>'+dictationTheme.numOfQuestions+'</td>';
		output += '<td>'+regDate.getFullYear()+"-"
				+parseInt(regDate.getMonth() +1)+"-"+regDate.getDate()+'</td>';
		output += '</tr>';
		$('#searchResultTable_'+suffix+' > tbody:last').append(output)
		output =''; 
	});
	
	
	
}



/**
 * 목록의 네비게이션 바를 표시한다.
 * 
 * @param pageMaker
 * @returns
 */
function displayPageNavigation(pageMaker, sType, suffix){
	//console.log("pageMaker="+JSON.stringify(pageMaker));
	
	var prevPage = pageMaker.prevPage;
	var nextPage = pageMaker.nextPage;
	var currentPage = pageMaker.currentPage;
	var pageList = pageMaker.pageList;
	var currentPageNum = parseInt(pageMaker.currentPageNum);
	
	var ul = $('#searchResultPageNavi ul');
	ul.empty();
	
	if(prevPage != null){
		
		var li100 = $('<li></li>');
		li100.addClass('page-item');
		
		var link100 = $('<a class="page-link"></a>').attr('href', '#' ).
			html('PREV'+parseInt((pageMaker.currentPageNum > 100)?
						(pageMaker.currentPageNum - 100) : 1));
		link100.attr('onclick','searchDictationTheme("'+sType+'",'
						+ parseInt((pageMaker.currentPageNum > 100)?
						(pageMaker.currentPageNum - 100) : 1)+',"'+suffix+'")');
		link100.appendTo(li100);
		li100.appendTo(ul);
		
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
			html('PREV'+parseInt(prevPage.pageNumber+1));
		link.attr('onclick','searchDictationTheme("'+sType+'",'+parseInt(prevPage.pageNumber+1)+',"'+suffix+'")');
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
		link.attr('onclick','searchDictationTheme("'+sType+'",'+parseInt(page.pageNumber+1)+',"'+suffix+'")');
		link.html(parseInt(page.pageNumber + 1));
		
		li.append(link);
		li.appendTo(ul);
	});
	
	if(nextPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchDictationTheme("'+sType+'",'+parseInt(nextPage.pageNumber+1)+',"'+suffix+'")');
		
		link.appendTo(li);
		li.appendTo(ul);

		var li100 = $('<li></li>');
		li100.addClass('page-item');
		
		var link100 = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt((pageMaker.totalPageNum < pageMaker.currentPageNum + 100)?
						pageMaker.totalPageNum : (pageMaker.currentPageNum + 100)));
		link100.attr('onclick','searchDictationTheme("'+sType+'",'
						+ parseInt((pageMaker.totalPageNum < pageMaker.currentPageNum + 100)?
						pageMaker.totalPageNum : (pageMaker.currentPageNum + 100))+',"'+suffix+'")');
		
		link100.appendTo(li100);
		li100.appendTo(ul);
	}
}

/**
 * 목록의 네비게이션 바를 표시한다.
 * 
 * @param pageMaker
 * @returns
 */
function displayPageNavigation2(pageMaker, sType, suffix){
	
	var prevPage = pageMaker.prevPage;
	var nextPage = pageMaker.nextPage;
	var currentPage = pageMaker.currentPage;
	var pageList = pageMaker.pageList;
	var currentPageNum = parseInt(pageMaker.currentPageNum);
	
	var ul = $('#searchResultPageNavi ul');
	ul.empty();
	
	if(prevPage != null){
		var li100 = $('<li></li>');
		li100.addClass('page-item');
		
		var link100 = $('<a class="page-link"></a>').attr('href', '#' ).
			html('PREV'+parseInt((pageMaker.currentPageNum > 100)?
						(pageMaker.currentPageNum - 100) : 1));
		link100.attr('onclick','searchSentence("'+sType+'",'
						+ parseInt((pageMaker.currentPageNum > 100)?
						(pageMaker.currentPageNum - 100) : 1)+',"'+suffix+'")');
		link100.appendTo(li100);
		li100.appendTo(ul);
		
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
			html('PREV'+parseInt(prevPage.pageNumber+1));
		link.attr('onclick','searchSentence("'+sType+'",'+parseInt(prevPage.pageNumber+1)+',"'+suffix+'")');
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
		link.attr('onclick','searchSentence("'+sType+'",'+parseInt(page.pageNumber+1)+',"'+suffix+'")');
		link.html(parseInt(page.pageNumber + 1));
		
		li.append(link);
		li.appendTo(ul);
	});
	
	if(nextPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchSentence("'+sType+'",'+parseInt(nextPage.pageNumber+1)+',"'+suffix+'")');
		
		link.appendTo(li);
		li.appendTo(ul);
		
		var li100 = $('<li></li>');
		li100.addClass('page-item');
		
		var link100 = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt((pageMaker.totalPageNum < pageMaker.currentPageNum + 100)?
						pageMaker.totalPageNum : (pageMaker.currentPageNum + 100)));
		link100.attr('onclick','searchSentence("'+sType+'",'
						+ parseInt((pageMaker.totalPageNum < pageMaker.currentPageNum + 100)?
						pageMaker.totalPageNum : (pageMaker.currentPageNum + 100))+',"'+suffix+'")');
		
		link100.appendTo(li100);
		li100.appendTo(ul);		
	}
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

//----------------------------------------
//	list_dictationtheme.html & 
//	search_dictationtheme.html
//----------------------------------------

/**
 * 검색된 목록의 내용(title 부분)을 클릭했을 때 상세보기 폼으로 복사
 */
function pickUpDictationThemeInfo(obj){
	var dictationThemeTr = obj.parent().parent();
	var dictationThemeNo = dictationThemeTr.children().first().next();
	var tid = dictationThemeNo.next();
	var appCode = tid.next();
	var title = appCode.next();
	var description = title.next();
	var themeType = description.next();
	var limit = themeType.next();
	var cutOffPoint = limit.next();
	var numOfQuestions = cutOffPoint.next();
	var regDate = numOfQuestions.next();
	 
	
	$('.dictationThemeDetailPart #tid').text(tid.text());	
	$('.dictationThemeDetailPart #appCode').val(appCode.text().trim());
	$('.dictationThemeDetailPart #title').val(title.text().trim());
	$('.dictationThemeDetailPart #description').val(description.text());
	$('.dictationThemeDetailPart #themeType').val(themeType.text().trim());
	$('.dictationThemeDetailPart #limit').val(limit.text());
	$('.dictationThemeDetailPart #cutOffPoint').val(cutOffPoint.text());
	$('.dictationThemeDetailPart #numOfQuestions').val(numOfQuestions.text());
	$('.dictationThemeDetailPart #regDate').text(regDate.text());
}

/**
 * 해당 테마의 딕테이션 목록 출력
 * list_dictationtheme.html에서 테마의 타이틀을 클릭하여 테마의 상세보기를 하는 경우 
 * 		$('.resultWrapper').on('click', '.dictationThemeDetail', function(e) 
 * 해당 테마에 담겨있는 dictationList를 출력함.
 * 
 * searchDictationList()에서 호출됨
 * 
 * dictationListTable안의 tbody, $('#dictationList') 안에 dictation내용을 채움.
 * 
 */
function displayDictationList(dictationList, currentPageNum, total){
	
	$('#dictationList').empty();
	
	var num=1;	
	var fetchSize = 10;
	
	$.each(dictationList, function(index, dictation){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		
		var tr = document.createElement("tr");
		tr.className = "contents";

		tr.innerHTML +=
		"<td>"+num+"</td>"
		+"<td>"+dictation.did+"</td>"
		+"<td class='text-left text-truncate'>"+dictation.sentence.eng+"</td>"
		+"<td class='text-left text-truncate'>"+dictation.sentence.kor+"</td>"
		+"<td>"+dictation.evaluation.testCount+"</td>"
		+"<td>"+dictation.evaluation.rightCount+"</td>"
		+"<td>"+dictation.evaluation.correctRate+"</td>"
		+"<td>"+dictation.regDate+"</td>"
		+"<td><i class=\"fas fa-trash-alt\" onclick=\"deleteDictation('"+dictation.did+"')\"></i></td>"
		$('#dictationList').append(tr);
		
	});
	$('[data-toggle="tooltip"]').tooltip();
}


/**
 * 목록의 네비게이션 바를 표시한다.
 * 
 * 페이지 리스트의 링크에 searchDictationTheme() onclick이벤트를 걸어줌.
 * searchDictationTheme()에서 호출
 * 
 * @param pageMaker
 * @returns
 */
function displayPageNavigationForDictationList(pageMaker, dictationThemeId){
	var prevPage = pageMaker.prevPage;
	var nextPage = pageMaker.nextPage;
	var currentPage = pageMaker.currentPage;
	var pageList = pageMaker.pageList;
	var currentPageNum = parseInt(pageMaker.currentPageNum);
	
	var ul = $('#dictationListPageNavi ul');
	ul.empty();
	
	if(prevPage != null){
		var li100 = $('<li></li>');
		li100.addClass('page-item');
		
		var link100 = $('<a class="page-link"></a>').attr('href', '#' ).
			html('PREV'+parseInt((pageMaker.currentPageNum > 100)?
						(pageMaker.currentPageNum - 100) : 1));
		link100.attr('onclick','searchDictationList("'+dictationThemeId+'",'
						+ parseInt((pageMaker.currentPageNum > 100)?
						(pageMaker.currentPageNum - 100) : 1)+')');
		link100.appendTo(li100);
		li100.appendTo(ul);		
		
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
			html('PREV'+parseInt(prevPage.pageNumber+1));
		link.attr('onclick','searchDictationList("'+dictationThemeId+'",'+parseInt(prevPage.pageNumber+1)+')');
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
		link.attr('onclick','searchDictationList("'+dictationThemeId+'",'+parseInt(page.pageNumber+1)+')');
		link.html(parseInt(page.pageNumber + 1));
		
		li.append(link);
		li.appendTo(ul);
	});
	
	if(nextPage != null){
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchDictationList("'+dictationThemeId+'",'+parseInt(nextPage.pageNumber+1)+')');
		
		link.appendTo(li);
		li.appendTo(ul);
		
		var li100 = $('<li></li>');
		li100.addClass('page-item');
		
		var link100 = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt((pageMaker.totalPageNum < pageMaker.currentPageNum + 100)?
						pageMaker.totalPageNum : (pageMaker.currentPageNum + 100)));
		link100.attr('onclick','searchDictationList("'+dictationThemeId+'",'
						+ parseInt((pageMaker.totalPageNum < pageMaker.currentPageNum + 100)?
						pageMaker.totalPageNum : (pageMaker.currentPageNum + 100))+')');
		
		link100.appendTo(li100);
		li100.appendTo(ul);				
	}
}



//----------------------------------------
//			list_dictationTheme.html
//----------------------------------------
/**
 * 해당 테마의 딕테이션 목록 출력
 * list_dictationtheme.html에서 테마의 타이틀을 클릭하여 테마의 상세보기를 하는 경우 
 *       $('.resultWrapper').on('click', '.dictationThemeDetail', function(e) 
 *       안에서 searchDictationList($('#tid').text(), 1);를 호출.
 * 
 * 해당 테마에 담겨있는 dictationList를 출력함.
 * 
 */
function searchDictationList(dictationThemeId, page){

	if(page==undefined){
		page = 1;
	}
	
	$.ajax({
		type: "GET", 
		url : '/admin/dictationBook/dictation/list/' + dictationThemeId,
		data : {
			page : page,
			size : 10
		},
		success : function(pageMaker){ 
			console.log('pageMaker' + pageMaker);
			var dictationPage = pageMaker.result;
			
			displayDictationList(dictationPage.content, pageMaker.currentPageNum, dictationPage.totalElements);
			displayPageNavigationForDictationList(pageMaker, dictationThemeId);
		},
		error : function (e) {
			$('#successDiv').hide();
			
			$('#errorDiv').css("display",'inline');
			$('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
	});
}

function clearWhiteElement(elem){
    elem = elem || document;
   
    //alert("elem="+elem);
    
    var childs = elem;//elem.childNodes;
    var length = childs.length;
    //alert("length="+length);
    
    for (var i = 0; i < length; i++){
        var child = childs[i];
        if (child) {
        	 //alert("child="+child);
            if (child.nodeType === 3 && !/\S/.test(child.nodeValue)){
                elem.removeChild(child);
            }
            else if(child.nodeType === 1) {
                clearWhiteElement(child);
            }
        }
        else{
            var n = next(elem);
            if (n) clearWhiteElement(n);
        }
    }
}

function next(elem){
    do{
        elem = elem.nextSibling;
    }
    while(elem && elem.nodeType !== 1)
    return elem;
}

var removeWhiteSpaceNodes = function ( parent ) {
	var nodes = parent.childNodes;
	console.log("target parent="+parent+ ", test nodes="+nodes+", lengh="+nodes.length);

    for( var i =0, l = nodes.length; i < l; i++ ){
      if( nodes[i] && nodes[i].nodeType == 3 && !/\S/.test( nodes[i].nodeValue ) ){
        parent.replaceChild( document.createTextNode(''), nodes[i]  );
      }else if( nodes[i] ){
        removeWhiteSpaceNodes( nodes[i] );
      }
    }
    return parent;
  }


jQuery.fn.htmlClean = function() {
    this.contents().filter(function() {
        if (this.nodeType != 3) {
            $(this).htmlClean();
            return false;
        }
        else {
            this.textContent = $.trim(this.textContent);
            return !/\S/.test(this.nodeValue);
        }
    }).remove();
    return this;
}

/**
 * list_dictationtheme.html에서 테마를 체크하여 선택.
 * 선택한 테마를 가지고 add_dictation.html로 이동
 * 선택한 테마에 문제들을 담게하기 위함.
 * 
 * dictationThemeChkboxList로 관리자가 어떤 테마를 선택했는지 알아내고
 * dictationThemeList로 sessionStorage에 저장함.
 * 
 * list_dictationtheme.html
 * <form id='goToAddDictationForm' th:action="@{/admin/dictationBook/dictation/add}" method="get">
 * 		<button id="goToAddDictation" type="button">딕테이션(문제) 등록하기</button>
 * 
 * 
 * @param dictationThemeChkboxList
 * @param form
 * @returns
 */
function saveTargetThemes(dictationThemeChkboxList){
	
	var dictationThemeList = new Array();
	$.each(dictationThemeChkboxList, function(index, dictationThemeId){
		
		var dictationThemeTr = $(dictationThemeId).parent();
		var tid = dictationThemeTr.next().next();
		var appCode = tid.next();
		var title = appCode.next();
		var limit = title.next();
		var numOfQuestions = limit.next();
		var regDate = numOfQuestions.next();
		
		var dictationTheme = {
				tid : tid.text(),
				appCode : appCode.text(),
				title : title.text().trim(),
				limit : limit.text(),
				numOfQuestions : numOfQuestions.text(),
				regDate : regDate.text()
		   };
		
		dictationThemeList[index] = dictationTheme;
	});

	sessionStorage.setItem("dictationThemeList", JSON.stringify(dictationThemeList));
}


/**
 * add_dictation.html의 $(document).ready에서 호출함.
 * list_dictationtheme에서 선택하여 넘어온 dictationThemeList로 화면을 구성함.
 * 
 * 2개가 선택한 테마에 맞게 동적으로 생성되어야함.
 *	1. 테이블의 헤더에서 선택한 테마들의 타이틀 
 * 	2. 테이블 바디에서 한 문장 tr별로 체크박스 부분
 * 
 * 
 * 
 * 
 * @param dictationThemeList
 * @returns
 */
function displayAddDictationTable(dictationThemeList){

	
	var theadTagString = ''
	var num=1;	
	var fetchSize = 10;
	
	var tbodyTagString = '';
	$('#sentenceListDiv thead').children("tr").children("th").remove();
	//--------------------------------------------------------------------------
	//sentenceListDiv안 테이블의 thead부분에서
	// 선택한 dictationThem숫자에 맞게 th를 동적으로 생성함.
	theadTagString += '<th style="width: 70px;"><a href="javascript:void(0)" class="thlink">번호</a></th>';
	theadTagString += '<th style="width: 70px;"><a href="javascript:void(0)" class="thlink" data-value="sid">SID</a><span class="sortMark">▼</span></th>';
	theadTagString += '<th><a href="javascript:void(0)" class="thlink" data-value="eng">영어</a><span class="sortMark">▼</span></th>';
	theadTagString += '<th style="width: 100px;">출처</th>';

	// 헤더쪽
	$.each(dictationThemeList, function(index, dictationTheme){
		theadTagString += '<th style="width: 80px;" class = "text-truncate" data-tid= "'+dictationTheme.tid+'">'
			+ '<a href="javascript:void(0)" class="dictationThemeDetail">' + dictationTheme.title + '</a><br>'
			+'<input type="checkbox" class="theme-checkbox" name="themeChk" value="'+dictationTheme.tid+'"></th>';

		$('#sentenceListDiv .thead').append(theadTagString);
		theadTagString =''; 
	});
	//--------------------------------------------------------------------------
	 
	
	//-------------------------------------------------------------------------- 
	// sentenceListDiv안 테이블의 tbody부분에서 
	// 선택한 dicatationTheme에 맞게 체크박스를 동적으로 만들어주는 부분
	var sentenceList = $('#sentenceListDiv tbody > tr');
	//$('#sentenceListDiv tbody > tr').children('td').remove();
	$.each(sentenceList, function(index, sentence){
		//$(sentence).remove(); 
		$.each(dictationThemeList, function(index, dictationTheme){
			tbodyTagString += '<td style="width: 100px; vertical-align: middle;">'
				+ '<label><input type="checkbox" class="dictation-checkbox" name="chkList" value="'+dictationTheme.tid+'">'
				+ '<span class="checkbox-icon"></span></label></td>';
			
			$(sentence).append(tbodyTagString);
			tbodyTagString =''; 
		});
	});
	//--------------------------------------------------------------------------
}

/**
 * add_dictation.html에서 비동기적으로 검색을 통해 가져온 센텐스 목록을 출력함.
 *
 * add_dictation.html에서 incl된
 * 	th:insert="~{/admin/dictationBook/incl/search_sentence::search_sentence}"에서 
 * 	dictationbook.js의 searchSentence()를 호출
 * 
 * searchSentence()안에서 displayAddDictationTable2()를 호출함.
 * 
 * 
 * @param dictationThemeList
 * @returns
 */
function displayAddDictationTable2(sentenceList, currentPageNum, total, suffix, dictationThemeList){

	var theadTagString = ''
	var num=1;	
	var fetchSize = 10;
	
	var tbodyTagString = '';

	$('#searchResultTable_'+suffix+' thead > tr').children("th").remove();
	//--------------------------------------------------------------------------
	//sentenceListDiv안 테이블의 thead부분에서
	// 선택한 dictationThem숫자에 맞게 th를 동적으로 생성함.
	theadTagString += '<th style="width: 70px;"><a href="javascript:void(0)" class="thlink">번호</a></th>';
	theadTagString += '<th style="width: 70px;"><a href="javascript:void(0)" class="thlink" data-value="sid">SID</a><span class="sortMark">▼</span></th>';
	theadTagString += '<th><a href="javascript:void(0)" class="thlink" data-value="eng">영어</a><span class="sortMark">▼</span></th>';
	theadTagString += '<th style="width: 100px;">출처</th>';
	
	// 헤더쪽 
	$.each(dictationThemeList, function(index, dictationTheme){
		theadTagString += '<th style="width: 80px;" class = "text-truncate" data-tid= "'+dictationTheme.tid+'">'
			+ '<a href="javascript:void(0)" class="dictationThemeDetail">' + dictationTheme.title + '</a><br>'
			+' <input type="checkbox" class="theme-checkbox" name="themeChk" value="'+dictationTheme.tid+'"></th>';

		$('#searchResultTable_'+suffix+' thead > tr').append(theadTagString);
		theadTagString =''; 
	});
	//--------------------------------------------------------------------------
	 
	//--------------------------------------------------------------------------
	// sentenceListDiv안 테이블의 tbody부분에서 
	// 선택한 dicatationTheme에 맞게 체크박스를 동적으로 만들어주는 부분
	var num=1;	
	//var sentenceTrList = $('#searchResultTable_'+suffix+' tbody > tr');
	var sentenceTrList = $('#searchResultTable_'+suffix+' tbody');
	
	$('#searchResultTable_'+suffix+' tbody').children("tr").remove();
	//$('#sentenceListDiv tbody > tr').children('td').remove();
	$.each(sentenceList, function(index, sentence){
		//$(sentence).remove();
		num = (total-index)-(currentPageNum-1)*fetchSize;
		
		tbodyTagString += '<tr>';
		tbodyTagString += '<td>'+num+'</td>';
		tbodyTagString += '<td>'+sentence.sid+'</td>';
		tbodyTagString += '<td class="text-left">'+sentence.eng
								+'<br>'+sentence.kor+'</td>';
		tbodyTagString += '<td>'+sentence.source+'</td>';
		 
		$.each(dictationThemeList, function(index, dictationTheme){
			
			tbodyTagString += '<td style="width: 100px;">'
				+ '<label><input type="checkbox" class="dictation-checkbox" name="chkList" value="'+dictationTheme.tid+'">'
				+ '<span class="checkbox-icon"></span></label></td>';
			
		});
		tbodyTagString += '</tr>';
		$('#searchResultTable_'+suffix+' tbody').append(tbodyTagString);
		tbodyTagString =''; 
	});
	//--------------------------------------------------------------------------
}

/**
 * add_dictation.html에서 $('#addDictation').click()으로 호출함.
 * 
 * 테이블에서 체크된 체크박스 항목(dictationThemeId)을 전달받아
 * 체크된 곳의 sentenceId를 알아냄.
 * 
 * 테마id와 센텐스id정보를 담은 Dictation객체들 만들고
 * /admin/dictationBook/dictation/add 로
 * dictationPack이라는 커멘드에 dictationList를 담아서 전송함.
 * 
 * @param dictationCheckedList
 * @returns
 */
function addDictation(dictationCheckedList){
	
	 var dictationPack = {}; 
	 $.each(dictationCheckedList, function(index, dictationChecked) {
	 	var sentenceId = $(dictationChecked).closest("tr")
	 								.children().first().next().text();
	 	var dictationThemeId = dictationChecked.value;

		 dictationPack['dictationList[' + index +'].theme.tid'] = dictationThemeId;
		 dictationPack['dictationList[' + index +'].sentence.sid'] = sentenceId;  
	 });
	 
	 $.ajax({
			type: "POST", 
			url : '/admin/dictationBook/dictation/add',
			data : dictationPack, 
			success : function(result){ 
				$('#errorDiv').hide();
				
				alert("success");

	            console.log("SUCCESS : ", result);
	            
	            //체크박스 모두 해제
	            $(":checkbox").prop('checked', false);
			},
			error : function (e) {
				$('#successDiv').hide();
				
				$('#errorDiv').css("display",'inline');
				$('#errorDiv > pre').text(e.responseText);

	            console.log("ERROR : ", e);
	        }
		});
}

/**
 * list_dictationtheme.html에서 테마 상세보기 클릭시
 * displayDictationList()를 호출해 해당 테마에 등록된 문제 목록들을 보여줌.
 * 
 * displayDictationList()에서 문제에 대한 내용을 동적으로 테이블을 생성할때
 * "<td><i class=\"fas fa-trash-alt\" onclick=\"deleteDictation('"+dictation.did+"')\"></i></td>"
 * 로 온클릭 이벤트를 걸어줌
 * 
 * 
 * @param dictationId
 * @returns
 */
function deleteDictation(dictationId){
	
	var deleteConfirm = confirm('DID '+dictationId + ' 삭제');
	
	if(deleteConfirm == true){
		$.ajax({
			type: "POST", 
			url : '/admin/dictationBook/dictation/del/' + dictationId,
			success : function(dictationThemeId){ 
				
				$('#errorDiv').hide();
				
				$('#successDiv').css("display",'inline');
				$('#successDiv > pre').text('SUCCESS');
				searchDictationList(dictationThemeId, 1);

	            console.log("SUCCESS : ", dictationId);
			},
			error : function (e) {
				$('#successDiv').hide();
				
				$('#errorDiv').css("display",'inline');
				$('#errorDiv > pre').text(e.responseText);

	            console.log("ERROR : ", e);
	        }
		});
	}
}

/**
 * list_dictationtheme.html의 '#editDictationThemeBtn'.click()으로 호출됨.
 * 
 * 
 * @param dictationThemeId
 * @returns
 */
function updateDictationTheme(dictationThemeId){
	
   var params = $("#editDictationThemeForm").serialize();
 
   $.ajax({
      type: "POST", 
      url : '/admin/dictationBook/theme/edit/' + dictationThemeId,
      data:params,
      success : function(dictationTheme){ 
         
         $('#errorDiv').hide();
         
         $('#eidtDictationThemeFormContainer .successBtn').show();
         
         $('.dictationThemeDetailPart #tid').text(dictationTheme.tid);   
         $('.dictationThemeDetailPart #appCode').val(dictationTheme.appCode);
         $('.dictationThemeDetailPart #title').val(dictationTheme.title);
         $('.dictationThemeDetailPart #description').val(dictationTheme.description);
         $('.dictationThemeDetailPart #themeType').text(dictationTheme.themeType);   
         $('.dictationThemeDetailPart #limit').val(dictationTheme.limit);
         $('.dictationThemeDetailPart #cutOffPoint').val(dictationTheme.cutOffPoint);
         $('.dictationThemeDetailPart #numOfQuestions').val(dictationTheme.numOfQuestions);
         $('.dictationThemeDetailPart #regDate').text(dictationTheme.regDate);
         
         
      },
      error : function (e) {
         $('#successDiv').hide();
         
         $('#errorDiv').css("display",'inline');
         $('#errorDiv > pre').text(e.responseText);

            console.log("ERROR : ", e);
        }
   });
}
/*------------------------------------------------------------------------------
 * 				        play_dictation_book.html
 -----------------------------------------------------------------------------*/
var dictationList;
var audioList = null;			//현재 문장에서 재생할 Audio 리스트
var totalDictationNum;			// 현재 테스트의 전체 문장 갯수
var currentDictationIndex = 0;	// 테스트 내에서 현재 학습 중인 문제의 인덱스.
var studyOverCount = 0;			// 푼 문제의 갯수
var correctCount = 0;

var currentAudio;
var currentVoiceIndex = 0;		//현재 센텐스 보이스들의 인덱스.
var currentVoiceActor;			//현재 재생되는 보이스(액터정보를 위해)
var playCount = 0;				//오디오  재생 횟수
var isRepeat = false; 			//현재 센텐스 무한 반복 지정 , false일경우 loopSize만큼 반복 후 다음 센텐스로 이동
var loopSize = 3;				//오디오 반복 재생 지정 횟수
var timer;						//재생 간격을 처리하기 위해 쓰는 타이머 객체
var voiceResourcePath="/resource/voice/";		// 오디오 파일이 저장된 prefix 경로
/**
 * 기능: 이미 파싱된 JSON Object인 dictationList를 재파싱하여 전역변수로 저장한다.
 * 호출위치: view_dictation_book.html > $(document).ready();
 * 
 * JSON은 내부요소에 Date가 있을 경우 파싱하지 못하기 때문에 문자열로 변환후 다시 JSON으로 변환
 */
function parseDictationList(dl){
	dictationList = JSON.parse(JSON.stringify(dl));
};

/**
 * 기능: 현재 시험의 총 문제 수를 전역변수로써 저장하고 첫 문제를 재생하기 위한 설정을 한다.
 * 호출위치: view_dictation_book.html > $(document).ready();
 * 
 * 현재 시험의 총 문제 수는 상단 진행바의 움직임 제어, 다음 문제로 넘어갈 때의 분기 제어변수로 사용.
 * JSON으로 저장된 dictationList 첫 문제를 재생 준비 설정.
 */
function initCurrentTest(dictationList){
	totalDictationNum = dictationList.length;
	
	//현재 센텐스의 보이스 파일과 성우 사진을 저장한다.
	initDictation();
	
};

/**
 * 기능: 현재 재생할 Audio의 소스를 진행 중인 문제의 소스로 변경하고 성우를 변경한다.
 * 호출위치: 1. dictationbook.js > function initCurrentTest()
 * 		  2. view_dictation_book.html > $("#answerFrm").submit()
 * 
 * JSON으로 저장된 dictation 내의 센텐스 음성의 파일경로값을 토대로 
 * 음성파일을 미리 불러와서 이벤트 등록을 하고 성우 사진을 표시하기 위한 정보 세팅.
 */
function initDictation(){
	//console.log("[Count] "+playCount+", "+currentSentenceIndex);
	clearTimeout(timer);
	
	//초기화
	audioList = [], voiceActorList = [];
	playCount = 0;
	var nextAudio;
	var voice = nextDictation(currentDictationIndex).sentence.voiceList[0];
	nextAudio = new Audio();
	nextAudio.preload = 'none';
	nextAudio.onerror = function(){
		nextAudio.src = voiceResourcePath + voice.path + '?v=' + Math.random();
		nextAudio.load();
		if(currentAudio != undefined){
			currentAudio.src = nextAudio.src;
		}else{
			currentAudio = nextAudio;
		}
	}
	nextAudio.src = voiceResourcePath + voice.path;
	nextAudio.load();				//for Safari
	if(currentAudio != undefined){
		currentAudio.src = nextAudio.src;
	}else{
		currentAudio = nextAudio;
	}
	currentVoiceActor = voice;
	nextVoice();
};

/**
 * 기능: 테스트를 구성하는 문제 중에서 dictationIndex번째 문제를 리턴한다.
 * 호출위치: dictationbook.js > function initDictation()
 *        
 * 곧바로 dictationList에서 인덱싱하여 dictation을 고를 수 있지만
 * dictation이 제대로 지정되었을 때만 반환하도록 함.
 * @param dictationIndex
 * @returns
 */
function nextDictation(dictationIndex){
	var dictation = dictationList[dictationIndex];
	
	if(dictation != undefined){
		return dictation;
	}
};


/**
 * 기능: currentAudio에 오디오 종료 이벤트리스너를 등록한다.
 * 호출위치: dictationbook.js > function initDictation()
 * 
 * addEventListener 내용이 복잡하기 때문에 이벤트리스너를 등록하는 함수와 분리하여
 * currentAudio가 유효할 때만 이벤트리스너를 실행하도록 함
 */
function nextVoice(){
	//console.log("currentAudio i: "+random);
	if(currentAudio){
		//console.log("nextVoice()="+currentAudio.src.slice(-7));
		addEndAudioEvent();
	}else{
		console.log("nextVoice() : problem occurred");
	}
	
	return currentAudio;
};



/**
 * 기능: 하나의 오디오 파일 재생이 끝날때 수행할 이벤트를 정의한다.
 * 		재생중인 오디오 파일을 2.5초 간격으로 loopSize만큼 반복 재생.
 * 호출위치: dictationbook.js > function nextVoice(), addEndAudioEvent()
 * 
 * 오디오 재생이 끝나면 몇 회 동안 다시 이벤트를 반복시키면서
 * 이전 이벤트와는 중복이 되지 않도록 처리 필요.
 */
function addEndAudioEvent(){
	// 이전의 ended 이벤트 리스너를 모두 삭제한다.
	currentAudio.removeEventListener('ended', setNextPlay);
	// ended 이벤트 리스너를 새로 할당.
	currentAudio.addEventListener('ended', setNextPlay);
};
function setNextPlay() {
	currentAudio.pause();
	playCount++;
	// 재생 횟수가 다 차면 재생제어 버튼들 사라짐
	if(typeof hidePlayButtons == "function" && (playCount >= loopSize)){
		hidePlayButtons();
	}
	if(typeof toggleAnimate == "function"){
		toggleAnimate(false);
	}
	clearTimeout(timer);
	if(loopSize == 0 || playCount < (loopSize)){
		timer = setTimeout(function() {
			addEndAudioEvent();
			playAudio();
		}, 1500);
	}
}

/**
 * 기능: currentAudio를 재생한다.
 * 호출위치: 1. view_dictation_book.html > $("#popMenu_modal").hidden(), 
 * 									    $("#play").click(), 
 * 									    $("#answerFrm").submit()
 *        2. dictationbook.js > function addEndAudioEvent()
 * 
 * 여러 곳에서 불리면서 음성 재생, 성우사진 표시함수 호출, 음성 재생 아이콘 표시를 한 번에 처리
 * @returns
 */
function playAudio() {
	if(currentAudio){
		//두 개이상의 오디오가 동시에 재생되는 것을 방지를 위해 
		//타겟 오디오 재생을 위해 항상 현재 재생되고 있는 것이 있다면 중지시킨다.
		if(!currentAudio.pause){
			currentAudio.pause();
		}
		if(typeof displayVoiceActorInfo === "function"){
			displayVoiceActorInfo();
		}
		currentAudio.addEventListener('canplaythrough', currentAudio.play());
		if(typeof toggleAnimate === "function"){
			toggleAnimate(true);
		}
		
	}else{
		console.log("can't play the audio.");
	}
};
/**
 * currentAudio 일시 정지
 * @returns
 */
function stopAudio() {
	clearTimeout(timer);
	if (currentAudio && !currentAudio.paused && !currentAudio.ended
			&& currentAudio.readyState > 2) {
		currentAudio.pause();
		//currentAudio.currentTime = 0;
	}
};



/*------------------------------------------------------------------------------
 *					test_result.html 
 *----------------------------------------------------------------------------*/

/**
 * 기능: dictationList에 들어있는 보이스파일들을 모두 한 번에 로드하여 배열에 저장
 * 호출위치: test_result.html > $(document).ready();
 * 
 * 보이스를 하나씩 들을 때 마다 서버를 호출하지 않도록 미리 다운로드하여 저장
 * @returns
 */
function initVoices() {
	audioList = [];
	voiceActorList = [];
	var sentenceAudio;
	dictationList.forEach(function(dictation, i, array) {
		sentenceAudio = new Audio(voiceResourcePath + dictation.sentence.voiceList[0].path);
		sentenceAudio.load();				//for Safari
		
		//nextAudio = preloadAudio(voiceResourcePath + voice.path);
		audioList.push(sentenceAudio);
		voiceActorList.push(dictation.sentence.voiceList[0]);
	});
};

/*------------------------------------------------------------------------------
 *							mypage.html
 *----------------------------------------------------------------------------*/

/**
 * 기능: 회원의 해당 테마 시험 기록을 불러온다.
 * 호출위치: mypage.html > 테마 div 클릭
 * 		($(document).ready() > $(document).on("click","theme-info-cover") )
 * 
 * 테스트 내역을 동적으로 불러오기 위한 ajax 요청은 js 파일로 분리하고
 * 불러온 테스트 내역은 다시 html상의 함수(successGetMyTestHistory)를 호출하여 표시
 * @param obj
 * @returns
 */
function getMyTestHistory(obj) {
	$.ajax({
		type: "GET",
		url: "/dictationBook/mypage/test/list/" + obj.themeId,
		success: function(testHistory){
			
			//--------------------------------------------
			successGetMyTestHistory(testHistory, obj.div);
			//--------------------------------------------
		},
		error: function(xhr){
			switch(xhr.status){
				case 401:
				case 403:
				case 405:
					confirm('로그인 정보가 없거나 만료되었습니다. 확인/취소를 누르면 로그인 페이지로 이동합니다.');
					location.href = '/auth/login?destPage=' + location.pathname;
					break;
				default:
					alert('정보를 가져오지 못 했습니다. 오류가 반복되면 문의를 남겨 주세요');	
			}
		}
	});
}; 
/**
 * 기능: 회원의 다음 페이지 응시 테마 리스트를 불러온다.
 * 호출위치: mypage.html > 테마 리스트의 네비게이션 바 클릭
 * 		( $(document).ready() > $(document).on("click", ".my-test-info-page a") )
 * 
 * 테마 리스트를 동적으로 불러오기 위한 ajax 요청은 js파일로 분리하고
 * 불러온 테마 리스트는 다시 html상의 함수(successGetMyTestThemes)를 호출하여 화면 표시
 * @param obj
 * @returns
 */
function getMyTestThemes(obj) {
	var pathVariables = obj.themeType + "/" + obj.page;
	$.ajax({
		type: "GET",
		url: "/dictationBook/mypage/" + pathVariables,
		success: function(pageMaker){
			//-----------------------------------------
			successGetMyTestThemes(pageMaker, obj.div);
			//-----------------------------------------
		},
		error: function(xhr){
			switch(xhr.status){
				case 401:
				case 403:
				case 405:
					confirm('로그인 정보가 없거나 만료되었습니다. 확인/취소를 누르면 로그인 페이지로 이동합니다.');
					location.href = '/auth/login?destPage=' + location.pathname;
					break;
				default:
					alert('정보를 가져오지 못 했습니다. 오류가 반복되면 문의를 남겨 주세요');	
			}
		}
	});	
};

/**
 * 기능: 한 테마 내에서 회원의 순위를 불러온다.
 * 호출위치: mypage.html > 시험 내역 내의 '나의 랭킹(%) 보기' 버튼 클릭
 * 		( $(document).ready() > $(document).on("click", ".view-my-rank") )
 * 
 * 테마 내 회원의 순위를 동적으로  불러오기 위한 ajax 요청은 js파일로 분리하고
 * 불러온 순위정보는 다시 html상의 함수(successGetMyRanking)를 호출하여 화면 표시
 * @param obj
 * @returns
 */
function getMyRanking(obj) {
	$.ajax({
		type: "GET",
		url: "/dictationBook/mypage/test/ranking/" + obj.themeId,
		success: function(ranking){
			//------------------------------------
			successGetMyRanking(ranking, obj.div);
			//------------------------------------
		},
		error: function(xhr){
			switch(xhr.status){
				case 401:
				case 403:
				case 405:
					confirm('로그인 정보가 없거나 만료되었습니다. 확인/취소를 누르면 로그인 페이지로 이동합니다.');
					location.href = '/auth/login?destPage=' + location.pathname;
					break;
				default:
					alert('정보를 가져오지 못 했습니다. 오류가 반복되면 문의를 남겨 주세요');	
			}
		}
	});
};

/**
 * 기능: 한 테마 내에서 회원이 틀린 문제 리스트를 불러온다.
 * 호출위치: mypage.html > 시험 내역 내의 '내가 틀린 문장들 보기' 버튼 클릭
 * 		( $(document).ready() > $(document).on("click", ".view-my-wrong") ) 
 * 
 * 테마 내 틀린 문제 리스트를 동적으로 불러오기 위한 ajax 요청은 js파일로 분리하고
 * 불러온 틀린 문제 리스트는 다시 html 상의 함수(successGetMyWrongDictationList)를 호출하여 표시
 * @param obj
 * @returns
 */
function getMyWrongDictationList(obj) {
	var pathVariables = obj.themeId + "/" + obj.page;
	$.ajax({
		type: "GET",
		url: "/dictationBook/mypage/test/incorrect/" + pathVariables,
		success: function(pageMaker){
			
			//------------------------------------
			successGetMyWrongDictationList(pageMaker, obj.div);
			//------------------------------------
		},
		error: function(xhr){
			switch(xhr.status){
				case 401:
				case 403:
				case 405:
					confirm('로그인 정보가 없거나 만료되었습니다. 확인/취소를 누르면 로그인 페이지로 이동합니다.');
					location.href = '/auth/login?destPage=' + location.pathname;
					break;
				default:
					alert('정보를 가져오지 못 했습니다. 오류가 반복되면 문의를 남겨 주세요');	
			}
		}
	});	
};