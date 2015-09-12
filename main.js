(function(){    

    var countChannels = 0;
    var currentChannel = {};

    var Application = {
        read : function(url, callback) {
            $.ajax({
            url: "https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=99999&q="+url,    
            jsonp: "callback",   
            dataType: "jsonp",   
            data: {
                format: "json"
                },
            success: function (data) {
                callback(data);
            }
            });
        },
        addChannel: function() {
            var newChannelUrl = $('#name-channel').val();

            //clear input after click on Add button
            $('#name-channel').val('');
                  
            Application.read(newChannelUrl, function(response) {
                var data = [];
                data.push(response.responseData.feed);

                $('.channels').append('<li class="channels__item" data-url="'+data[0].feedUrl+'"><div class="channels__name">' + data[0].title+'</div><div class="channels__close"></div></li>')               
                    .trigger('add-channel');
            });              
        },
        showCountChannels: function(sign) {
            if (sign === 'plus') {
                countChannels++;
            } else if (sign === 'minus') {
                countChannels--;
            }       
            
            $('.channels__count').html('Число каналов: ' + countChannels);
        },
        createArticles: function(url) {

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

            Application.read(url, function(response) {
                var data = [];
                data.push(response);

                currentChannel = {
                    url: url
                };

                showArticles(data); //show all articles in current channel

             });
        },
        showMessage: function(data, number) {

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


            var entries = data[0].responseData.feed.entries;
            for (var i in entries) {
                if (i === number) {
                    var message = entries[i].content;
                       
                    //show message
                    $('.messages').html(message);
                        
                    createChart(message);
                }
            }
        },
        clearSections : function() {

            $('.articles').html('');
            $('.messages').html('');
            $('#chart').html('');
        }
    };


    //Handlers
    $('#add-channel').on('click', Application.addChannel);

    $('.channels').on('add-channel', function(e) {        
        Application.showCountChannels('plus');
    });
  
    $(document).on('click','.channels__item', function(){
        var url = $(this).attr('data-url');

        Application.clearSections();
        Application.createArticles(url);
    });

    $(document).on('click','.articles__item', function(){
        var number = $(this).attr('data-number');

        Application.read(currentChannel.url, function(response) {
                var data = [];              

                data.push(response);     

                Application.showMessage(data, number); //show message of current article

             });
       
    });  
    
    $(document).on('click','.channels__close', function(event) {
    	event.stopPropagation();

    	$(this).parent().remove();
        
        //clear all sections after remove channel
        Application.clearSections();
    	Application.showCountChannels('minus');
    });

    //Initialize
    Application.showCountChannels();

})();