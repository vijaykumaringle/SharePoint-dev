var libname = "Shared Documents";
var listname = "csvitemlist";
var tenantname = "https://abcd.sharepoint.com";
var csvurl;
var lines = [];

$( document ).ready(function() {

    $("#csvtoitembtn").click(function(){
        calltocsvlibrary();
        $("#csvtoitembtn").attr("disabled",true);
    });

    //function button press call to getdatatabledata
    $("#datatbtn").click(function(){
        getdatatabledata();
    });

});


//function to call and get csv file
function calltocsvlibrary(){
    $.ajax({  
  
        async: false,  
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFolderByServerRelativeUrl('"+libname+"')/Files",
        method: "GET",  
  
        headers: {  
            "accept": "application/json;odata=verbose",   
            "content-type": "application/json;odata=verbose"   
  
        },  
        success: function(data) {  
            datad = data.d.results;
            //console.log(datad);
            datad.forEach(element => {
                csvurl = element.ServerRelativeUrl
                console.log(csvurl); 
            });

            readcsv();
           
        },  
        error: function(error) {  
            console.log(JSON.stringify(error));  
  
        }  
  
    });
}


//call to read csv
function readcsv(){
    $.ajax({
        async: false, 
        type: "GET",
        url: tenantname+csvurl,
        dataType: "text",
        success: function(data) {processData(data);},
        error: function(error) {  
            console.log(JSON.stringify(error));  
  
        }
     });

    function processData(allText) {
        var allTextLines = allText.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        

        for (var i=1; i<allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {

                var tarr = [];
                for (var j=0; j<headers.length; j++) {
                    
                    tarr.push(data[j]);
                }
                lines.push(tarr);
            }
        }
        console.log(lines);
        itemcreate();
    }
}


//Write data to list item by item
function itemcreate(){
    lines.forEach(element => {
        var fname = element[0];
        var lname = element[1];
        var eid = element[2];

        $.ajax({
            async: false,
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('"+listname+"')/items",
            type: "POST",
            data: JSON.stringify({
                __metadata:
                {
                    "type": "SP.Data.CsvitemlistListItem"
                },
                Title: fname,
                LastName: lname,
                EmployeeId: eid,
            }),
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "POST"
            },
            success: function(data, status, xhr)
            {
                console.log("List Item Created");
            
            },
            error: function(xhr, status, error)
            {
                
                console.log("Error "+error);
            }
        });
    });

}


//call to data table using GET rest
function getdatatabledata(){
    var siteUrl = _spPageContextInfo.webAbsoluteUrl;    
    var oDataUrl = siteUrl + "/_api/web/lists/getbytitle('"+listname+"')/items";
    
    $.ajax({
        async: false, 
        url: oDataUrl,    
        type: "GET",    
        dataType: "json",    
        headers: {    
            "accept": "application/json;odata=verbose"    
        },    
        success: function(data){
               
                console.log(data.d.results);
              var table = $('#disptable').DataTable({ 
                  
                  data: data.d.results,    
                  columns: [
                    {    
                        title: "ID",
                        "mData": "ID",
                           
                    },
                  {    
                    title: "First Name",
                      "mData": "Title",
                          
                  },   
                  {  
                    title: "Last Name",
                      "mData": "LastName",
                        
                  },          
                  {
                    title: "Employee Id",
                      "mData": "EmployeeId",
                      
        
                  },
                  
                                      
                  ],
                  select: true   
              });    
          
        },    
        error: function(data, errMessage){
            alert("Error: "+ errMessage);
        }  
    }); 
}