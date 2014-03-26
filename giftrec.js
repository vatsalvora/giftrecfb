$(document).ready(function() {
        $.ajaxSetup({ cache: true });
		  $.getScript('//connect.facebook.net/en_UK/all.js', function(){
			FB.init({
			  appId: '799066233444105',
			});
			FB.login(function(){}, {scope: 'user_likes,user_friends,friends_likes'});			
			$('#loginbutton').removeAttr('disabled');
			FB.getLoginStatus(updateStatusCallback);
		  });
		 
      });
	  function updateStatusCallback(){
		// Your logic here
		console.log('Welcome!  Fetching your information.... ');
		$('#friendlikes').hide();
		$('#userlikes').hide();
		$('#disp').hide();
		$('#disp').append('<h3>Friends !!!</h3>');
		getFriends();
		$('#disp').delay(1500).fadeIn("slow", function(){$('#loading').hide()});
		console.log("Done!");
		//var friendName = prompt("Name of Friend?").toLowerCase();
		var getIDS = function(list){
			for(var l in list)
			{
				$.getJSON('http://www.omdbapi.com/?t=' + l, function(json_data){
					if(json_data.Response === "True")
					{
						var imdbID = json_data.imdbID.substr(2);
						$.getJSON("http://ec2-54-84-252-222.compute-1.amazonaws.com/api.php",  {id: imdbID}, function(data){
							$.getJSON('http://www.omdbapi.com/?i=' + 'tt' + data.objects[0].film_id, function(film_data){
								$('#cat').append("<li>" + film_data.Title + "</li>");
							});
						});
					}
				});
			}
		}
		var getLikes = function(id,name,list,category){
			FB.api('/'+id+'/likes', function(response){
					console.log(response);
					var usercat = {};
				var fricat = {};
				var likePool = {};
				for(var j=0; j<list.length; j++)
				{
					$('#userlikes').append("<li>"+ list[j]["name"] + "</li>");
					if(list[j]["category"].toLowerCase()===category)
					{
						usercat[list[j]["name"]] = true;
						likePool[list[j]["name"]] = true;
					}
				}
				$('#friendlikes').append("<h3>"+ name + "</h3>");
				for(var k=0; k<response.data.length; k++)
				{
					$('#friendlikes').append("<li>"+ response.data[k]["name"] + "</li>");
					if(response.data[k]["category"].toLowerCase()===category)
					{
						fricat[response.data[k]["name"]] = true;
						likePool[response.data[k]["name"]] = true;
					}
				}
				//console.log(usercat);
				//console.log(fricat);
				for(var l in fricat)
				{
					if(!(l in usercat))
					{
						//$('#cat').append("<li>"+ l + "</li>");
					}
				}
				console.log(likePool);
				getIDS(likePool);
								
			});
		}
		function getProfileImage(id,name) {
		 
			var $photo = $('.photo');
		 
		 
		 
			var profileImage = 'https://graph.facebook.com/'+id+'/picture?width=90&height=90'; //remove https to avoid any cert issues
	 
			 //add random number to reduce the frequency of cached images showing
			//console.log(name);
			var nameArray = name.split(" ");
			var nameCombined = nameArray[0]+"-"+nameArray[1];
		   $photo.append('<figure id='+id+' class='+ nameCombined +'><img src="' + profileImage + 
		   '" height="90" width="90" alt="'+name+' is loading!"><figcaption>'+name+'</figcaption></figure>');

		   $( '#'+id ).bind('click',function() {
				//$(this).css('color', 'blue');
				var fName = $(this).attr('class').split("-");
				fName = fName[0]+" "+fName[1];
				$('#userlikes').empty();
				$('#userlikes').append("<h3>User Likes!!!</h3>");
				$('#friendlikes').empty();
				$('#friendlikes').append("<h3>Friend Likes!!!</h3>");
				$('#cat').empty();
				$('#cat').append("<h3>Suggestions!!</h3>");
				$('#imp').empty();
				$('#imp').append("<h3>Selected Information!!!</h3>");
				console.log(fName);
				console.log(this.id);
				$('#message').show();
				$(function() {
				$( "#dialog" ).dialog({
				  resizable: true,
				  height:250,
				  modal: true,
				  buttons: {
					"Movie": function() {
						getUserLikes(id,name,'movie');
						$('#message').hide();
						$("html, body").animate({ scrollTop:0 },"slow");
					  $( this ).dialog( "close" );
					},
					"Tv Show": function() {
						getUserLikes(id,name,'tv show');
						$('#message').hide();
						$("html, body").animate({ scrollTop:0 },"slow");
					  $( this ).dialog( "close" );
					}
				  }
				});
			  });
			});
		}
		
		function compare(a,b){
			if(a["name"]<b["name"])
				return -1;
			if(a["name"]>b["name"])
				return 1;
			return 0;
		}
		
		function getFriends()
		{
			FB.api(
				'/me/friends',
				function (response) {
				  if (response && !response.error) {
					console.log(response.data[0]["name"]);
					var friendsArray = response.data;
					friendsArray.sort(compare);
					for(var i=0; i<friendsArray.length; i++)
					{
						var name = friendsArray[i]["name"];
						var id = friendsArray[i]["id"];
						getProfileImage(id,name);
					}
				  }
				  });
		}
		
		function getUserLikes(id,friendName,category)
		{
			FB.api('/me/likes',function(response){
				if (response && !response.error) {
					$('#imp').append("<h3>" + friendName + "</h3>");
					getLikes(id,friendName,response.data,category);
					console.log(response);
				}
			});
		}
	}