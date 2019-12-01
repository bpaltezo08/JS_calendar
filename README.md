# JS_calendar
#Custom calendar generator

#USAGE

let events = [
{
  date: "June 16 2019",
  time: "9:00 am",
  repeat: false,
  details: "Church Celebration!"
}];



calendar.init({
  parent: $("#calendar-container"),
  today: true,
  shift: 0,
  color: "#6074FF",
  data: events
});

