/** 
 * 검색폼을 통한 검색 전송시 ajax 를 통해 결과 목록을 PageMaker:json로 전달받는다.
 * 	전송방식은 세가지 사용자 인터페이스를 갖는다.
 * 	1. 검색버튼을 이용한 최초 전송과 그 이후 
 * 	2. 목록 페이지를 선택하여 전송
 * 	3. 테이블에서 컬럼 정렬을 선택하여 전송
*/
function searchSentence(searchType, page, suffix){
	//alert("searchSentence....in jungleBook.js");
	//alert("Search...\nsearchType1="+searchType+", searchType2="+$('#searchType').val()+", sortName="+$('#sortName').val()+", page="+page);
	//alert("suffix="+suffix);
	
	if(page==undefined){
		page = 1;
	}
	
	var sType = searchType;
	if(sType==undefined){
		sType=$('#searchFormHidden_'+suffix+' #searchType').val();
	}
	
	//alert("asc="+$('#searchFormHidden_'+suffix+' #asc').val());
	//alert("Search...\nsearchType1="+sType+", sortName="+$('#sortName').val()+ ", asc="+$('#asc').val()+", page="+page+", suffix="+suffix);
	console.log('page ' + page);
	console.log('sType ' + sType);
	console.log('keyword ' + $('#keyword').val().trim());
	var keyword =  $('#keyword').val().trim();
	if(sType == 'appCode'){ 
		keyword = $('#appCodeDiv #keyword').val().trim();
	}
	
	
	
	$.getJSON({
		//type: "GET", 
		url : '/admin/jungleBook/' + suffix,
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
			if(suffix == 'statistics'){
				displayStatisticsList(searchType, page.content, result.currentPageNum, page.totalElements, suffix);	
			}else{
				displaySentenceList(page.content, result.currentPageNum, page.totalElements, suffix);		
			}
			displayPageNavigation(result, sType, suffix);

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
 * 통계폼을 통한 통계 전송시 ajax 를 통해 결과 목록을 json으로 전달받는다.
*/
function statsJungleSentence(type){
	
	if(type == 'groupByTopMember'){
		var size =  $('#size').val(); 
	} 
	
	$.getJSON({
		type: "POST", 
		url : '/admin/jungleBook/stats',
		data : {
			searchType : type,
			//keyword : keyword, 
			size : size, 
			fromDate : $('#fromDate').val(),
			toDate : $('#toDate').val(),
		},
		success : function(result){
			//resetDefault();
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
 *  id = type'Box'형식으로 ex) #newSentenceBox, #memberCountOnAddBox
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
	if(type == 'newSentence' || type == 'memberCountOnAdd'){
		$('#'+ type + 'Box div span').eq(0).empty(); 
		$('#'+ type + 'Box div span').eq(0).text(result);
		
	}
	else if(type == 'groupByRoleName'){
		
		$.each(result, function(index, stats){
			// 각 등급별 출력위치가 지정되어있으므로 List로 받은 result를 등급에 맞게 count값을 넣어줘야함.
			// #groupByRolNameBox > div #SilverCount 와 같은 식으로 값을 넣어줌.
			$('#'+ type + 'Box div #' + stats.roleName + 'Count').empty(); 
			$('#'+ type + 'Box div #' + stats.roleName + 'Count')
															.text(stats.count);
		});
	}
	
	else{
		
		
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
			if(type == 'groupByTopMember'){
				output += '<td>'+stats.personacon.alias+'</td>';
				output += '<td>'+stats.personacon.memberType+'</td>';
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

/**
 * 센텐스 목록에서 테이블 헤더를 통한 컬럼 정렬을 수행할 경우 ajax를 통해 전송받은
 * 센텐스 목록을 출력한다.
 * 
 * @param sentenceList
 * @param currentPageNum
 * @param total
 * @returns
 */
//ajax로 전송한 요청에 대한 결과셋 테이블 표시

function displaySentenceList(sentenceList, currentPageNum, total, suffix){
	
	$('#searchResultTable_'+suffix).children('tbody').children("tr").remove();
	//alert("suffix="+suffix);
	//alert("sentenceList="+sentenceList);
	//$('#searchResultTable_'+suffix).css('background', 'red');
	
	var page = $("#page").val();
	var output = ''
	var num=1;	
	var fetchSize = 20;//$('#h_size').val();
	$.each(sentenceList, function(index, sentence){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		//index++;
		var regDate = new Date(sentence.regDate);
		output += '<tr>';
		/* output += '<td>'+parseInt(index+(currentPageNum-1)* 20)+'</td>'; */
		output += '<td>'+num+'</td>';
		output += '<td>'+sentence.jid+'</td>'; 
		output += '<td class="text-left"><a href="javascript:void(0)" class="sentenceDetail">'
					+sentence.eng;
		output += '<input type="hidden" value="'+sentence.kor+'"/></td>';
		output += '<td class="text-left" >'+sentence.kor+'</td>';
		output += '<td>'+sentence.added +'</td>';
		
		$('#searchSentenceDiv #appCodeDiv').find("option").each(function(i,opt){
			if($(opt).val() == sentence.appCode){ 
				output += '<td>'+$(opt).text() +'<br>' + $(opt).val() +'</td>';
			}
		}); 
		output += '<td>'+regDate.getFullYear()+"-"
				+parseInt(regDate.getMonth() +1)+"-"+regDate.getDate()+'</td>';
		output += '</tr>';
		$('#searchResultTable_'+suffix+' > tbody:last').append(output)
		output =''; 
	});
}


/**
 * 센텐스 목록에서 테이블 헤더를 통한 컬럼 정렬을 수행할 경우 ajax를 통해 전송받은
 * 센텐스 목록을 출력한다.
 * 
 * @param sentenceList
 * @param currentPageNum
 * @param total
 * @returns
 */
//ajax로 전송한 요청에 대한 결과셋 테이블 표시

function displayStatisticsList(searchType, statisticsList, currentPageNum, total, suffix){
	
	$('#searchResultTable_'+suffix).children('tbody').children("tr").remove();
	//alert("suffix="+suffix);
	//alert("sentenceList="+sentenceList);
	//$('#searchResultTable_'+suffix).css('background', 'red');
	
	var page = $("#page").val();
	var output = ''
	var num=1;	
	var fetchSize = 20;//$('#h_size').val();
	
	var datedisPlayCode;
	
	$.each(statisticsList, function(index, statistics){
		//num = (total-index)-(currentPageNum-1)*fetchSize;
		num = (index+1)+(currentPageNum-1)*fetchSize;
		//index++;
		var regDate = new Date(statistics.regDate);
		output += '<tr>';
		output += '<td>'+num+'</td>';
		
		
		if(searchType == 'D'){
			datedisPlayCode = '<td>'+regDate.getFullYear()+"-"+parseInt(regDate.getMonth() +1)+"-"+regDate.getDate()+'</td>';
		}else if(searchType == 'M'){
			
			datedisPlayCode = '<td>'+regDate.getFullYear()+"-"+parseInt(regDate.getMonth() +1)+'</td>';
		}
		output += datedisPlayCode;
		
		output += '<td>'+statistics.count + '</td>';
		output += '<td>'+statistics.appName +'</td>';
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
		//ul.add('li').addClass('page-item');
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
		//ul.add('li').addClass('page-item');
		var li = $('<li></li>');
		li.addClass('page-item');
		
		var link = $('<a class="page-link"></a>').attr('href', '#' ).
		html('NEXT'+parseInt(nextPage.pageNumber+1));
		link.attr('onclick','searchSentence("'+sType+'",'+parseInt(nextPage.pageNumber+1)+',"'+suffix+'")');
		
		link.appendTo(li);
		li.appendTo(ul);
	}
}




//논리적 위치 : src=/resource/voicebook/2018/10/10/xxx.mp3


var audio;
function playVoice(vpath, play){
	play.style.display='none';
	var stop = play.nextElementSibling;
	stop.style.display='inline';

	try {
		audio = new Audio(vpath);
		var i=3;
		var timeout;
		audio.addEventListener('ended',function(){
			//audio.currentTime=0;
			clearTimeout(timeout);
			timeout=setTimeout(function() {
				if(i > 1){
					i--;
					audio.play();
					if(i==1){
						play.style.display='inline';
						stop.style.display='none';
					}
				}			
			}, 20)
			
		});
		
		audio.play();
	} catch (e) {
		// TODO: handle exception
		alert('파일을 찾을 수 없습니다.');
	}
	
};

function stopVoice(stop){
	stop.style.display='none';
	stop.previousElementSibling.style.display='inline';
	
	if(audio!=null){  //audio 변수에 음성 객체가 있다면
		if(!audio.paused){  //멈춤 상태가 아닐 시 
			audio.pause();  //재생을 정지.
		}
		audio = null;
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
//	list_sentences.html & 
//	search_sentences_page.html
//----------------------------------------

/**
 * 검색된 목록의 내용(eng 부분)을 클릭했을 때 상세보기 폼으로 복사
 */
function pickUpSentenceInfo(obj){
	var sentenceTr = obj.parent().parent();
	var sentenceNo = sentenceTr.children().first();
	var jid = sentenceNo.next();
	var eng = jid.next();
	//var kor = eng.children().eq(1);
	//alert("kor="+kor.val());
	var kor = eng.next();
	var added = kor.next();
	var appCode = added.next();//테이블의 tr요소를 가리킴
	//실제 앱코드값은 아래 appCodeNum
	// ex) ProfileText<br>40200 로 html이 구성되어 있음 
	var appCodeNum = appCode.html().split('<br>')[1];
	//var alias = appCode.next();
	var regDate = appCode.next();
	
	
	$('#jid').val(jid.text().trim());	
	$('#eng').val(eng.text().trim());
	$('#kor').val(kor.text().trim());
	$('#added').val(added.text());
	$('#appCode').val(appCodeNum);
	//$('#alias').val(alias.text());
	$('#regDate').text(regDate.text());
	console.log(appCode);
	console.log(appCode.val());
	//select박스의 appCode선택하기
	$('#editSentenceForm #appCode').find("option").each(function(i,opt){
		if($(opt).val() == appCodeNum){ 
			$(opt).prop("selected", true);
		}else{
			$(opt).prop("selected", false);
		}
	});
}

/**
 * 해당 예문의 보이스 목록 출력
 */
function displayVoiceList(sentenceId){
	$.getJSON("/admin/jungleVoiceBook/list/"+sentenceId, function(result){
		//var voiceResourcePath=[[@{/resource/voice/}]];
		var voiceResourcePath="/resource/jungleVoice/";
		
		//console.log("result="+JSON.stringify(result));
		$('#voiceList').empty();
		
		result.forEach(function(voice, index) {
			var tr = document.createElement("tr");
			tr.className = "contents";
			
			var demo="";
			if(voice.demo ==true){
				demo='<i class="fas fa-check"></i>';
			}
			
			tr.innerHTML +=
			"<td>"+voice.vid+"</td>"
			+"<td>"+demo+"</td>"
			+"<td>"+voice.voiceType+"</td>"
			+"<td>"+voice.voiceRate+"</td>"
			+"<td>"+voice.voiceSex+"</td>"
			+"<td>"+voice.accent+"</td>"
			+"<td>"+voice.source+"</td>"
			+"<td><i class='fas fa-volume-up' onclick='playVoice(\""+voiceResourcePath+voice.path+"\", this)'>"
			+"</i><i class=\'fas fa-stop\' onclick=\'stopVoice(this)\' style=\'display:none\'></i></td>"
			+"<td>"+voice.regDate+"</td>"
			+"<td><i class=\"fas fa-edit\" onclick=\"showVoiceForm(this)\"></i> " 
			+"<i class=\"fas fa-file-excel\" onclick=\"changeVoiceFile('"+voice.vid+"')\"></i> "
			+"<i class=\"fas fa-trash-alt\" onclick=\"deleteVoiceFile('"+voice.vid+"')\"></i>"
			+"<i class=\"fas fa-plus\" data-action=\"add\" onclick=\"addNewVoiceFile('"+sentenceId+"')\"></i></td>"
			+"<td style='display:none'>"+voice.description+"</td>"
			$('#voiceList').append(tr);
		});
		$('[data-toggle="tooltip"]').tooltip();
	});
}


//----------------------------------------
//			list_sentences.html
//----------------------------------------

function clearWhiteElement(elem){
    elem = elem || document;
   
    alert("elem="+elem);
    
    var childs = elem;//elem.childNodes;
    var length = childs.length;
    alert("length="+length);
    
    for (var i = 0; i < length; i++){
        var child = childs[i];
        if (child) {
        	 alert("child="+child);
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


function updateSentence(jid){
	var params = $("#editSentenceForm").serialize();

	$.ajax({
		type: 'POST',
		url: '/admin/jungleBook/edit/'+jid,
		data:params,
		success: function (sentence) {
			$('#jid').val(sentence.jid);	
			$('#eng').val(sentence.eng);
			$('#kor').val(sentence.kor);
			//$('#alias').val(sentence.alias);
			$('#added').val(sentence.added);
			$('#appCode').val(sentence.appCode);
			//$('#regDate').text(sentence.regDate); 
			
			$('.successBtn').show();
		}
	});
}

/* ----------------------------------------------------------------------------
 * 			admin/junglevoicebook/add_voice.html
 * ---------------------------------------------------------------------------*/

/**
 * admin/jungleVoiceBook/add_voice.html에서 $('#addJungleVoice').click()으로 호출함.
 * 
 * 테이블에서 체크된 체크박스 항목을 전달받아
 * jungleSentenceId와 eng정보를 알아냄
 * 
 * jungleSentenceId와 eng정보를 담은 JungleSentence객체들 만들고
 * /admin/jungleVoiceBook/batch/add 로
 * JungleSentencePack이라는 커멘드에 jungleSentenceList를 담아서 전송함.
 * 
 * @param jungleSentenceCheckedList
 * @returns
 */
function addJungleVoice(jungleSentenceCheckedList, page){
	
	var jungleSentencePack = {}; 
	 $.each(jungleSentenceCheckedList, function(index, jungleSentenceChecked) {
	 	//var jungleSentenceId = jungleSentenceChecked.value;
		 var jungleSentenceId = $(jungleSentenceChecked).closest("tr")
			.children().first().next().next().text().trim();
	 	
	 	var eng = $(jungleSentenceChecked).closest("tr")
	 					.children().first().next().next().next().text().trim();
	 	
	 	//영어 문장이 없는 정글센텐스를 클릭한 경우, 해당 센텐스는 제외하고 커멘드에 담음
	 	if(eng == ''){
	 		index--;
	 	}else{
	 		jungleSentencePack['jungleSentenceList[' + index +'].jid'] = jungleSentenceId;
	 		jungleSentencePack['jungleSentenceList[' + index +'].eng'] = eng;  
	 	}
	 	
	 });
	 
	 $.ajax({
			type: "POST", 
			url : '/admin/jungleVoiceBook/batch/add',
			data : jungleSentencePack, 
			success : function(result){ 
				$('#errorDiv').hide();
				
				alert("success");

	            console.log("SUCCESS : ", result);
	            
	            //체크박스 모두 해제
	            $(":checkbox").prop('checked', false);
	            
	            alert('page ' +page);
				var url = '/admin/jungleBook/list';
				location.href=url+"?page="+page+"&size=10&searchType=voice";
			},
			error : function (e) {
				$('#successDiv').hide();
				
				$('#errorDiv').css("display",'inline');
				$('#errorDiv > pre').text(e.responseText);

	            console.log("ERROR : ", e);
	        }
		});
}

/* ----------------------------------------------------------------------------
 * 			admin/junglevoicebook/list_voices.html
 * ---------------------------------------------------------------------------*/

/**
 * 검색된 보이스 등록 목록의 내용(eng 부분)을 클릭했을 때 상세보기 폼으로 복사
 */
function pickUpSentenceInfoFromVoiceInfo(obj){
	var sentenceTr = obj.parent().parent();
	var sentenceNo = sentenceTr.children().first();
	var jid = sentenceNo.next().next();
	var eng = jid.next();
	var kor = eng.next();
	var added = kor.next();
	var appCode = added.next();
	var alias = appCode.next();
	var regDate = alias.next();
	
	$('#jid').val(jid.text().trim());	
	$('#eng').val(eng.text().trim());
	$('#kor').val(kor.text().trim());
	$('#alias').val(alias.text());
	$('#added').val(added.text());
	$('#appCode').val(appCode.text());
	$('#regDate').text(regDate.text());

}

/**
 * 해당 예문의 보이스 목록 출력
 */
function displayVoiceList(sentenceId){
	//기존의 보이스 편집,상세보기가 열려있다면 닫아줌 
	$('#editVoiceForm').css('display', 'none');
	
	//console.log(sentenceId); 
	$.getJSON("/admin/jungleVoiceBook/list/"+sentenceId, function(result){
		//var voiceResourcePath=[[@{/resource/voice/}]];
		var voiceResourcePath="/resource/jungleVoice/";
		
		//console.log("result="+JSON.stringify(result));
		$('#voiceList').empty();
		
		result.forEach(function(voice, index) {
			var tr = document.createElement("tr");
			tr.className = "contents";
			
			var demo="";
			if(voice.demo ==true){
				demo='<i class="fas fa-check"></i>';
			}
			
			tr.innerHTML +=
			"<td>"+voice.vid+"</td>"
			+"<td>"+demo+"</td>"
			+"<td>"+voice.voiceType+"</td>"
			+"<td>"+voice.voiceRate+"</td>"
			+"<td>"+voice.voiceSex+"</td>"
			+"<td>"+voice.accent+"</td>"
			+"<td>"+voice.source+"</td>"
			+"<td><i class='fas fa-volume-up' onclick='playVoice(\""+voiceResourcePath+voice.path+"\", this)'>"
			+"</i><i class=\'fas fa-stop\' onclick=\'stopVoice(this)\' style=\'display:none\'></i></td>"
			+"<td>"+voice.regDate+"</td>"
			+"<td><i class=\"fas fa-edit\" onclick=\"showVoiceForm(this)\"></i> " 
			+"<i class=\"fas fa-file-excel\" onclick=\"changeVoiceFile('"+voice.vid+"')\"></i> "
			+"<i class=\"fas fa-trash-alt\" onclick=\"deleteVoiceFile('"+voice.vid+"')\"></i>"
			+"<i class=\"fas fa-plus\" data-action=\"add\" onclick=\"addNewVoiceFile('"+sentenceId+"')\"></i></td>"
			+"<td style='display:none'>"+voice.description+"</td>"
			$('#voiceList').append(tr);
		});
		$('[data-toggle="tooltip"]').tooltip();
	});
}


/**
 * 보이스 수정폼 출력
 */
function showVoiceForm(obj){
	$('#editVoiceForm').css('display', 'block');
	
	var children = obj.parentNode.parentNode.childNodes;//tr
	
	var val='';
	for(var i = 0 ; i < children.length ; i++){
		val += i+"="+children[i].innerHTML+"\n";
	}
	alert(val);
	
	document.getElementsByName('vid')[0].value = children[0].innerHTML;
	
	if(children[1].innerHTML != ''){
		document.getElementsByName('demo')[0].checked=true;
	}
	
	var radioBtns = document.getElementsByName("voiceType");
	for(var i=0; i < radioBtns.length; i++){
		if(radioBtns[i].value == children[2].innerHTML){
			radioBtns[i].checked = true;
		}
	}
	
	radioBtns = document.getElementsByName("voiceRate");
	for(var i=0; i < radioBtns.length; i++){
		if(radioBtns[i].value == children[3].innerHTML){
			radioBtns[i].checked = true;
		}
	}
	
	radioBtns = document.getElementsByName("voiceSex");
	for(var i=0; i < radioBtns.length; i++){
		if(radioBtns[i].value == children[4].innerHTML){
			radioBtns[i].checked = true;
		}
	}
	
	radioBtns = document.getElementsByName("accent");
	for(var i=0; i < radioBtns.length; i++){
		if(radioBtns[i].value == children[5].innerHTML){
			radioBtns[i].checked = true;
		}
	}
	
	document.getElementsByName('source')[0].value = children[6].innerHTML;
	document.getElementsByName('description')[0].value = children[10].innerHTML;
}

/**
 * 보이스 정보 수정하기
 */
function updateVoice(vid){
	var params = $("#editVoiceForm").serialize();
	//alert(params);
	//var csrf = JSON.parse('[[${_csrf}]]');
	$.ajax({
		type: 'POST',
		url: '/admin/jungleVoiceBook/edit/'+vid,
		data:params,
		/*beforeSend : function(xhr){
			xhr.setRequestHeader(csrf.headerName, csrf.token);
		},*/
		success: function (sid) {
			alert(sid+" changed.");
			
			//업데이트된 voice를 voice목록에서 재확인할 수 있도록 한다.
			displayVoiceList(sid);
			$('#editVoiceForm').css('display', 'none');
		}
	});
}

/**
 * 기존 보이스 파일 변경하기
 */
function changeVoiceFile(vid){
	window.open("/admin/jungleVoiceBook/changeFile/"+vid, "changeVoiceWindow", 
		"width=700, height=500, toolbar=no, menubar=no, scrollbars=no, resizable=yes" );  

}

/**
 * 기존 보이스 파일 삭제하기
 */
function deleteVoiceFile(vid){
	var result = Boolean(confirm("삭제할까요"));	
	if(result){
		var obj = {
			vid:vid, 
		};
		
		$.ajax({
			type: 'POST',
			url: '/admin/jungleVoiceBook/delete/'+vid,
			data:JSON.stringify(obj),
			success: function (sid) {
				alert(sid+" changed.");
				
				//업데이트된 voice를 voice목록에서 재확인할 수 있도록 한다.
				displayVoiceList(sid);
				$('#editVoiceForm').css('display', 'none');
			}
		});
	}
	
}

function addNewVoiceFile(sentenceId){
	window.open("/admin/jungleVoiceBook/add/"+sentenceId, "addVoiceWindow", 
	"width=700, height=700, toolbar=no, menubar=no, scrollbars=no, resizable=yes" );  
}


//논리적 위치 : src=/resource/jungleVoiceBook/2018/10/10/xxx.mp3
var audio;
function playVoice(vpath, play){
	play.style.display='none';
	var stop = play.nextElementSibling;
	stop.style.display='inline';

	try {
		audio = new Audio(vpath);
		var i=3;
		var timeout;
		audio.addEventListener('ended',function(){
			//audio.currentTime=0;
			clearTimeout(timeout);
			timeout=setTimeout(function() {
				if(i > 1){
					i--;
					audio.play();
					if(i==1){
						play.style.display='inline';
						stop.style.display='none';
					}
				}			
			}, 20)
			
		});
		
		audio.play();
	} catch (e) {
		// TODO: handle exception
		alert('파일을 찾을 수 없습니다.');
	}
	
};

function stopVoice(stop){
	stop.style.display='none';
	stop.previousElementSibling.style.display='inline';
	
	if(audio!=null){  //audio 변수에 음성 객체가 있다면
		if(!audio.paused){  //멈춤 상태가 아닐 시 
			audio.pause();  //재생을 정지.
		}
		audio = null;
	}
}


function searchVoice(searchType, page, suffix){
	
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
	if(sType == 'voiceType'){ 
		keyword = $('#voiceTypeDiv #keyword').val().trim();
	}
	else if(sType == 'voiceRate'){ 
		keyword = $('#voiceRateDiv #keyword').val().trim();
	}
	else if(sType == 'accent'){ 
		keyword = $('#accentDiv #keyword').val().trim();
	}
	
	$.getJSON({
		//type: "GET", 
		url : '/admin/jungleVoiceBook/' + suffix,
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
			
			var page = result.result;
			displaySearchedVoiceList(page.content, result.currentPageNum, page.totalElements, suffix);		
			displayPageNavigation(result, sType, suffix);

			//if open, 에러 패널 닫기
			$('#errorDiv').css("display",'none');
			//기존 테이블 닫기
			$('#voiceListDiv').css("display",'none');
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
 * 센텐스 목록에서 테이블 헤더를 통한 컬럼 정렬을 수행할 경우 ajax를 통해 전송받은
 * 센텐스 목록을 출력한다.
 * 
 * @param sentenceList
 * @param currentPageNum
 * @param total
 * @returns
 */
//ajax로 전송한 요청에 대한 결과셋 테이블 표시
function displaySearchedVoiceList(voiceList, currentPageNum, total, suffix){
	
	$('#searchResultTable_'+suffix).children('tbody').children("tr").remove();
	//alert("suffix="+suffix);
	//alert("sentenceList="+sentenceList);
	//$('#searchResultTable_'+suffix).css('background', 'red');
	
	var page = $("#page").val();
	var output = ''
	var num=1;	
	var fetchSize = 20;//$('#h_size').val();
	$.each(voiceList, function(index, voice){
		num = (total-index)-(currentPageNum-1)*fetchSize;
		//index++;
		var regDate = new Date(voice.regDate);
		output += '<tr>';
		/* output += '<td>'+parseInt(index+(currentPageNum-1)* 20)+'</td>'; */
		output += '<td>'+num+'</td>';
		output += '<td>'+voice.vid+'</td>'; 
		output += '<td style="display: none">'+voice.sentence.jid+'</td>';
		output += '<td class="text-left"><a href="javascript:void(0)" class="voiceDetail">'+voice.sentence.eng+'</td>';
		output += '<td style="display: none">'+voice.sentence.kor+'</td>';
		output += '<td style="display: none">'+voice.sentence.added+'</td>';
		output += '<td style="display: none">'+voice.sentence.appCode+'</td>';
		output += '<td style="display: none">'+voice.sentence.personacon.alias+'</td>';
		output += '<td style="display: none">'+voice.sentence.regDate+'</td>';
		
		output += '<td><i class="fas fa-volume-up" data="/resource/jungleVoice/' 
			+ voice.path +'" onclick="playVoice(this.getAttribute(\'data\'),this)"></i>'
			+'<i class="fas fa-stop" onclick="stopVoice(this)" style="display:none"></i></td>';
		
		output += '<td>'+voice.demo+'</td>';
		output += '<td>'+voice.voiceType+'</td>'; 
		output += '<td>'+voice.accent+'</td>'; 
		output += '<td>'+voice.voiceSex+'</td>'; 
		output += '<td>'+voice.source+'</td>'; 
		
		output += '<td>'+regDate.getFullYear()+"-"
				+parseInt(regDate.getMonth() +1)+"-"+regDate.getDate()+'</td>';
		output += '</tr>';
		$('#searchResultTable_'+suffix+' > tbody:last').append(output)
		output =''; 
	});
}

