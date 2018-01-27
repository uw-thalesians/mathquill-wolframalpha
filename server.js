const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const fs = require('fs');

const WolframAlphaAPI = require('wolfram-alpha-api');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

function make_request(res, client_query, app_id){

    //console.log(app_id);

    if(!app_id)
    {
        res.json({error: "An App ID is required to use Wolfram Alpha APIs"});
    }
    else{

        const waAPI = WolframAlphaAPI(app_id);

        //res.json({result: client_query});

        waAPI.getFull(client_query).then(function(wolfram_resp){
            
            res.json({result: wolfram_resp});
        }).catch(console.error);  
    }
}

function getAppID(end_fn){    
    
    fs.readFile("../wolfram-appid.txt", function(error, text){
        
        var app_id = text.toString();
        
        //console.log(app_id);
        
        end_fn(app_id)});

}

app.post('/use_wolfram', function(req, res, next){

    console.log(req.body);

    var client_query = req.body.query;

    if(req.body.app_id != undefined){

        make_request(res, client_query, req.body.app_id);
    
    }else{

        getAppID( function(app_id){ make_request(res, client_query, app_id); } );
            
    }
});

app.get('/', function(req, res, next){
    
    getAppID(function(app_id){
        
        const index_markup = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
            <link rel="stylesheet" href="node_modules/mathquill/build/mathquill.css">
        
            <script src="node_modules/jquery/dist/jquery.min.js"></script>
        
            <script src="node_modules/mathquill/build/mathquill.js"></script>
            
            <script src="js/client.js"></script>

            <title>mathquill-wolframalpha</title>
        </head>
        <body>
            <header>
                <div class="jumbotron jumbotron-fluid p-4">
                    <h1>MathQuill &amp; Wolfram Alpha</h1>
                </div>
            </header>
            <main class="container-fluid">
                <div class="row p-4">
                    <div class="col-12 text-center align-middle p-2">
                        <div class="card">
                            <div class="card-block p-5">
                                <p class="card-title">
                                Enter an equation (e.g. <span id="example"> ax^2 + bx + c = 0 </span>):
                                    
                                </p>
                                <div class="card-text p-2 row">

                                        <span class="col-8" id="problem"></span>
                                        <div class="btn btn-success offset-2 col-auto" id="submit">Submit</div>
                                </div>
                                <script>
                                    var MQ = MathQuill.getInterface(2);
                                    MQ.StaticMath($('#example')[0]);
                                    var problem = MQ.MathField($('#problem')[0], {
                                    handlers: {
                                        edit: function() {
                                        
                                        }
                                    }
                                    });
                                </script>
                            </div>
                        </div>
                    </div>
                    <div class=" col-8 p-2">
                        <div class="card">
                            <div class="card-block">
                                <div class="card-title">
                                    Results
                                </div>
                                <div clas="card-text text-center" style="overflow-y: scroll; max-height: 35vh;">
                                    <p id="results">No results yet! Enter an equation and submit it to Wolfram Alpha</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-1">
                        <label>
                            App ID to use
                            <input type="password" id="app_id" value="`+ app_id +`"`+ ((app_id!=0)?" disabled":"")+`>
                        </label>` + 
                        ((app_id==0)?`<p><a href="https://developer.wolframalpha.com/portal/signin.html">Sign up</a> for one if you dont have one!</p>`:"") +
                    `</div>
                    <div class="offset-1 col-auto">
                        <label>
                            <input id="show_id" type="checkbox">
                            Show App ID
                        </label>
                    </div>
                </div>
            </main>
        </body>
        </html>
        `;
        res.send( index_markup );
    });
});

app.use("/node_modules", express.static(__dirname + '/node_modules'));

app.use("/js", express.static(__dirname + '/js'));

app.listen(80, function () {
  console.log('Web server listening on port 80')
});