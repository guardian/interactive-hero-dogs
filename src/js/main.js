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

    var dogs, title, standfirst, byline;

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
        getPageData();

        dogs.map(function(dog){
            if(selectedDogHash === dog.id){
                dog.selected = true;
            }else{
                dog.selected = false;
            }
            dog.story = dog.story.split('\n').filter(function(paragraph,i){
                return paragraph;
            })
        })
        var container = new Ractive({
            el:el,
            template:appTemplate,
            data: {
                allDogs: dogs,
                furniture: {
                    title: title,
                    standfirst: standfirst,
                    byline: byline
                }
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
        var twitterBaseUrl = "http://twitter.com/share?text=";
        var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
        var sharemessage = "Britain's most heroic dogs: " + event.context.name + ", " + event.context.shareline;
        var urlsuffix = "#" + event.context.id;
        var shareImage = "@@assetPath@@/imgs/" + event.context.image;
        var guardianUrl = "http://gu.com/p/46bdb/" + urlsuffix;
         
        if(platform === "twitter"){
            shareWindow = 
                twitterBaseUrl + 
                encodeURIComponent(sharemessage) + 
                "&url=" + 
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

    function getPageData(){
        var furniture = {
            title: "Have cape, will travel",
            standfirst: "Meet Britain’s most heroic dogs"
        };
        
        // var title = furniture.title;
        title = $('header.content__head h1');
        standfirst = $('header.content__head .content__standfirst p');
        byline = $('.content__main .content__meta-container.u-cf');


        if(title.length > 0){
            title = $(title).get(0).textContent;
        }else{
            title = furniture.title;
        }

        if(standfirst.length > 0){
            standfirst = $(standfirst).get(0).textContent;
        }else{
            standfirst = furniture.standfirst;
        }

        if(byline.length > 0){
            byline = $(byline).get(0).outerHTML;
        }else{
            byline = "";
        }

    }

    return {
        init: init
    };
});
