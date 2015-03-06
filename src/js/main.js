define([
    'iframe-messenger',
    'json!data/data.json',
    'ractive',
    'get',
    'jquery',
    'text!./templates/appTemplate.html',
    './ractive-events-tap.js'
], function(
    iframeMessenger,
    data,
    Ractive,
    get,
    $,
    appTemplate
) {
   'use strict';

    var dogs, title, standfirst, byline;

    function init(el, context, config, mediator) {
        // get('http://interactive.guim.co.uk/spreadsheetdata/1j5tKq-oRLIiBP51kgjHRcdf2UxCR1zlukj7v1-6qT-c.json')
        // .then(JSON.parse)
        // .then(function(response){
        //     console.log('loaded data')
        //     dogs = response.sheets.Sheet1;
        //     renderDogs(el);
        // })

        dogs = data.sheets.Sheet1;
        renderDogs(el);

        iframeMessenger.enableAutoResize();
    }

    function renderDogs(el){
        var selectedDogHash = document.location.hash ? document.location.hash.replace('#','') : null;
        $('article.content--interactive').addClass('interactiveContainer');
        $('#article-header.article__header').addClass('interactiveMobile')
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
                },
                loadImage: function(url,name){
                    var imagez = new Image();
                    imagez.onload = function(){
                        return 'hey'
                    }
                    imagez.src = url;
                    imagez.alt = name;
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
                

                $('#allDogs').animate({
                    opacity:0.2
                },100)
                    

                var detailOffset = $('#content').offset().top;
                $('html,body').animate({
                    scrollTop:detailOffset
                },500,function(){
                    $('#allDogs').animate({
                        opacity:1
                    },10)
                });

                
            }
        })
        container.on('shareDog',shareContent)
    }

    function shareContent(event, platform){
        var sharepics = {
            "echo":"pic.twitter.com/7r7kgMZ70p",
            "willow": "pic.twitter.com/RDX1OidAEx",
            "tyke": "pic.twitter.com/rxhbe0yBfJ",
            "obi": "pic.twitter.com/NhT8vPk4gQ",
            "ellie": "pic.twitter.com/qKHmjm1IyZ",
            "ronnie":"pic.twitter.com/mKpGDBy6Sl",
            "toby": "pic.twitter.com/cmAK5Xdkos",
            "jj": "pic.twitter.com/cP2sdxDGVW",
            "murphy": "pic.twitter.com/n2rNgSq8iv"
        }
        var shareWindow;
        var twitterBaseUrl = "http://twitter.com/share?text=";
        var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";
        var sharemessage = "Britain's most heroic dogs: " + event.context.name + ", " + event.context.shareline + " " + sharepics[event.context.id];
        var urlsuffix = "#" + event.context.id;
        var shareImage = "@@assetPath@@/imgs/" + event.context.id + "/" + event.context.image;
        console.log(shareImage);
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
            standfirst: " meet Britain’s most heroic dogs "
        };
        
        // var title = furniture.title;
        title = $('header.content__head h1');
        byline = $('.content__main .content__meta-container.u-cf');


        if(title.length > 0){
            title = $(title).get(0).textContent;
            standfirst = title.split(':')[1];
            title = title.split(':')[0];
        }else{
            title = furniture.title;
        }

        if(!standfirst){
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
