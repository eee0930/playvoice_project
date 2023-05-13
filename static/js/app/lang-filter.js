/**
 * 문자열의 입력언어를 제한한다.
 * \u000A|\u000C|\u000D|\u0085|\u2028|\u2029 -> 줄바꿈 문자들
 * \u0020-\u007F -> 기본라틴문자(abc,.+-[] 등)
 * \u005B-\u0060|\u007B-\u007F|\u1100-\u11FF|\u3130-\u318F|\uAC00-\uD7AF -> 한글(자음,모음,완성형)
 * 
 * 준비: 항상 텍스트 내용을 전달해줘야 한다. html 태그가 있을 경우 무조건 false를 반환한다.
 */

/**
 * 문자열의 내용 중 한글과 숫자 및 기본라틴문자(영어x)가 아닌 문자들이 있을 경우
 * true를 반환.
 */

function isAllKor(content) {
	var valid = (content.match(/[^(\u0020-\u0040|\u005B-\u0060|\u007B-\u007F|\u1100-\u11FF|\u3130-\u318F|\uAC00-\uD7AF|\u000A|\u000C|\u000D|\u0085|\u2028|\u2029)]/gi)==null);
	return valid;
};

/**
 * 문자열의 내용 중 영어(기본라틴문자. 기본 특수문자와 숫자 포함)가 아닌 문자들이 있을 경우
 * true를 반환.
 */
function isAllEng(content) {
	var valid = (content.match(/[^(\u0020-\u007F|\u000A|\u000C|\u000D|\u0085|\u2028|\u2029)]/gi)==null);
	return valid;
};