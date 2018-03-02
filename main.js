var ctr =1;

var mapdata=[["name","lat","long","temp","weather"]];
var flightPlanCoordinates= [{"lat":0, "lng":0}];

function lookupcity()
{
    var citysearch= document.getElementById("city-lookup-tb").value;
    console.log("Searched for "+citysearch);
    document.getElementById("city-lookup-tb").value="";

    var url_citylookup= "https://cse.taylor.edu/~cos143/wucity.php?query="+citysearch;
   
    var divsct= document.getElementById('location-options');
    var sct= document.getElementById('lo-table');
    divsct.removeChild(sct);


    jQuery(document).ready(function($) {
        $.ajax({
        url : url_citylookup,
        dataType : "json",
        success : function(parsed_json) {
        //alert("Found");
        var numcities=Object.keys(parsed_json["RESULTS"]).length;
        console.log("Number of cities found ="+numcities);  
        var sct_tmp = document.createElement("table");
        sct_tmp.id= 'lo-table';
        divsct.appendChild(sct_tmp);
        
        var sct= document.getElementById('lo-table');
        var row = sct.insertRow(0);
        var cell0 = row.insertCell(0);  cell0.innerHTML = "Location Options";
        var cell1 = row.insertCell(1);  cell1.innerHTML = "Add";
        if (numcities>5)
        {
            numcities=5;
        }    

        for (let index = 0; index < numcities; index++) {
          
            var row = sct.insertRow(index+1);
            
            row.id= parsed_json['RESULTS'][index]['name'];
            var rowid= parsed_json['RESULTS'][index]['name'];
            var cell0 = row.insertCell(0);  cell0.innerHTML = parsed_json['RESULTS'][index]['name'];
            var cell1 = row.insertCell(1);  cell1.innerHTML = "<button onclick=\"addtoiti('"+rowid+"')\">Add</button>";
            
        }
        
        }
        });
      });

}


function addtoiti(rowid)
{
    var url_needed_citylookup= "https://cse.taylor.edu/~cos143/wucity.php?query="+rowid;
    var loca;
    jQuery(document).ready(function($) {
        $.ajax({
        url : url_needed_citylookup,
        dataType : "json",
        success : function(parsed_json) {
        
        var sct= document.getElementById('selected-cities-table');
        var row = sct.insertRow(ctr);
        var cell0 = row.insertCell(0);  cell0.innerHTML = ctr;
        var cell1 = row.insertCell(1);  cell1.innerHTML = rowid;
        var cell2 = row.insertCell(2); 
        var cell3 = row.insertCell(3); 
        var cell4 = row.insertCell(4); 
        
        //alert(parsed_json['RESULTS'][0]['lat']);
        var lat= parsed_json['RESULTS'][0]['lat'];
        var lon =  parsed_json['RESULTS'][0]['lon'];

        if(lat!=undefined)
       { var cell5 = row.insertCell(5);  cell5.innerHTML = lat;}
        else
        { var cell5 = row.insertCell(5);  cell5.innerHTML = "NA";}


        if(lon!=undefined)
        {var cell6 = row.insertCell(6);  cell6.innerHTML = lon;}
        else
      {  var cell6 = row.insertCell(6);  cell6.innerHTML = "NA";}
        
        loca =  parsed_json['RESULTS'][0]['l'];
        //alert("loca== "+loca);
        lookweather(loca,ctr,lat,lon,rowid);
        ctr=ctr+1;
        }
        });
    
        });

    }

//https://cse.taylor.edu/~cos143/wuweather.php?key=587e710ba20290dc&location=/q/zmw:00000.264.43295

function lookweather(locat,ct,lat,lon,cityname)
{
    var url_needed_weather= "https://cse.taylor.edu/~cos143/wuweather.php?key=587e710ba20290dc&location="+locat;

     jQuery(document).ready(function($) {
       $.ajax({
       url : url_needed_weather,
       dataType : "json",
       success : function(parsed_json) {
           
           //alert(parsed_json["current_observation"]["temp_f"]);
           var sct= document.getElementById('selected-cities-table');
           var temp=parsed_json["current_observation"]["temp_f"];
           var weather=parsed_json["current_observation"]["weather"];
           var humid= parsed_json["current_observation"]["relative_humidity"];

           if(temp!=undefined)
           {
               if (temp<32)
               {
                sct.rows[ct].cells[2].id="lightbluetd";
               }
               else
               if (temp<75)
               {
                sct.rows[ct].cells[2].id="lightgreentd";
               }
               else
               {
                sct.rows[ct].cells[2].id="lightredtd";
               }
           }

           if (temp!=undefined)
           sct.rows[ct].cells[2].innerHTML = temp;
           else 
           sct.rows[ct].cells[2].innerHTML = "NA";


           if (weather!=undefined)
           sct.rows[ct].cells[3].innerHTML = weather;
           else 
           sct.rows[ct].cells[3].innerHTML = "NA";

          
            if (humid!=undefined)
           sct.rows[ct].cells[4].innerHTML = humid;
            else 
           sct.rows[ct].cells[4].innerHTML = "NA";
        


          googlemaps(locat,ct,temp,humid,weather,lat,lon,cityname);
       }
       });
    });

   
}

function googlemaps(locat,ct,temp,humid,weather,lat,lon,cityname)
{
    mapdata.push([cityname,lat,lon,temp,weather]);

    console.log(mapdata);
    var myCenter = new google.maps.LatLng(lat,lon);
    var mapCanvas = document.getElementById("google-maps");
    var mapOptions = {center: myCenter, zoom: 5};
    var map = new google.maps.Map(mapCanvas, mapOptions);
  
      var infowindow = new google.maps.InfoWindow();
  
      var marker, i;
  
      for (i = 1; i < mapdata.length; i++) { 
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(mapdata[i][1], mapdata[i][2]),
          map: map
        });
  
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
            infowindow.setContent("City: "+ mapdata[i][0]+ "\nTemp: "+mapdata[i][3]+"\nWeather: "+mapdata[i][4]);
            infowindow.open(map, marker);
          }
        })(marker, i));
  
    }
    console.log(flightPlanCoordinates);
    flightPlanCoordinates.push({"lat":parseInt(lat), "lng":parseInt(lon)});
    console.log(flightPlanCoordinates);
    if(ct==1)
    {
        flightPlanCoordinates.shift();
    }
  
      var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      flightPath.setMap(map);

}   

function myMap() {
    //alert(locat);
    var mapProp= {
        center:new google.maps.LatLng(51.508742,-0.120850),
        zoom:5,
    };
    var map=new google.maps.Map(document.getElementById("google-maps"),mapProp);
    }