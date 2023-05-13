/**
 * 날짜를 이용한 검색시 시작날짜와 종료날짜에 대한 처리를 한다.
 */
function adjustDateForm(){
	var fromDate = $('#fromDate');
	var toDate = $('#toDate');
	var today = new Date();
	
	fromDate.datepicker({ 
		language : 'kr', 	//한국
		pickTime : false, 	//시간표시
		format: "yyyy-mm-dd"
	}); 
	
	toDate.datepicker({ 
		language : 'kr', 
		pickTime : false, 
		format: "yyyy-mm-dd"
	});
	
	var pattern = /[^(0-9)]/gi;
	fromDate.keyup(function(){
		var from = fromDate.val();
		fromDate.val(from.replace(pattern, ""));
	});
	toDate.keyup(function(){
		var to = toDate.val();
		toDate.val(to.replace(pattern, ""));
	});
	
	
	fromDate.datepicker("setDate", firstDay() );
	toDate.datepicker("setDate", today);
}

/**
 * startDate의 기본값으로 한달 전인 지난 달로 설정시
 */
function lastMonth(){
	var startDate = new Date();
	startDate.setMonth(startDate.getMonth()-1);
	return startDate;// star기본값으로 오늘 날짜  
}

/**
 * startDate의 기본값으로 이 달의 첫째날을 기본값으로 설정시 
 */
function firstDay(){
	var startDate = new Date();
	startDate.setDate(1);
	return startDate;// 기본값으로 오늘 날짜  
}