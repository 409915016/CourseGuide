var DataView = {
	clear : function() {
		$("tr").remove(".course");
	},

	addView : function(data) {
		var html = "<tr class=\"course\">";
		for (var i = 0, len = data.length; i < len; i++) {
			html += "<td>" + data[i] + "</td>";
		};
		html += "</tr>";
		$("#courselist").append(html);
	},

	/* 
		设置当前导航是否可用，并更新导航链接
		@id
		@val 当前导航值
		@compare 对比值，如果val同该值相等，则导航不可用
		@target 导航目标值
	*/
	adjust : function(id, val, compare, target) {
		var enabled = true;
		if(val == compare) {
			enabled = false;
		}
		DataView.enable(id, enabled);
		DataView.setIndex(id, enabled ? target : 0);
	},

	setIndex : function(id, index) {
		$(id).children("a").attr("href", "nav:" + index);
	},

	enable : function(id, enabled) {
		if(enabled) {
			if($(id).hasClass("disabled")) 
				$(id).removeClass("disabled");
		}else {
			if(!$(id).hasClass("disabled")) 
				$(id).addClass("disabled");
		}
	},

	navigate : function(nav) {
		DataView.adjust("#nav-prev", nav.index, 1, nav.index - 1);
		DataView.adjust("#nav-next", nav.index, nav.total, nav.index + 1);

		var html;
		$("#nav-body").empty();
		for (var i = 0, len = nav.pages.length; i < len; i++) {
			if(nav.pages[i] == nav.index) {
				html = "<li class=\"active\"><span>" + nav.pages[i] + "</span>";
			}else {
				html = "<li><a href=\"nav:" + nav.pages[i] + "\">" + nav.pages[i] + "</a>";
			}
			html += "</li>";
			$("#nav-body").append(html);
		};
	}
}

var QueryLib = {
	isJSON : function(data) {
		return data.match("^\{(.+:.+,*){1,}\}$");
	},

	notify : function(show) {
		show ? $("#load-view").show() : $("#load-view").hide();
	},

	parse : function(data) {
		obj = $.parseJSON(data);
		if(obj.data && obj.nav) {
			DataView.clear();

			var html;
			for (var i = 0, len = obj.data.length; i < len; i++) {
				DataView.addView(obj.data[i]);
			};

			DataView.navigate(obj.nav);
		}		
	},

	load : function(index) {
		QueryLib.notify(true);

		$.ajax({
			type : "get",
			url : "query.php",
			data : {
				"act" : "query",
				"index" : index
			},
			timeout : 10000,
			success : function(data) {
				QueryLib.notify(false);

				if(!QueryLib.isJSON(data)) {
					alert(data);
				}else {
					QueryLib.parse(data);
				}
			},
			error : function() {
				QueryLib.notify(false);

				alert("failed!");
			}
		});
	}
}

$(document).ready(function() {
	var index = 1;
	QueryLib.load(index);

	$(document).on("click", "a", function() {
		var link = $(this).attr("href");
		var pos = link.indexOf("nav:");
		if(pos != -1) {
			event.preventDefault();
			// The length of "nav:"
			pos += 4;
			index = link.substr(pos);

			if(index > 0) QueryLib.load(index);
		}
	});
});