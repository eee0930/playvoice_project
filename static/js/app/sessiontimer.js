/**----------------------------------------------------------------------------
 * 						Session TimeOut Handling Functions
 * 	사전 준비 라이브러리: jquery.min.js, common.js
 *  필요 html: incl/footer.html
 -----------------------------------------------------------------------------*/
// Load jQuery first 
// 서버 설정 세션 시간(초)
var sessionLifeTime;
// sessionCheckInterval(밀리초) 마다 세션 남은 시간 체크
var sessionCheckInterval = 60000; 
// 지정된 세션 유지 시간(분). 기본 세션타임아웃(sessionLifeTime)과 별개로 부여되는 시간. 
var sessionExpiryMinutes;
// 세션만료를 경고하는 대기 경과 시간(분)
var sessionWarningMinutes;

// 마지막으로 사용자의 동작이 감지된 시간(Date)
var lastUserActTime;
// 마지막으로 세션이 갱신된 시간(Date)
var lastSessionRefreshTime;
// 세션 시간 체크 타이머
var sessionCheckTimer;
/* 로그아웃 함수. 로그아웃 전 실행함수를 실행 후 로그아웃을 수행한다. 
 *사용법: logoutFunc.doBeforeLogout().logout();
 *		logoutFunc.doBeforeLogout().goLoginPage();
 */
var logoutFunc = {
		// beforeLogout()이라는 함수가 있을 시 실행한다.
		doBeforeLogout: function(){
			if(typeof beforeLogout == 'function'){
				//-------------
				beforeLogout();	// 각 앱,페이지마다 로그아웃 전 실행할 동작. 
				//-------------
			}
			return this;
		},
		// 세션이 아직은 만료되지 않았다는 가정 하에 로그아웃을 수행한다.
		logout: function(){
			var csrf = $("meta[name='_csrf']").attr('content');
			var params = {'_csrf': csrf};
			//-----------------------------------------
			submitPost('/auth/logout', params, 'post');	// common.js 함수
			//-----------------------------------------
		},
		// 이미 세션이 만료되었기 때문에 로그인 페이지로 이동한다.
		goLoginPage: function(){
			alert("세션을 갱신하지 못했습니다. 로그인 화면으로 이동합니다.");
			location.href = "/auth/login?destPage=" + location.href;
		}
}
//------------------------------------------------------------------------------

/**
 * 세션타이머 변수값들 초기화 및 세션타이머 작동.
 * minutesToAlive: 최대 허용 유휴 시간(분)(사용자의 행위 없음)
 */
function initSessionMonitor(minutesToAlive){
	sessionExpiryMinutes = minutesToAlive? minutesToAlive : (sessionLifeTime/60);
	lastUserActTime = new Date();
	sessionWarningMinutes = sessionExpiryMinutes - 15; // 지정한 세션시간이 10분 남으면 경고 메세지
	sessionSetInterval();
	refreshSession();
	// 이벤트명에 .namespace를 추가하여 다른 이벤트와 충돌이 없도록 한다.
	$(document).on("keypress.session click.session scroll.session", function(){
		lastUserActTime = new Date();
	});
}
/**
 * sessionCheckInterval밀리초 마다 세션을 체크
 */
function sessionSetInterval() {
	clearInterval(sessionCheckTimer);
	// 타이머 설정
	sessionCheckTimer = setInterval(function(){
							//-------------
							checkSession();
							//-------------
						}, sessionCheckInterval);
}
/**
 * 서버를 호출하여 세션을 강제로 갱신.
 * 실패할 경우 이미 세션이 끊어진 상태이므로 로그인 화면으로 이동.
 */
function refreshSession(){
	$.ajax({
		type: "get",
		url: "/refresh",
		success: function(result){
			lastSessionRefreshTime = new Date();
		},
		error: function(xhr){
			//----------------------------------------
			logoutFunc.doBeforeLogout().goLoginPage();
			//----------------------------------------
		}
	});
}
/**
 * 현재 세션을 체크하여 
 * 유휴 시간이 경고 시간에 진입하면 경고메세지를 띄운다.
 * 	- 페이지 계속 탐색 의사가 확인되면 세션을 갱신하고
 * 	- 그렇지 않을 경우 로그아웃한다.
 * 아직 경고 시간에 진입하지 않은 경우 세션을 갱신하여 다음 체크 시간까지 기다린다.
 */
function checkSession() {
	var now = new Date();
	// 최근 활동으로부터 지난 시간(분)
	var elapsedActiveMinutes = (now - lastUserActTime) / 1000 / 60;
	// 최근 세션 갱신으로부터 지난 시간(초)
	var elapsedSessionRefreshTime = (now - lastSessionRefreshTime) / 1000;
	// 경고 시간에 진입함
	if(elapsedActiveMinutes >= sessionWarningMinutes){
		// 타이머 종료
		clearInterval(sessionCheckTimer);
		if(confirm("약 " + (sessionExpiryMinutes - elapsedActiveMinutes).toFixed(0) 
				+ "분 후 세션이 종료됩니다.(" + now.toLocaleTimeString() + " 기준)\n"
				+ ((typeof beforeLogout == 'function')? "":"작성 중인 글은 저장되지 않습니다.\n")
				+ "'확인'을 눌러 페이지를 탐색하거나 '취소'를 눌러 로그아웃 하시기 바랍니다.")){
			// confirm창의 실제 확인 버튼을 누르기까지 시간이 흐르기 때문에 다시 시간 확인
			now  = new Date();
			var elapsedActiveMinutes = (now - lastUserActTime) / 1000 / 60;
			
			// confirm창의 확인 버튼을 누르는 시점에 이미 세션이 종료
			if(elapsedActiveMinutes >= sessionExpiryMinutes){
				//-----------------------------------
				logoutFunc.doBeforeLogout().logout();
				//-----------------------------------
			}else{ // 세션이 종료되기 전에 페이지 계속 탐색 의사가 확인되었으므로 세션 갱신 호출
				//-------------------
				refreshSession();
				//-------------------
				lastUserActTime = Date.now();
				//-------------------
				sessionSetInterval();
				//-------------------
			}
		}else{
			//-----------------------------------
			logoutFunc.doBeforeLogout().logout();
			//-----------------------------------
		}
	// 아직 경고 시간에 진입 전이지만 세션시간 만료가 가까우므로(대기 시간 > 세션타임아웃 - 90초) 세션 갱신.
	}else if(elapsedSessionRefreshTime > (sessionLifeTime - 90)){ 
		//---------------
		refreshSession();
		//---------------
	}else{
		// 아직 세션 유효
	}
}
