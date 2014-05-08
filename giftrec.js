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
			  appId: '[Enter Facebook APP ID]',
			});
			FB.login(function(){FB.getLoginStatus(updateStatusCallback);}, {scope: 'user_likes,user_friends,friends_likes'});			
			$('#loginbutton').removeAttr('disabled');
		  });
		 
      });
	  //This function gets called after the User has logged in 
	  // and the FB api has been loaded
	  function updateStatusCallback(){
		console.log('Welcome!  Fetching your information.... ');
		$('#disp').hide();
		var fbRecs = new FriendLikes();
		getFriends();
		$('#disp').delay(1500).fadeIn("slow", function(){
			$('#topNav').show();
			$('#loading').hide();
		});
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
						$.getJSON("[URL TO PHP SCRIPT]/api.php",  {id: imdbID}, function(data){
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
											$('#message').append('<a href="http://www.imdb.com/title/tt'+data.objects[index].film_id+'/"><li style="display:block;">' + name + '</li></a>');
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
				$.getJSON('http://ws.audioscrobbler.com/2.0/?format=json&method=artist.getsimilar&artist='+l+'&api_key=[Enter last.fm API KEY]', function(data){
					if(typeof data.similarartists.artist != 'undefined')
					{
						var index = Math.floor((data.similarartists.artist.length-1)*Math.random());
						var name = data.similarartists.artist[index].name;
						var url = data.similarartists.artist[index].url;
						if(typeof name != 'undefined')
						{
							if(added[name] != true)
							{
								added[name] = true;
								//console.log(data);
								$('#message').append('<a href="https://'+ url +'"><li style="display:block;">' + name + '</li></a>');
							}
						}
					}
				});
			}
		}
		//This function is for getting the Facebook User
		//likes for the friend the user selected
		function getLikes(id,name,list,category){
			FB.api('/'+id+'/likes?limit=200', function(response){
				var likePool = {};
				var count = 0;
				for(var j=0; j<list.length; j++)
				{
					if(list[j]["category"].toLowerCase()===category)
					{
						likePool[list[j]["name"]] = true;
						count++;
						j += Math.floor(100*Math.random());

					}
					
					
				}
				for(var k=0; k<response.data.length; k++)
				{
					if(response.data[k]["category"].toLowerCase()===category)
					{
						likePool[response.data[k]["name"]] = true;
						count++;
						k += Math.floor(10*Math.random());
					}


				}
				if(count<1){
					$('#message').append('<li style="display:block;">No Data available for Recommendation!</li>');
				}
				else if(category==='musician/band')
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
	 
			 			
			//Using HTML5 figure tag
		   $photo.append('<figure><img class='+ id +' src="' + profileImage + 
		   '" height="90px" width="90px" alt="'+name+' is loading!"><figcaption class='+ id +'>'+name+'</figcaption></figure>');

			//The function for on click to bring up
			//dialog box and call the functions for 
			// the api(s)
			$( '.'+id+'' ).bind('click',function(){
				$('#message').empty();
				$('#friends').empty();
				$('#dialog').dialog({title:"Suggestions for "+name+""});
				//console.log(name);
				//console.log(this.id);
				var category = ["movie","tv show","musician/band"];
				var index = 0;
				$('#message').show();
				$('#friends').show();
				$('#message').append("<li><strong>"+category[index].toUpperCase()+"</li></strong>");
				$('#friends').append("<li><strong>Friends Suggestions</li></strong>");
				fbRecs.appendToDiv(category[index]);
				getUserLikes(id,name,category[index]);

				
				$( "#dialog" ).dialog({
				  resizable: true,
				  height:300,
				  width: 450,
				  modal: true,
			      closeOnEscape: true,
				  buttons: {
					"Previous": function() {
					  $('#message').show();
					  $('#friends').show();
					  index = (index-1+category.length)%3;
					  $('#message').empty();
					  $('#friends').empty();
					  $('#message').append("<li><strong>"+category[index].toUpperCase()+"</strong></li>");
					  $('#friends').append("<li><strong>Friends Suggestions</li></strong>");
					  fbRecs.appendToDiv(category[index]);
					  getUserLikes(id,name,category[index]);
					  console.log(fbRecs);
					  
					},
					"Next": function() {
						$('#message').show();
						$('#friends').show();
						index = (index+1)%3;
						$('#message').empty();
						$('#friends').empty();
						$('#message').append("<li><strong>"+category[index].toUpperCase()+"</strong></li>");
						$('#friends').append("<li><strong>Friends Suggestions</li></strong>");
						fbRecs.appendToDiv(category[index]);
						getUserLikes(id,name,category[index]);
						console.log(fbRecs);
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
					//console.log(response.data[0]["name"]);
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
					storeFriendLikes(friendsArray);
				  }
				  });
		}
		//The function is for getting the facebook likes of the
		//current user
		function getUserLikes(id,friendName,category)
		{
			FB.api('/me/likes?limit=200',function(response){
				if (response && !response.error) {
					getLikes(id,friendName,response.data,category);
				}
			});
		}
		
		function storeFriendLikes(friendsArray)
		{
			FB.api('/me/likes?limit=200',function(userlikes){
				if (userlikes && !userlikes.error) {
					var compareLikes = {};
					for(var p=0; p<userlikes.data.length; p++)
					{
						compareLikes[userlikes.data[p]["name"]] = true;
					}
					//console.log(compareLikes);
					for(var i=0; i<friendsArray.length; i++)
					{	
						var name = friendsArray[i]["name"];
						var id = friendsArray[i]["id"];
						FB.api('/'+id+'/likes?limit=200', (function(name) { return function(response){
							if (response && !response.error) {
								for(var k=0; k<response.data.length; k++)
								{
									var cat = response.data[k]["category"].toLowerCase();
									if(typeof fbRecs.categories[cat] != 'undefined')
									{
										if(!(compareLikes[response.data[k]["name"]] === true))
										{
											var itemName = response.data[k]["name"];
											if(typeof fbRecs.categories[cat][itemName] != 'undefined'){
												if(!(fbRecs.categories[cat][itemName].friendNames[name] === true))
												{
													fbRecs.categories[cat][itemName].friendNames[name] = true;
													var count = (fbRecs.categories[cat][itemName].count) + 1;
													fbRecs.categories[cat][itemName].count = count;
												}
											}
											else
											{
												fbRecs.categories[cat][itemName] = {};
												fbRecs.categories[cat][itemName].friendNames = {};
												fbRecs.categories[cat][itemName].friendNames[name] = true;
												fbRecs.categories[cat][itemName].count = 1;
											}
										}
									}
								}					
							}
						}})(name));
					}
				}
			});
		}
		
		function FriendLikes(){
			this.categories = {"movie":{},"tv show":{},"musician/band":{}};
			this.sort = function(){
				var sortable = [];
				for (var item in this.categories["movie"])
				{
					  if(item != 'sorted')
					  {
						sortable.push([item, this.categories["movie"][item]["count"], this.categories["movie"][item]["friendNames"]]);
					  }
				}
				sortable.sort(function(a, b) {return b[1] - a[1]});
				this.categories["movie"].sorted = sortable;
				var sortableTV = [];
				for (var item in this.categories["tv show"])
				{
					if(item != 'sorted')
					{
					  sortableTV.push([item, this.categories["tv show"][item]["count"], this.categories["tv show"][item]["friendNames"]]);
					}
				}
				sortableTV.sort(function(a, b) {return b[1] - a[1]});
				this.categories["tv show"].sorted = sortableTV;
				var sortableMusic = [];
				for (var item in this.categories["musician/band"])
				{
					if(item != 'sorted')
					{
					  sortableMusic.push([item, this.categories["musician/band"][item]["count"], this.categories["musician/band"][item]["friendNames"]]);
					}
				}
				sortableMusic.sort(function(a, b) {return b[1] - a[1]});
				this.categories["musician/band"].sorted = sortableMusic;
			};
			this.appendToDiv = function(category){
				this.sort();
				if(category != 'musician/band')
				{
					for(var i=0; i<3; i++)
					{
						var name = this.categories[category].sorted[i][0];
						var sortedArray = this.categories[category].sorted[i];
						$.getJSON('http://www.omdbapi.com/?t=' + name, (function(sortedArray) { return function(data){
							if(data.Response === "True")
							{
								var friendObj = sortedArray[2];
								var friendNames = [];
								for( var f in friendObj) friendNames.push(f);
								var displayNames = 'Liked by ';
								for(var j=0; j<friendNames.length-1; j++)
								{
									displayNames += friendNames[j] + ' , ';
								}
								displayNames += friendNames[friendNames.length-1];
								$('#friends').append('<a href="http://www.imdb.com/title/'+data.imdbID+'/" title="'+ displayNames +'"><li style="display:block;">' + data.Title + '</li></a>');
							}
						};})(sortedArray));
					}
				}
				else
				{
					for(var i=0; i<3; i++)
					{
						var name = this.categories[category].sorted[i][0];
						var sortedArray = this.categories[category].sorted[i];
						$.getJSON('http://ws.audioscrobbler.com/2.0/?format=json&method=artist.getinfo&artist='+name+'&api_key=8a981fbe76b27b7e1fd32e9248a0454b', (function(sortedArray) { return function(data){
							if(typeof data.artist != 'undefined')
							{
								var artname = data.artist.name;
								var url = data.artist.url.substr(7);
								var friendObj = sortedArray[2];
								var friendNames = [];
								for( var f in friendObj) friendNames.push(f);
								var displayNames = 'Liked by ';
								for(var j=0; j<friendNames.length-1; j++)
								{
									displayNames += friendNames[j] + ' , ';
								}
								displayNames += friendNames[friendNames.length-1];
								$('#friends').append('<a href="https://'+ url +'" title="' + displayNames +'"><li style="display:block;">' + artname + '</li></a>');
							}
							else{
								var artname = sortedArray[0];
								var friendObj = sortedArray[2];
								var friendNames = [];
								for( var f in friendObj) friendNames.push(f);
								var displayNames = 'Liked by ';
								for(var j=0; j<friendNames.length-1; j++)
								{
									displayNames += friendNames[j] + ' , ';
								}
								displayNames += friendNames[friendNames.length-1];
								$('#friends').append('<span title="' + displayNames +'"><li style="display:block;">' + artname + '</li></span>');
							
							}
						};})(sortedArray));
					}
				}
			};
		}
	}
