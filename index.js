var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var readline = require('readline');

var args = [];
var orgID = "";

function AddOrg(name, next) {
    // Build the post string from an object
    var post_data = querystring.stringify({
        'Name' : 'RandomOrg'+name
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: args[0],
        port: args[1],
        path: '/orgs/add',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    var ret = Post(post_options, post_data, x => {console.log("Added an org."); next();});
    
}

function AddUser(name, orgid, next) {
    // Build the post string from an object
    var post_data = querystring.stringify({
        "Name" : "RandomPerson"+name,
        "Phone": "123-123-1234",
        "Email": "user@email.com",
        "Username": "someusername"+name,
        "Password": "somepassword"
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: args[0],
        port: args[1],
        path: '/user/add',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    Post(post_options, post_data, x => {console.log("Added a user. ID:"); next();});

}

function AddParty(name, orgid, next) {
    // Build the post string from an object
    var post_data = querystring.stringify({
        'Name' : 'RandomParty'+name,
        'OrgID': orgID,
        'Capacity': '100',
        'UnixDate': '0',
        'Latitude': '43.0777320',
        'Longitude': '-89.4177600',
        'IsPublic': (Math.random() < 0.5)
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: args[0],
        port: args[1],
        path: '/parties/add',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    Post(post_options, post_data, x => {console.log("Added a party."); next();});
}

function Post(post_options, post_data, onresp) {
    // Set up the request
    var resp = "";

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            resp = chunk;
            if(resp.includes("org")){orgID = resp; console.log("OrgID is "+orgID);}
            onresp();
            console.log(resp);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

    return resp;
}

function NukeDB(next) {
    console.log('Attempting to drop VeriFrat database...\n');

    var optionsget = {
        host : args[0],
        port : args[1],
        path : '/nukedb', // the rest of the url with parameters if needed
        method : 'GET' // do GET
    };

    var reqGet = http.request(optionsget, function(res) {
        res.on('data', function(d) {
            console.log(
                "Successfully dropped database <verifrat-db>\n"
            );   
            next();     
        });
    });
    
    reqGet.end();
}

var main = function () { 
    var rl = readline.createInterface({
        input : process.stdin,
        output : process.stdout
      });
    
    rl.question('Enter VeriFrat API host IP (Default: localhost) \n', function(line){
        if(line === "") {
            line = "localhost";
        }
        args.push(line);
        rl.question('Enter VeriFrat API host port (Default: 5000) \n', function(line){
            if(line === "") {
                line = "5000";
            }
            args.push(line);
            outside();
            rl.close();
        });
    });
    outside = function() {
        console.log("Host: " + args[0]);
        console.log("Port: "+ args[1]);
        console.log("           Starting test sequence..");
        console.log("================================================")
        NukeDB(x=> {
            AddOrg(1, x=> {
                AddUser(1, orgID, x=> {
                    AddParty(1, orgID, x => {
                        AddParty(2, orgID, x=> {
                            AddParty(3, orgID, x=> {
                                AddParty(4, orgID, x=> {
                                    console.log("Test complete.");
                                });
                            });
                        });
                    });                    
                });
            });
        });
        

    }
} 
if (require.main === module) { 
    main(); 
}