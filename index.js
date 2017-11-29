var querystring = require('querystring');
var http = require('http');
var fs = require('fs');
var readline = require('readline');

var args = [];

function AddOrg(name) {
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

    var ret = Post(post_options, post_data);

    console.log("Added an org.");

    return ret;
}

function AddUser(name) {
    // Build the post string from an object
    var post_data = querystring.stringify({
        'Name' : 'RandomPerson'+name,
        'Phone': '123-123-1234',
        'Email': 'user@email.com',
        'username': 'someusername'+name,
        'rawPassword': 'somepassword'
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

    Post(post_options, post_data);

    console.log("Added a user.");
}

function AddParty(name, orgid) {
    // Build the post string from an object
    var post_data = querystring.stringify({
        'Name' : 'RandomParty'+name,
        'OrgID': orgid,
        'Capacity': '100',
        'UnixDate': '0',
        'Latitude': '43.0777320',
        'Longitude': '-89.4177600',
        'IsPublic': (Math.random() < 0.5).toString()
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

    Post(post_options, post_data);

    console.log("Added a user.");
}

function Post(post_options, post_data) {
    // Set up the request
    var resp = "";

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            resp = chunk;
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

    return chunk;
}

function NukeDB() {
    console.log('Attempting to drop VeriFrat database...\n');

    http.get(args[0]+args[1]+"/nukedb", res => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", data => {
          body += data;
        });
        res.on("end", () => {
          body = JSON.parse(body);
          console.log(
              "Successfully dropped database <verifrat-db>\n"
          );
        });
      });
}

var main = function () { 
    var rl = readline.createInterface({
        input : process.stdin,
        output : process.stdout
      });
    
    rl.question('Enter VeriFrat API host IP (Default: localhost) \n', function(line){
        if(line === "") {
            line = "http://localhost/";
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
        NukeDB();
        var orgID = AddOrg();
        AddUser();
        AddParty();
        AddParty();
        AddParty();
        AddParty();
        
    }

} 
if (require.main === module) { 
    main(); 
}