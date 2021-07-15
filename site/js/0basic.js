//Нужный скрипт

var docWidth = window.innerWidth;
var docHeight = window.innerHeight;
var deviceSmall = docWidth < 320;
var deviceMobile = docWidth <= 480 && docWidth >= 320;
var deviceTablet = docWidth <= 768 && docWidth > 480;
var deviceLaptop = docWidth <= 1200 && docWidth > 768;
var deviceComp = docWidth <= 1920 && docWidth > 1200;
var device2K = docWidth <= 2560 && docWidth > 1920;
var device4K = docWidth <= 4096 && docWidth > 2560;
var deviceBig = docWidth > 4096;

$(document).ready(function() {
	$(window).on("resize", function() {
		docWidth = window.innerWidth;
		docHeight = window.innerHeight;
		
		deviceSmall = docWidth < 320;
		deviceMobile = docWidth <= 480 && docWidth >= 320;
		deviceTablet = docWidth <= 768 && docWidth > 480;
		deviceLaptop = docWidth <= 1200 && docWidth > 768;
		deviceComp = docWidth <= 1920 && docWidth > 1200;
		device2K = docWidth <= 2560 && docWidth > 1920;
		device4K = docWidth <= 4096 && docWidth > 2560;
		deviceBig = docWidth > 4096;
	});
});

function testFunction(num) {
	if (num !== undefined) alert("Функция успешно работает! Номер проверки -> " + num);
	else alert("Функция успешно работает!");
}

function testConsole(num) {
	if (num !== undefined) console.log("Функция успешно работает! Номер проверки -> " + num);
	else console.log("Функция успешно работает!");
}

/*
	Полный пример: [ https://kakvariant.ru/descServ.php?isTrue=true&val=0#test ]

	URL      -- Полная ссылка на текущий сайта [ https://kakvariant.ru/descServ.php?isTrue=true&val=0#test ]
	Protocol -- Протокол сайта [ https: ]
	Host     -- Имя сайта [ kakvaruant.ru ]
	Path     -- Путь к странице [ /descServ.php ]
	Values   -- Значения из URL [ ?isTrue=true&val=0 ]
	Hash     -- ID элемента, с помощью которого перемещается страница либо вверх, либо вниз [ #test ]
*/

function getURL() {return location.href;}
function getURLProtocol() {return location.protocol;}
function getURLHost() {return location.host;}
function getURLPath() {return location.pathname;}
function getURLValues() {return location.search;}
function getURLHash() {return location.hash;}

function isURL(url) {return location.href == url;}
function isURLProtocol(pr) {return location.protocol == pr;}
function isURLHost(host) {return location.host == host;}
function isURLPath(path) {return location.pathname == path;}
function isURLValues(vals) {return location.search == vals;}
function isURLHash(hash) {return location.hash == hash;}

function setURL(url) {location.href = url;}
function setURLProtocol(pr) {location.protocol = pr;}
function setURLHost(host) {location.host = host;}
function setURLPath(path) {location.pathname = path;}
function setURLValues(vals) {location.search = vals;}
function setURLHash(hash) {location.hash = hash;}

