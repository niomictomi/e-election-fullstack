var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');

var crypto = require('crypto');

var XMLHttpRequest = require('xhr2');

var axios = require('axios');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: false
}));

var server = require('http').Server(app);

var config = require('./config');

app.get('/',function(req,res){
  res.send('Welcome to E-election app!');
});

app.get('/date',function(req,res){
  var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
  var targetDate = new Date() // Current date/time of user computer
  var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
  var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
  var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

  var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
  xhr.open('GET', apicall) // open GET request
  xhr.onload = function(){
      if (xhr.status === 200){ // if Ajax request successful
          var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
          console.log(output.status) // log API return status for debugging purposes
          if (output.status == 'OK'){ // if API reports everything was returned successfully
              var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
              var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
              console.log(localdate.toLocaleString()) // Display current India date and time
              res.send(localdate.toLocaleString().split(',')[0]);
          }
      }
      else{
          alert('Request failed.  Returned status of ' + xhr.status)
      }
  }
  xhr.send() // send request
});

app.get('/time',function(req,res){
  function convertTime12to24(time12h) {
    const [time, modifier] = time12h.split(' ');

    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    return hours + ':' + minutes;
  }

  var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
  var targetDate = new Date() // Current date/time of user computer
  var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
  var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
  var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

  var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
  xhr.open('GET', apicall) // open GET request
  xhr.onload = function(){
      if (xhr.status === 200){ // if Ajax request successful
          var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
          console.log(output.status) // log API return status for debugging purposes
          if (output.status == 'OK'){ // if API reports everything was returned successfully
              var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
              var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
              console.log(localdate.toLocaleString()) // Display current India date and time
              //res.send(localdate.toLocaleString());
              var x = localdate.toLocaleString().split(',')[1];
              var y = convertTime12to24(x.trim());
              var z = y+':'+x.split(':')[2];
              res.send(z.split(' ')[0]);
          }
      }
      else{
          alert('Request failed.  Returned status of ' + xhr.status)
      }
  }
  xhr.send() // send request

});

app.post('/election-over',function(req,res){

    var cdate='';
    var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
    var targetDate = new Date() // Current date/time of user computer
    var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
    var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
    var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

    var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
    xhr.open('GET', apicall) // open GET request
    xhr.onload = function(){
        if (xhr.status === 200){ // if Ajax request successful
            var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
            console.log(output.status) // log API return status for debugging purposes
            if (output.status == 'OK'){ // if API reports everything was returned successfully
                var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
                var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
                console.log(localdate.toLocaleString()) // Display current India date and time
                cdate = localdate.toLocaleString().split(',')[0];

                var election_id = req.body.eid;

                var body = {
                    "type": "select",
                    "args": {
                        "table": "election",
                        "columns": [
                            "election_end_time"
                        ],
                        "where": {
                            "election_id": {
                                "$eq": election_id
                            }
                        }
                    }
                };

                var request = new XMLHttpRequest();

                request.onreadystatechange = function(){
                  if(request.readyState === XMLHttpRequest.DONE)
                  {
                    if(request.status === 200)
                    {
                      //res.status(200).send(request.responseText);

                      var end_time = JSON.parse(request.responseText)[0];
                      var eedate = end_time.election_end_time.split('T')[0];

                      var eey = Number(eedate.split('-')[0]);
                      var eem = Number(eedate.split('-')[1]);
                      var eed = Number(eedate.split('-')[2]);
                      console.log(eey);
                      console.log(eem);
                      console.log(eed);

                      console.log(cdate);
                      var cy = Number(cdate.split('/')[2]);
                      var cm = Number(cdate.split('/')[0]);
                      var cd = Number(cdate.split('/')[1]);
                      console.log(cy);
                      console.log(cm);
                      console.log(cd);

                      if(cy > eey)
                      {
                        res.send('1');
                      }
                      else if(cy === eey && cm > eem)
                      {
                        res.send('1');
                      }
                      else if(cy === eey && cm === eem && cd > eed)
                      {
                        res.send('1');
                      }
                      else if(cy === eey && cm === eem && cd === eed)
                      {
                        function convertTime12to24(time12h) {
                          const [time, modifier] = time12h.split(' ');

                          let [hours, minutes] = time.split(':');

                          if (hours === '12') {
                            hours = '00';
                          }

                          if (modifier === 'PM') {
                            hours = parseInt(hours, 10) + 12;
                          }

                          return hours + ':' + minutes;
                        }

                        var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
                        var targetDate = new Date() // Current date/time of user computer
                        var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
                        var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
                        var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

                        var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
                        xhr.open('GET', apicall) // open GET request
                        xhr.onload = function(){
                            if (xhr.status === 200){ // if Ajax request successful
                                var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
                                console.log(output.status) // log API return status for debugging purposes
                                if (output.status == 'OK'){ // if API reports everything was returned successfully
                                    var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
                                    var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
                                    console.log(localdate.toLocaleString()) // Display current India date and time
                                    //res.send(localdate.toLocaleString());
                                    var x = localdate.toLocaleString().split(',')[1];
                                    var y = convertTime12to24(x.trim());
                                    var z = y+':'+x.split(':')[2];
                                    var ctime = z.split(' ')[0];

                                    var eetime = end_time.election_end_time.split('T')[1].split('+')[0];
                                    console.log(eetime);

                                    var eehr = Number(eetime.split(':')[0]);
                                    var eemin = Number(eetime.split(':')[1]);
                                    var eesec = Number(eetime.split(':')[2]);

                                    console.log(ctime);
                                    var chr = Number(ctime.split(':')[0]);
                                    var cmin = Number(ctime.split(':')[1]);
                                    var csec = Number(ctime.split(':')[2]);

                                    if(chr > eehr)
                                    {
                                      res.send('1');
                                    }
                                    else if(chr === eehr && cmin > eemin)
                                    {
                                      res.send('1');
                                    }
                                    else if(chr === eehr && cmin === eemin && csec > eesec)
                                    {
                                      res.send('1');
                                    }
                                    else
                                    {
                                      res.send('0');
                                    }

                                }
                            }
                            else{
                                alert('Request failed.  Returned status of ' + xhr.status)
                            }
                        }
                        xhr.send() // send request
                      }
                      else
                      {
                        res.send('0');
                      }

                    }
                    else if(request.status === 401)
                    {
                      res.status(500).send(request.responseText);
                    }
                    else if(request.status === 500)
                    {
                      res.status(500).send(request.responseText);
                    }
                  }
                };

                request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
                request.setRequestHeader('Content-Type','application/json');
                request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
                request.send(JSON.stringify(body));

            }
        }
        else{
            alert('Request failed.  Returned status of ' + xhr.status)
        }
    }
    xhr.send() // send request

});

app.post('/election-start',function(req,res){


      var cdate='';
      var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
      var targetDate = new Date() // Current date/time of user computer
      var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
      var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
      var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

      var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
      xhr.open('GET', apicall) // open GET request
      xhr.onload = function(){
          if (xhr.status === 200){ // if Ajax request successful
              var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
              console.log(output.status) // log API return status for debugging purposes
              if (output.status == 'OK'){ // if API reports everything was returned successfully
                  var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
                  var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
                  console.log(localdate.toLocaleString()) // Display current India date and time
                  cdate = localdate.toLocaleString().split(',')[0];

                  var election_id = req.body.eid;

                  var body = {
                      "type": "select",
                      "args": {
                          "table": "election",
                          "columns": [
                              "election_start_time"
                          ],
                          "where": {
                              "election_id": {
                                "$eq": election_id
                              }
                          }
                      }
                  };

                  var request = new XMLHttpRequest();

                  request.onreadystatechange = function(){
                    if(request.readyState === XMLHttpRequest.DONE)
                    {
                      if(request.status === 200)
                      {
                        //res.status(200).send(request.responseText);

                        var start_time = JSON.parse(request.responseText)[0];
                        var eedate = start_time.election_start_time.split('T')[0];

                        console.log(eedate);
                        var eey = Number(eedate.split('-')[0]);
                        var eem = Number(eedate.split('-')[1]);
                        var eed = Number(eedate.split('-')[2]);
                        console.log(eey);
                        console.log(eem);
                        console.log(eed);

                        console.log(cdate);
                        var cy = Number(cdate.split('/')[2]);
                        var cm = Number(cdate.split('/')[0]);
                        var cd = Number(cdate.split('/')[1]);
                        console.log(cy);
                        console.log(cm);
                        console.log(cd);

                        if(cy > eey)
                        {
                          res.send('1');
                        }
                        else if(cy === eey && cm > eem)
                        {
                          res.send('1');
                        }
                        else if(cy === eey && cm === eem && cd > eed)
                        {
                          res.send('1');
                        }
                        else if(cy === eey && cm === eem && cd === eed)
                        {
                          function convertTime12to24(time12h) {
                            const [time, modifier] = time12h.split(' ');

                            let [hours, minutes] = time.split(':');

                            if (hours === '12') {
                              hours = '00';
                            }

                            if (modifier === 'PM') {
                              hours = parseInt(hours, 10) + 12;
                            }

                            return hours + ':' + minutes;
                          }

                          var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
                          var targetDate = new Date() // Current date/time of user computer
                          var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
                          var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
                          var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

                          var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
                          xhr.open('GET', apicall) // open GET request
                          xhr.onload = function(){
                              if (xhr.status === 200){ // if Ajax request successful
                                  var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
                                  console.log(output.status) // log API return status for debugging purposes
                                  if (output.status == 'OK'){ // if API reports everything was returned successfully
                                      var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
                                      var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
                                      console.log(localdate.toLocaleString()) // Display current India date and time
                                      //res.send(localdate.toLocaleString());
                                      var x = localdate.toLocaleString().split(',')[1];
                                      var y = convertTime12to24(x.trim());
                                      var z = y+':'+x.split(':')[2];
                                      var ctime = z.split(' ')[0];

                                      var eetime = start_time.election_start_time.split('T')[1].split('+')[0];
                                      console.log(eetime);

                                      var eehr = Number(eetime.split(':')[0]);
                                      var eemin = Number(eetime.split(':')[1]);
                                      var eesec = Number(eetime.split(':')[2]);

                                      console.log(ctime);
                                      var chr = Number(ctime.split(':')[0]);
                                      var cmin = Number(ctime.split(':')[1]);
                                      var csec = Number(ctime.split(':')[2]);

                                      if(chr > eehr)
                                      {
                                        res.send('1');
                                      }
                                      else if(chr === eehr && cmin > eemin)
                                      {
                                        res.send('1');
                                      }
                                      else if(chr === eehr && cmin === eemin && csec > eesec)
                                      {
                                        res.send('1');
                                      }
                                      else
                                      {
                                        res.send('0');
                                      }

                                  }
                              }
                              else{
                                  alert('Request failed.  Returned status of ' + xhr.status)
                              }
                          }
                          xhr.send() // send request
                        }
                        else
                        {
                          res.send('0');
                        }

                      }
                      else if(request.status === 401)
                      {
                        res.status(500).send(request.responseText);
                      }
                      else if(request.status === 500)
                      {
                        res.status(500).send(request.responseText);
                      }
                    }
                  };

                  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
                  request.setRequestHeader('Content-Type','application/json');
                  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
                  request.send(JSON.stringify(body));

              }
          }
          else{
              alert('Request failed.  Returned status of ' + xhr.status)
          }
      }
      xhr.send() // send request

});

app.post('/nomination-start',function(req,res){

  var cdate='';
  var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
  var targetDate = new Date() // Current date/time of user computer
  var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
  var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
  var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

  var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
  xhr.open('GET', apicall) // open GET request
  xhr.onload = function(){
      if (xhr.status === 200){ // if Ajax request successful
          var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
          console.log(output.status) // log API return status for debugging purposes
          if (output.status == 'OK'){ // if API reports everything was returned successfully
              var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
              var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
              console.log(localdate.toLocaleString()) // Display current India date and time
              cdate = localdate.toLocaleString().split(',')[0];

              var election_id = req.body.eid;

              var body = {
                  "type": "select",
                  "args": {
                      "table": "election",
                      "columns": [
                          "nomination_start_time"
                      ],
                      "where": {
                          "election_id": {
                            "$eq": election_id
                          }
                      }
                  }
              };

              var request = new XMLHttpRequest();

              request.onreadystatechange = function(){
                if(request.readyState === XMLHttpRequest.DONE)
                {
                  if(request.status === 200)
                  {
                    //res.status(200).send(request.responseText);

                    var start_time = JSON.parse(request.responseText)[0];
                    var eedate = start_time.nomination_start_time.split('T')[0];

                    console.log(eedate);
                    var eey = Number(eedate.split('-')[0]);
                    var eem = Number(eedate.split('-')[1]);
                    var eed = Number(eedate.split('-')[2]);
                    console.log(eey);
                    console.log(eem);
                    console.log(eed);

                    console.log(cdate);
                    var cy = Number(cdate.split('/')[2]);
                    var cm = Number(cdate.split('/')[0]);
                    var cd = Number(cdate.split('/')[1]);
                    console.log(cy);
                    console.log(cm);
                    console.log(cd);

                    if(cy > eey)
                    {
                      res.send('1');
                    }
                    else if(cy === eey && cm > eem)
                    {
                      res.send('1');
                    }
                    else if(cy === eey && cm === eem && cd > eed)
                    {
                      res.send('1');
                    }
                    else if(cy === eey && cm === eem && cd === eed)
                    {
                      function convertTime12to24(time12h) {
                        const [time, modifier] = time12h.split(' ');

                        let [hours, minutes] = time.split(':');

                        if (hours === '12') {
                          hours = '00';
                        }

                        if (modifier === 'PM') {
                          hours = parseInt(hours, 10) + 12;
                        }

                        return hours + ':' + minutes;
                      }

                      var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
                      var targetDate = new Date() // Current date/time of user computer
                      var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
                      var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
                      var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

                      var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
                      xhr.open('GET', apicall) // open GET request
                      xhr.onload = function(){
                          if (xhr.status === 200){ // if Ajax request successful
                              var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
                              console.log(output.status) // log API return status for debugging purposes
                              if (output.status == 'OK'){ // if API reports everything was returned successfully
                                  var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
                                  var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
                                  console.log(localdate.toLocaleString()) // Display current India date and time
                                  //res.send(localdate.toLocaleString());
                                  var x = localdate.toLocaleString().split(',')[1];
                                  var y = convertTime12to24(x.trim());
                                  var z = y+':'+x.split(':')[2];
                                  var ctime = z.split(' ')[0];

                                  var eetime = start_time.nomination_start_time.split('T')[1].split('+')[0];
                                  console.log(eetime);

                                  var eehr = Number(eetime.split(':')[0]);
                                  var eemin = Number(eetime.split(':')[1]);
                                  var eesec = Number(eetime.split(':')[2]);

                                  console.log(ctime);
                                  var chr = Number(ctime.split(':')[0]);
                                  var cmin = Number(ctime.split(':')[1]);
                                  var csec = Number(ctime.split(':')[2]);

                                  if(chr > eehr)
                                  {
                                    res.send('1');
                                  }
                                  else if(chr === eehr && cmin > eemin)
                                  {
                                    res.send('1');
                                  }
                                  else if(chr === eehr && cmin === eemin && csec > eesec)
                                  {
                                    res.send('1');
                                  }
                                  else
                                  {
                                    res.send('0');
                                  }

                              }
                          }
                          else{
                              alert('Request failed.  Returned status of ' + xhr.status)
                          }
                      }
                      xhr.send() // send request
                    }
                    else
                    {
                      res.send('0');
                    }

                  }
                  else if(request.status === 401)
                  {
                    res.status(500).send(request.responseText);
                  }
                  else if(request.status === 500)
                  {
                    res.status(500).send(request.responseText);
                  }
                }
              };

              request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
              request.setRequestHeader('Content-Type','application/json');
              request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
              request.send(JSON.stringify(body));

          }
      }
      else{
          alert('Request failed.  Returned status of ' + xhr.status)
      }
  }
  xhr.send() // send request

});

app.post('/nomination-end',function(req,res){

  var cdate='';
  var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
  var targetDate = new Date() // Current date/time of user computer
  var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
  var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
  var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

  var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
  xhr.open('GET', apicall) // open GET request
  xhr.onload = function(){
      if (xhr.status === 200){ // if Ajax request successful
          var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
          console.log(output.status) // log API return status for debugging purposes
          if (output.status == 'OK'){ // if API reports everything was returned successfully
              var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
              var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
              console.log(localdate.toLocaleString()) // Display current India date and time
              cdate = localdate.toLocaleString().split(',')[0];

              var election_id = req.body.eid;

              var body = {
                  "type": "select",
                  "args": {
                      "table": "election",
                      "columns": [
                          "nomination_end_time"
                      ],
                      "where": {
                          "election_id": {
                            "$eq": election_id
                          }
                      }
                  }
              };

              var request = new XMLHttpRequest();

              request.onreadystatechange = function(){
                if(request.readyState === XMLHttpRequest.DONE)
                {
                  if(request.status === 200)
                  {
                    //res.status(200).send(request.responseText);

                    var end_time = JSON.parse(request.responseText)[0];
                    var eedate = end_time.nomination_end_time.split('T')[0];

                    var eey = Number(eedate.split('-')[0]);
                    var eem = Number(eedate.split('-')[1]);
                    var eed = Number(eedate.split('-')[2]);
                    console.log(eey);
                    console.log(eem);
                    console.log(eed);

                    console.log(cdate);
                    var cy = Number(cdate.split('/')[2]);
                    var cm = Number(cdate.split('/')[0]);
                    var cd = Number(cdate.split('/')[1]);
                    console.log(cy);
                    console.log(cm);
                    console.log(cd);

                    if(cy > eey)
                    {
                      res.send('1');
                    }
                    else if(cy === eey && cm > eem)
                    {
                      res.send('1');
                    }
                    else if(cy === eey && cm === eem && cd > eed)
                    {
                      res.send('1');
                    }
                    else if(cy === eey && cm === eem && cd === eed)
                    {
                      function convertTime12to24(time12h) {
                        const [time, modifier] = time12h.split(' ');

                        let [hours, minutes] = time.split(':');

                        if (hours === '12') {
                          hours = '00';
                        }

                        if (modifier === 'PM') {
                          hours = parseInt(hours, 10) + 12;
                        }

                        return hours + ':' + minutes;
                      }

                      var loc = '28.704059, 77.102490' // India expressed as lat,lng tuple
                      var targetDate = new Date() // Current date/time of user computer
                      var timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60 // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
                      var apikey = 'AIzaSyD4AlMeIBPVl4bNpLM1cgeaAwmJmAQf1iY'
                      var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey

                      var xhr = new XMLHttpRequest() // create new XMLHttpRequest2 object
                      xhr.open('GET', apicall) // open GET request
                      xhr.onload = function(){
                          if (xhr.status === 200){ // if Ajax request successful
                              var output = JSON.parse(xhr.responseText) // convert returned JSON string to JSON object
                              console.log(output.status) // log API return status for debugging purposes
                              if (output.status == 'OK'){ // if API reports everything was returned successfully
                                  var offsets = output.dstOffset * 1000 + output.rawOffset * 1000 // get DST and time zone offsets in milliseconds
                                  var localdate = new Date(timestamp * 1000 + offsets) // Date object containing current time of India (timestamp + dstOffset + rawOffset)
                                  console.log(localdate.toLocaleString()) // Display current India date and time
                                  //res.send(localdate.toLocaleString());
                                  var x = localdate.toLocaleString().split(',')[1];
                                  var y = convertTime12to24(x.trim());
                                  var z = y+':'+x.split(':')[2];
                                  var ctime = z.split(' ')[0];

                                  var eetime = end_time.nomination_end_time.split('T')[1].split('+')[0];
                                  console.log(eetime);

                                  var eehr = Number(eetime.split(':')[0]);
                                  var eemin = Number(eetime.split(':')[1]);
                                  var eesec = Number(eetime.split(':')[2]);

                                  console.log(ctime);
                                  var chr = Number(ctime.split(':')[0]);
                                  var cmin = Number(ctime.split(':')[1]);
                                  var csec = Number(ctime.split(':')[2]);

                                  if(chr > eehr)
                                  {
                                    res.send('1');
                                  }
                                  else if(chr === eehr && cmin > eemin)
                                  {
                                    res.send('1');
                                  }
                                  else if(chr === eehr && cmin === eemin && csec > eesec)
                                  {
                                    res.send('1');
                                  }
                                  else
                                  {
                                    res.send('0');
                                  }

                              }
                          }
                          else{
                              alert('Request failed.  Returned status of ' + xhr.status)
                          }
                      }
                      xhr.send() // send request
                    }
                    else
                    {
                      res.send('0');
                    }

                  }
                  else if(request.status === 401)
                  {
                    res.status(500).send(request.responseText);
                  }
                  else if(request.status === 500)
                  {
                    res.status(500).send(request.responseText);
                  }
                }
              };

              request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
              request.setRequestHeader('Content-Type','application/json');
              request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
              request.send(JSON.stringify(body));

          }
      }
      else{
          alert('Request failed.  Returned status of ' + xhr.status)
      }
  }
  xhr.send() // send request

});

app.post('/data',function(req,res){

  var authtoken = 'Bearer '+req.body.auth;

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {
        res.status(200).send(request.responseText);
      }
      else if(request.status === 401)
      {
        res.status(500).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('GET','https://auth.artfully11.hasura-app.io/v1/user/info',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization',authtoken);
  request.send(null);

});

app.post('/check-credentials',function(req,res){

  var id = req.body.serial;

    var body = {
      "type": "select",
      "args": {
          "table": "usertable",
          "columns": [
              "*"
          ],
          "where": {
              "hasura_id": {
                  "$eq": id
              }
          }
      }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {

        var hasOwnProperty = Object.prototype.hasOwnProperty;

        function isEmpty(obj) {

            // null and undefined are "empty"
            if (obj == null) return true;

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;

            // If it isn't an object at this point
            // it is empty, but it can't be anything *but* empty
            // Is it empty?  Depends on your application.
            if (typeof obj !== "object") return true;

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        }

        if(isEmpty(JSON.parse(request.responseText)))
        {
          res.status(200).send("1");
        }
        else
        {
          res.status(200).send("0");
        }
      }
      else if(request.status === 400)
      {
        res.status(400).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.post('/get-credentials',function(req,res){

  var id = req.body.serial;
  var nm = req.body.name;
  var g = req.body.gender;
  var dt = req.body.date;
  var State = req.body.state;
  var voter_id = req.body.voterId;
  var mail = req.body.email;
  var number = req.body.phone;

  var credentials = crypto.randomBytes(8).toString('hex');

    var body = {
      "type": "insert",
      "args": {
          "table": "usertable",
          "objects": [
              {
                  "hasura_id": id,
                  "name": nm,
                  "gender": g,
                  "dob": dt,
                  "state": State,
                  "voter_id": voter_id,
                  "email": mail,
                  "phone": number,
                  "credentials": credentials
              }
          ]
      }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {
        res.status(200).send(credentials);
      }
      else if(request.status === 400)
      {
        res.status(400).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.post('/get-elections',function(req,res){

    var body = {
      "type": "select",
      "args": {
          "table": "election",
          "columns": [
              "*"
          ]
      }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {
        res.status(200).send(request.responseText);
      }
      else if(request.status === 400)
      {
        res.status(400).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.post('/view-credentials',function(req,res){

  var id = req.body.serial;

    var body = {
    "type": "select",
    "args": {
        "table": "usertable",
        "columns": [
            "*"
        ],
        "where": {
            "hasura_id": {
                "$eq": id
            }
        }
    }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {
        res.status(200).send(request.responseText);
      }
      else if(request.status === 400)
      {
        res.status(400).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.post('/nominate',function(req,res){

  var hasura_id = req.body.id;
  var election_id = req.body.eid;
  var manifesto1 = req.body.manifesto;
  var indi_flag = req.body.individual;
  var party_name = req.body.party;
  var party_ticket_id = req.body.party_ticket;


  if(indi_flag)
  {
        var body = {
        "type": "insert",
        "args": {
            "table": "nomination",
            "objects": [
                {
                    "hasura_id": hasura_id,
                    "election_id": election_id,
                    "manifesto": manifesto1,
                    "individual": indi_flag
                }
            ]
        }
    };

    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){
      if(request.readyState === XMLHttpRequest.DONE)
      {
        if(request.status === 200)
        {
          var body1 = {
            "type": "update",
            "args": {
                "table": "usertable",
                "where": {
                    "hasura_id": {
                        "$eq": hasura_id
                    }
                },
                "$set": {
                    "nomination": "true"
                }
            }
          };

          var request1 = new XMLHttpRequest();

          request1.onreadystatechange = function(){
            if(request1.readyState === XMLHttpRequest.DONE)
            {
              if(request1.status === 200)
              {
                res.status(200).send(request1.responseText);
              }
              else if(request1.status === 400)
              {
                res.status(400).send(request1.responseText);
              }
              else if(request1.status === 500)
              {
                res.status(500).send(request1.responseText);
              }
            }
          }

          request1.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
          request1.setRequestHeader('Content-Type','application/json');
          request1.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
          request1.send(JSON.stringify(body1));
        }
        else if(request.status === 400)
        {
          res.status(400).send(request.responseText);
        }
        else if(request.status === 500)
        {
          res.status(500).send(request.responseText);
        }
      }
    }

    request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
    request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
    request.send(JSON.stringify(body));

  }
  else
  {
        var body = {
        "type": "insert",
        "args": {
            "table": "nomination",
            "objects": [
                {
                    "election_id": election_id,
                    "manifesto": manifesto1,
                    "individual": indi_flag,
                    "party": party_name,
                    "party_ticket_id": party_ticket_id,
                    "hasura_id": hasura_id
                }
            ]
        }
    };

    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){
      if(request.readyState === XMLHttpRequest.DONE)
      {
        if(request.status === 200)
        {
          var body1 = {
            "type": "update",
            "args": {
                "table": "usertable",
                "where": {
                    "hasura_id": {
                        "$eq": hasura_id
                    }
                },
                "$set": {
                    "nomination": "true"
                }
            }
          };

          var request1 = new XMLHttpRequest();

          request1.onreadystatechange = function(){
            if(request1.readyState === XMLHttpRequest.DONE)
            {
              if(request1.status === 200)
              {
                res.status(200).send(request1.responseText);
              }
              else if(request1.status === 400)
              {
                res.status(400).send(request1.responseText);
              }
              else if(request1.status === 500)
              {
                res.status(500).send(request1.responseText);
              }
            }
          }

          request1.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
          request1.setRequestHeader('Content-Type','application/json');
          request1.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
          request1.send(JSON.stringify(body1));
        }
        else if(request.status === 400)
        {
          res.status(400).send(request.responseText);
        }
        else if(request.status === 500)
        {
          res.status(500).send(request.responseText);
        }
      }
    }

    request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
    request.setRequestHeader('Content-Type','application/json');
    request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
    request.send(JSON.stringify(body));

  }

});

app.post('/get-nominations',function(req,res){

  var election_id = req.body.eid;

    var body = {
      "type": "select",
      "args": {
          "table": "nomination",
          "columns": [
              "*"
          ],
          "where": {
              "election_id": {
                  "$eq": election_id
              }
          }
      }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {
        res.status(200).send(request.responseText);
      }
      else if(request.status === 400)
      {
        res.status(400).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  }

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.post('/vote',function(req,res){

  var hasura_id_candidate = req.body.id_of_candidate;
  var hasura_id_voter = req.body.id_of_voter;
  var election_id = req.body.eid;
  var cred = req.body.credentials;

  var body3 = {
      "type": "select",
      "args": {
          "table": "usertable",
          "columns": [
              "hasura_id",
              "credentials"
          ],
          "where": {
              "$and": [
                  {
                      "hasura_id": {
                          "$eq": hasura_id_voter
                      }
                  },
                  {
                    "credentials": {
                        "$eq": cred
                    }
                  }
              ]
          }
      }
  };

  var request3 = new XMLHttpRequest();

  request3.onreadystatechange = function(){
    if(request3.readyState === XMLHttpRequest.DONE)
    {
      if(request3.status === 200)
      {

        var hasOwnProperty = Object.prototype.hasOwnProperty;

        function isEmpty(obj) {

            // null and undefined are "empty"
            if (obj == null) return true;

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;

            // If it isn't an object at this point
            // it is empty, but it can't be anything *but* empty
            // Is it empty?  Depends on your application.
            if (typeof obj !== "object") return true;

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        }

        if(isEmpty(JSON.parse(request3.responseText)))
        {
          res.status(200).send("0");
        }
        else
        {
          var body = {
            "type": "update",
            "args": {
                "table": "nomination",
                "where": {
                    "hasura_id": {
                        "$eq": hasura_id_candidate
                    }
                },
                "$inc": {
                    "votes": "1"
                }
            }
        };

        var request = new XMLHttpRequest();

        request.onreadystatechange = function(){
          if(request.readyState === XMLHttpRequest.DONE)
          {
            if(request.status === 200)
            {
                var body1 = {
                  "type": "update",
                  "args": {
                      "table": "election",
                      "where": {
                          "election_id": {
                              "$eq": election_id
                          }
                      },
                      "$inc": {
                          "total_votes": "1"
                      }
                  }
              };

              var request1 = new XMLHttpRequest();

              request1.onreadystatechange = function(){
                if(request1.readyState === XMLHttpRequest.DONE)
                {
                  if(request1.status === 200)
                  {
                    var body2 = {
                        "type": "insert",
                        "args": {
                            "table": "votes",
                            "objects": [
                                {
                                    "hasura_id": hasura_id_voter,
                                    "election_id": election_id
                                }
                            ]
                        }
                    };

                    var request2 = new XMLHttpRequest();

                    request2.onreadystatechange = function(){
                      if(request2.readyState === XMLHttpRequest.DONE)
                      {
                        if(request2.status === 200)
                        {
                          res.status(200).send("1");
                        }
                        else if(request2.status === 400)
                        {
                          res.status(400).send(request2.responseText);
                        }
                        else if(request2.status === 500)
                        {
                          res.status(500).send(request2.responseText);
                        }
                      }
                    }

                    request2.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
                    request2.setRequestHeader('Content-Type','application/json');
                    request2.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
                    request2.send(JSON.stringify(body2));

                  }
                  else if(request1.status === 400)
                  {
                    res.status(400).send(request1.responseText);
                  }
                  else if(request1.status === 500)
                  {
                    res.status(500).send(request1.responseText);
                  }
                }
              }

              request1.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
              request1.setRequestHeader('Content-Type','application/json');
              request1.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
              request1.send(JSON.stringify(body1));
            }
            else if(request.status === 400)
            {
              res.status(400).send(request.responseText);
            }
            else if(request.status === 500)
            {
              res.status(500).send(request.responseText);
            }
          }
        }

        request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
        request.setRequestHeader('Content-Type','application/json');
        request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
        request.send(JSON.stringify(body));
        }
      }
      else if(request3.status === 400)
      {
        res.status(400).send(request3.responseText);
      }
      else if(request3.status === 500)
      {
        res.status(500).send(request3.responseText);
      }
    }
  }

  request3.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request3.setRequestHeader('Content-Type','application/json');
  request3.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request3.send(JSON.stringify(body3));

});

app.post('/can-vote',function(req,res){

  var hasura_id = req.body.id;
  var election_id = req.body.eid;

  var body = {
      "type": "select",
      "args": {
          "table": "votes",
          "columns": [
              "*"
          ],
          "where": {
              "$and": [
                  {
                      "hasura_id": {
                          "$eq": hasura_id
                      }
                  },
                  {
                      "election_id": {
                          "$eq": election_id
                      }
                  }
              ]
          }
      }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {

        var hasOwnProperty = Object.prototype.hasOwnProperty;

        function isEmpty(obj) {

            // null and undefined are "empty"
            if (obj == null) return true;

            // Assume if it has a length property with a non-zero value
            // that that property is correct.
            if (obj.length > 0)    return false;
            if (obj.length === 0)  return true;

            // If it isn't an object at this point
            // it is empty, but it can't be anything *but* empty
            // Is it empty?  Depends on your application.
            if (typeof obj !== "object") return true;

            // Otherwise, does it have any properties of its own?
            // Note that this doesn't handle
            // toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }

            return true;
        }

        if(isEmpty(JSON.parse(request.responseText)))
        {
          res.status(200).send("1");
        }
        else
        {
          res.status(200).send("0");
        }

      }
      else if(request.status === 400)
      {
        res.status(400).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.post('/can-nominate',function(req,res){

  var hasura_id = req.body.id;

  var body = {
      "type": "select",
      "args": {
          "table": "usertable",
          "columns": [
              "nomination"
          ],
          "where": {
              "hasura_id": {
                  "$eq": hasura_id
              }
          }
      }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {
        if(JSON.parse(request.responseText)[0].nomination === false)
        {
          res.status(200).send("1");
        }
        else
        {
          res.status(200).send("0");
        }
      }
      else if(request.status === 400)
      {
        res.status(400).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.post('/results',function(req,res){

  var election_id = req.body.eid;

  var body = {
      "type": "select",
      "args": {
          "table": "election",
          "columns": [
              "total_votes"
          ],
          "where": {
              "election_id": {
                  "$eq": election_id
              }
          }
      }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {

        var total = JSON.parse(request.responseText)[0].total_votes.toString();

        var body1 = {
            "type": "select",
            "args": {
                "table": "nomination",
                "columns": [
                    "votes",
                    "hasura_id"
                ],
                "where": {
                    "election_id": {
                        "$eq": election_id
                    }
                }
            }
        };

        var request1 = new XMLHttpRequest();

        request1.onreadystatechange = function(){
          if(request1.readyState === XMLHttpRequest.DONE)
          {
            if(request1.status === 200)
            {

              var max_votes=0,winner_id="";
              var votes=0,id="";
              var percent = 0;
              var data = JSON.parse(request1.responseText);
              for(var i=0;i<data.length;i++)
              {
                id = data[i].hasura_id.toString();
                votes = Number(data[i].votes);
                if(votes > max_votes)
                {
                  max_votes = votes;
                  winner_id = id;
                }
              }

              percent = (((Number(max_votes)/Number(total))*100).toString()).substring(0,5)+"%";;

              var result = {
                "winner":winner_id,
                "total_votes":total,
                "votes_of_winner":max_votes,
                "win_percent":percent
              }

              res.status(200).send(JSON.stringify(result));
            }
            else if(request1.status === 400)
            {
              res.status(400).send(request1.responseText);
            }
            else if(request1.status === 500)
            {
              res.status(500).send(request1.responseText);
            }
          }
        }

        request1.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
        request1.setRequestHeader('Content-Type','application/json');
        request1.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
        request1.send(JSON.stringify(body1));

      }
      else if(request.status === 400)
      {
        res.status(400).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.post('/get-election-data',function(req,res){

  var election_id = req.body.eid;

  var body = {
      "type": "select",
      "args": {
          "table": "election",
          "columns": [
              "*"
          ],
          "where": {
              "election_id": {
                  "$eq": election_id
              }
          }
      }
  };

  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){
    if(request.readyState === XMLHttpRequest.DONE)
    {
      if(request.status === 200)
      {
        res.status(200).send(request.responseText);
      }
      else if(request.status === 401)
      {
        res.status(500).send(request.responseText);
      }
      else if(request.status === 500)
      {
        res.status(500).send(request.responseText);
      }
    }
  };

  request.open('POST','https://data.artfully11.hasura-app.io/v1/query',true);
  request.setRequestHeader('Content-Type','application/json');
  request.setRequestHeader('Authorization','Bearer 9729a88294a0859b8bf736156b6b9f7d381d596c44d8a73f');
  request.send(JSON.stringify(body));

});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
