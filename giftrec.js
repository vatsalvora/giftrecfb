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
	  //This function gets called after the User has logged in 
	  // and the FB api has been loaded
	  function updateStatusCallback(){
		console.log('Welcome!  Fetching your information.... ');
		$('#friendlikes').hide();
		$('#userlikes').hide();
		$('#disp').hide();
		$('#disp').append('<h3>Friends !!!</h3>');
		getFriends();
		$('#disp').delay(1500).fadeIn("slow", function(){$('#loading').hide()});
		console.log("Done!");
		//var friendName = prompt("Name of Friend?").toLowerCase();
		
		//This function is for getting movie suggestions from 
		//Filmmaster using IMDB ids
		var getIDS = function(list){
			for(var l in list)
			{
				//Get the imdb id for the movie title
				$.getJSON('http://www.omdbapi.com/?t=' + l, function(json_data){
					if(json_data.Response === "True")
					{
						var imdbID = json_data.imdbID.substr(2);
						//Get the movie recommendations from filmmaster using the imdb ids
						$.getJSON("http://ec2-54-84-252-222.compute-1.amazonaws.com/api.php",  {id: imdbID}, function(data){
							if(data.objects.length>0)
							{
								var index = Math.floor((data.objects.length-1)*Math.random()); //Randomize selections from the suggestions
								//Get the film names from the response of filmmmaster's api
								$.getJSON('http://www.omdbapi.com/?i=' + 'tt' + data.objects[index].film_id, function(film_data){
									$('#cat').append("<li>" + film_data.Title + "</li>");
								});
							}
						});
					}
				});
			}
		}
		//This function is for getting music suggestions from 
		//Last.Fm
		var getSimilarArtist = function(list){
			for(var l in list){
				$.getJSON('http://ws.audioscrobbler.com/2.0/?format=json&method=artist.getsimilar&artist='+l+'&api_key=8a981fbe76b27b7e1fd32e9248a0454b', function(data){
					if(data.similarartists.artist.length>0)
					{
						var index = Math.floor((data.similarartists.artist.length-1)*Math.random());
						$('#cat').append("<li>" + data.similarartists.artist[index].name+ "</li>");
					}
				});
			}
		}
		//This function is for getting the Facebook User
		//likes for the friend the user selected
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
				if(category==='musician/band')
				{
					getSimilarArtist(likePool);
				}
				else
				{
					getIDS(likePool);
				}			
			});
		}
		
		//This function obtains the facebook profile picture
		//for all the friends and binds the image with a function
		//to obtain the suggestions
		function getProfileImage(id,name) {
		 
			var $photo = $('.photo');
		 
		 
		 
			var profileImage = 'https://graph.facebook.com/'+id+'/picture?width=90&height=90'; //remove https to avoid any cert issues
	 
			 //add random number to reduce the frequency of cached images showing
			//console.log(name);
			var nameArray = name.split(" ");
			var nameCombined = nameArray[0]+"-"+nameArray[1];
			
			//Using HTML5 figure tag
		   $photo.append('<figure id='+id+' class='+ nameCombined +'><img src="' + profileImage + 
		   '" height="90" width="90" alt="'+name+' is loading!"><figcaption>'+name+'</figcaption></figure>');

		   //The function for on click
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
				  height:200,
				  width: 450,
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
					  },
					  "Musician/Band": function() {
						getUserLikes(id,name,'musician/band');
						$('#message').hide();
						$("html, body").animate({ scrollTop:0 },"slow");
					  $( this ).dialog( "close" );
					}
				}
				});
				});
			  });
		}
		
		//This function is a comparator for 
		//ordering the friends by name
		function compare(a,b){
			if(a["name"]<b["name"])
				return -1;
			if(a["name"]>b["name"])
				return 1;
			return 0;
		}
		
		//This function is for getting all the friends
		//of the user from facebook
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
		//The function is for getting the facebook likes of the
		//current user
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