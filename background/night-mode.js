// Night mode hack by mgsloan
//
// Ideally, we'd have per-style control of whether it is enabled at
// nighttime / daytime / both.  However, I currently only use stylus
// for dark styles during night use, so for me it's enough to disable
// it on sunrise, and enable it on sunset.

const MY_LATITUDE = 47;
const MY_LONGITUDE = -120;

function mySunrise(day) {
  return day.sunrise(MY_LATITUDE, MY_LONGITUDE);
}

function mySunset(day) {
  return day.sunset(MY_LATITUDE, MY_LONGITUDE);
}

function setDay(date, day) {
  date.setMonth(day.getMonth());
  date.setDate(day.getDate());
}

function handleTimer() {
  var now = new Date();
  var tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  var sunriseToday = mySunrise(now);
  var sunsetToday = mySunset(now);
  var sunriseTomorrow = mySunrise(tomorrow);
  // sun.js varies from my expectations for which date is used, so
  // just using it for times, and setting the dates of each result.
  setDay(sunriseToday, now);
  setDay(sunsetToday, now);
  setDay(sunriseTomorrow, tomorrow);
  var events = [
    { time: sunriseToday, type: "sunrise" },
    { time: sunsetToday, type: "sunset" },
    { time: sunriseTomorrow, type: "sunrise" },
  ];
  var nextEvent = null;
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    if (event.time > now) {
      nextEvent = event;
      break;
    }
  }
  if (!nextEvent) {
    throw "Invariant violated: couldn't find next sunrise / sunset event";
  }
  if (nextEvent.type === "sunrise") {
    console.info("Currently nighttime, so night-mode is enabling Stylus.");
    browserCommands.styleDisableAll({ checked: false });
  } else if (nextEvent.type === "sunset") {
    console.info("Currently daytime, so night-mode is disabling Stylus.");
    browserCommands.styleDisableAll({ checked: true });
  } else {
    throw "Invariant violated: expected sunrise or sunset event";
  }
  var nextEventMillis = nextEvent.time - now;
  var nextEventHours = nextEventMillis / (60 * 60 * 1000);
  console.info("Next stylus night-mode event is", nextEvent.type, "in", nextEventHours, "hours");
  setTimeout(handleTimer, nextEventMillis);
}

setTimeout(handleTimer, 100);
