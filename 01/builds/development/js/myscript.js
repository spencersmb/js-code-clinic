$(function(){
  'use strict';

  //Set up variables to show the last 30 days be default
  var fromDate;
  var toDate;

  //get MEAN
  function getMean(myArray){

    //add up all the numbers in the array using .reduce()
    var mean = myArray.reduce(function(a, b){
      return a + b;
    //then divide the total by the length
    })/myArray.length;

    //return the total with 2 decimanl places.
    return mean.toFixed(2);
  }

  //sort lowest to highest
  function getMedian(myArray){

    var median;

    //sort from highest to lowest
    var sorted = myArray.sort(myArray);

    //get rid of any decimal spots
    var middleIndex = Math.floor(sorted.length/2);


    //Checks if array has even number of elements
    if(sorted.length % 2 === 0){

      //gets the item on the right side of the middle
      var medianA = sorted[middleIndex];

      //get item on the left sideof the middle
      var medianB = sorted[middleIndex - 1];

      median = (medianA + medianB)/2;
    }else{
      //get the middle index of an odd number array
      median = sorted[middleIndex];
    }

    //return final value
    return median.toFixed(2);
  }

  //parsing the data function
  function parseData(data){
    var myData = [];

    //Create arrays to pass through mean and median functions
    //The data that gets parsed comes in as an object
    //So we push it into the array as it comes in
    var myDates = ['x'];

    var medTemps = ['Median Temperature'];
    var meanTemps = ['Mean Temperature'];
    var medPress = ['Median Pressure'];
    var meanPress = ['Mean Pressure'];
    var medSpeed = ['Median Speed'];
    var meanSpeed = ['Mean Speed'];

    for( var key in data){

      //first test to make sure it has data and isnt null
      if(data.hasOwnProperty(key)){

        //make sure data doesnt isnt null
        if( data[key].t !== null && data[key].p !== null && data[key].s !== null){
          myDates.push(key);
          medTemps.push(getMedian(data[key].t));
          meanTemps.push(getMean(data[key].t));
          medPress.push(getMedian(data[key].p));
          meanPress.push(getMean(data[key].p));
          medSpeed.push(getMedian(data[key].s));
          meanSpeed.push(getMean(data[key].s));
        }
      }
      //console.log(getMean(data[key].s));
    }

    myData.push(myDates, medTemps, meanTemps, medPress, meanPress, medSpeed, meanSpeed);
    //console.log(myData);
    return myData;
  }

  function generateChart(data){
    var chart = c3.generate({
      bindto: '#chart',
      data:{
        //use the array with X as the X axis
        x: 'x',
        columns: data,
        type:'bar',
        groups: [
          [
            'Median Temperature',
            'Mean Temperature',
            'Median Pressure',
            'Mean Pressure',
            'Median Speed',
            'Mean Speed'
          ]
        ]
      },
      bar:{
        width:{
          ratio:0.7
        }
      },
      axis:{
        x:{
          type:'timeseries',
          tick:{
            format: '%Y-%m-%d'
          }
        }
      }
    });
  }


  //Run tests to make sure function works:
  //var test = [2,2,2,2];
  //console.log("Mean: " + getMean(test));
  //console.log("Median: " + getMedian(test));

  //GET DATA FROM AJAX CALL
  function loadChart(){
    $.ajax({
      //Add &callback=? to the end of the url to call the function jsonReturnData
      url: 'http://foundationphp.com/phpclinic/podata.php?&raw&callback=?',
      //Set the name of the function
      jsonpCallback: 'jsonReturnData',
      dataType: 'jsonp',
      //key/value of the data passed in
      //URL example http://foundationphp.com/phpclinic/podata.php?startDate=20150301&endDate=20150302&raw
      data:{
        startDate:formatDate(fromDate, ''),
        endDate: formatDate(toDate, ''),
        format: 'json'
      },
      success: function(response){
        //console.log(parseData(response));

        //Call the generate chart on the parsed data array set
        generateChart(parseData(response));
      }
    });
  }

  function formatDate(date, divider){
    var someday = new Date(date);

    //must add +1 to get a normal number
    var month = someday.getUTCMonth() + 1;
    var day = someday.getUTCDate();
    var year = someday.getUTCFullYear();

    //format numbers < 9
    if(month <= 9){ month = '0' + month;}
    if(day <= 9){ day = '0' + day;}

    //return dates as string
    return('' + year + divider + month + divider + day);
  }

  //Defaults setup
  fromDate = new Date(); //get current date

  //get Date returns just the number, set date takes in a number to calc the date you want
  fromDate.setDate(fromDate.getDate() - 31);

  toDate = new Date(); //get current date

  //get Date returns just the number, set date takes in a number to calc the date you want
  toDate.setDate(toDate.getDate() - 1);

  //target range form elements on the HTML page on initial load
  var form = $('form[name="rangeform"]');
  var inputFrom = form.find('input[name="from"]');
  var inputTo = form.find('input[name="to"]');

  inputFrom.val(formatDate(fromDate, '-'));
  inputTo.val(formatDate(toDate, '-'));


  //on change events for the form date
  form.change(function(e){
    //alert('change');
    //on change get the new date from the input field and set it as the new date
    fromDate = new Date($(this).find('input[name="from"]').val());
    toDate = new Date($(this).find('input[name="to"]').val());
    console.log(fromDate);

    //format the new data for the chart so they are formatted using local time
    fromDate = fromDate.toUTCString();
    toDate = toDate.toUTCString();
    console.log(fromDate);

    loadChart();

  });

  loadChart();
});