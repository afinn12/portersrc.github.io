$(document).ready(function () {

    var icons_path = 'img';
    var icons = [
        'sunny.svg',
        'partially-sunny.svg',
        'cloudy.svg',
        'rainy.svg',
        'stormy.svg',
    ];

    var display = '';

    function hideAllChildren(table) {
        table.rows().every(function () {
            if (this.child.isShown()) {
                this.child.hide(); 
            }
        });
    }
 

    function setDisplay(newDisplay, table) { 
        console.log(display, " ", newDisplay)
        if (display !== newDisplay)
        {
            display = newDisplay;
            if (display === "nightly")
            {
                table.column(2).visible(true);
                table.column(3).visible(true);
                table.column(4).visible(true);
                table.column(5).visible(false);
                table.column(6).visible(false);
                table.column(7).visible(false);

                $('#weather-table-name').empty();
                // Hard-code for now...could dynamically set the table name or something
                // more sophisticated later if we have want more tables, etc.
                $('#weather-table-name').append(
                    '<div style="text-align: center;">' +
                    '<a class="title" href="https://github.com/kata-containers/kata-containers/actions/workflows/ci-nightly.yaml">' +
                    'Kata Containers CI Nightly </a>' +
                    '</div>'
                );
            }else{
                table.column(2).visible(false);
                table.column(3).visible(false);
                table.column(4).visible(false);
                table.column(5).visible(true);
                table.column(6).visible(true);
                table.column(7).visible(true);

                $('#weather-table-name').empty();
                // Hard-code for now...could dynamically set the table name or something
                // more sophisticated later if we have want more tables, etc.
                $('#weather-table-name').append(
                    '<div style="text-align: center;">' +
                    '<a class="title" href="https://github.com/kata-containers/kata-containers/pulls?state=closed&per_page=">' +
                    'Kata Containers CI PRs </a>' +
                    '</div>'
                );
            }
            hideAllChildren(table);
        }
    }



    // Get the weather image for some stat map of fails, skips, and runs. For
    // simplicity, skips are considered fails. Failure rates for the icons are:
    //   stormy: .8 <= x
    //   rainy:  .6 <= x < .8
    //   cloudy: .4 <= x < .6
    //   partially-sunny: .2 <= x < .4
    //   sunny:  x < .2
    function get_weather_icon(stat) {
        var fail_rate = (stat['fails'] + stat['skips']) / stat['runs'];
        var idx = Math.floor(fail_rate * 10 / 2); // e.g. failing 3/9 runs is .33, or idx=1
        if (idx == icons.length) {
            // edge case: if 100% failures, then we go past the end of icons[]
            // back the idx down by 1
            console.assert(fail_rate == 1.0);
            idx -= 1;
        }
        var icon = icons[idx];
        img_tag = '<img src="' + icons_path + '/' + icon + '" width="35%" height="35%"></img>'
        sort_val = "image-"+idx;
        return [img_tag, sort_val];
    }

    function populate_table(job_stats) {
        const url = new URLSearchParams(window.location.search);
        const searchParam = url.get('search') || "";
        // console.log(searchParam)

        for (var [name, stat] of Object.entries(job_stats)) {
            re = new RegExp('kata-containers-ci-on-push / run-.*-tests.*');

            if (re.test(name) && name.toLowerCase().includes(searchParam.toLowerCase())) {
                var [img_tag, img_sort] = get_weather_icon(stat);
                var urls = stat['urls'].join(' ');
                var results = stat['results'].join(' ');
                var run_nums = stat['run_nums'].join(' ');

                var pr_urls = stat['pr_urls'].join(' ');
                var pr_results = stat['pr_results'].join(' ');
                var pr_run_nums = stat["pr_nums"].join(' ');

                console.log("nightly append");
                $('#weather-table tbody').append(
                    '<tr data-urls="'+urls+'" data-results="'+results+'" data-run-nums="'+run_nums+'"' +
                    ' data-pr-urls="'+ pr_urls +'" data-pr-results="'+ pr_results +'" data-pr-run-nums="'+ pr_run_nums +'">' +
                        '<td class="dt-left dt-control">'+name+'</td>' +
                        '<td>'+stat['required']+'</td>' +
                        '<td>'+stat['runs']+'</td>' +
                        '<td>'+stat['fails']+'</td>' +
                        '<td>'+stat['skips']+'</td>' +
                        '<td>'+stat['pr_runs']+'</td>' +
                        '<td>'+stat['pr_fails']+'</td>' +
                        '<td>'+stat['pr_skips']+'</td>' +
                        '<td data-sort="'+img_sort+'">'+img_tag+'</td>' +
                    '</tr>'
                    );
            }
        }
    }

    // Create the hyperlinks that will show up when we click a name for more
    // details. Each <tr> should have a data-urls and data-results attribute
    // with space-separated urls and pass/fail results, respectively. Create
    // and return the appropriate HTML string from them.
    function format_tr_job_urls(tr) {
        var job_urls = '';
        if (display === "nightly")
        {
            console.log($(tr).data())

            var urls = $(tr).data('urls').split(' ');
            var results = $(tr).data('results').split(' ');
            var run_nums = $(tr).data('run-nums').toString().split(' ');
            var result_to_color = {
                'Pass': '&#128994;', // green
                'Skip': '&#128993;', // yellow
                'Fail': '&#128308;', // red
            }
            for (var i = 0; i < urls.length; i++) {
                job_urls += '' + result_to_color[results[i]]
                               + '<a href="'
                               + urls[i]
                               + '">'
                               + run_nums[i]
                               + '</a><span class="p-2"></span>';
            }
        }else{
            console.log($(tr).data())
            var urls = $(tr).data('pr-urls').split(' ');
            var results = $(tr).data('pr-results').split(' ');
            var run_nums = $(tr).data('pr-run-nums').toString().split(' ');
            var result_to_color = {
                'Pass': '&#128994;', // green
                'Skip': '&#128993;', // yellow
                'Fail': '&#128308;', // red
            }
            for (var i = 0; i < urls.length; i++) {
                job_urls += '' + result_to_color[results[i]]
                               + '<a href="'
                               + urls[i]
                               + '">'
                               + run_nums[i]
                               + '</a><span class="p-2"></span>';
            }
        }
 
        return job_urls;
    }

    function set_datatable_options(table) {
        var nightly = document.getElementById('nightly');
        var pr = document.getElementById('pr');
        

        nightly.addEventListener('click', function () {
            setDisplay('nightly', table);
        });
        
        pr.addEventListener('click', function () {
            setDisplay('pr', table);
        });

        table.on('click', 'td.dt-control', function (e) {
            let tr = e.target.closest('tr');
            let row = table.row(tr);
            if (row.child.isShown()) {
                row.child.hide();
            } else {
                row.child(format_tr_job_urls(tr)).show();
            }
        });
    }

    function requiredFilter() {
        $('#weather-table tbody tr').each(function() {
            var required = $(this).find('td').eq(1).text();
            // console.log(required);
            if(required == 'false' && $('#filterRequired').is(':checked'))
            {
                $(this).hide(); 
            } else {
                $(this).show(); 
            }
    })
    }

    // Event listener for the required filter 
    $('#filterRequired').change(function() {
        requiredFilter();
    });

    function main() {
        populate_table(ci_nightly_data);
        var table = new DataTable('#weather-table', {
            order: [[2, 'desc']],
            paging: false
        });    
        set_datatable_options(table);
        setDisplay("nightly", table)
    }

    main();
});
