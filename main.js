anychart.onDocumentReady(function () {
  anychart.format.locales.default.numberLocale.decimalsCount = 4;
  // the data used in this sample can be obtained from the CDN
  // https://cdn.anychart.com/csv-data/csco-daily.js

  // create data table on loaded data
  var dataTable = anychart.data.table();
  dataTable.addData(get_dji_daily_short_data());

  // map loaded data for the ohlc series
  var mapping = dataTable.mapAs({ open: 1, high: 2, low: 3, close: 4 });

  // create stock chart
  var chart = anychart.stock();

  // create ohlc series on the chart
  var series = chart.plot(0);
  var ohlc = series.ohlc(mapping);
  ohlc.name("CSCO");

  //enable yGrid
  series.yGrid().enabled(true);

  // create SMA indicator with period 10
  var sma10 = series.sma(mapping, 10).series();
  sma10.stroke("red");

  // create SMA indicator with period 30
  var sma30 = series.sma(mapping, 30).series();
  sma30.stroke("green");

  var results = findIntersections();

  // create the first range marker
  var marker = series.rangeMarker(0);
  // set start point of the marker
  marker.from();
  // set end point of the marker
  marker.to(results.intersection[0]);
  // set marker inner color
  marker.fill(results.rangeColor1);
  // set axis
  marker.axis(series.xAxis());

  for (i = 0; i < results.intersection.length - 1; i = i + 2) {
    // create the rest range markers
    var marker = series.rangeMarker(i + 1);
    // set start point of the marker (the first intersection)
    marker.from(results.intersection[i]);
    // set end point of the marker (the next intersection)
    marker.to(results.intersection[i + 1]);
    // set marker inner color
    marker.fill(results.rangeColor2);
    // set axis
    marker.axis(series.xAxis());

    var vMarker = series.rangeMarker(i + 2);
    vMarker.from(results.intersection[i + 1]);
    console.log(i);
    // set end point of the marker = last date when we have 1 intersection
    if (results.intersection.length == 1) {
      vMarker.to(results.lastDate);
    } else {
      vMarker.to(results.intersection[i + 2]);
    }
    vMarker.axis(series.xAxis());
    vMarker.fill(results.rangeColor1);
  }

  // create scroller series with mapped data
  chart.scroller().line(mapping);

  // set container id for the chart
  chart.container("container").draw();

  // Set range anchor.
  chart.selectRange("year", 1, "first-date", true);

  // prepare the data to color the areas red and green
  function findIntersections() {
    // get start date and end date
    var xScale = chart.xScale();
    var max = xScale.getFullMaximum();
    var min = xScale.getFullMinimum();

    var selectable = mapping.createSelectable();
    // select certain dates range
    selectable.select(min, max);

    var sma10Array = [];
    var sma30Array = [];
    var timeArr = [];
    var intersection = [];
    var i = 0;
    var lastDate = 0;
    var firstDate = 0;
    var rangeColor1 = "";
    var rangeColor2 = "";

    // get iterator
    var iterator = selectable.getIterator();
    // advance iterator to the next position
    while (iterator.advance()) {
      var timestamp = selectable.search(iterator.getKey(), "exact-or-next");
      // add dates and the sma10, sma30 data into arrays
      timeArr.push(iterator.getKey());
      sma10Array.push(timestamp.getColumn(-1));
      sma30Array.push(timestamp.getColumn(-2));
    }

    // save the last date
    lastDate = timeArr[timeArr.length - 1];

    // find all the intersections
    for (i = 0; i < sma10Array.length; i++) {
      if (
        (sma10Array[i] - sma30Array[i]) *
          (sma10Array[i + 1] - sma30Array[i + 1]) <=
        0
      ) {
        intersection.push(timeArr[i]);
        // when sma10 is higher than sma30, color the area green
        if (intersection.length == 1 && sma10Array[i] > sma30Array[i]) {
          rangeColor1 = "#d7fcda 0.5";
          rangeColor2 = "#fcd8d7 0.5";
        }
        // when sma30 is higher than sma10, color the area red
        else if (intersection.length == 1 && sma10Array[i] < sma30Array[i]) {
          rangeColor1 = "#fcd8d7 0.4";
          rangeColor2 = "#d7fcda 0.4";
        }
      }
    }
    return {
      intersection: intersection,
      lastDate: lastDate,
      rangeColor1: rangeColor1,
      rangeColor2: rangeColor2,
    };
  }
});
