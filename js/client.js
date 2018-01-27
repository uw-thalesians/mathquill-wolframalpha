$(document).ready(function(){

    //if the app id is set and the control disabled, the server already
    //has the id, and it doesnt need to be sent in the post
    var inputAppID = $("#app_id");
    var useAppID = !inputAppID.prop("disabled");

    var showID = $("#show_id");
    
    function toggleID(){
        
        inputAppID = inputAppID.clone().attr('type', (inputAppID.attr('type')=="password"?"text":"password")).insertAfter("#app_id").prev().remove();

        console.log("check")
        inputAppID = $("#app_id");
    }

    showID.click(toggleID);


    console.log(inputAppID, useAppID);

    $("#submit").click(function(){

        //console.log("getting mq data to send back to the server");

        var MQ = MathQuill.getInterface(2);
        //console.log(MQ);
        
        var problem = MQ.MathField($('#problem')[0]);

        //console.log(problem.latex());

        var MQdata = problem.latex();
        
        //console.log(MQdata);
        
        var json = {
            "query": MQdata
        };

        if(useAppID)
            json.app_id = inputAppID.val();

        $.post("use_wolfram", json, function(data, status){
            
            //console.log(data);
            //console.log(status);
            
            var output = data.error;
            if(!output)
            {
                var queryresult = data.result;

                const pods = queryresult.pods;
                output = pods.map((pod) => {
                const subpodContent = pod.subpods.map(subpod =>
                `  <img src="${subpod.img.src}" alt="${subpod.img.alt}">`
                    ).join('\n');
                    return `<h2>${pod.title}</h2>\n${subpodContent}`;
                    }).join('\n');

                //console.log(output);
            }
            
            $("#results").html(output);

        });

    });

});