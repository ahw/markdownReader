(function(document) {

	//忽略HTML代码
	if (document.doctype) return;

    // Set up some defaults.
    var options = {
        style: 'markdownreader.css'
    };

    // Get any options passed into the querystring.
    if (window.location.search) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        vars.forEach(function(item) {
            var pair = item.split("=");
            options[pair[0]] = pair[1];
        });
    }

	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = chrome.extension.getURL(options.style);
	document.head.appendChild(link);
    console.log(window.location);
    console.log('here is osmething');

	link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = chrome.extension.getURL('prettify.css');
	document.head.appendChild(link);
	document.body.innerHTML = '<div id="markdown-container"></div><div id="markdown-outline"></div><div id="markdown-backTop" onclick="window.scrollTo(0,0);"></div>';
	window.onresize = tryToShowOutline;

	var markdownConverter = new Showdown.converter();
	var lastText = null;

	function updateMarkdown(text) {
		if (text !== lastText) {
			lastText = text;
			document.getElementById('markdown-container').innerHTML = markdownConverter.makeHtml(lastText);
			prettyPrint();
			updateOutline();
		}
	}

	function updateOutline() {
		var arrAllHeader = document.querySelectorAll("h1,h2,h3,h4,h5,h6");
		var arrOutline = ['<ul>'];
		var header, headerText;
		var id = 0;
		var level = 0,
			lastLevel = 1;
		var levelCount = 0;
		for (var i = 0, c = arrAllHeader.length; i < c; i++) {
			header = arrAllHeader[i];
			headerText = header.innerText;

			header.setAttribute('id', id);

			level = header.tagName.match(/^h(\d)$/i)[1];
			levelCount = level - lastLevel;

			if (levelCount > 0) {
				for (var j = 0; j < levelCount; j++) {
					arrOutline.push('<ul>');
				}
			} else if (levelCount < 0) {
				levelCount *= -1;
				for (var j = 0; j < levelCount; j++) {
					arrOutline.push('</ul>');
				}
			};
			arrOutline.push('<li>');
			arrOutline.push('<a href="#' + id + '">' + headerText + '</a>');
			arrOutline.push('</li>');
			lastLevel = level;
			id++;
		}
		arrOutline.push('</ul>')
		var outline = document.getElementById('markdown-outline');
		if(arrOutline.length > 2){
			outline.innerHTML = arrOutline.join('');
			tryToShowOutline();
		}
		else outline.style.display = 'none'; 
	}

	function tryToShowOutline() {
        if (options.outline) {
            var outline = document.getElementById('markdown-outline');
            var markdownContainer = document.getElementById('markdown-container');
            outline.style.left = markdownContainer.offsetLeft + markdownContainer.offsetWidth + 10 + 'px';
            outline.style.maxHeight = document.body.clientHeight - 30;
            outline.style.display = 'block';
        }
	}

	var xmlhttp = new XMLHttpRequest();
	var fileurl = location.href,
		bLocalFile = /^file:\/\//i.test(fileurl);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status != 404) {
			updateMarkdown(xmlhttp.responseText);
		}
	};

	function checkUpdate() {
		xmlhttp.abort();
		xmlhttp.open("GET", fileurl + '?rnd=' + new Date().getTime(), true);
		xmlhttp.send(null);
		if (bLocalFile) setTimeout(checkUpdate, 500);
	}

	checkUpdate();

}(document));
