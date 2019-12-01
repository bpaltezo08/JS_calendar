var BPACalendar = function(){

    const $$ = this;
    const date = new Date;

    this.currentView;
    this.shift;
    this.currentDate;
    this.currentDay;
    this.currentMonth;
    this.currentYear;
    this.container;
    this.tasks;
    this.color;
    this.DATA;
    this.startTime = 6;

    this.months = {
        names: ["January","February","March","April","May","June","July","August","September","October","November","December"],
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayLengths: [31,28,31,30,31,30,31,31,30,31,30,31],
        startIndexes: [2,5,5,1,3,6,1,4,7,2,5,7]
    };
    
    this.today = {
        get: function(){return {monthIndex:date.getMonth(),dayIndex:date.getDay(),day:$$.months.days[date.getDay()],date:date.getDate(),month:$$.months.names[date.getMonth()],year:date.getFullYear(),time:date.toLocaleTimeString()}},
        text: function(){let time=$$.today.get();return time.day+" "+time.date+" "+time.month+" "+time.year;}
    }

    this.defaults = {
        set: function(){
            $$.currentMonth = $$.DATA.m;
            $$.currentYear = $$.DATA.y;
            $$.currentDay = $$.DATA.d;
            $$.currentDate = $$.DATA.dx;
            $$.startTime = 6;
        }
    }

    this.map = function(data, year){for(var x=0;x<data.length;x++){if(year==data[x].y){return x;}}return false;}
    this.el = function(t){return document.createElement(t);}

    this.init = function(data){

        if(data && data.today){
            data.y = $$.today.get().year;
            data.m = $$.today.get().monthIndex;
            data.d = $$.today.get().date;
            data.dx = $$.today.get().dayIndex;
            data.view = "month";
        }else{
            data = {
            parent: $("body"),
            today: false,
            y: 2019,
            m: 0,
            d: 1,
            dx: 0,
            shift: 0,
            view: "month",
            color: "",
            data: []
            };
        }

        this.currentView = "month";
        this.container = data.parent;
        this.currentYear = data.y;
        this.currentMonth = data.m;
        this.currentDay = data.d;
        this.currentDate = data.dx;
        this.shift = data.shift;
        this.tasks = data.data;
        this.color = data.color;
        this.DATA = data;

        data.parent.append($$.generate(data.shift, data.y, data.m, data.data));
        
        $$.functions();
    
    }

    this.generate = function(shift, y, m, dataset){

        shift = (shift || 0) % 7;
        this.year = y;
        this.month = m;

        // get first day of month
        var firstDay = new Date(this.year, this.month, 1);
        var startingDay = firstDay.getDay();

        if (shift > startingDay) shift -= 7;

        // find number of days in month
        var monthLength = $$.months.dayLengths[this.month];

        // compensate for leap year
        if (this.month == 1) { // February only!
            if ((this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0) {
                monthLength = 29;
            }
        }

        // do the header
        var monthName = $$.months.names[this.month]
        var html = '<table class="table table-bordered calendar m-b-30">';
    
        //html += monthName + "&nbsp;" + this.year;
        html += '<thead><tr>';

        for (var i = 0; i <= 6; i++) {
            html += '<th>';
            html += $$.months.shortDays[(i + shift + 7) % 7];
            html += '</th>';
        }
        
        html += '</tr></thead><tbody><tr>';

        // fill in the days
        var day = 1;
        // this loop is for is weeks (rows)
        for (var i = 0; i < 9; i++) {
            // this loop is for weekdays (cells)
            for (var j = 0; j <= 6; j++){

                let today = $$.today.get();

                html += '<td data-day="'+$$.months.shortDays[(j + shift + 7) % 7]+'" data-year="'+this.year+'" data-month="'+this.month+'" class="calendar-day text-right';

                if (day <= monthLength && (i > 0 || j + shift >= startingDay)){

                    if(this.year == today.year && this.month == today.monthIndex && day == today.date){
                        html += ' calendar-today" data-date="'+day+'" >';
                    }else{
                        html += '" data-date="'+day+'" >';
                    }

                    html += day;
                    day++;

                }else{
                    html += ' disabled" data-disabled="true">';
                }

                html += '</td>';
            }
            
            // stop making rows if we've run out of days
            if (day > monthLength) {
                break;
            } else {
                html += '</tr><tr>';
            }
        }

        html += '</tr></tbody></table>';
        this.html = html;
        this.result = $$.el("div");
        this.result.className = "table-responsive m-t-20 m-b-20";
        this.result.innerHTML = $$.heading(y, m, firstDay) + this.html;

        return this.result;

    }

    this.addTask = {

        month: function(){

            let days = $(".calendar-day");
            let tasks = $$.tasks;
            let day, data, task = [], json = [];

            //LOOP FOR REPEATED EVENTS
            for(var t=0;t<tasks.length;t++){
                if(tasks[t].repeat){
                    for(var d=0;d<days.length;d++){
                        data = $(days[d]).data();
                        day = data.day;
                        if(day == tasks[t].every && !data.disabled){
                            let p = $$.el("p");
                            p.className = "calendar-task-detail text-left small m-t-20";
                            p.innerHTML = tasks[t].details;
                            days[d].append(p);
                            $(days[d]).addClass("calendar-task");
                            json.push({
                                date: days[d],
                                task: tasks[t]
                            });
                        }
                    }
                }
            }

            //LOOP FOR REGULAR EVENT
            for(var d=0;d<days.length;d++){
                data = $(days[d]).data();
                day = $$.months.names[data.month] + " " + data.date + " " + data.year;
                for(var t=0;t<tasks.length;t++){
                    if(tasks[t].date == day){
                        let p = $$.el("p");
                        p.className = "calendar-task-detail text-left small text-break list-inline m-t-20";
                        p.innerHTML = tasks[t].details;
                        days[d].append(p);
                        $(days[d]).addClass("calendar-task");
                        json.push({
                            date: days[d],
                            task: tasks[t]
                        });
                    }
                }
               
            }

            $$.addTask.json(json);

        },

        week: function(){

            let days = $(".calendar-view-week");
            let tasks = $$.tasks;

            //LOOP FOR REPEATED EVENTS
            for(var t=0;t<tasks.length;t++){   
                let time = ((tasks[t].time.includes("am"))?(Math.floor(tasks[t].time.split(":")[0])||""):((Math.floor(tasks[t].time.split(":")[0])+12)||""));
                if(tasks[t].every && tasks[t].repeat){
                    for(var d=0;d<days.length;d++){
                        if($$.months.shortDays[$(days[d]).data("day")] == tasks[t].every && $(days[d]).hasClass("time"+time)){
                            let p = $$.el("p");
                            p.className = "calendar-task-detail text-left";
                            p.innerHTML = tasks[t].details;
                            $(days[d]).append(p);
                        }
                    }
                }
            }

            //LOOP FOR REGULAR EVENT
            for(var t=0;t<tasks.length;t++){   
                let time = ((tasks[t].time.includes("am"))?(Math.floor(tasks[t].time.split(":")[0])||""):((Math.floor(tasks[t].time.split(":")[0])+12)||""));
                for(var d=0;d<days.length;d++){
                    let date = $$.months.names[$(days[d]).data("month")] + " " + $(days[d]).data("date") + " " + $(days[d]).data("year");
                    console.log(date);
                    if(date == tasks[t].date && $(days[d]).hasClass("time"+time)){
                        let p = $$.el("p");
                        p.className = "calendar-task-detail text-left";
                        p.innerHTML = tasks[t].details;
                        $(days[d]).append(p);
                    }
                }
            }

        },

        day: function(){

            let days = $(".calendar-time");
            let tasks = $$.tasks;

            for(var x=0;x<tasks.length;x++){

                for(var d=0;d<days.length;d++){

                    let day = $(days[d]);
                    let data = day.data();
                    let time = ((tasks[x].time.includes("am"))?(Math.floor(tasks[x].time.split(":")[0])||""):((Math.floor(tasks[x].time.split(":")[0])+12)||""));
                    let date = data.month+" "+data.date+" "+data.year;

                    if(date == tasks[x].date || tasks[x].every == data.day){
                        if(day.hasClass("time"+time)){
                            let p=$$.el("p");
                            p.innerHTML=tasks[x].details;
                            $(days[d]).append(p);
                        }
                    }

                }

            }

        },

        json: function(data){

            for(var d=0;d<data.length;d++){

                let tasks = [], json;
                let dataset = $(data[d].date).data("dataset");
                
                if(dataset){
                    json = JSON.parse(dataset);
                    if(json) tasks.push(json[0]);
                }
                tasks.push(data[d].task);    
                $(data[d].date).data("dataset", JSON.stringify(tasks));
            
            }
        }

    }

    this.applyEffects = function(){
        //$(this.container).prepend(`<div class="preloader"><div class="lds-ripple"><div class="lds-pos"></div><div class="lds-pos"></div></div></div>`)
        $(this.container).hide();
        $(this.container).fadeOut("slow");
        $(this.container).fadeIn("slow");
    }

    this.getWeek = {

        get: function(y, m, d, start, end){
            return $$.getWeek.map( (y || $$.currentYear), (m||$$.currentMonth), (d||$$.currentDay), (start||0), (end||6)  );        
        },

        map: function(y, m, d, start){
            let w = {start: null, end: null}, sdata, edata, dt; let day = d;
            for(var x=0;x<7;x++){dt = new Date(y, m, day);sdata = { day: dt.getDay(), d: dt.getDate(), m: dt.getMonth(), y: dt.getFullYear() }; if(sdata.day == start && x > 0){ w.start = sdata; break;}else if(x == 0 && sdata.day == start){ w.start = sdata; break;}else{day--;}}
            dt = new Date(sdata.y, sdata.m, (sdata.d+6));
            w.end = { day: dt.getDay(), d: dt.getDate(), m: dt.getMonth(), y: dt.getFullYear()}
            w.dates = $$.getWeek.dates(w.start.y, w.start.m, w.start.d);
            return w;
        },

        dates: function(y, m, d){
            let dt, res = [];
            for(var x=0;x<7;x++){ dt=new Date(y,m,d+x); res.push({ str: dt.toDateString(), day: dt.getDay(), d: dt.getDate(), m: dt.getMonth(), y: dt.getFullYear() });}
            return res;
        }
        
    };


    this.css = {

        /*
            //"rgba(22, 33, 44, 0.03)"
            //"rgba(22, 33, 44, 0.1)"
            //"rgba(22, 33, 44, 0.03)"
            //"rgba(22, 33, 44, 0.1)"
        */

        apply: function(color){

            let rgb = ((color.includes("#"))?$$.css.hexToRgb(color):$$.css.rgbToHex(color));
            $(".calendar").css({width: "95%", marginLeft: "2.5%"});
            $(".calendar thead th").css({textAlign:"center", backgroundColor: $$.css.colText(rgb, 1), color: $$.css.textColor(rgb), width: "14.285714285714286%", border: 0.03});
            $(".calendar td").css({height: "calc(80vh / 6)"});
            $(".calendar td").hover(function(){if(!$(this).hasClass("disabled")){$(this).css({cursor: "pointer",backgroundColor: $$.css.colText(rgb, 0.03) });}}).mouseout(function(){if($(this).data("date")) $(this).css({backgroundColor: ""});});
            $(".calendar .calendar-today").css({backgroundColor: $$.css.colText(rgb, 0.2)});
            $(".calendar .calendar-today").hover(function(){$(this).css({cursor: "pointer",backgroundColor: $$.css.colText(rgb, 0.18) });}).mouseout(function(){$(this).css({backgroundColor: $$.css.colText(rgb, 0.2)});});
            $(".calendar .calendar-task").css({float: "left" });
            $(".calendar .calendar-task-light").css({color: $$.css.colText(rgb, 1), backgroundColor: '#fff'});
            $(".calendar a").css({color: $$.css.colText(rgb, 1)});
            $(".calendar-title h2").css({
                marginTop: 0,
                whiteSpace: "nowrap",
                fontSize: "32px",
                fontWeight: 100,
                marginBottom: "10px",
                fontFamily: 'Roboto',
            })

            $(".calendar .calendar-task-detail").css({
                textAlign: "left",
                display: "block",
                fontSize: "12pt",
            });

            let rows = $(".calendar-day");
            for(var x=0;x<rows.length;x++){
                if(!$(rows[x]).data("date")){
                    $(rows[x]).css({backgroundColor: $$.css.colText(rgb, 0.03), color: $$.css.colText(rgb, 0.04)});
                }
            }

            $(".calendar-day-view thead th").css({textAlign:"right", fontSize: "22px", fontWeight: 100,fontFamily: "Roboto", backgroundColor: $$.css.colText(rgb, 1), color: $$.css.textColor(rgb), border: 0.03});
            $(".calendar-day-view thead nav").css({marginTop: "10%"});
            $(".calendar-day-view .time").css({backgroundColor: $$.css.colText(rgb, 0.03), color: "", width: "10%", textAlign: "left"});

            $(".calendar-week-view thead th").css({textAlign:"center", fontSize: "16px", fontWeight: 100,fontFamily: "Roboto", backgroundColor: $$.css.colText(rgb, 1), color: $$.css.textColor(rgb), border: 0.03});
            $(".calendar-week-view .time").css({backgroundColor: $$.css.colText(rgb, 0.03), color: "", width: "12%", textAlign: "left"});

        },

        modal: function(){
            $("#calendarModal .calendar-title").css({fontWeight: 0, fontSize: "24px"});
        },

        pagination: function(){
            
            $(".calendar-month-view-btn").removeClass("disabled");
            $(".calendar-week-view-btn").removeClass("disabled");
            $(".calendar-day-view-btn").removeClass("disabled");

            if($$.currentView == "month"){
                $(".calendar-month-view-btn").addClass("disabled");
            }else if($$.currentView == "day"){
                $(".calendar-day-view-btn").addClass("disabled");
            }else if($$.currentView == "week"){
                $(".calendar-week-view-btn").addClass("disabled");
            }

        },

        getHex: function(c){var hex=c.toString(16);return hex.length==1?"0"+hex:hex;},
        rgbToHex: function(r,g,b){return "#"+$$.css.getHex(r)+$$.css.getHex(g)+$$.css.getHex(b);},
        hexToRgb: function(hex){var res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return res?{r: parseInt(res[1], 16),g: parseInt(res[2], 16),b: parseInt(res[3], 16)}:null;},
        colText: function(c, op){return "rgba("+c.r+","+c.g+","+c.b+","+op+")";},
        textColor: function(rgb){
            return ( (rgb.r < 90 && rgb.g < 90 && rgb.b < 90) ? "#223345" : "#fff" );
        }

    }

    this.functions = function(opt){

        if(opt != "no-animation") $$.applyEffects();
        $$.css.apply($$.color);
        $$.css.pagination();
        
        if($$.currentView == "month") $$.addTask.month();
        else if($$.currentView == "week") $$.addTask.week();
        else if($$.currentView == "day") $$.addTask.day();

        $(".calendar-prev-btn").on("click", function(){

            if($$.currentView == "month"){
                
                if($$.currentMonth<=0){$$.currentMonth=11;$$.currentYear-=1;}else{$$.currentMonth-=1;}
                $$.container.html($$.generate($$.shift, $$.currentYear, $$.currentMonth, $$.tasks));
            
            }else if($$.currentView == "day"){

                if($$.currentDay == 1){ if($$.currentMonth<=0){$$.currentMonth=11;$$.currentYear-=1; }else{$$.currentMonth-=1;} $$.currentDate--;$$.currentDay = $$.months.dayLengths[$$.currentMonth];}else{$$.currentDay--;$$.currentDate--;}
                if($$.currentDate > 7){ $$.currentDate = 0;}else if($$.currentDate < 0){$$.currentDate = 6;}
                $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.day($$.currentDay, $$.currentDate, $$.currentMonth));

            }else if($$.currentView == "week"){

                let w = $$.getWeek.get(); $$.currentDay = w.start.d-7; $$.currentMonth = w.start.m;
                if($$.currentDay <= 0){$$.currentMonth--; $$.currentDay = $$.months.dayLengths[$$.currentMonth] - Math.abs($$.currentDay);}
                $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.week($$.currentDay, $$.currentDate, $$.currentMonth));
            
            }

            $$.functions();
        });

        $(".calendar-next-btn").on("click", function(){
    
            if($$.currentView == "month"){

                if($$.currentMonth>=11){$$.currentMonth=0;$$.currentYear+=1;}else{$$.currentMonth+=1;}
                $$.container.html($$.generate($$.shift, $$.currentYear, $$.currentMonth, $$.tasks));
            
            }else if($$.currentView == "day"){

                if($$.currentDay == $$.months.dayLengths[$$.currentMonth]){ if($$.currentMonth>=11){ $$.currentMonth=0;$$.currentYear+=1;}else{ $$.currentMonth+=1;}$$.currentDate++;$$.currentDay = 1;}else{ $$.currentDay++;$$.currentDate++;}
                if($$.currentDate >= 7){ $$.currentDate = 0;}else if($$.currentDate < 0){$$.currentDate = 6;}
                $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.day($$.currentDay, $$.currentDate, $$.currentMonth));

            }else if($$.currentView == "week"){

                let w = $$.getWeek.get(); $$.currentDay = w.end.d+1; $$.currentMonth = w.end.m;
                $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.week($$.currentDay, $$.currentDate, $$.currentMonth));
            
            }
        
            $$.functions();
        
        });

        $(".calendar-day-prev-time-btn").on("click", function(){
            if($$.startTime == 1) $$.startTime = 6;
            else $$.startTime--;
            $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.day($$.currentDay, $$.currentDate, $$.currentMonth, $$.startTime, $$.startTime+12));
            $$.functions("no-animation");    
        });

        $(".calendar-day-next-time-btn").on("click", function(){
            if($$.startTime == 12) $$.startTime = 6;
            else $$.startTime++;
            $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.day($$.currentDay, $$.currentDate, $$.currentMonth, $$.startTime, $$.startTime+12));
            $$.functions("no-animation");
        });

        $(".calendar-week-prev-time-btn").on("click", function(){
            if($$.startTime == 1) $$.startTime = 6;
            else $$.startTime--;
            $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.week($$.currentDay, $$.currentDate, $$.currentMonth, $$.startTime, $$.startTime+12));
            $$.functions("no-animation");
        });

        $(".calendar-week-next-time-btn").on("click", function(){
            if($$.startTime == 12) $$.startTime = 6;
            else $$.startTime++;
            $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.week($$.currentDay, $$.currentDate, $$.currentMonth, $$.startTime, $$.startTime+12));
            $$.functions("no-animation");
        });

        $(".calendar-today-btn").on("click", function(){

            if($$.currentView == "month"){
                $$.defaults.set();
                $$.container.html($$.generate($$.shift, $$.currentYear, $$.currentMonth, $$.tasks));
            }else if($$.currentView == "week"){
                $$.defaults.set();
                $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.week($$.currentDay, $$.currentDate, $$.currentMonth));
            }else if($$.currentView == "day"){
                $$.defaults.set();
                $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.day($$.currentDay, $$.currentDate, $$.currentMonth));
            }

            $$.functions();
        
        });

        $(".calendar-day-view-btn").on("click", function(){
            $$.currentView = "day";
            $$.defaults.set();
            $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.day($$.currentDay, $$.currentDate, $$.currentMonth));
            $$.functions();
        });

        $(".calendar-week-view-btn").on("click", function(){
            $$.currentView = "week";
            $$.defaults.set();
            $$.container.html("<br>" + $$.heading($$.currentYear, $$.currentMonth) + $$.views.week($$.currentDay, $$.currentDate, $$.currentMonth));
            $$.functions();
        });

        $(".calendar-month-view-btn").on("click", function(){
            $$.currentView = "month";
            $$.defaults.set();
            $$.container.html($$.generate($$.shift, $$.currentYear, $$.currentMonth, $$.tasks));
            $$.functions();
        });

        $(".calendar-day").on("click", function(){
            let data = $(this).data();
            //console.log(JSON.parse(data.dataset));
            let day = $$.months.names[data.month]+" "+data.date+", "+data.year;
            let tasks = data.dataset?$$.dialogcontent(JSON.parse(data.dataset), $(this)):"No schedules";
            //console.log(data, data.dataset);
            $("#calendarModal").remove();
            if(data.date) $$.container.append($$.dialogmodal(day, tasks));
            $("#calendarModal").modal({});
            $$.css.modal();
        });

    }

    this.heading = function(y, m, today){

        let currentMonth = $$.months.names[m];
        let currentYear = y;
        let localedate = date;

        return `
           

                    <div class="card col-lg-12 m-b-0">
                        <div class="card-body">
                        <div class="row">
                            <div class="col-lg-4">
                                <div class="float-left calendar-title m-t-10">
                                    <h2>`+currentMonth + " " + currentYear +`</h2>
                                </div>
                            </div>
                        
                            <div class="col-lg-4">
                                <nav aria-label="...">
                                    <ul class="pagination pagination-lg">
                                        <li class="page-item calendar-day-view-btn">
                                            <a class="page-link calendar-view " href="javascript:void(0);" tabindex="-1">day</a>
                                        </li>
                                        <li class="page-item calendar-week-view-btn">
                                            <a class="page-link" href="javascript:void(0);">week</a>
                                        </li>
                                        <li class="page-item calendar-month-view-btn disabled">
                                            <a class="page-link" href="javascript:void(0);">month</a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        
                            <div class="col-lg-4">
                        
                                <div class="float-right">

                                    <nav aria-label="...">
                                    <ul class="pagination pagination-lg">
                                        <li class="page-item">
                                            <a class="page-link calendar-prev-btn" href="javascript:void(0);" tabindex="-1"><i class="mdi mdi-chevron-left"></i></a>
                                        </li>
                                        <li class="page-item">
                                            <a class="page-link calendar-next-btn" href="javascript:void(0);"><i class="mdi mdi-chevron-right"></i></a>
                                        </li>
                                        <li class="page-item">
                                            
                                        </li>
                                        <li class="page-item">
                                            <a class="page-link calendar-today-btn" href="javascript:void(0);">today</a>
                                        </li>
                                    </ul>
                                    </nav>
                                    
                                </div>
                            </div>

                        </div>
                        </div>
                    </div>
                
        `;
    
    }

    this.dialogmodal = function(title, content){
        return `
            <div class="modal fade" id="calendarModal" role="dialog">
                <div class="modal-dialog">  
                    <div class="modal-content">
                        <div class="modal-header">
                            <p class="calendar-title"><i class="mdi mdi-calendar-clock"></i> `+title+`</p>
                        </div>
                        <div class="modal-body">
                        `+content+`
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    this.dialogcontent = function(data, el){
        return `<div class="row">
                    <div class="col-lg-12">
                        <div class="card">
                            <div class="comment-widgets scrollable">
                            `+$$.writetask(data, el)+`
                            </div>
                        </div>
                    </div>
                    
                </div>`;
    }

    this.writetask = function(data, el){
        
        let eldata = $(el).data();
        let tdata = $$.today.get();
        let eday = new Date(eldata.year, eldata.month, eldata.date);
        let tday = new Date(tdata.year, tdata.monthIndex, tdata.date);
        let label = ((eday > tday) ? 'label-primary">Pending' : 'label-danger">Past Event' );
        console.log(eldata, tdata, eday, tday);
        let res = "";
        for(var x=0;x<data.length;x++){
            res += `
                <div class="d-flex flex-row comment-row m-t-0">
                    <div class="p-2 display-5"><i class="mdi mdi-calendar-multiple"></i></div>
                    <div class="comment-text w-100">
                        <p class="m-t-20 calendar-title">`+data[x].details+`</p>
                        <span class="m-b-15 d-block"></span>
                        <div class="comment-footer">
                            <span class="text-muted float-right">`+data[x].time+`</span> 
                            <span class="label label-rounded `+label+`</span>
                            <span class="action-icons" style="opacity:1;visibility:visible;">
                                <a href="javascript:void(0)" title="Mark as done"><i class="mdi mdi-calendar-check"></i></a>
                                <a href="javascript:void(0)" title="Cancel schedule"><i class="mdi mdi-calendar-remove"></i></a>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }
        return res;
    }

    this.views = {

        day: function(d, dx, m, start, limit){

            start = (start || $$.startTime);
            limit = (limit || $$.startTime+12);

            let time = "", ext = "", day = $$.months.days[dx], month = $$.months.names[m];

            let res = `<div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body calendar-day-view">
                                
                                <table class="table table-bordered">
                                    <thead>
                                        <th colspan="3">
                                            <div class="row">
                                                <div class="col-md-12 text-center">
                                                <nav aria-label="...">
                                                <ul class="pagination pagination-md w-100">
                                                    <li class="page-item">
                                                        <a title="Step 1 hour down" class="page-link calendar-time-btn calendar-day-prev-time-btn" href="javascript:void(0);" tabindex="-1"><i class="mdi mdi-chevron-down"></i></a>
                                                    </li>
                                                    <li class="page-item">
                                                        <a title="Step 1 hour up" class="page-link calendar-time-btn calendar-day-next-time-btn" href="javascript:void(0);"><i class="mdi mdi-chevron-up"></i></a>
                                                    </li>
                                                </ul>
                                                </nav>
                                                </div>
                                            </div>
                                        </th>
                                        <th></th>
                                        <th></th>
                                        <th></th>
                                        <th></th>
                                        <th class="day">`+day + ", " + month + " " + d +`</th>
                                    </thead>
                                    <tbody>`;

            for(var x=start;x<=limit;x++){

                if(x < 12){
                    time = ((x<10)?"0"+x+":00 am":x+":00 am");
                }else{
                    time = ((x==12)?x:(((x-12) < 10)?"0"+(x-12):x-12)) + ((x==24)?":00 am":":00 pm");
                }

                res += `<tr>
                            <td class="calendar-view-day time">`+time+`</td>
                            <td class='calendar-task calendar-view-day calendar-time time`+x+`' data-day="`+$$.months.shortDays[dx]+`" data-date="`+d+`" data-month="`+month+`" data-year="`+$$.currentYear+`" colspan="7"></td>
                        </tr>`;
            }

            return res + `</tbody></table></div></div></div></div>`;
        },

        week: function(d, dx, m, start, limit){

            start = (start || $$.startTime);
            limit = (limit || $$.startTime+12);
            w = $$.getWeek.get();
            //console.log(w);

            let time = "", ext = "", day = $$.months.days[dx], month = $$.months.names[m];

            let res = `<div class="row">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body calendar-week-view">
                                
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th class="day" colspan="8">`+"<br>" +w.dates[0].str+" - "+ w.dates[w.dates.length-1].str +`</th>
                                        </tr>
                                        <tr>
                                            <th>
                                                <div class="row">
                                                <div class="col-md-12 text-center center">
                                                <nav aria-label="...">
                                                <ul class="pagination pagination-sm w-100">
                                                    <li class="page-item">
                                                        <a title="Step 1 hour down" class="page-link calendar-time-btn calendar-week-prev-time-btn" href="javascript:void(0);" tabindex="-1"><i class="mdi mdi-chevron-down"></i></a>
                                                    </li>
                                                    <li class="page-item">
                                                        <a title="Step 1 hour up" class="page-link calendar-time-btn calendar-week-next-time-btn" href="javascript:void(0);"><i class="mdi mdi-chevron-up"></i></a>
                                                    </li>
                                                </ul>
                                                </nav>
                                                </div>
                                            </div>
                                            </th>
                                            <th>Sun</th>
                                            <th>Mon</th>
                                            <th>Tue</th>
                                            <th>Wed</th>
                                            <th>Thu</th>
                                            <th>Fri</th>
                                            <th>Sat</th>    
                                        </tr>
                                                                                
                                    </thead>
                                    <tbody>`;

            for(var x=start;x<=limit;x++){

                if(x < 12){
                    time = ((x<10)?"0"+x+":00 am":x+":00 am");
                }else{
                    time = ((x==12)?x:(((x-12) < 10)?"0"+(x-12):x-12)) + ((x==24)?":00 am":":00 pm");
                }

                res += `<tr><td class="calendar-view-day time">`+time+`</td>`;

                for(var ww=0;ww<w.dates.length;ww++){
                    res += `<td class='calendar-task calendar-time calendar-view-week time`+x+` week`+ww+`' data-date="`+w.dates[ww].d+`" data-month="`+w.dates[ww].m+`" data-year="`+w.dates[ww].y+`" data-day="`+w.dates[ww].day+`"></td>`;
                }

                res += `</tr>`;
            }

            return res + `</tbody></table></div></div></div></div>`;

        }

    }

}
