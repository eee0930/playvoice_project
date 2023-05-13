window.displayPlayvoiceAppMenu = function() {
	$("#appMenuOff").show();
	$("#appMenuOn").hide();
	$("#playvoice_menu_section").show();
}
window.disappearPlayvoiceAppMenu = function() {
	$("#appMenuOff").hide();
	$("#appMenuOn").show();
	$("#playvoice_menu_section").hide();
}

window.mobileMenuOpen = function() {
	$("#mobileMenu, .page_cover, html").addClass("open"); 
	window.location.hash = "#open";
}


var lastScrollY = this.scrollY;
var scrollTimer;
$(window).on("scroll",function scrollStuff(e){
   $(window).off("scroll", scrollStuff);
   clearTimeout(scrollTimer);
   if(lastScrollY < this.scrollY){
	   $('#moveTop_btn').fadeIn(100);
   }else if(lastScrollY > this.scrollY){
	   $('#moveTop_btn').fadeOut(100);
   }
   lastScrollY = this.scrollY;
   scrollTimer = setTimeout(function(){
      $(window).on("scroll", scrollStuff);
   }, 100);
});


window.moveTop = function() {
    $("html, body").animate({
       scrollTop: 0
    }, 500);
    return false;
}

window.onhashchange = function() {
	if (location.hash != "#open") {  
		$("#mobileMenu, .page_cover, html").removeClass("open");
	}
}


/*nav header*/
$(window).scroll(function() {
	var contentOffset = $("section").offset();
	if(contentOffset !== undefined){
		if ($(this).scrollTop() > contentOffset.top) {
			$('#headerNavbar').show();
			$('#menuOpenBtn').addClass("fixed");
		} else {
			$('#headerNavbar').hide();
			$('#menuOpenBtn').removeClass("fixed");
		}
	}
});

window.displayNavbarAppMenu = function() {
	$("#appMenuOff2").show();
	$("#appMenuOn2").hide();
	$("#playvoice_menu_navbar").show();
}
window.disappearNavbarAppMenu = function() {
	$("#appMenuOff2").hide();
	$("#appMenuOn2").show();
	$("#playvoice_menu_navbar").hide();
}



