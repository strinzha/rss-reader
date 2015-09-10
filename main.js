(function(){    

    var countChannels = 0;

    function addChannel() {
        var newChannelUrl = $('#name-channel').val();        

        showChannelTitle(newChannelUrl);       
        showCountChannels('plus'); 

        //clear input after click on Add button
        $('#name-channel').val('');     
    }

    function showChannelTitle(url) {
        $.ajax({
            url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=99999&q="+url,    
            jsonp: "callback",   
            dataType: "jsonp",   
            data: {
                format: "json"
            }
        }).done(function(response) {
            var data = [];
            data.push(response);

               $('.channels').append('<li class="channels__item" data-url="'+data[0].responseData.feed.feedUrl+'"><div class="channels__name">' + data[0].responseData.feed.title+'</div><div class="channels__close"></div></li>');               
        });
    }

    function showCountChannels(sign) {
        if (sign === 'plus') {
            countChannels++;
        } else if (sign === 'minus') {
            countChannels--;
        }       
        
        $('.channels__count').html('Число каналов: ' + countChannels);
    }

    function createArticles(url) {    	
    	$.ajax({
		    url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=99999&q="+url,    
		    jsonp: "callback",   
		    dataType: "jsonp",   
		    data: {
		        format: "json"
		    }
		}).done(function(response) {
			var data = [];
		    data.push(response);

		    showArticles(data); //show all articles in current channel

		    //Handler
		    $(document).on('click','.articles__item', function(){
		     	var number = $(this).attr('data-number');
		    	showMessage(data, number); //show message of current article
		    });		   

		});
    }

    function showArticles(data) {
        var countMessages = 0,
            authors = [];
        
        $('.articles').html(''); //clear articles

        for (var i in data[0].responseData.feed.entries) { 
            var notEqual = true,
                currentAuthor = data[0].responseData.feed.entries[i].author;

            //show titles of messages
            $('.articles').append($('<li class="articles__item" data-number="'+countMessages+'">').text(data[0].responseData.feed.entries[i].title));

            //counting authors
            for (var j in authors) {
                if (currentAuthor === authors[j]) {
                    notEqual = false;
                }
            }

            if (notEqual) {
                authors.push(currentAuthor);
            }

            //counting messages
            countMessages++;
        }

        $('.articles').prepend($('<div class="articles__count">').text('Число сообщений: ' + countMessages), $('<div class="articles__author">').text('Число авторов: ' + authors.length));
                
    }

    function showMessage(data, number) {    	
    	for (var i in data[0].responseData.feed.entries) {
    		if (i === number) {
                var message = data[0].responseData.feed.entries[i].content;

                //show message
    			$('.messages').html(message);
    			
    			createChart(message);
    		}
    	}
    }

    function createChart(message) {    	
    	var result = message.toLowerCase().replace(/<[^>]+>/g,''), //remove all html tags
    	    dataPie = [];    	
    	    alphabet = 'abcdefjhijklmnopqrstuvwxyz';

    	for (var i = 0; i < 26; i++) {
            var currentSymbol = alphabet.charAt(i),
                colorHex = '#'+Math.floor(Math.random()*16777215).toString(16), //Paul Irish solution for random HEX color
                val = result.split(currentSymbol).length - 1; 

		    dataPie.push({
		     	value : val,
		 		color : colorHex,
		 		label : currentSymbol
		 	}); //create data array for showPieChart
		}
		
		showPieChart(dataPie);
    	  		
    }    
  
    function showPieChart(data) { 
        var pieData = data,    	           
            pieOptions = {
                    segmentShowStroke : true,
                    animation: false
            };

        
        $('#chart').html($('<canvas id="chart-pie" width="300" height="300">'));

        var chartEl= $("#chart-pie").get(0).getContext("2d"),
            pieChart = new Chart(chartEl).Pie(pieData, pieOptions);
    }  	
    
    

    //Handlers
    $('#add-channel').on('click', addChannel);

    $(document).on('click','.channels__item', function(){
    	var url = $(this).attr('data-url');

    	$('.messages').html('');
    	$('#chart').html('');

    	createArticles(url);
    });

    $(document).on('click','.channels__close', function(event) {
    	event.stopPropagation();

    	$(this).parent().remove();
        
        //clear all sections after remove channel
        $('.articles').html('');
        $('.messages').html('');
        $('#chart').html('');

    	showCountChannels('minus');
    });

    //Initialize
    showCountChannels();

})();