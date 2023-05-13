/**-----------------------------------------------------------------------------
								Detective Julie
 -----------------------------------------------------------------------------*/
/**
 * @ author 송화연
 */
var detectiveJs = function(julieQ){
	
	var question = null;
	var answerNum = 0;
	var answerText = null;
	var engQuestion = null;
	var randomAnswer = [];
	var julieVoicePath = null;
	var wordView = null;
	var arrestRP = 0;
	var roundArrestRP = 0;
	
	class DetectiveController {
		constructor(julieQ){
			question = julieQ;
		}
		// 한글 퀴즈 정답 확인
		checkDetectiveKorAnswer(questionNum, $selectedDiv) {
			answerNum = question[5];
			engQuestion = question[2];
			
			var answerKor = $("#korQuestionDiv .korQuestion").eq(answerNum).text();
			$("#answerResultKor").text(answerKor);
			
			displayEngQuestion(engQuestion);
			
			if(answerNum == questionNum) {
           		// 정답
            	displayKorCheck($selectedDiv);
				arrestRP = 5;
         	} else {
				// 오답
				openKissAndCry(false);
				arrestRP = 0;
			}
		}
		
		// 영어 알파벳 퀴즈 정답 확인
		checkDetectiveEngAnswer(userAnswer) {
			answerText = question[6].toLowerCase();
			userAnswer = userAnswer.toLowerCase();
			if(userAnswer == answerText) {
				openKissAndCry(true);
			} else {
				openKissAndCry(false);
			}
		}
		
		// 탐정 줄리 힌트 보여주기
		// 1. 알파벳 두 자 힌트 확인
		displayAlphabetHint() {
			answerText = question[6];
			var hintText1 = answerText.substring(0,1);
			var hintText2 = answerText.substring(1,2);
			
			return [hintText1, hintText2];
		}
		// 2. 랜덤 스펠링 힌트 보여주기
		displayRandomSpellingHint() {
			randomAnswer = question[4];
			var $displayRandomSpelling = $("#displayRandomSpelling");
			$displayRandomSpelling.html("<span class=\"guide\">랜덤 스펠링</span>");
			for(var i = 0; i < randomAnswer.length; i++) {
				var $randomAnswerText = $("<label></label>").text(randomAnswer[i]);
				$displayRandomSpelling.append($randomAnswerText.clone().addClass("spelling-cover"));
			}
		}
		// 3. 예문 음성 힌트, 결과화면 음성 세팅하기
		displayQuestionVoiceHint() {
			if(question.voicePath != null) {
				julieVoicePath = question.voicePath;
				$("#voiceHint, #sentenceVoice").attr("data-path", julieVoicePath);
				$("#voiceHint, #sentenceVoice").show();
			} else {
				$("#voiceHint, #sentenceVoice").hide();
			}
		}
		
		
		// 정답 단어 보여주기 (키스 앤 크라이)
		displayWordView() {
			wordView = question[7];
			$("#wordDiv #wordTitle").text(wordView);
			//displayParseMeaning(wordView.meaningText);
		}
		
		// 정답 문장 보여주기 (키스 앤 크라이)
		displayAnswer() {
			var answerTexts = question[6].split('');
			$("#answerResult").empty();
			var $AnswerDiv = $("#hiddenEngQuestionForm").clone();
			$AnswerDiv.find("span").each(function(i, element) {
				var answerAlphbet = answerTexts[i];
				$(element).text(answerAlphbet);
			});
			$("#answerResult").append($AnswerDiv);
		}
		
		// 수갑 개수 전송 후 다음 문제 세팅
		submitHandcuff(cuffNum) {
			$.ajax({
				url: '/pictionary/kick/detective/play/2',
				type: 'get',
				contentType: 'application/json;charset=UTF-8',
				success: function(nextQuestion) {
					displayJulieQuestion(nextQuestion);
					question = nextQuestion;
				},
				error: function(xhr) {
					alert('현황을 저장하지 못 했습니다. 로그인을 확인하거나 잠시 뒤 재시도 해주세요.');
				}
			});
		}
		// 검거 결과 전송
		sendArrestResult(correct){
			var arrestResult = {
				psentenceId: question.jid,
				wordId: question.wordView.id,
				arrested: correct
			}
			$.ajax({
				url: '/pictionary/kick/detective/arrest',
				type: 'post',
				data: JSON.stringify(arrestResult),
				contentType: 'application/json;charset=UTF-8',
				success: function(){
					
				},
				error: function(xhr){
					alert('현황을 저장하지 못 했습니다. 로그인을 확인하거나 잠시 후 재시도 해주세요.');
				}
			})
		}
		
		// 퀴즈 도중 끝내기
		quitQuiz(){
			$.ajax({
				url: '/pictionary/kick/detective/escaped',
				type: 'post',
				contentType: 'application/json;charset=UTF-8',
				success: function(){
					
				},
				error: function(xhr){
					alert('현황을 저장하지 못 했습니다.');
				}
			});
			return true;
		}
		
		// 테스트를 종료하고 결과 화면으로 이동
		endDetective($form) {
			setJulieSessionStorage();
			$(window).off('beforeunload');
			$form.submit();
		}
		
	}
	
	
	
	return new DetectiveController(julieQ);
}






