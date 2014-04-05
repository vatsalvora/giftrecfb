$(document).ready(function() {
		$('#links > ul > li > a').on('click', function(e){
			e.preventDefault();
			var anchorid = $(this.hash);
			
			if(anchorid.length == 0) anchorid = $('a[name="' + this.hash.substr(1) + '"]');
			else anchorid = $('html');
			
			$('html, body').animate({ scrollTop: anchorid.offset().top }, 450);
		  });
        $.ajaxSetup({ cache: true });
		  $.getScript('//connect.facebook.net/en_UK/all.js', function(){
			FB.init({
			  appId: '799066233444105',
			});
			FB.login(function(){FB.getLoginStatus(updateStatusCallback);}, {scope: 'user_likes,user_friends,friends_likes'});			
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
		getFriends();
		$('#disp').delay(1500).fadeIn("slow", function(){
			$('#topNav').show();
			$('#botNav').show();
			$('#loading').hide();
		});
		console.log("Done!");
		//var friendName = prompt("Name of Friend?").toLowerCase();
		
		//This function is for getting movie suggestions from 
		//Filmmaster using IMDB ids
		function getIDS(list){
			var added = {};
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
									var name = film_data.Title;
									if(typeof name != 'undefined')
									{
										if(added[name]!= true){
											added[name] = true;
											$('#message').append('<li style="display:block;">' + name + '</li>');
										}
									}
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
			var added = {};
			for(var l in list){
				$.getJSON('http://ws.audioscrobbler.com/2.0/?format=json&method=artist.getsimilar&artist='+l+'&api_key=8a981fbe76b27b7e1fd32e9248a0454b', function(data){
					if(data.similarartists.artist.length>0)
					{
						var index = Math.floor((data.similarartists.artist.length-1)*Math.random());
						var name = data.similarartists.artist[index].name;
						if(typeof name != 'undefined')
						{
							if(added[name] != true)
							{
								added[name] = true;
								$('#message').append('<li style="display:block;">' + name + '</li>');
							}
						}
					}
				});
			}
		}
		//This function is for getting the Facebook User
		//likes for the friend the user selected
		function getLikes(id,name,list,category){
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
		 
			var $photo = $('#disp');
		 
		 
		 
			var profileImage = 'https://graph.facebook.com/'+id+'/picture?width=90&height=90'; //remove https to avoid any cert issues
	 
			 //add random number to reduce the frequency of cached images showing
			//console.log(name);
			var nameArray = name.split(" ");
			var nameCombined = nameArray[0]+"-"+nameArray[1];
			
			//Using HTML5 figure tag
		   $photo.append('<figure><img class='+ nameCombined +' src="' + profileImage + 
		   '" height="90px" width="90px" alt="'+name+' is loading!"><figcaption class='+ nameCombined +'>'+name+'</figcaption></figure>');

			//The function for on click to bring up
			//dialog box and call the functions for 
			// the api(s)
			$( '.'+nameCombined ).bind('click',function(){
				$('#message').empty();
				$('#dialog').dialog({title:"Suggestions for "+name+""});
				console.log(name);
				console.log(this.id);
				var category = ["movie","tv show","musician/band"];
				var index = 0;
				$('#message').show();
				getUserLikes(id,name,category[index]);
				$('#message').append("<li><strong>"+category[index].toUpperCase()+"</li></strong>");
				
				$( "#dialog" ).dialog({
				  resizable: true,
				  height:300,
				  width: 450,
				  modal: true,
				  buttons: {
					"Next Category": function() {
						index = (index+1)%3;
						$('#message').empty();
						$('#message').append("<li><strong>"+category[index].toUpperCase()+"</strong></li>");
						getUserLikes(id,name,category[index]);
					},
					Cancel: function() {
					  $('#message').hide();
					  $( this ).dialog( "close" );
					}
				}
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
					var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
					var arrLinks = {};
					for(var a in alphabet){
						arrLinks[a] = false;
					}
				  if (response && !response.error) {
					console.log(response.data[0]["name"]);
					var friendsArray = response.data;
					friendsArray.sort(compare);
					for(var i=0; i<friendsArray.length; i++)
					{
						var name = friendsArray[i]["name"];
						var fchar = name.substring(0,1).toLowerCase();
						if(!arrLinks[fchar]){
							arrLinks[fchar] = true;
							$('#disp').append('<a name="index'+fchar+'"></a>');
							var index = alphabet.indexOf(fchar)-1;
							while(index>0 && !arrLinks[alphabet[index]]){
								arrLinks[alphabet[index]] = true;
								$('#disp').append('<a name="index'+alphabet[index]+'"></a>');
								index = index-1;
							}
						}
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
					console.log(response);
					getLikes(id,friendName,response.data,category);
				}
			});
		}
	}
