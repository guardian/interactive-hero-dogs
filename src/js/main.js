define([
    'iframe-messenger',
    'ractive',
    'jquery',
    'text!./templates/appTemplate.html',
    './ractive-events-tap.js'
], function(
    iframeMessenger,
    Ractive,
    $,
    appTemplate
) {
   'use strict';

    var dogs;

    function init(el, context, config, mediator) {
        $.getJSON('http://interactive.guim.co.uk/spreadsheetdata/1j5tKq-oRLIiBP51kgjHRcdf2UxCR1zlukj7v1-6qT-c.json',function(response){
            dogs = response.sheets.Sheet1;
            renderDogs(el);
        })

        iframeMessenger.enableAutoResize();
    }

    function renderDogs(el){
        var selectedDogHash = document.location.hash ? document.location.hash.replace('#','') : null;

        $('article.content--interactive').addClass('interactiveContainer');

        dogs.map(function(dog){
            if(selectedDogHash === dog.id){
                dog.selected = true;
            }else{
                dog.selected = false;
            }
            dog.story = dog.story.split('\n').filter(function(paragraph){
                return paragraph;
            })
        })
        var container = new Ractive({
            el:el,
            template:appTemplate,
            data: {
                allDogs: dogs
            }
        })

        container.on('selectDog',function(e,dog){
            if(!dog.selected){
                dogs.forEach(function(dog){
                    dog.selected = false;
                })
                dog.selected = true;
                document.location.hash = dog.id;
                container.update('allDogs')

                var detailOffset = $('#content').offset().top;
                $('html,body').animate({
                    scrollTop:detailOffset
                },500);
            }
        })
        container.on('shareDog',shareContent)
    }

    function shareContent(event, platform){
        var shareWindow;
        var twitterBaseUrl = "https://twitter.com/home?status=";
        var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
        
        var sharemessage = event.context.name + " " + event.context.shareline;
        var urlsuffix = "#" + event.context.id;
        var shareImage = "@@assetPath@@/imgs/" + event.context.image;
        var guardianUrl = "http://interactive.guim.co.uk/2015/03/hero-dogs/" + urlsuffix;
        
        console.log(shareImage);
         
        if(platform === "twitter"){
            shareWindow = 
                twitterBaseUrl + 
                encodeURIComponent(sharemessage) + 
                "%20" + 
                encodeURIComponent(guardianUrl)
            
        }else if(platform === "facebook"){
            shareWindow = 
                facebookBaseUrl + 
                encodeURIComponent(guardianUrl) + 
                "&picture=" + 
                encodeURIComponent(shareImage) + 
                "&redirect_uri=http://www.theguardian.com";
        }else if(platform === "mail"){
            shareWindow =
                "mailto:" +
                "?subject=" + sharemessage +
                "&body=" + guardianUrl 
        }
        window.open(shareWindow, platform + "share", "width=640,height=320");
    }

    return {
        init: init
    };
});
