$(document).ready(function () {

    var icons_path = 'img';
    var icons = [
        'sunny.svg',
        'partially-sunny.svg',
        'cloudy.svg',
        'rainy.svg',
        'stormy.svg',
    ];

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
        for (var [name, stat] of Object.entries(job_stats)) {
            re = new RegExp('kata-containers-ci-on-push / run-.*-tests.*');

            if (re.test(name)) {
                var [img_tag, img_sort] = get_weather_icon(stat);
                var urls = stat['urls'].join(' ');
                var results = stat['results'].join(' ');
                var run_nums = stat['run_nums'].join(' ');
                $('#weather-table tbody').append(
                  '<tr data-urls="'+urls+'" data-results="'+results+'" data-run-nums="'+run_nums+'">' +
                    '<td class="dt-left dt-control">'+name+'</td>' +
                    '<td>'+stat['runs']+'</td>' +
                    '<td>'+stat['fails']+'</td>' +
                    '<td>'+stat['skips']+'</td>' +
                    '<td data-sort="'+img_sort+'">'+img_tag+'</td>' +
                  '</tr>'
                );
            }
        }
        // Hard-code for now...could dynamically set the table name or something
        // more sophisticated later if we have want more tables, etc.
        $('#weather-table-name').append(
          '<a class="title" href="https://github.com/kata-containers/kata-containers/actions/workflows/ci-nightly.yaml">'
        + 'Kata Containers CI Nightly'
        + '</a>'
        );
    }


    function populate_table2(job_stats) {
        let levels = [];
        let paths = new Set();

        var names = Object.keys(job_stats);
        
        var max = 0;

        for (let i = 0; i<names.length;i++)
        {
            names[i] = names[i].split('/');
            
            if (max <names[i].length)
            {
                console.log("name: " + names[i] )
                console.log("len: " + names[i].length )

                max = names[i].length
            }
            
        }
        console.log("max: " + max )

        for (let i = 0; i < max; i++)
        {
            for (let n of names)
            {
                paths.add(n[i]);
            }
            //for each unique path, create row

            //clear paths

        }
    

        for (let p of paths)
        {
            console.log("paths: " + p);
        }


        // each names[i][j], as j increments, goes through path
        // same [j] same level in tree
        // for each j, create a level for unique. 
        // for each subsequent unique j, put under respective prior j
        // when last j, put tests under 
        

        for (var [name, stat] of Object.entries(job_stats)) {
            re = new RegExp('kata-containers-ci-on-push / run-.*-tests.*');
            var n = name.split('/');
            for (let i = 0; i<n.length-1; i++)
            {
                paths[n[i]] = n[i+1];
            }
           

            // if (re.test(name)) {
            //     var [img_tag, img_sort] = get_weather_icon(stat);
            //     var urls = stat['urls'].join(' ');
            //     var results = stat['results'].join(' ');
            //     var run_nums = stat['run_nums'].join(' ');
            //     $('#weather-table tbody').append(
            //       '<tr data-urls="'+urls+'" data-results="'+results+'" data-run-nums="'+run_nums+'">' +
            //         '<td class="dt-left dt-control">'+name+'</td>' +
            //         '<td>'+stat['runs']+'</td>' +
            //         '<td>'+stat['fails']+'</td>' +
            //         '<td>'+stat['skips']+'</td>' +
            //         '<td data-sort="'+img_sort+'">'+img_tag+'</td>' +
            //       '</tr>'
            //     );
            // }
        }
     
        // Hard-code for now...could dynamically set the table name or something
        // more sophisticated later if we have want more tables, etc.
        $('#weather-table-name').append(
          '<a class="title" href="https://github.com/kata-containers/kata-containers/actions/workflows/ci-nightly.yaml">'
        + 'Kata Containers CI Nightly'
        + '</a>'
        );
    }

    function create_tree_children(tr) 
    {
        var job_urls = '';
        for (var i = 0; i < urls.length; i++) {
            job_urls += '' + result_to_color[results[i]]
                           + '<a href="'
                           + urls[i]
                           + '">'
                           + run_nums[i]
                           + '</a><span class="p-2"></span>';
        }
        return job_urls;
        
    }

    // Create the hyperlinks that will show up when we click a name for more
    // details. Each <tr> should have a data-urls and data-results attribute
    // with space-separated urls and pass/fail results, respectively. Create
    // and return the appropriate HTML string from them.
    function format_tr_job_urls(tr) {
        var job_urls = '';
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
        return job_urls;
    }

    function set_datatable_options() {
        var table = new DataTable('#weather-table', {
            order: [[2, 'desc']],
            paging: false
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

    function main() {
        populate_table(ci_nightly_data);
        set_datatable_options();
    }

    main();
});
