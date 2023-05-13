/**
 * 텍스트형 pdf를 인식하여 텍스트를 추출
 * @param pdfData 실제 파일의 blob 데이터
 * @param callback 인식된 텍스트를 처리할 콜백함수
 */
function textualPdfToText(pdfData, callback){
	var pdfjsReady = function(){
		// Loaded via <script> tag, create shortcut to access PDF.js exports.
		var pdfjsLib = window['pdfjs-dist/build/pdf'];
	
		// The workerSrc property shall be specified.
		pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/build/pdf.worker.min.js';
	
		// Using DocumentInitParameters object to load binary data.
		var loadingTask = pdfjsLib.getDocument({data: pdfData});
		loadingTask.promise.then(function(pdf) {
			var pages = [];
			var pageLength = pdf.numPages;
			for(var pageNumber = 1; pageNumber <= pageLength; pageNumber++){
				pages.push(pageNumber);
			}
			Promise.all(pages.map(function(pageNumber){
				return pdf.getPage(pageNumber).then(function(page) {
					return page.getTextContent().then(function(textContent){
						if(textContent.items != null){
							var page_text = "", last_item = null;
							var items = textContent.items;
							for(var i = 0; i < items.length; i++){
								var item = items[i];
								// 이전 문장이 있고 이전 문장이 ' '로 끝나지 않는다면
								if(last_item != null && last_item.str[last_item.str.length - 1] != ' '){
									var itemX = item.transform[5], lastX = last_item.transform[5],
										itemY = item.transform[4], lastY = last_item.transform[4];
									// 수평상 이전 문장보다 앞이면 줄바꿈, 커서 초기화
									if(itemX < lastX){
										page_text += "\r\n";
									
									// 수평상 위치는 이전 문장보다 뒤이고,
									// 수직상 위치가 다르고, 이전 문장에 영어문장성분이 없을 경우
									}else if(itemY != lastY && 
									(last_item.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) == null)){
										page_text += ' ';
									}
								}
								page_text += item.str;
								last_item = item;
							}
							return page_text + '\n\n';
						}
					});
				});
			})).then(function(pages){
				callback(pages.join());
			})
			
		}, function (reason) {
			// PDF loading error
			console.error(reason);
		});
	}
	if(typeof pdfjsLib == 'undefined'){
		checkOCRLibrary('https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/build/pdf.min.js', pdfjsReady)
	}else{
		return pdfjsReady();
	}
}

/**
 * 이미지형 pdf를 인식하여 텍스트를 추출
 * @param pdfData 실제 파일의 blob 데이터
 * @param callback 인식된 텍스트를 처리할 콜백함수
 */
var worker = null;
function imagePdfToText(pdfData, callback){
	var pdfjsReady = function(){

		// Loaded via <script> tag, create shortcut to access PDF.js exports.
		var pdfjsLib = window['pdfjs-dist/build/pdf'];
	
		// The workerSrc property shall be specified.
		pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/build/pdf.worker.min.js';
	
		// Using DocumentInitParameters object to load binary data.
		var loadingTask = pdfjsLib.getDocument({data: pdfData});
		loadingTask.promise.then(function(pdf) {
			var pages = [];
			var pageLength = pdf.numPages;
			for(var pageNumber = 1; pageNumber <= pageLength; pageNumber++){
				pages.push(pageNumber);
			}
			Promise.all(pages.map(function(pageNumber){
				return pdf.getPage(pageNumber).then(function(page) {
					var viewport = page.getViewport({scale: 1.0});
				
					// Prepare canvas using PDF page dimensions
					var canvas = document.createElement('canvas');
					var context = canvas.getContext('2d');
					canvas.height = viewport.height;
					canvas.width = viewport.width;
				
					// Render PDF page into canvas context
					var renderContext = {
						canvasContext: context,
						viewport: viewport
					};
					var renderTask = page.render(renderContext);
					return renderTask.promise.then(async function () {
						// OCR 처리 코드. 텍스트 인식 후 한글 제거 체크박스가 체크돼있으면 한글제거를 후처리함.--------
						// text: 결과 텍스트
						return worker.recognize(canvas).then(function({data: {text}}){
							return text;
						})
						//await worker.terminate();
					}, function (reason) {
						// PDF loading error
						console.error(reason);
					});
				});
			})).then(function(pages){
				callback(pages.join('\n\n'));
			})
		}); 
	}
	
	function callLibrary(){
		if(typeof pdfjsLib == 'undefined'){
			checkOCRLibrary('https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/build/pdf.min.js', callLibrary);
		}else if(typeof Tesseract == 'undefined'){
			checkOCRLibrary('https://unpkg.com/tesseract.js@2.1.4/dist/tesseract.min.js', callLibrary);
		}else{
			initTesseract(pdfjsReady);
		}
	}
	callLibrary();
}

/**
 * 워드프로세서 문서에서 텍스트를 추출
 * @param docData .doc, .docx 파일의 바이너리 데이터
 * @param callback 인식된 텍스트를 처리할 콜백함수
 */
function docxToText(docData, callback){
	var docjsReady = function(){
		mammoth.extractRawText({arrayBuffer:docData}).then(function(resultObj){
			callback(resultObj.value);
		})
	}
		
	if(typeof mammoth == 'undefined'){
		checkOCRLibrary('https://cdn.jsdelivr.net/npm/mammoth@1.4.8/mammoth.browser.min.js', docjsReady);
	}else{
		docjsReady();
	}
}

/**
 * 이미지에서 텍스트를 추출
 * @param imgData .doc, .docx 파일의 바이너리 데이터
 * @param callback 인식된 텍스트를 처리할 콜백함수
 */
function imgToText(imgData, callback){
	var imgjsReady = function(){
		worker.recognize(imgData).then(function({data: {text}}){
			callback(text);
		})
	}
	
	var callLibrary = function(){
		if(typeof Tesseract == 'undefined'){
			checkOCRLibrary('https://unpkg.com/tesseract.js@2.1.4/dist/tesseract.min.js', callLibrary);
		}else{
			initTesseract(imgjsReady);
		}
	}
	callLibrary();
}

/**
 * Tesseract 초기화.
 * @param callback Tesseract.js 초기화 작업 후 실행할 콜백 함수
 */
var worker = null;
function initTesseract(callback){
	if(worker == null){
		worker = Tesseract.createWorker();
		(async () => {
			await worker.load();
			await worker.loadLanguage('eng+kor');
			await worker.initialize('eng+kor');
			callback();
		})();
	} else {
		callback();
	}
}

/**
 * OCR 처리를 위한 라이브러리가 로드되었는지 체크
 * @param url 라이브러리 경로
 * @param callback 라이브러리가 로드된 후 실행할 콜백 함수
 */
function checkOCRLibrary(url, callback){
	var libraryJs = document.createElement('script');
	libraryJs.type = 'text/javascript';
	libraryJs.src = url;
	document.body.appendChild(libraryJs);
	libraryJs.onload = callback	
}